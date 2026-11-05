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
 *
 * MONGODB_DB, when set, names the database inside the cluster. Without it the
 * database comes from the connection string, and a string with none (as
 * hosting integrations often provide) makes the driver use `test`.
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
  const dbName = process.env.MONGODB_DB?.trim();

  if (!cached.promise) {
    const options = { bufferCommands: false, ...(dbName ? { dbName } : {}) };
    cached.promise = mongoose.connect(uri, options).catch((error) => {
      // Forget a failed attempt so the next request tries again.
      cached.promise = null;
      throw error;
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default dbConnect;
