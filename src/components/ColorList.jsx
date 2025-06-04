'use client';
import { useEffect, useState } from 'react';

const ColorList = () => {
  const [colors, setColors] = useState([]);

  useEffect(() => {
    fetch('/api/colors')
      .then((res) => res.json())
      .then((data) => setColors(data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">All Predictions</h2>
      <ul className="space-y-2">
        {colors.map((item) => (
          <li key={item._id} className="border p-2 rounded">
            <p><strong>Num:</strong> {item.num.toString().padStart(4, '0')}</p>
            <p><strong>Black:</strong> {item.black}</p>
            <p><strong>White:</strong> {item.white}</p>
            <p><strong>Winner:</strong> {item.winner}</p>
            <p><strong>Status:</strong> {item.status}</p>
            <p><strong>Start Time:</strong> {new Date(item.start_time).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ColorList;
