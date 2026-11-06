import dbConnect from '../../../lib/dbConnect';
import Story from '../../../models/Story';
import { requireSession, methodNotAllowed, sendValidationError, withApiErrors } from '../../../lib/apiHelpers';
import { storyCreateSchema } from '../../../lib/validation';
import { findUsedWords } from '../../../lib/sightWords';
import { enforceRateLimit } from '../../../lib/rateLimit';
import { RATE_LIMITS, STORY_LIMITS } from '../../../lib/limits';

async function handler(req, res) {
  if (!['GET', 'POST'].includes(req.method)) {
    return methodNotAllowed(res, ['GET', 'POST']);
  }

  const session = await requireSession(req, res);
  if (!session) return;

  await dbConnect();

  // GET - Fetch the signed-in user's stories
  if (req.method === 'GET') {
    try {
      const stories = await Story.find({ userId: session.user.id }).sort({ createdAt: -1 });
      return res.status(200).json(stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      return res.status(500).json({ message: 'Error fetching stories' });
    }
  }

  // POST - Create a story from whitelisted fields
  const parsed = storyCreateSchema.safeParse(req.body);
  if (!parsed.success) return sendValidationError(res, parsed.error);

  // Counted together with edits (pages/api/stories/[id].js)
  const allowed = await enforceRateLimit(res, {
    scope: 'storyWrite',
    key: session.user.id,
    ...RATE_LIMITS.storyWrite,
  });
  if (!allowed) return;

  try {
    // Two saves at once can both pass this check; the rate limit bounds how far over the cap that goes
    const savedStories = await Story.countDocuments({ userId: session.user.id });
    if (savedStories >= STORY_LIMITS.maxStoriesPerAccount) {
      return res.status(403).json({
        message: `An account can keep up to ${STORY_LIMITS.maxStoriesPerAccount} saved stories. Delete one from the story library to save another.`,
        code: 'STORY_LIMIT_REACHED',
      });
    }

    const story = await Story.create({
      ...parsed.data,
      usedWords: findUsedWords(parsed.data.content, parsed.data.words),
      userId: session.user.id,
    });
    return res.status(201).json(story);
  } catch (error) {
    console.error('Error creating story:', error);
    return res.status(500).json({ message: 'Error saving story' });
  }
}

export default withApiErrors(handler);
