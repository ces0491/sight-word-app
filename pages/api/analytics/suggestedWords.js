import dbConnect from '../../../lib/dbConnect';
import WordAnalytics from '../../../models/WordAnalytics';
import { requireSession, methodNotAllowed } from '../../../lib/apiHelpers';
import { gradeSchema } from '../../../lib/validation';

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
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const session = await requireSession(req, res);
  if (!session) return;

  const { grade } = req.query;
  const parsedGrade = gradeSchema.safeParse(grade === undefined ? 1 : Number(grade));
  if (!parsedGrade.success) {
    return res.status(400).json({ message: 'Invalid grade level' });
  }
  const gradeLevel = parsedGrade.data;
  
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