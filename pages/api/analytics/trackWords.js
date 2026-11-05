import dbConnect from '../../../lib/dbConnect';
import WordAnalytics from '../../../models/WordAnalytics';
import { requireSession, methodNotAllowed, sendValidationError } from '../../../lib/apiHelpers';
import { trackWordsSchema } from '../../../lib/validation';

export default async function handler(req, res) {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);

  const session = await requireSession(req, res);
  if (!session) return;

  // grade is validated as an integer 0-5 before it becomes part of a field path.
  const parsed = trackWordsSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);
  const { words, grade } = parsed.data;
  const uniqueWords = [...new Set(words.map((word) => word.toLowerCase()))];

  await dbConnect();

  try {
    await Promise.all(
      uniqueWords.map((word) =>
        WordAnalytics.findOneAndUpdate(
          { word },
          { $inc: { count: 1, [`gradeLevel.${grade}`]: 1 }, $set: { lastUsed: new Date() } },
          { upsert: true, new: true }
        )
      )
    );

    return res.status(200).json({ success: true, count: uniqueWords.length });
  } catch (error) {
    console.error('Error tracking word analytics:', error);
    return res.status(500).json({ message: 'Error tracking words' });
  }
}
