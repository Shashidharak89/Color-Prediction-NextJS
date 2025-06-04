'use client';
import { useEffect, useState } from 'react';
import TransactionHistory from './TransactionHistory'; // adjust the path

const WALLET_KEY = 'wallet_balance';
const BETS_KEY = 'user_bets';

const getWalletBalance = () => {
  const val = localStorage.getItem(WALLET_KEY);
  return val ? parseInt(val) : 1000;
};

const setWalletBalance = (value) => {
  localStorage.setItem(WALLET_KEY, value);
};

const addToWallet = (amount) => {
  const current = getWalletBalance();
  setWalletBalance(current + amount);
};

const deductFromWallet = (amount) => {
  const current = getWalletBalance();
  if (current < amount) return false;
  setWalletBalance(current - amount);
  return true;
};

const getUserBets = () => {
  const val = localStorage.getItem(BETS_KEY);
  return val ? JSON.parse(val) : {};
};

const setUserBets = (bets) => {
  localStorage.setItem(BETS_KEY, JSON.stringify(bets));
};

export default function ColorPredictor() {
  const [round, setRound] = useState(null);
  const [allRounds, setAllRounds] = useState([]);
  const [amount, setAmount] = useState('');
  const [color, setColor] = useState('black');
  const [lastWinner, setLastWinner] = useState(null);
  const [wallet, setWallet] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [lastCheckedRound, setLastCheckedRound] = useState(null);

  const ROUND_DURATION = 120; // seconds

  const checkAndCreditWinnings = (rounds) => {
    const bets = getUserBets();
    let updated = false;

    rounds.forEach((r) => {
      if (r.status === 'completed' && bets[r.num] && !bets[r.num].credited) {
        const userBet = bets[r.num];
        const winAmount = userBet[r.winner] || 0;
        bets[r.num].credited = true;
        if (winAmount > 0) {
          addToWallet(winAmount);
          showPopup(`🎉 Congratulations! You won ${winAmount} coins on round #${r.num}!`);
        } else {
          showPopup(`😢 Better luck next time on round #${r.num}.`);
        }
        updated = true;
      }
    });

    if (updated) {
      setUserBets(bets);
      setWallet(getWalletBalance());
    }
  };

  const showPopup = (message) => {
    const popup = document.createElement('div');
    popup.className = 'fixed top-10 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    popup.innerText = message;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 5000);
  };

  const fetchLatestRound = async () => {
    const res = await fetch('/api/color');
    const data = await res.json();

    const currentRound = data.find((r) => r.status === 'pending') || data[0];
    setRound(currentRound);
    setAllRounds(data);

    const completedRounds = data.filter((r) => r.status === 'completed');
    if (completedRounds.length > 0) {
      setLastWinner(completedRounds[0].winner);
    }

    if (lastCheckedRound !== currentRound?.num) {
      checkAndCreditWinnings(completedRounds);
      setLastCheckedRound(currentRound?.num);
    }

    if (currentRound?.start_time) {
      const startTime = new Date(currentRound.start_time);
      const endTime = new Date(startTime.getTime() + ROUND_DURATION * 1000);
      const secondsLeft = Math.max(0, Math.floor((endTime - new Date()) / 1000));
      setTimeLeft(secondsLeft);
    }
  };

  const handlePlaceBet = async () => {
    const amt = parseInt(amount);
    if (!amt || amt <= 0 || isNaN(amt)) return alert('Enter a valid amount');

    const success = deductFromWallet(amt);
    if (!success) return alert('Not enough balance');

    setWallet(getWalletBalance());

    const bets = getUserBets();
    const roundNum = round?.num;
    if (!roundNum) return alert('No active round found');

    if (!bets[roundNum]) bets[roundNum] = { black: 0, white: 0, credited: false };
    bets[roundNum][color] += amt;
    setUserBets(bets);

    const res = await fetch('/api/color', {
      method: 'POST',
      body: JSON.stringify({ color, amount: amt }),
    });

    const data = await res.json();
    setRound(data);
    setAmount('');
    fetchLatestRound();
  };

  useEffect(() => {
    setWallet(getWalletBalance());
  }, []);

  useEffect(() => {
    fetchLatestRound();
    const interval = setInterval(fetchLatestRound, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-black via-gray-900 to-black text-white p-6 flex flex-col items-center">
      <h1 className="text-3xl font-extrabold text-purple-400 mb-4">🎯 Color Prediction Game</h1>
      <div className="mb-4 text-lg text-yellow-400">💰 Wallet: {wallet} coins</div>

      {lastWinner && (
        <div className="mb-4 text-yellow-300 text-lg">
          🏆 Last Winner: <span className="font-bold">{lastWinner.toUpperCase()}</span>
        </div>
      )}

      {round ? (
        <div className="bg-gray-800 rounded-xl p-6 shadow-md w-full max-w-md mb-6">
          <p className="text-xl font-semibold mb-2">Round #{round.num}</p>
          <p className="text-sm mb-1">
            Status: <span className={round.status === 'completed' ? 'text-red-400' : 'text-green-400'}>{round.status}</span>
          </p>
          <p className="text-sm mb-1">Black Coins: <span className="text-white">{round.black}</span></p>
          <p className="text-sm mb-1">White Coins: <span className="text-white">{round.white}</span></p>
          <p className="text-sm mb-1">Winner: <span className="text-yellow-300">{round.winner || 'TBD'}</span></p>
          {round.status !== 'completed' && (
            <p className="text-md mt-2 font-mono text-green-300">⏳ Time Left: {formatTime(timeLeft)}</p>
          )}
        </div>
      ) : (
        <p>Loading current round...</p>
      )}

      <div className="w-full max-w-md flex flex-col items-center space-y-4 bg-gray-900 p-6 rounded-xl shadow-inner">
        <input
          type="number"
          placeholder="Enter Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 rounded text-black"
        />
        <select
          value={color}
          onChange={(e) => setColor(e.target.value)}
          className="w-full p-2 rounded text-black"
        >
          <option value="black">Black</option>
          <option value="white">White</option>
        </select>
        <button
          onClick={handlePlaceBet}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-bold"
        >
          Place Bet
        </button>
      </div>

      <div className="w-full max-w-2xl mt-6">
        <h2 className="text-xl font-bold mb-2 text-purple-400">🏁 Previous Winning Colors</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-3 text-center">
          {allRounds
            .filter((r) => r.status === 'completed')
            .map((r) => (
              <div
                key={r.num}
                className={`p-2 rounded-lg shadow-md ${
                  r.winner === 'black' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                <p className="text-xs"># {r.num}</p>
                <p className="font-semibold">{r.winner.toUpperCase()}</p>
              </div>
            ))}
        </div>
      </div>
      <TransactionHistory allRounds={allRounds} />
    </div>
  );
}