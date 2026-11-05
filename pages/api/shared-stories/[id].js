import crypto from 'crypto';
import mongoose from 'mongoose';
import dbConnect from '../../../lib/dbConnect';
import Story from '../../../models/Story';
import { methodNotAllowed, withApiErrors } from '../../../lib/apiHelpers';

/** Constant-time comparison of two strings. */
const tokensMatch = (expected, provided) => {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const { id, token } = req.query;
  // A missing story, a bad token and a story never shared all get the same 404,
  // so the response doesn't reveal which stories exist.
  const notFound = () => res.status(404).json({ message: 'Story not found' });

  if (!mongoose.isValidObjectId(id) || typeof token !== 'string' || !token) {
    return notFound();
  }

  await dbConnect();

  try {
    const story = await Story.findById(id).select('+shareToken');
    if (!story?.shareToken || !tokensMatch(story.shareToken, token)) {
      return notFound();
    }

    return res.status(200).json({
      _id: story._id,
      title: story.title,
      content: story.content,
      scenes: story.scenes,
      words: story.words,
      usedWords: story.usedWords,
      format: story.format,
      includeImages: story.includeImages,
      grade: story.grade,
      learningNeeds: story.learningNeeds,
      createdAt: story.createdAt,
    });
  } catch (error) {
    console.error('Error fetching shared story:', error);
    return res.status(500).json({ message: 'Error fetching story' });
  }
}

export default withApiErrors(handler);
