'use client';
import { useEffect, useState } from 'react';
import { getWalletBalance, setWalletBalance, deductFromWallet } from '../lib/wallet';

export default function ColorPredictor() {
  const [round, setRound] = useState(null);
  const [amount, setAmount] = useState('');
  const [color, setColor] = useState('black');
  const [lastWinner, setLastWinner] = useState(null);
  const [wallet, setWallet] = useState(0);

  const fetchLatestRound = async () => {
    const res = await fetch('/api/color');
    const data = await res.json();
    setRound(data[0]);

    const completedRound = data.find((r) => r.status === 'completed');
    if (completedRound) setLastWinner(completedRound.winner);
  };

  const handlePlaceBet = async () => {
    const amt = parseInt(amount);
    if (!amt || amt <= 0 || isNaN(amt)) {
      alert('Enter a valid amount');
      return;
    }

    const success = deductFromWallet(amt);
    if (!success) {
      alert('Not enough balance');
      return;
    }

    setWallet(getWalletBalance());

    const res = await fetch('/api/color', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user1',
        color,
        amount: amt,
      }),
    });

    const data = await res.json();
    setRound(data);
    setAmount('');
  };

  useEffect(() => {
    fetchLatestRound();
    const interval = setInterval(fetchLatestRound, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setWallet(getWalletBalance());
  }, []);

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
          <p className="text-sm mb-1">Status: <span className={round.status === 'completed' ? 'text-red-400' : 'text-green-400'}>{round.status}</span></p>
          <p className="text-sm mb-1">Black Coins: <span className="text-white">{round.black}</span></p>
          <p className="text-sm mb-1">White Coins: <span className="text-white">{round.white}</span></p>
          <p className="text-sm">Winner: <span className="text-yellow-300">{round.winner || 'TBD'}</span></p>
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
    </div>
  );
}
