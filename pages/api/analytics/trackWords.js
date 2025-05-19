import dbConnect from '../../../lib/dbConnect';
import WordAnalytics from '../../../models/WordAnalytics';
import { getSession } from 'next-auth/react';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { words, grade } = req.body;
  if (!words || !Array.isArray(words)) {
    return res.status(400).json({ message: 'Words array required' });
  }
  
  await dbConnect();
  
  try {
    // Update word counts in bulk
    const operations = await Promise.all(words.map(async (word) => {
      const update = {
        $inc: { count: 1, [`gradeLevel.${grade}`]: 1 },
        $set: { lastUsed: new Date() }
      };
      
      return WordAnalytics.findOneAndUpdate(
        { word: word.toLowerCase() },
        update,
        { upsert: true, new: true }
      );
    }));
    
    return res.status(200).json({ success: true, count: operations.length });
  } catch (error) {
    console.error('Error tracking word analytics:', error);
    return res.status(500).json({ message: 'Error tracking words' });
  }
}