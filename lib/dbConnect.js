import mongoose from 'mongoose';
import { ConfigError } from './errors';

// Reuse one connection across hot reloads and warm serverless invocations.
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Connect to MongoDB, or return the existing connection.
 *
 * MONGODB_URI is read here rather than when the module loads, so a missing
 * variable fails only the requests that need the database, with a clear error.
 * @returns {Promise<typeof mongoose>}
 */
async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new ConfigError('MONGODB_URI is not set. Add it to .env.local, or to the hosting environment.');
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, { bufferCommands: false }).catch((error) => {
      // Forget a failed attempt so the next request tries again.
      cached.promise = null;
      throw error;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
