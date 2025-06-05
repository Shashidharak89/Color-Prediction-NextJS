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
  const quickAmounts = [5, 10, 20, 50, 100, 200, 500,1000];

  const checkAndCreditWinnings = (rounds) => {
    const bets = getUserBets();
    let updated = false;

    rounds.forEach((r) => {
      if (r.status === 'completed' && bets[r.num] && !bets[r.num].credited) {
        const userBet = bets[r.num];
        const winAmount = userBet[r.winner] || 0;
        bets[r.num].credited = true;
        if (winAmount > 0) {
          // Double the bet amount (original bet + win amount)
          const totalPayout = winAmount * 2;
          addToWallet(totalPayout);
          showPopup(`🎉 Congratulations! You won ${totalPayout} coins on round #${r.num}!`);
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
    popup.className = 'fixed top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl shadow-2xl z-50 border border-cyan-400 backdrop-blur-sm animate-bounce';
    popup.style.boxShadow = '0 0 30px rgba(6, 182, 212, 0.4)';
    popup.innerText = message;
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 4000);
  };

  const addQuickAmount = (quickAmount) => {
    const currentAmount = parseInt(amount) || 0;
    setAmount((currentAmount + quickAmount).toString());
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

  const checkWinnings = async () => {
    const res = await fetch('/api/color');
    const data = await res.json();
    
    const completedRounds = data.filter((r) => r.status === 'completed');
    checkAndCreditWinnings(completedRounds);
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

  // New useEffect to check winnings every 3 seconds
  useEffect(() => {
    const winCheckInterval = setInterval(checkWinnings, 3000);
    return () => clearInterval(winCheckInterval);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        <div className="absolute top-20 left-1/2 w-60 h-60 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
        
        {/* Floating particles */}
        <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-ping opacity-60"></div>
        <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-40 animation-delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-80 animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Compact Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2 animate-pulse">
            🎯 COLOR PREDICTION
          </h1>
          <div className="text-sm text-gray-400">Predict • Win • Earn</div>
        </div>

        {/* Top Row: Wallet + Last Winner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Wallet Card */}
          <div className="bg-gradient-to-r from-slate-800/60 to-gray-800/60 backdrop-blur-lg rounded-2xl p-4 border border-slate-600/30 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="text-center">
              <div className="text-xs text-gray-400 mb-1">Your Balance</div>
              <div className="text-2xl font-bold text-emerald-400 animate-pulse">
                💰 {wallet.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500">coins</div>
            </div>
          </div>

          {/* Last Winner */}
          {lastWinner && (
            <div className="bg-gradient-to-r from-cyan-900/40 to-blue-900/40 backdrop-blur-lg rounded-2xl p-4 border border-cyan-500/30 text-center hover:shadow-xl transition-all duration-300">
              <div className="text-cyan-400 text-sm font-semibold">
                🏆 Last Winner: <span className="font-bold text-cyan-300 animate-pulse">{lastWinner.toUpperCase()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Current Round Card */}
          <div className="lg:col-span-2">
            {round ? (
              <div className="bg-gradient-to-br from-slate-800/70 to-gray-900/70 backdrop-blur-lg rounded-2xl p-6 border border-slate-600/40 shadow-xl hover:shadow-2xl transition-all duration-300">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-xl font-bold text-white">Round #{round.num}</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                    round.status === 'completed' 
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' 
                      : 'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse'
                  }`}>
                    {round.status.toUpperCase()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-black/60 rounded-xl p-3 border border-gray-700/40 hover:border-gray-600 transition-all duration-300 hover:scale-105">
                    <div className="text-center">
                      <div className="text-white text-sm mb-1">BLACK</div>
                      <div className="text-xl font-bold text-white">{round.black}</div>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-3 border border-gray-600/40 hover:border-gray-500 transition-all duration-300 hover:scale-105">
                    <div className="text-center">
                      <div className="text-white text-sm mb-1">WHITE</div>
                      <div className="text-xl font-bold text-white">{round.white}</div>
                    </div>
                  </div>
                </div>

                <div className="text-center mb-4">
                  <div className="text-xs text-gray-400 mb-1">Winner</div>
                  <div className="text-lg font-bold text-cyan-400 animate-pulse">
                    {round.winner ? round.winner.toUpperCase() : 'TBD'}
                  </div>
                </div>

                {round.status !== 'completed' && (
                  <div className="text-center">
                    <div className="text-xs text-gray-400 mb-2">Time Remaining</div>
                    <div className="text-2xl font-mono font-bold text-emerald-400 bg-black/40 rounded-lg py-2 px-4 inline-block animate-pulse">
                      ⏳ {formatTime(timeLeft)}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-400 bg-slate-800/50 rounded-2xl p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mx-auto mb-4"></div>
                Loading current round...
              </div>
            )}
          </div>

          {/* Betting Interface */}
          <div className="bg-gradient-to-br from-slate-800/70 to-gray-900/70 backdrop-blur-lg rounded-2xl p-6 border border-slate-600/40 shadow-xl hover:shadow-2xl transition-all duration-300">
            <div className="text-center mb-4">
              <h3 className="text-lg font-bold text-white mb-1">Place Your Bet</h3>
              <div className="text-xs text-gray-400">Choose your prediction</div>
            </div>

            {/* Amount Input */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 mb-2">Bet Amount</label>
              <input
                type="number"
                placeholder="Enter amount..."
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3 bg-black/50 border border-gray-600/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 hover:border-gray-500"
              />
            </div>

            {/* Quick Amount Buttons */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 mb-2">Quick Add</label>
              <div className="grid grid-cols-4 gap-2">
                {quickAmounts.map((quickAmount) => (
                  <button
                    key={quickAmount}
                    onClick={() => addQuickAmount(quickAmount)}
                    className="px-2 py-1 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-500/30 rounded-lg text-xs font-semibold text-cyan-400 border border-cyan-500/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    +{quickAmount}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-400 mb-2">Choose Color</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setColor('black')}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                    color === 'black'
                      ? 'border-cyan-500 bg-black/70 shadow-lg shadow-cyan-500/25'
                      : 'border-gray-600/50 bg-black/30 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-6 h-6 bg-black rounded-full mx-auto mb-1 border-2 border-white/30"></div>
                    <div className="text-white font-semibold text-xs">BLACK</div>
                  </div>
                </button>
                <button
                  onClick={() => setColor('white')}
                  className={`p-3 rounded-xl border-2 transition-all duration-300 hover:scale-105 active:scale-95 ${
                    color === 'white'
                      ? 'border-cyan-500 bg-white/20 shadow-lg shadow-cyan-500/25'
                      : 'border-gray-600/50 bg-white/10 hover:border-gray-500'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-6 h-6 bg-white rounded-full mx-auto mb-1"></div>
                    <div className="text-white font-semibold text-xs">WHITE</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Place Bet Button */}
            <button
              onClick={handlePlaceBet}
              className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-bold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Place Bet 🚀
            </button>
          </div>
        </div>

        {/* Previous Results - More Compact */}
        <div className="bg-gradient-to-br from-slate-800/60 to-gray-900/60 backdrop-blur-lg rounded-2xl p-6 border border-slate-600/40 shadow-xl mb-6">
          <h2 className="text-lg font-bold text-center mb-4 bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            🏁 Recent Winners
          </h2>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
            {allRounds
              .filter((r) => r.status === 'completed')
              .slice(0, 24)
              .map((r) => (
                <div
                  key={r.num}
                  className={`p-2 rounded-lg shadow-md transition-all duration-300 hover:scale-110 cursor-pointer ${
                    r.winner === 'black' 
                      ? 'bg-gradient-to-br from-black to-gray-800 text-white border border-gray-600 hover:shadow-white/20' 
                      : 'bg-gradient-to-br from-white to-gray-200 text-black border border-gray-300 hover:shadow-black/20'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xs opacity-75">#{r.num}</div>
                    <div className="font-bold text-xs">{r.winner.charAt(0).toUpperCase()}</div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Transaction History */}
        <div>
          <TransactionHistory allRounds={allRounds} />
        </div>
      </div>

      <style jsx>{`
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
}