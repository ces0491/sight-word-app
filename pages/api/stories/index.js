import dbConnect from '../../../lib/dbConnect';
import Story from '../../../models/Story';
import { requireSession, methodNotAllowed, sendValidationError, withApiErrors } from '../../../lib/apiHelpers';
import { storyCreateSchema } from '../../../lib/validation';
import { findUsedWords } from '../../../lib/sightWords';

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

  try {
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
