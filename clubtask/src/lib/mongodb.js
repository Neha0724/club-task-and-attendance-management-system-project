import mongoose from 'mongoose'

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || ''

if (!MONGO_URI) {
  throw new Error('Please define MONGODB_URI in environment variables')
}

let cached = global.mongoose
if (!cached) cached = global.mongoose = { conn: null, promise: null }

async function dbConnect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    const opts = { bufferCommands: false }
    cached.promise = mongoose.connect(MONGO_URI, opts).then(m => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}

export default dbConnect
