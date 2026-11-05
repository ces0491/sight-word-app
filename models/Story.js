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
  // Scene id behind each sentence (null where there isn't one), used to draw the illustrations.
  scenes: [{
    type: String,
  }],
  // Sight words that appear in `content`, computed on the server when the story is saved.
  usedWords: [{
    type: String,
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
  // Random secret in share links. Not returned by queries unless selected with '+shareToken'.
  shareToken: {
    type: String,
    select: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Story || mongoose.model('Story', StorySchema);