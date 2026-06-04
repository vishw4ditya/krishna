import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

declare global {
  var mongooseConn:
    | {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
      }
    | undefined;
}

const cached = global.mongooseConn ?? { conn: null, promise: null };
global.mongooseConn = cached;

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not configured.");
  }
  const mongoUri = MONGODB_URI;

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri, {
      bufferCommands: false,
      dbName: process.env.MONGODB_DB ?? "krishna",
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
