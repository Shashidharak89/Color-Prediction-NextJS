import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
  num: Number,
  black: { type: Number, default: 0 },
  white: { type: Number, default: 0 },
  winner: String,
  start_time: { type: Date, default: null },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
});

export default mongoose.models.Color || mongoose.model('Color', colorSchema);
