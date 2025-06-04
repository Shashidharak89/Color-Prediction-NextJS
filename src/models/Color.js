import mongoose from 'mongoose';

const colorSchema = new mongoose.Schema({
  num: {
    type: Number,
    unique: true,
  },
  black: Number,
  white: Number,
  winner: String,
  start_time: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending',
  },
});

// Auto increment logic
colorSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastColor = await mongoose.model('Color').findOne().sort('-num');
    this.num = lastColor ? lastColor.num + 1 : 1;
  }
  next();
});

export default mongoose.models.Color || mongoose.model('Color', colorSchema);
