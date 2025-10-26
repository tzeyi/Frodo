import React from 'react';

function StatCard({ title, value }) {
  return (
    <div className="flex-1 p-4 bg-slate-800 rounded-lg shadow-md">
      <div className="text-gray-400 text-sm">
        {title}
      </div>
      <div className="text-3xl font-bold text-white">
        {value}
      </div>
    </div>
  );
}

export default StatCard;