'use client';
import { useEffect, useState } from 'react';

const BETS_KEY = 'user_bets';

export default function TransactionHistory({ allRounds }) {
  const [history, setHistory] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);

  useEffect(() => {
    const storedBets = localStorage.getItem(BETS_KEY);
    if (!storedBets) return;

    const userBets = JSON.parse(storedBets);

    const roundResults = allRounds
      .filter((r) => r.status === 'completed')
      .map((r) => {
        const userBet = userBets[r.num];
        if (!userBet) return null;

        const winColor = r.winner;
        const winAmount = userBet[winColor] || 0;
        const totalBet = (userBet.black || 0) + (userBet.white || 0);
        const result =
          userBet.black === userBet.white
            ? 'Draw'
            : userBet[winColor]
            ? 'Won'
            : 'Lost';

        return {
          round: r.num,
          black: userBet.black || 0,
          white: userBet.white || 0,
          winner: winColor,
          result,
          totalBet,
          amountWon: result === 'Won' ? winAmount : 0,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.round - a.round); // Sort descending by round number

    setHistory(roundResults);
  }, [allRounds]);

  const handleViewMore = () => {
    setVisibleCount((prev) => prev + 10);
  };

  const getResultIcon = (result) => {
    switch (result) {
      case 'Won': return '🎉';
      case 'Lost': return '💔';
      case 'Draw': return '🤝';
      default: return '❓';
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'Won': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'Lost': return 'text-red-400 bg-red-400/10 border-red-400/30';
      case 'Draw': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/30';
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-800/70 to-gray-900/70 backdrop-blur-lg rounded-2xl p-6 border border-slate-600/40 shadow-xl hover:shadow-2xl transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
          📊 Transaction History
        </h2>
        <div className="text-xs text-gray-400 bg-slate-700/50 px-3 py-1 rounded-full">
          {history.length} transactions
        </div>
      </div>

      {history.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-30">📋</div>
          <p className="text-gray-400 text-sm">No completed rounds with bets yet.</p>
          <p className="text-gray-500 text-xs mt-2">Start betting to see your transaction history!</p>
        </div>
      ) : (
        <>
          {/* Mobile-first card layout */}
          <div className="space-y-3 md:hidden">
            {history.slice(0, visibleCount).map((h) => (
              <div 
                key={h.round} 
                className="bg-black/30 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300 hover:scale-[1.02]"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold text-white">Round #{h.round}</span>
                    <span className="text-xs text-gray-400">
                      Winner: <span className={`font-semibold ${h.winner === 'black' ? 'text-white' : 'text-gray-300'}`}>
                        {h.winner.toUpperCase()}
                      </span>
                    </span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${getResultColor(h.result)}`}>
                    {getResultIcon(h.result)} {h.result}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div className="text-center">
                    <div className="text-gray-400">Black Bet</div>
                    <div className="text-white font-semibold">{h.black}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">White Bet</div>
                    <div className="text-white font-semibold">{h.white}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-gray-400">Winnings</div>
                    <div className={`font-semibold ${h.amountWon > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                      {h.amountWon}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop table layout */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700/50">
                  <th className="p-3 text-left text-cyan-400 font-semibold">Round</th>
                  <th className="p-3 text-left text-cyan-400 font-semibold">Black Bet</th>
                  <th className="p-3 text-left text-cyan-400 font-semibold">White Bet</th>
                  <th className="p-3 text-left text-cyan-400 font-semibold">Winner</th>
                  <th className="p-3 text-left text-cyan-400 font-semibold">Result</th>
                  <th className="p-3 text-left text-cyan-400 font-semibold">Winnings</th>
                </tr>
              </thead>
              <tbody>
                {history.slice(0, visibleCount).map((h, index) => (
                  <tr 
                    key={h.round} 
                    className={`border-b border-gray-800/50 hover:bg-slate-700/20 transition-all duration-300 ${
                      index % 2 === 0 ? 'bg-slate-800/20' : 'bg-transparent'
                    }`}
                  >
                    <td className="p-3">
                      <span className="font-semibold text-white">#{h.round}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-black rounded-full border border-white/30"></div>
                        <span className="text-white">{h.black}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-white rounded-full"></div>
                        <span className="text-white">{h.white}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full ${h.winner === 'black' ? 'bg-black border border-white/30' : 'bg-white'}`}></div>
                        <span className={`font-semibold ${h.winner === 'black' ? 'text-white' : 'text-gray-300'}`}>
                          {h.winner.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-semibold border ${getResultColor(h.result)}`}>
                        <span>{getResultIcon(h.result)}</span>
                        <span>{h.result}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`font-bold ${h.amountWon > 0 ? 'text-emerald-400' : 'text-gray-500'}`}>
                        {h.amountWon > 0 ? `+${h.amountWon}` : '0'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {visibleCount < history.length && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleViewMore}
                className="group relative px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 rounded-xl text-white font-semibold text-sm transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative flex items-center space-x-2">
                  <span>View More</span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    +{Math.min(10, history.length - visibleCount)}
                  </span>
                </div>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}