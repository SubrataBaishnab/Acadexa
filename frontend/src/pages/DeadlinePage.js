import React, { useState, useEffect } from 'react';
import { deadlineService } from '../services/deadlineService';
import PressureMeter from '../components/PressureMeter';
import TaskList from '../components/TaskList';

const STUDENT_ID = 'student_001'; // Replace with auth context later

const DeadlinePage = () => {
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    thesisTitle: '',
    deadlineDate: '',
    progressPercent: 0,
    tasks: [],
  });

  const [pressureInfo, setPressureInfo] = useState({
    pressureScore: 0,
    pressureLevel: 'Low',
    daysLeft: 0,
    remainingTasks: 0,
  });

  useEffect(() => {
    fetchDeadline();
  }, []);

  const fetchDeadline = async () => {
    setLoading(true);
    try {
      const res = await deadlineService.getDeadlineByStudent(STUDENT_ID);
      if (res.data && res.data.length > 0) {
        const d = res.data[0];
        setDeadline(d);
        setForm({
          thesisTitle: d.thesisTitle,
          deadlineDate: d.deadlineDate?.split('T')[0] || '',
          progressPercent: d.progressPercent,
          tasks: d.tasks || [],
        });
        syncPressure(d);
      }
    } catch (err) {
      setError('Failed to load deadline data.');
    } finally {
      setLoading(false);
    }
  };

  const syncPressure = (d) => {
    const now = new Date();
    const dl = new Date(d.deadlineDate);
    const daysLeft = Math.max(0, Math.ceil((dl - now) / (1000 * 60 * 60 * 24)));
    const remainingTasks = (d.tasks || []).filter((t) => !t.completed).length;
    setPressureInfo({
      pressureScore: d.pressureScore || 0,
      pressureLevel: d.pressureLevel || 'Low',
      daysLeft,
      remainingTasks,
    });
  };

  const handleCreate = async () => {
    if (!form.thesisTitle || !form.deadlineDate) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const res = await deadlineService.createDeadline({ ...form, studentId: STUDENT_ID });
      setDeadline(res.data.deadline);
      syncPressure(res.data.deadline);
      setShowForm(false);
    } catch (err) {
      setError('Failed to create deadline.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (updatedFields) => {
    if (!deadline) return;
    setSaving(true);
    try {
      const payload = { ...form, ...updatedFields };
      const res = await deadlineService.updateDeadline(deadline._id, payload);
      setDeadline(res.data.deadline);
      setForm((prev) => ({ ...prev, ...updatedFields }));
      syncPressure(res.data.deadline);
    } catch (err) {
      setError('Failed to update.');
    } finally {
      setSaving(false);
    }
  };

  const handleTaskChange = (newTasks) => {
    setForm((prev) => ({ ...prev, tasks: newTasks }));
    if (deadline) handleUpdate({ tasks: newTasks });
  };

  const handleProgressChange = (val) => {
    const p = Number(val);
    setForm((prev) => ({ ...prev, progressPercent: p }));
    if (deadline) handleUpdate({ progressPercent: p });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Loading deadline...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Deadline Tracker</h1>
        <p className="text-gray-500 mt-1 text-sm">Monitor your thesis timeline and pressure level in real time.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {/* No deadline yet */}
      {!deadline && !showForm && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No deadline set yet</h2>
          <p className="text-sm text-gray-400 mb-6">Set your thesis deadline to start tracking your progress and pressure level.</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
          >
            + Set Deadline
          </button>
        </div>
      )}

      {/* Create Form */}
      {showForm && !deadline && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Set Your Thesis Deadline</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Thesis Title *</label>
              <input
                type="text"
                value={form.thesisTitle}
                onChange={(e) => setForm({ ...form, thesisTitle: e.target.value })}
                placeholder="e.g. Deep Learning for Medical Imaging"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Deadline Date *</label>
              <input
                type="date"
                value={form.deadlineDate}
                onChange={(e) => setForm({ ...form, deadlineDate: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">
                Current Progress: <span className="text-blue-600 font-semibold">{form.progressPercent}%</span>
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.progressPercent}
                onChange={(e) => setForm({ ...form, progressPercent: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCreate}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              {saving ? 'Saving...' : 'Create Deadline'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-5 py-2.5 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Dashboard (when deadline exists) */}
      {deadline && (
        <>
          {/* Thesis Title + Meta */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{deadline.thesisTitle}</h2>
                <p className="text-sm text-gray-400 mt-0.5">
                  Deadline: {new Date(deadline.deadlineDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              {saving && <span className="text-xs text-blue-400 animate-pulse">Saving...</span>}
            </div>

            {/* Progress slider */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 font-medium">Overall Progress</span>
                <span className="text-blue-600 font-semibold">{form.progressPercent}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={form.progressPercent}
                onChange={(e) => handleProgressChange(e.target.value)}
                className="w-full accent-blue-500"
              />
              <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                <div
                  className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${form.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Pressure Meter + Tasks (2 col on larger screens) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PressureMeter
              pressureScore={pressureInfo.pressureScore}
              pressureLevel={pressureInfo.pressureLevel}
              daysLeft={pressureInfo.daysLeft}
              remainingTasks={pressureInfo.remainingTasks}
            />
            <TaskList tasks={form.tasks} onChange={handleTaskChange} />
          </div>
        </>
      )}
    </div>
  );
};

export default DeadlinePage;
