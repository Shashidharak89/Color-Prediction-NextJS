// --- MODEL: Color.js ---
import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
  num: { type: Number, unique: true },
  black: { type: Number, default: 0 },
  white: { type: Number, default: 0 },
  winner: { type: String },
  start_time: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
});

colorSchema.pre('save', async function (next) {
  if (this.isNew) {
    const last = await mongoose.model('Color').findOne().sort('-num');
    this.num = last ? last.num + 1 : 1;
  }
  next();
});

export default mongoose.models.Color || mongoose.model('Color', colorSchema);
