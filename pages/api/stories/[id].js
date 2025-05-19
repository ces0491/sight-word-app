import dbConnect from '../../../lib/dbConnect';
import Story from '../../../models/Story';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  const { id } = req.query;
  const session = await getSession({ req });
  
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  await dbConnect();
  
  // GET - Fetch single story
  if (req.method === 'GET') {
    try {
      const story = await Story.findOne({
        _id: id,
        userId: session.user.id
      });
      
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }
      
      return res.status(200).json(story);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching story' });
    }
  }
  
  // PUT - Update story
  if (req.method === 'PUT') {
    try {
      const story = await Story.findOne({
        _id: id,
        userId: session.user.id
      });
      
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }
      
      const updatedStory = await Story.findByIdAndUpdate(
        id,
        { ...req.body },
        { new: true, runValidators: true }
      );
      
      return res.status(200).json(updatedStory);
    } catch (error) {
      return res.status(400).json({ message: error.message });
    }
  }
  
  // DELETE - Delete story
  if (req.method === 'DELETE') {
    try {
      const story = await Story.findOneAndDelete({
        _id: id,
        userId: session.user.id
      });
      
      if (!story) {
        return res.status(404).json({ message: 'Story not found' });
      }
      
      return res.status(200).json({ message: 'Story deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error deleting story' });
    }
  }
  
  return res.status(405).json({ message: 'Method not allowed' });
}