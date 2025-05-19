import dbConnect from '../../../lib/dbConnect';
import Story from '../../../models/Story';

export default async function handler(req, res) {
  const { id } = req.query;
  const { token } = req.query;
  
  if (!id || !token) {
    return res.status(400).json({ message: 'Missing required parameters' });
  }
  
  await dbConnect();
  
  try {
    // Find the story by id
    const story = await Story.findById(id);
    
    if (!story) {
      return res.status(404).json({ message: 'Story not found' });
    }
    
    // In a production app, you would validate the token against a database of valid share tokens
    // For simplicity, we'll just check if the token includes the story ID
    const isValidToken = token.includes(id);
    
    if (!isValidToken) {
      return res.status(401).json({ message: 'Invalid access token' });
    }
    
    // Return the story data
    return res.status(200).json({
      _id: story._id,
      title: story.title,
      content: story.content,
      words: story.words,
      format: story.format,
      includeImages: story.includeImages,
      grade: story.grade,
      learningNeeds: story.learningNeeds,
      createdAt: story.createdAt
    });
  } catch (error) {
    console.error('Error fetching shared story:', error);
    return res.status(500).json({ message: 'Error fetching story' });
  }
}