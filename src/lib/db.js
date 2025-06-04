import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let isConnected = false;

export const connectDB = async () => {
  if (isConnected) return;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined');
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
  }
};
