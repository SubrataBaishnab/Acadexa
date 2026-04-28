import React, { useState } from 'react';
import { deadlineService } from '../services/deadlineService';

const RISK_STYLES = {
  'Low Risk':      { bg: 'bg-green-50',  border: 'border-green-200',  badge: 'bg-green-100 text-green-800 border-green-300',  ring: '#16a34a', label: 'text-green-700' },
  'Moderate Risk': { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800 border-yellow-300', ring: '#ca8a04', label: 'text-yellow-700' },
  'High Risk':     { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-100 text-orange-800 border-orange-300', ring: '#ea580c', label: 'text-orange-700' },
  'Critical Risk': { bg: 'bg-red-50',    border: 'border-red-200',    badge: 'bg-red-100 text-red-800 border-red-300',          ring: '#dc2626', label: 'text-red-700' },
};

const CATEGORY_ICONS = {
  'Time Management': '⏰',
  'Self Care':       '🌿',
  'Task Strategy':   '🎯',
  'Mental Health':   '🧠',
  'Academic':        '📚',
};

const ScoreRing = ({ score, color }) => {
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative" style={{ width: 80, height: 80 }}>
      <svg width="80" height="80" viewBox="0 0 80 80" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="40" cy="40" r={radius} fill="none" stroke="#e5e7eb" strokeWidth="6" />
        <circle cx="40" cy="40" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circumference} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease' }} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-semibold text-gray-800">{score}</span>
        <span className="text-xs text-gray-400">/100</span>
      </div>
    </div>
  );
};

const BurnoutIndicator = ({ deadline, pressureInfo }) => {
  const [extraContext, setExtraContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);

  const totalTasks = deadline?.tasks?.length || 0;

  const handleAnalyze = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const payload = {
        thesisTitle:     deadline.thesisTitle,
        deadlineDate:    deadline.deadlineDate,
        progressPercent: deadline.progressPercent,
        pressureScore:   pressureInfo.pressureScore,
        pressureLevel:   pressureInfo.pressureLevel,
        daysLeft:        pressureInfo.daysLeft,
        remainingTasks:  pressureInfo.remainingTasks,
        totalTasks,
        extraContext,
      };
      const res = await deadlineService.analyzeBurnout(payload);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const style = result
    ? RISK_STYLES[result.risk_level] || RISK_STYLES['Moderate Risk']
    : null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

      {/* Header — always visible, clickable to expand */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">🔥</span>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-800">Burnout Indicator</h3>
            <p className="text-xs text-gray-400">
              {result ? `Risk Level: ${result.risk_level}` : 'Detect signs of overwork and burnout'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result && (
            <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${RISK_STYLES[result.risk_level]?.badge}`}>
              {result.risk_level}
            </span>
          )}
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Expandable body */}
      {expanded && (
        <div className="border-t border-gray-100 px-6 py-5">

          {/* Extra context input */}
          {!result && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                How are you feeling lately?{' '}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                rows={2}
                placeholder="e.g. I've been working late nights, skipping meals, feeling anxious about the deadline..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
              />
            </div>
          )}

          {/* Current stats summary */}
          {!result && (
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { label: 'Days Left',       value: pressureInfo.daysLeft },
                { label: 'Tasks Remaining', value: pressureInfo.remainingTasks },
                { label: 'Pressure Score',  value: `${pressureInfo.pressureScore}/100` },
              ].map((stat) => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-semibold text-gray-800">{stat.value}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Analyze button */}
          {!result && (
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Analyzing burnout patterns...
                </span>
              ) : (
                'Check My Burnout Risk →'
              )}
            </button>
          )}

          {/* Results */}
          {result && style && (
            <div className="space-y-4">

              {/* Score hero */}
              <div className={`rounded-xl border p-4 flex items-center gap-4 ${style.bg} ${style.border}`}>
                <ScoreRing score={result.burnout_score} color={style.ring} />
                <div>
                  <span className={`inline-block text-xs px-2.5 py-1 rounded-full border font-medium mb-1.5 ${style.badge}`}>
                    {result.risk_level}
                  </span>
                  <h4 className="text-sm font-semibold text-gray-800 mb-1">{result.headline}</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">{result.summary}</p>
                </div>
              </div>

              {/* Warning signs */}
              {result.warning_signs?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Warning Signs Detected
                  </p>
                  <ul className="space-y-1.5">
                    {result.warning_signs.map((sign, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-orange-400 mt-0.5 flex-shrink-0">⚠</span>
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {result.suggestions?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Recommendations
                  </p>
                  <div className="space-y-2">
                    {result.suggestions.map((s, i) => (
                      <div key={i} className="flex gap-3 bg-gray-50 rounded-xl px-4 py-3">
                        <span className="text-base flex-shrink-0">
                          {CATEGORY_ICONS[s.category] || '💡'}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-0.5">{s.category}</p>
                          <p className="text-sm text-gray-700 leading-relaxed">{s.tip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Encouraging note */}
              {result.encouraging_note && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                  <p className="text-sm text-blue-700 leading-relaxed">
                    💙 {result.encouraging_note}
                  </p>
                </div>
              )}

              {/* Re-analyze button */}
              <button
                onClick={() => { setResult(null); setExtraContext(''); }}
                className="w-full border border-gray-200 hover:bg-gray-50 text-gray-500 text-sm py-2.5 rounded-xl transition-colors"
              >
                ← Re-analyze
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BurnoutIndicator;