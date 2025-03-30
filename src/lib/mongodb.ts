import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

// ตรวจสอบว่ามีการกำหนด MONGODB_URI หรือไม่
if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable inside .env.local'
  );
}

// จัดการ global caching ของการเชื่อมต่อ
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // ถ้ามีการเชื่อมต่ออยู่แล้ว ให้ใช้การเชื่อมต่อเดิม
  if (cached.conn) {
    console.log("Using existing MongoDB connection");
    return cached.conn;
  }

  // ถ้ายังไม่มีการเชื่อมต่อ ให้สร้างการเชื่อมต่อใหม่
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    console.log("Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log("Connected to MongoDB successfully");
        return mongoose;
      })
      .catch(err => {
        console.error("MongoDB connection error:", err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    throw error;
  }
}

export default connectDB;