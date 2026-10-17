import mongoose from "mongoose";

/**
 * Cached connection promise for Vercel's serverless environment.
 * In serverless, each invocation may reuse the same process, so we
 * cache the promise to avoid opening multiple connections.
 */
let cached: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached) return cached;

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env file before starting the server."
    );
  }

  cached = mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  cached
    .then((conn) => {
      console.log(`MongoDB connected: ${conn.connection.name}`);
    })
    .catch((err) => {
      // Clear cache so the next invocation retries.
      cached = null;
      throw err;
    });

  return cached;
}
