import Color from '../models/Color.js';
import Bet from '../models/Bet.js';
import { connectDB } from '../lib/db.js';

let roundTimeout;

export const placeBet = async (req) => {
  await connectDB();
  const { userId, color, amount } = await req.json();

  // Get active round or create new
  let current = await Color.findOne({ status: 'pending' }).sort({ start_time: -1 });

  if (!current) {
    current = await Color.create({});
    scheduleRoundEnd(current._id); // set 2 min timer
  }

  // Append amount
  current[color] += amount;
  await current.save();

  // Save user bet
  await Bet.create({ colorId: current._id, userId, color, amount });

  return current;
};

export const getColors = async () => {
  await connectDB();
  return await Color.find().sort({ num: -1 });
};

const scheduleRoundEnd = (id) => {
  setTimeout(async () => {
    await connectDB();
    const round = await Color.findById(id);
    if (!round || round.status === 'completed') return;

    // Determine winner based on lowest amount
    const winner = round.black < round.white ? 'black' : 'white';

    round.winner = winner;
    round.status = 'completed';
    await round.save();
  }, 2 * 60 * 1000); // 2 minutes
};

