import React, { useState } from 'react';

const TaskList = ({ tasks = [], onChange }) => {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [showDateInput, setShowDateInput] = useState(false);

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) return;
    const newTask = {
      title: newTaskTitle,
      completed: false,
      dueDate: newTaskDueDate || null,
    };
    onChange([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setShowDateInput(false);
  };

  const handleToggleTask = (index) => {
    const updatedTasks = tasks.map((t, i) =>
      i === index ? { ...t, completed: !t.completed } : t
    );
    onChange(updatedTasks);
  };

  const handleDeleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    onChange(updatedTasks);
  };

  const isTaskOverdue = (task) => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
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
      <div className="mb-4 space-y-2">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
            placeholder="Add a new task..."
            className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={() => setShowDateInput(!showDateInput)}
            title="Add due date"
            className={`text-sm px-3 py-2 rounded-xl border transition-colors ${
              showDateInput
                ? 'bg-blue-100 border-blue-300 text-blue-600'
                : 'bg-gray-100 border-gray-200 text-gray-500 hover:bg-gray-200'
            }`}
          >
            📅
          </button>
          <button
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-medium px-4 py-2 rounded-xl transition-colors"
          >
            +
          </button>
        </div>

        {/* Optional due date for new task */}
        {showDateInput && (
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 whitespace-nowrap">Due date:</label>
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
        <div
          className="h-2 rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${tasks.length === 0 ? 0 : (completedCount / tasks.length) * 100}%` }}
        />
      </div>

      {/* Task List */}
      <div className="space-y-2 max-h-56 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No tasks yet. Add one to get started!</p>
        ) : (
          tasks.map((task, index) => (
            <div
              key={index}
              className={`flex items-start gap-2 p-3 rounded-lg ${
                isTaskOverdue(task)
                  ? 'bg-red-50 border border-red-200'
                  : 'bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggleTask(index)}
                className="w-4 h-4 mt-0.5 cursor-pointer accent-blue-500"
              />
              <div className="flex-1 min-w-0">
                <span
                  className={`text-sm font-medium block ${
                    task.completed ? 'text-gray-400 line-through' : 'text-gray-700'
                  }`}
                >
                  {task.title}
                </span>
                {task.dueDate && (
                  <span
                    className={`text-xs mt-0.5 block ${
                      isTaskOverdue(task) ? 'text-red-500 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {isTaskOverdue(task) ? '⚠️ Overdue · ' : '📅 '}
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteTask(index)}
                className="text-gray-300 hover:text-red-500 transition-colors text-lg leading-none mt-0.5"
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