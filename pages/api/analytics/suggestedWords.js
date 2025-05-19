import dbConnect from '../../../lib/dbConnect';
import WordAnalytics from '../../../models/WordAnalytics';
import { getSession } from 'next-auth/react';

// Define common sight words by grade level
const commonSightWords = {
  0: ['a', 'and', 'the', 'I', 'see', 'like', 'to', 'go', 'is', 'my'],
  1: ['he', 'she', 'we', 'they', 'was', 'for', 'are', 'you', 'have', 'with'],
  2: ['because', 'from', 'or', 'this', 'that', 'had', 'not', 'what', 'when', 'your'],
  3: ['about', 'many', 'then', 'them', 'these', 'would', 'could', 'should', 'their', 'people'],
  4: ['through', 'every', 'always', 'around', 'where', 'before', 'which', 'there', 'know', 'write'],
  5: ['though', 'thought', 'enough', 'different', 'language', 'important', 'together', 'between', 'against', 'special']
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  
  const session = await getSession({ req });
  if (!session) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  
  const { grade } = req.query;
  const gradeLevel = grade ? parseInt(grade) : 1;
  
  if (gradeLevel < 0 || gradeLevel > 5) {
    return res.status(400).json({ message: 'Invalid grade level' });
  }
  
  await dbConnect();
  
  try {
    // Get most commonly used words for this grade level
    const popularWords = await WordAnalytics.find({ [`gradeLevel.${gradeLevel}`]: { $gt: 0 } })
      .sort({ [`gradeLevel.${gradeLevel}`]: -1 })
      .limit(10);
    
    // Combine with common sight words for this grade
    const defaultWords = commonSightWords[gradeLevel] || [];
    
    // Create a combined list without duplicates
    const popularWordsList = popularWords.map(w => w.word);
    const combinedWords = [...new Set([...popularWordsList, ...defaultWords])].slice(0, 20);
    
    return res.status(200).json({
      grade: gradeLevel,
      suggestedWords: combinedWords
    });
  } catch (error) {
    console.error('Error fetching suggested words:', error);
    return res.status(500).json({ message: 'Error fetching suggested words' });
  }
}