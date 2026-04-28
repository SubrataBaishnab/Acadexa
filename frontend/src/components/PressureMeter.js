import React from 'react';

const levelConfig = {
  Low: {
    color: 'text-green-600',
    bg: 'bg-green-50',
    border: 'border-green-200',
    bar: 'bg-green-500',
    badge: 'bg-green-100 text-green-700',
    icon: '✓',
  },
  Moderate: {
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    bar: 'bg-yellow-400',
    badge: 'bg-yellow-100 text-yellow-700',
    icon: '⚡',
  },
  High: {
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    bar: 'bg-orange-500',
    badge: 'bg-orange-100 text-orange-700',
    icon: '⚠',
  },
  Critical: {
    color: 'text-red-600',
    bg: 'bg-red-50',
    border: 'border-red-200',
    bar: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
    icon: '🔥',
  },
};

const PressureMeter = ({ pressureScore = 0, pressureLevel = 'Low', daysLeft = 0, remainingTasks = 0 }) => {
  const config = levelConfig[pressureLevel] || levelConfig.Low;

  return (
    <div className={`rounded-2xl border p-5 ${config.bg} ${config.border}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Deadline Pressure</h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.badge}`}>
          {config.icon} {pressureLevel}
        </span>
      </div>

      {/* Score Arc Display */}
      <div className="flex items-center gap-6 mb-4">
        <div className="relative flex items-center justify-center w-20 h-20">
          <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
            <circle cx="40" cy="40" r="32" fill="none" stroke="#e5e7eb" strokeWidth="8" />
            <circle
              cx="40" cy="40" r="32"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(pressureScore / 100) * 201} 201`}
              className={`transition-all duration-700 ${
                pressureLevel === 'Low' ? 'stroke-green-500' :
                pressureLevel === 'Moderate' ? 'stroke-yellow-400' :
                pressureLevel === 'High' ? 'stroke-orange-500' : 'stroke-red-500'
              }`}
            />
          </svg>
          <div className="absolute text-center">
            <div className={`text-xl font-bold ${config.color}`}>{pressureScore}</div>
            <div className="text-xs text-gray-400">/100</div>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Pressure Score</span>
              <span className={`font-semibold ${config.color}`}>{pressureScore}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-700 ${config.bar}`}
                style={{ width: `${pressureScore}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <div className={`text-2xl font-bold ${config.color}`}>{daysLeft}</div>
          <div className="text-xs text-gray-500 mt-0.5">Days Left</div>
        </div>
        <div className="bg-white rounded-xl p-3 text-center border border-gray-100">
          <div className={`text-2xl font-bold ${config.color}`}>{remainingTasks}</div>
          <div className="text-xs text-gray-500 mt-0.5">Tasks Remaining</div>
        </div>
      </div>
    </div>
  );
};

export default PressureMeter;
