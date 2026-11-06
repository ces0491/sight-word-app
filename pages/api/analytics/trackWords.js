import dbConnect from '../../../lib/dbConnect';
import WordAnalytics from '../../../models/WordAnalytics';
import { requireSession, methodNotAllowed, sendValidationError, withApiErrors } from '../../../lib/apiHelpers';
import { trackWordsSchema } from '../../../lib/validation';
import { enforceRateLimit } from '../../../lib/rateLimit';
import { RATE_LIMITS } from '../../../lib/limits';
import { DOLCH_LISTS } from '../../../lib/wordLists';

/**
 * Word usage is shared by every signed-in teacher, so only Dolch words are
 * counted. Other words, such as a child's name typed as a practice word,
 * never reach it.
 */
const DOLCH_WORDS = new Set(DOLCH_LISTS.flatMap((list) => list.words.map((word) => word.toLowerCase())));

async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const session = await requireSession(req, res);
  if (!session) return;

  // grade is validated as an integer 0-3 before it becomes part of a field path.
  const parsed = trackWordsSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const { words, grade } = parsed.data;
  const dolchWords = [...new Set(words.map((word) => word.toLowerCase()))].filter((word) => DOLCH_WORDS.has(word));

  await dbConnect();

  const allowed = await enforceRateLimit(res, {
    scope: 'trackWords',
    key: session.user.id,
    ...RATE_LIMITS.trackWords,
  });
  if (!allowed) return;

  try {
    await Promise.all(
      dolchWords.map((word) =>
        WordAnalytics.findOneAndUpdate(
          { word },
          { $inc: { count: 1, [`gradeLevel.${grade}`]: 1 }, $set: { lastUsed: new Date() } },
          { upsert: true, new: true }
        )
      )
    );

    return res.status(200).json({ success: true, count: dolchWords.length });
  } catch (error) {
    console.error('Error tracking word analytics:', error);
    return res.status(500).json({ message: 'Error tracking words' });
  }
}

export default withApiErrors(handler);
