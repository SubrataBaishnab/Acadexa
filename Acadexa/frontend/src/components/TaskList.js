import React, { useState } from 'react';

const TaskList = ({ tasks = [], onChange }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      title: newTaskTitle,
      completed: false,
    };
    onChange([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const handleToggleTask = (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    onChange(updatedTasks);
  };

  const handleDeleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    onChange(updatedTasks);
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Tasks</h3>
        <span className="text-xs text-gray-400">
          {completedCount}/{tasks.length}
        </span>
      </div>

      {/* Task Input */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
          placeholder="Add a new task..."
          className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleAddTask}
          disabled={!newTaskTitle.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-medium px-4 py-2 rounded-xl transition-colors"
        >
          +
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100}%` }}
        />
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No tasks yet. Add one to get started!</p>
        ) : (
          tasks.map((task, index) => (
            <div key={index} className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(index)}
                className="w-4 h-4 cursor-pointer accent-blue-500"
              />
              <span
                className={`flex-1 text-sm font-medium ${
                  task.completed
                    ? 'text-gray-400 line-through'
                    : 'text-gray-700'
                }`}
              >
                {task.title}
              </span>
              <button
                onClick={() => handleDeleteTask(index)}
                className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TaskList;
