'use client';
import { useState } from 'react';

const CreatePrediction = () => {
  const [black, setBlack] = useState('');
  const [white, setWhite] = useState('');
  const [winner, setWinner] = useState('black');
  const [status, setStatus] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      black: parseInt(black),
      white: parseInt(white),
      winner,
      status,
    };

    try {
      const res = await fetch('/api/colors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setMessage('✅ Prediction added!');
        setBlack('');
        setWhite('');
        setWinner('black');
        setStatus('pending');
      } else {
        const err = await res.json();
        setMessage(`❌ Error: ${err.error}`);
      }
    } catch (error) {
      setMessage('❌ Server Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg mb-6 w-full max-w-md text-white">
      <h2 className="text-xl font-bold mb-4">Create New Prediction</h2>

      <div className="mb-4">
        <label className="block text-sm mb-1">Black</label>
        <input
          type="number"
          value={black}
          onChange={(e) => setBlack(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">White</label>
        <input
          type="number"
          value={white}
          onChange={(e) => setWhite(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
          required
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">Winner</label>
        <select
          value={winner}
          onChange={(e) => setWinner(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        >
          <option value="black">Black</option>
          <option value="white">White</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 border border-gray-600"
        >
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-purple-600 hover:bg-purple-700 transition p-2 rounded font-semibold"
      >
        {loading ? 'Saving...' : 'Save Prediction'}
      </button>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </form>
  );
};

export default CreatePrediction;
