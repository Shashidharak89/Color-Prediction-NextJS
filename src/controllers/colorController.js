import Color from '../models/Color.js';
import { connectDB } from '../lib/db.js';

const ROUND_DURATION = 2 * 60 * 1000; // 2 minutes in milliseconds

// Complete rounds that expired (start_time + 2mins passed and still pending)
const completeExpiredRounds = async () => {
  const expiredRounds = await Color.find({
    status: 'pending',
    start_time: { $lte: new Date(Date.now() - ROUND_DURATION) },
  });

  for (let round of expiredRounds) {
    // Decide winner: if tie, pick randomly, else lowest amount wins
    let winner;
    if ((round.black || 0) === (round.white || 0)) {
      winner = Math.random() < 0.5 ? 'black' : 'white'; // Tie-break
    } else {
      winner = (round.black || 0) < (round.white || 0) ? 'black' : 'white';
    }

    round.status = 'completed';
    round.winner = winner;
    await round.save();
  }
};

// Create a new round or join an existing pending round by placing a bet
export const createOrJoinRound = async (req) => {
  await connectDB();

  // Complete expired rounds before processing new bets
  await completeExpiredRounds();

  const body = await req.json();
  const { color, amount } = body;

  // Find latest pending round
  let round = await Color.findOne({ status: 'pending' }).sort({ num: -1 });

  if (!round) {
    // No active round, create a new one
    const lastRound = await Color.findOne().sort({ num: -1 });
    const newNum = lastRound ? lastRound.num + 1 : 1;

    round = await Color.create({
      num: newNum,
      black: color === 'black' ? amount : 0,
      white: color === 'white' ? amount : 0,
      start_time: new Date(),
      status: 'pending',
    });
  } else {
    // Add amount to the existing round's color total safely
    round[color] = (round[color] || 0) + amount;
    await round.save();
  }

  return round;
};

// Get all rounds, completing expired ones first
export const getRounds = async () => {
  await connectDB();

  // Complete expired rounds before returning all rounds
  await completeExpiredRounds();

  const allRounds = await Color.find().sort({ num: -1 });
  return allRounds;
};
