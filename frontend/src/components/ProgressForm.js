import React, { useState } from 'react';
import { submitProgressUpdate, editProgressUpdate } from '../services/progressService';

const MONTHS = [
  'January 2026','February 2026','March 2026','April 2026',
  'May 2026','June 2026','July 2026','August 2026',
  'September 2026','October 2026','November 2026','December 2026',
];

// Replace with auth context later
const DUMMY_STUDENT = {
  studentId: 'student_001',
  studentName: 'Ahmed Hassan',
  supervisorId: 'supervisor_001',
  thesisTitle: 'Intelligent Thesis Management System',
};

function TaskListInput({ label, hint, tasks, onChange }) {
  const addTask = () => onChange([...tasks, { title: '' }]);
  const removeTask = (i) => onChange(tasks.filter((_, idx) => idx !== i));
  const updateTask = (i, val) =>
    onChange(tasks.map((t, idx) => (idx === i ? { ...t, title: val } : t)));

  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1">
        {label}
        <span className="ml-1 text-xs text-gray-400 font-normal">{hint}</span>
      </label>
      <div className="space-y-2">
        {tasks.map((task, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-5 h-5 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center font-bold">
              {i + 1}
            </span>
            <input
              type="text"
              value={task.title}
              onChange={(e) => updateTask(i, e.target.value)}
              placeholder={`Task ${i + 1}...`}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            {tasks.length > 1 && (
              <button
                type="button"
                onClick={() => removeTask(i)}
                className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addTask}
        className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
      >
        <span className="text-base leading-none">+</span> Add task
      </button>
    </div>
  );
}

export default function ProgressForm({ onSubmitSuccess, editingUpdate = null }) {
  const isEditing = Boolean(editingUpdate);

  const [form, setForm] = useState({
    month: editingUpdate?.month || '',
    completedTasks: editingUpdate?.completedTasks?.length
      ? editingUpdate.completedTasks
      : [{ title: '' }],
    challengesFaced: editingUpdate?.challengesFaced || '',
    upcomingGoals: editingUpdate?.upcomingGoals?.length
      ? editingUpdate.upcomingGoals
      : [{ title: '' }],
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Client-side validation
    if (!isEditing && !form.month) {
      return setError('Please select a report month.');
    }
    const validCompleted = form.completedTasks.filter(t => t.title.trim());
    const validGoals = form.upcomingGoals.filter(t => t.title.trim());
    if (validCompleted.length === 0 && validGoals.length === 0) {
      return setError('Please add at least one completed task or upcoming goal.');
    }
    if (!form.challengesFaced.trim()) {
      return setError('Please describe the challenges you faced.');
    }

    setLoading(true);
    try {
      const payload = {
        completedTasks: validCompleted,
        upcomingGoals: validGoals,
        challengesFaced: form.challengesFaced.trim(),
      };

      if (isEditing) {
        await editProgressUpdate(editingUpdate._id, payload);
      } else {
        await submitProgressUpdate({ ...DUMMY_STUDENT, month: form.month, ...payload });
      }

      setSuccess(isEditing ? 'Progress update saved!' : 'Progress update submitted!');
      setTimeout(() => { if (onSubmitSuccess) onSubmitSuccess(); }, 800);
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to submit. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Live preview: percentage based on completed vs total
  const validCompleted = form.completedTasks.filter(t => t.title.trim()).length;
  const validGoals = form.upcomingGoals.filter(t => t.title.trim()).length;
  const total = validCompleted + validGoals;
  const previewPct = total === 0 ? 0 : Math.round((validCompleted / total) * 100);

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-800 mb-0.5">
        {isEditing ? 'Edit Progress Update' : 'Monthly Progress Update'}
      </h2>
      <p className="text-gray-400 text-sm mb-6">
        {isEditing ? `Editing: ${editingUpdate.month}` : 'Submit your monthly thesis progress report'}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-5 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 mb-5 text-sm">
          {success}
        </div>
      )}

      {/* Live progress preview */}
      {total > 0 && (
        <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
          <div className="flex justify-between text-xs text-blue-700 font-medium mb-2">
            <span>Thesis completion preview</span>
            <span>{previewPct}%</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${previewPct}%` }}
            />
          </div>
          <p className="text-xs text-blue-500 mt-1.5">
            {validCompleted} completed · {validGoals} upcoming
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Month — hidden when editing */}
        {!isEditing && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Report Month</label>
            <select
              value={form.month}
              onChange={(e) => setForm({ ...form, month: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            >
              <option value="">Select month...</option>
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}

        {/* Completed Tasks */}
        <TaskListInput
          label="Completed Tasks"
          hint="— what you finished this month"
          tasks={form.completedTasks}
          onChange={(tasks) => setForm({ ...form, completedTasks: tasks })}
        />

        {/* Challenges */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Challenges Faced
            <span className="ml-1 text-xs text-gray-400 font-normal">— obstacles encountered</span>
          </label>
          <textarea
            value={form.challengesFaced}
            onChange={(e) => setForm({ ...form, challengesFaced: e.target.value })}
            rows={3}
            placeholder="What obstacles did you encounter?"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
        </div>

        {/* Upcoming Goals */}
        <TaskListInput
          label="Upcoming Goals"
          hint="— what you plan to achieve next month"
          tasks={form.upcomingGoals}
          onChange={(tasks) => setForm({ ...form, upcomingGoals: tasks })}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Submit Progress Update'}
        </button>
      </form>
    </div>
  );
}