import mongoose from "mongoose";

/**
 * Connects to MongoDB using MONGODB_URI from the environment.
 * Resolves once the connection is established; rejects if the URI is
 * missing or the server cannot be reached within the timeout.
 */
export async function connectDB(): Promise<typeof mongoose> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error(
      "MONGODB_URI is not set. Add it to your .env file before starting the server."
    );
  }

  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
  console.log(`MongoDB connected: ${conn.connection.name}`);
  return conn;
}
