import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
  },
  // Stored lower-cased; look emails up with EMAIL_COLLATION, which also matches older mixed-case entries.
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
  },
  role: {
    type: String,
    enum: ['teacher', 'admin'],
    default: 'teacher',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash the password before saving. Mongoose 9 middleware is async and takes no next()
UserSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

/** Case-insensitive comparison for email lookups. */
export const EMAIL_COLLATION = { locale: 'en', strength: 2 };

export default mongoose.models.User || mongoose.model('User', UserSchema);