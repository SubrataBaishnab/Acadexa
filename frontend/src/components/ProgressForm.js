import React, { useState } from 'react';
import { submitProgressUpdate } from '../services/progressService';

const months = [
  'January 2026','February 2026','March 2026','April 2026',
  'May 2026','June 2026','July 2026','August 2026',
  'September 2026','October 2026','November 2026','December 2026',
];

// Temporary dummy student — replace with auth context later
const DUMMY_STUDENT = {
  studentId: 'student_001',
  studentName: 'Ahmed Hassan',
  supervisorId: 'supervisor_001',
  thesisTitle: 'Intelligent Thesis Management System',
};

export default function ProgressForm({ onSubmitSuccess }) {
  const [form, setForm] = useState({
    month: '',
    completedTasks: '',
    challengesFaced: '',
    upcomingGoals: '',
    percentageComplete: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.month || !form.completedTasks || !form.challengesFaced || !form.upcomingGoals) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await submitProgressUpdate({ ...DUMMY_STUDENT, ...form });
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess('Progress update submitted successfully!');
        setForm({ month: '', completedTasks: '', challengesFaced: '', upcomingGoals: '', percentageComplete: 0 });
        setTimeout(() => {
          if (onSubmitSuccess) onSubmitSuccess();
        }, 1000);
      }
    } catch (err) {
      setError('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-1">Monthly Progress Update</h2>
      <p className="text-gray-500 text-sm mb-6">Submit your monthly thesis progress report</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-3 mb-4 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-3 mb-4 text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Month */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Report Month</label>
          <select
            name="month"
            value={form.month}
            onChange={handleChange}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
          >
            <option value="">Select month...</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Completed Tasks */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Completed Tasks</label>
          <textarea
            name="completedTasks"
            value={form.completedTasks}
            onChange={handleChange}
            rows={3}
            placeholder="What did you accomplish this month?"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
        </div>

        {/* Challenges */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Challenges Faced</label>
          <textarea
            name="challengesFaced"
            value={form.challengesFaced}
            onChange={handleChange}
            rows={3}
            placeholder="What obstacles did you encounter?"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
        </div>

        {/* Upcoming Goals */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Upcoming Goals</label>
          <textarea
            name="upcomingGoals"
            value={form.upcomingGoals}
            onChange={handleChange}
            rows={3}
            placeholder="What do you plan to achieve next month?"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
        </div>

        {/* Progress % */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Thesis Completion: <span className="text-blue-600 font-semibold">{form.percentageComplete}%</span>
          </label>
          <input
            type="range"
            name="percentageComplete"
            min="0"
            max="100"
            value={form.percentageComplete}
            onChange={handleChange}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>0%</span><span>50%</span><span>100%</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors duration-200 text-sm disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit Progress Update'}
        </button>
      </form>
    </div>
  );
}
