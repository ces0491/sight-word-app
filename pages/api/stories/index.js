import dbConnect from '../../../lib/dbConnect';
import Story from '../../../models/Story';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  // GET - Fetch user's stories
  if (req.method === 'GET') {
    try {
      const stories = await Story.find({ userId: session.user.id })
        .sort({ createdAt: -1 });
      return res.status(200).json(stories);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching stories' });
    }
  }

  // POST - Create new story
  if (req.method === 'POST') {
    try {
      const storyData = {
        ...req.body,
        userId: session.user.id
      };
      
      const story = await Story.create(storyData);
      return res.status(201).json(story);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}