import dbConnect from '../../../lib/dbConnect';
import WordAnalytics from '../../../models/WordAnalytics';
import Story from '../../../models/Story';
import { requireSession, methodNotAllowed, withApiErrors } from '../../../lib/apiHelpers';

async function handler(req, res) {
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);

  const session = await requireSession(req, res);
  if (!session) return;
  
  await dbConnect();
  
  try {
    // Get top words
    const topWords = await WordAnalytics.find()
      .sort({ count: -1 })
      .limit(8);
    
    // Get word counts by grade
    const wordsByGrade = await WordAnalytics.aggregate([
      {
        $group: {
          _id: null,
          grade0: { $sum: '$gradeLevel.0' },
          grade1: { $sum: '$gradeLevel.1' },
          grade2: { $sum: '$gradeLevel.2' },
          grade3: { $sum: '$gradeLevel.3' },
        }
      }
    ]);
    
    // Get total stories and unique words
    const totalStories = await Story.countDocuments({ userId: session.user.id });
    const totalUniqueWords = await WordAnalytics.countDocuments();
    
    const byGrade = wordsByGrade.length > 0 ? {
      '0': wordsByGrade[0].grade0 || 0,
      '1': wordsByGrade[0].grade1 || 0,
      '2': wordsByGrade[0].grade2 || 0,
      '3': wordsByGrade[0].grade3 || 0,
    } : {};
    
    return res.status(200).json({
      topWords,
      byGrade,
      totalStories,
      totalUniqueWords
    });
  } catch (error) {
    console.error('Error fetching word analytics:', error);
    return res.status(500).json({ message: 'Error fetching analytics' });
  }
}

export default withApiErrors(handler);
