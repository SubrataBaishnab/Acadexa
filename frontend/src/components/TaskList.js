import React, { useState } from 'react';

const TaskList = ({ tasks = [], onChange }) => {
  const [newTask, setNewTask] = useState('');

  const handleToggle = (index) => {
    const updated = tasks.map((t, i) =>
      i === index ? { ...t, completed: !t.completed } : t
    );
    onChange(updated);
  };

  const handleAdd = () => {
    const trimmed = newTask.trim();
    if (!trimmed) return;
    onChange([...tasks, { title: trimmed, completed: false }]);
    setNewTask('');
  };

  const handleDelete = (index) => {
    onChange(tasks.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Tasks</h3>
        <span className="text-xs text-gray-400">
          {completedCount}/{tasks.length} done
        </span>
      </div>

      {/* Progress bar */}
      {tasks.length > 0 && (
        <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
          <div
            className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }}
          />
        </div>
      )}

      {/* Task items */}
      <div className="space-y-2 mb-4 max-h-56 overflow-y-auto">
        {tasks.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No tasks yet. Add one below.</p>
        )}
        {tasks.map((task, index) => (
          <div
            key={index}
            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
              task.completed ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200'
            }`}
          >
            <button
              onClick={() => handleToggle(index)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                task.completed
                  ? 'bg-blue-500 border-blue-500 text-white'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            >
              {task.completed && (
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span className={`flex-1 text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-700'}`}>
              {task.title}
            </span>
            <button
              onClick={() => handleDelete(index)}
              className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Add task input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a task..."
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        <button
          onClick={handleAdd}
          disabled={!newTask.trim()}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  );
};

export default TaskList;
