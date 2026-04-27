import React, { useState } from 'react';

const tagColors = {
  'Research Methodology': 'bg-blue-100 text-blue-700',
  'Literature Review': 'bg-purple-100 text-purple-700',
  'Data Analysis': 'bg-teal-100 text-teal-700',
  'Defense Q&A': 'bg-orange-100 text-orange-700',
};

const difficultyColors = {
  Easy: 'bg-green-100 text-green-600',
  Medium: 'bg-yellow-100 text-yellow-600',
  Hard: 'bg-red-100 text-red-600',
};

const FlashCard = ({ question, answer, tag, difficulty }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: '1000px' }}
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className="relative w-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          minHeight: '180px',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-white rounded-2xl border border-gray-200 p-5 flex flex-col"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagColors[tag] || 'bg-gray-100 text-gray-600'}`}>
              {tag}
            </span>
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColors[difficulty] || 'bg-gray-100 text-gray-500'}`}>
              {difficulty}
            </span>
          </div>
          <p className="text-gray-800 text-sm font-medium flex-1 leading-relaxed">{question}</p>
          <p className="text-xs text-gray-400 mt-3 text-right">Click to reveal answer →</p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 bg-blue-50 rounded-2xl border border-blue-200 p-5 flex flex-col"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Answer</p>
          <p className="text-gray-800 text-sm flex-1 leading-relaxed">{answer}</p>
          <p className="text-xs text-gray-400 mt-3 text-right">Click to flip back ←</p>
        </div>
      </div>
    </div>
  );
};

export default FlashCard;
