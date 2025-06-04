import Color from '../models/Color.js';
import { connectDB } from '../lib/db.js';

const ROUND_DURATION = 2 * 60 * 1000; // 2 mins in ms

// Complete expired rounds by checking start_time + 2mins
const completeExpiredRounds = async () => {
  const expiredRounds = await Color.find({
    status: 'pending',
    start_time: { $lte: new Date(Date.now() - ROUND_DURATION) },
  });

  for (let round of expiredRounds) {
    let winner;
    if (round.black === round.white) {
      winner = Math.random() < 0.5 ? 'black' : 'white'; // Tie-break
    } else {
      winner = round.black < round.white ? 'black' : 'white';
    }

    round.status = 'completed';
    round.winner = winner;
    await round.save();
  }
};

export const createOrJoinRound = async (req) => {
  await connectDB();
  await completeExpiredRounds();

  const body = await req.json();
  const { color, amount } = body;

  let round = await Color.findOne({ status: 'pending' }).sort({ num: -1 });

  if (!round) {
    const lastRound = await Color.findOne().sort({ num: -1 });
    const newNum = lastRound ? lastRound.num + 1 : 1;
    round = await Color.create({
      num: newNum,
      [color]: amount,
      start_time: new Date(),
    });
  } else {
    round[color] += amount;
    await round.save();
  }

  return round;
};

export const getRounds = async () => {
  await connectDB();
  await completeExpiredRounds();

  const allRounds = await Color.find().sort({ num: -1 });
  return allRounds;
};
