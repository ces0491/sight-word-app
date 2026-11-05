import mongoose from 'mongoose';
import dbConnect from '../../../lib/dbConnect';
import Story from '../../../models/Story';
import { requireSession, methodNotAllowed, sendValidationError } from '../../../lib/apiHelpers';
import { storyUpdateSchema } from '../../../lib/validation';
import { findUsedWords } from '../../../lib/sightWords';

export default async function handler(req, res) {
  if (!['GET', 'PUT', 'DELETE'].includes(req.method)) {
    return methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
  }

  const session = await requireSession(req, res);
  if (!session) return;

  const { id } = req.query;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(404).json({ message: 'Story not found' });
  }

  await dbConnect();
  const ownedStory = { _id: id, userId: session.user.id };

  // GET - Fetch a single story
  if (req.method === 'GET') {
    try {
      const story = await Story.findOne(ownedStory);
      if (!story) return res.status(404).json({ message: 'Story not found' });
      return res.status(200).json(story);
    } catch (error) {
      console.error('Error fetching story:', error);
      return res.status(500).json({ message: 'Error fetching story' });
    }
  }

  // PUT - Update whitelisted fields only
  if (req.method === 'PUT') {
    const parsed = storyUpdateSchema.safeParse(req.body);
    if (!parsed.success) return sendValidationError(res, parsed.error);

    try {
      const story = await Story.findOne(ownedStory);
      if (!story) return res.status(404).json({ message: 'Story not found' });

      story.set(parsed.data);
      if (parsed.data.content && !parsed.data.scenes) {
        // Edited sentences no longer line up with the stored scene ids
        story.scenes = [];
      }
      if (parsed.data.content || parsed.data.words) {
        story.usedWords = findUsedWords(story.content, story.words);
      }
      await story.save();
      return res.status(200).json(story);
    } catch (error) {
      console.error('Error updating story:', error);
      return res.status(500).json({ message: 'Error updating story' });
    }
  }

  // DELETE - Delete a story
  try {
    const story = await Story.findOneAndDelete(ownedStory);
    if (!story) return res.status(404).json({ message: 'Story not found' });
    return res.status(200).json({ message: 'Story deleted successfully' });
  } catch (error) {
    console.error('Error deleting story:', error);
    return res.status(500).json({ message: 'Error deleting story' });
  }
}
