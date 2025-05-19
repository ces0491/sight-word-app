import mongoose from 'mongoose';

const StorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  content: [{
    type: String,
    required: true,
  }],
  words: [{
    type: String,
    required: true,
  }],
  format: {
    type: String,
    enum: ['highlighted', 'bold', 'underlined', 'normal'],
    default: 'highlighted',
  },
  includeImages: {
    type: Boolean,
    default: true,
  },
  grade: {
    type: Number,
    required: true,
  },
  learningNeeds: {
    adhd: { type: Boolean, default: false },
    dyslexia: { type: Boolean, default: false },
    autism: { type: Boolean, default: false },
    esl: { type: Boolean, default: false },
    visualProcessing: { type: Boolean, default: false },
  },
  sharedWith: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Story || mongoose.model('Story', StorySchema);