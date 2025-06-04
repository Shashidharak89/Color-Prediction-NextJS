// models/Bet.js
import mongoose from 'mongoose';

const betSchema = new mongoose.Schema({
  colorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Color' },
  userId: String, // Can be expanded
  color: { type: String, enum: ['black', 'white'] },
  amount: Number,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Bet || mongoose.model('Bet', betSchema);
