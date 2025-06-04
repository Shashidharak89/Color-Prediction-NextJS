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

  return (
    <div className="mt-10 w-full max-w-2xl bg-gray-900 p-5 rounded-lg shadow-lg">
      <h2 className="text-xl text-purple-400 font-bold mb-4">🧾 Transaction History</h2>
      {history.length === 0 ? (
        <p className="text-gray-400 text-sm">No completed rounds with bets yet.</p>
      ) : (
        <>
          <table className="w-full text-sm text-white">
            <thead>
              <tr className="text-yellow-300">
                <th className="p-2 text-left">Round</th>
                <th className="p-2 text-left">Black</th>
                <th className="p-2 text-left">White</th>
                <th className="p-2 text-left">Result</th>
                <th className="p-2 text-left">Win</th>
              </tr>
            </thead>
            <tbody>
              {history.slice(0, visibleCount).map((h) => (
                <tr key={h.round} className="border-t border-gray-700">
                  <td className="p-2">#{h.round}</td>
                  <td className="p-2">{h.black}</td>
                  <td className="p-2">{h.white}</td>
                  <td
                    className={`p-2 ${
                      h.result === 'Won'
                        ? 'text-green-400'
                        : h.result === 'Lost'
                        ? 'text-red-400'
                        : 'text-yellow-300'
                    }`}
                  >
                    {h.result}
                  </td>
                  <td className="p-2">{h.amountWon}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {visibleCount < history.length && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleViewMore}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded text-white font-semibold"
              >
                View More
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
