import mongoose from 'mongoose';

const WordAnalyticsSchema = new mongoose.Schema({
  word: { 
    type: String, 
    required: true, 
    unique: true 
  },
  count: { 
    type: Number, 
    default: 1 
  },
  gradeLevel: {
    0: { type: Number, default: 0 }, // Kindergarten
    1: { type: Number, default: 0 }, // Grade 1
    2: { type: Number, default: 0 }, // etc.
    3: { type: Number, default: 0 },
    4: { type: Number, default: 0 },
    5: { type: Number, default: 0 }
  },
  lastUsed: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.models.WordAnalytics || mongoose.model('WordAnalytics', WordAnalyticsSchema);