import React, { useState } from 'react';

const STATUS_STYLES = {
  'Pending Review': 'bg-yellow-50 text-yellow-700 border-yellow-200',
  'On Track':       'bg-green-50 text-green-700 border-green-200',
  'Delayed':        'bg-orange-50 text-orange-700 border-orange-200',
  'Critical':       'bg-red-50 text-red-700 border-red-200',
};

const STATUS_BAR_COLOR = {
  'Pending Review': 'bg-yellow-400',
  'On Track':       'bg-green-500',
  'Delayed':        'bg-orange-500',
  'Critical':       'bg-red-500',
};

const STATUSES = ['On Track', 'Delayed', 'Critical', 'Pending Review'];

export default function ProgressCard({
  update,
  isSupervisor = false,
  onStatusChange,
  onAddComment,
}) {
  const [expanded, setExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  const pct = update.percentageComplete ?? 0;
  const barColor = STATUS_BAR_COLOR[update.status] || 'bg-blue-500';

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await onAddComment(update._id, commentText.trim());
      setCommentText('');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-6 pt-5 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isSupervisor && (
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">
                {update.studentName}
              </p>
            )}
            <h3 className="text-base font-bold text-gray-800 truncate">{update.month}</h3>
            {isSupervisor && (
              <p className="text-xs text-gray-400 truncate mt-0.5">{update.thesisTitle}</p>
            )}
          </div>

          {/* Status badge or selector */}
          {isSupervisor ? (
            <select
              value={update.status}
              onChange={(e) => onStatusChange(update._id, e.target.value)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none ${STATUS_STYLES[update.status]}`}
            >
              {STATUSES.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          ) : (
            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${STATUS_STYLES[update.status]}`}>
              {update.status}
            </span>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-500 mb-1.5">
            <span>Overall completion</span>
            <span className="font-semibold text-gray-700">{pct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`${barColor} h-2.5 rounded-full transition-all duration-500`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="flex gap-4 mt-2 text-xs text-gray-400">
            <span>✓ {update.completedTasks?.length ?? 0} completed</span>
            <span>○ {update.upcomingGoals?.length ?? 0} upcoming</span>
          </div>
        </div>
      </div>

      {/* Expand/Collapse toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-2.5 text-xs text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors border-t border-gray-50 flex items-center justify-center gap-1"
      >
        {expanded ? '▲ Hide details' : '▼ View details'}
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-6 pb-6 space-y-5 border-t border-gray-50 pt-4">

          {/* Completed Tasks */}
          {update.completedTasks?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Completed Tasks
              </p>
              <ul className="space-y-1.5">
                {update.completedTasks.map((task, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full bg-green-100 text-green-600 text-xs flex items-center justify-center">✓</span>
                    {task.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Upcoming Goals */}
          {update.upcomingGoals?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Upcoming Goals
              </p>
              <ul className="space-y-1.5">
                {update.upcomingGoals.map((goal, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-full bg-blue-50 text-blue-400 text-xs flex items-center justify-center">○</span>
                    {goal.title}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenges */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Challenges Faced
            </p>
            <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-lg px-3 py-2.5">
              {update.challengesFaced}
            </p>
          </div>

          {/* Comments */}
          {update.comments?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Supervisor Comments
              </p>
              <div className="space-y-2">
                {update.comments.map((c, i) => (
                  <div key={i} className="bg-blue-50 rounded-lg px-3 py-2.5">
                    <p className="text-xs font-semibold text-blue-700">{c.supervisorName}</p>
                    <p className="text-sm text-gray-700 mt-0.5">{c.text}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Supervisor: Add comment */}
          {isSupervisor && (
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              />
              <button
                type="submit"
                disabled={submittingComment || !commentText.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                {submittingComment ? '...' : 'Post'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}