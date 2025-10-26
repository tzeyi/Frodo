import React from 'react';

function Card({ cardTitle, cardDesc, cardButtonText }) {
  return (
    <div className="flex-1 p-6 bg-slate-800 rounded-lg shadow-md flex justify-between items-center">
      
      {/* Left side: Title and Description */}
      <div>
        <h3 className="text-xl font-bold text-white">{cardTitle}</h3>
        <p className="text-gray-400">{cardDesc}</p>
      </div>

      {/* Right side: Button */}
      <button className="bg-purple-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-purple-700">
        {cardButtonText}
      </button>

    </div>
  );
}

export default Card;