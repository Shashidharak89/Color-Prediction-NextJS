import Color from '../models/Color.js';
import { connectDB } from '../lib/db.js';

export const createColor = async (req) => {
  await connectDB();
  const body = await req.json();
  const color = await Color.create(body);
  return color;
};

export const getColors = async () => {
  await connectDB();
  const colors = await Color.find().sort({ num: -1 });
  return colors;
};
