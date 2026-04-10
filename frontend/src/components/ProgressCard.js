import React from 'react';

const statusConfig = {
  'Pending Review': { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  'On Track':       { color: 'bg-green-100 text-green-700 border-green-200',  dot: 'bg-green-500'  },
  'Delayed':        { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  'Critical':       { color: 'bg-red-100 text-red-700 border-red-200',       dot: 'bg-red-500'    },
};

export default function ProgressCard({ update, isSupervisor, onStatusChange, onAddComment }) {
  const [comment, setComment] = React.useState('');
  const [showCommentBox, setShowCommentBox] = React.useState(false);

  const cfg = statusConfig[update.status] || statusConfig['Pending Review'];

  const handleCommentSubmit = () => {
    if (!comment.trim()) return;
    onAddComment(update._id, comment);
    setComment('');
    setShowCommentBox(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-gray-800 text-lg">{update.month}</h3>
          {isSupervisor && (
            <p className="text-sm text-gray-500 mt-0.5">👤 {update.studentName}</p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">{update.thesisTitle}</p>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${cfg.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
          {update.status}
        </span>
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs text-gray-500 mb-1">
          <span>Thesis Completion</span>
          <span className="font-medium">{update.percentageComplete}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${update.percentageComplete}%` }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 gap-3">
        <Detail label="✅ Completed Tasks" value={update.completedTasks} />
        <Detail label="⚠️ Challenges Faced" value={update.challengesFaced} />
        <Detail label="🎯 Upcoming Goals" value={update.upcomingGoals} />
      </div>

      {/* Supervisor Controls */}
      {isSupervisor && (
        <div className="pt-2 border-t border-gray-100 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 font-medium">Set Status:</span>
            {['On Track', 'Delayed', 'Critical'].map(s => (
              <button
                key={s}
                onClick={() => onStatusChange(update._id, s)}
                className={`text-xs px-3 py-1 rounded-full border font-medium transition-colors ${
                  update.status === s
                    ? statusConfig[s].color
                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowCommentBox(!showCommentBox)}
            className="text-xs text-blue-600 hover:underline font-medium"
          >
            {showCommentBox ? 'Cancel' : '+ Add Comment'}
          </button>
          {showCommentBox && (
            <div className="flex gap-2">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Write your feedback..."
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleCommentSubmit}
                className="bg-blue-600 text-white text-xs px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
              >
                Send
              </button>
            </div>
          )}
        </div>
      )}

      {/* Comments */}
      {update.comments && update.comments.length > 0 && (
        <div className="pt-2 border-t border-gray-100 space-y-2">
          <p className="text-xs font-medium text-gray-500">Supervisor Comments</p>
          {update.comments.map((c, i) => (
            <div key={i} className="bg-blue-50 rounded-xl px-4 py-2.5">
              <p className="text-xs font-semibold text-blue-700">{c.supervisorName}</p>
              <p className="text-sm text-gray-700 mt-0.5">{c.text}</p>
              <p className="text-xs text-gray-400 mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="bg-gray-50 rounded-xl px-4 py-3">
      <p className="text-xs font-semibold text-gray-500 mb-1">{label}</p>
      <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
    </div>
  );
}
