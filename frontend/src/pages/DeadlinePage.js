import React, { useState, useEffect } from 'react';
import { deadlineService } from '../services/deadlineService';
import PressureMeter from '../components/PressureMeter';
import TaskList from '../components/TaskList';
import BurnoutIndicator from '../components/BurnoutIndicator';

const STUDENT_ID = 'student_001';

const DeadlinePage = () => {
  const [deadline, setDeadline] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [error, setError] = useState('');
  const [isOverdue, setIsOverdue] = useState(false);

  const [form, setForm] = useState({
    thesisTitle: '',
    deadlineDate: '',
    progressPercent: 0,
    tasks: [],
  });

  const [editForm, setEditForm] = useState({
    thesisTitle: '',
    deadlineDate: '',
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
    setIsOverdue(dl < now);
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

  const handleEditSubmit = async () => {
    if (!editForm.thesisTitle || !editForm.deadlineDate) {
      setError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        studentId: STUDENT_ID,
        thesisTitle: editForm.thesisTitle,
        deadlineDate: editForm.deadlineDate,
        progressPercent: form.progressPercent,
        tasks: form.tasks,
      };
      const res = await deadlineService.updateDeadline(deadline._id, payload);
      setDeadline(res.data.deadline);
      setForm((prev) => ({
        ...prev,
        thesisTitle: editForm.thesisTitle,
        deadlineDate: editForm.deadlineDate,
      }));
      syncPressure(res.data.deadline);
      setShowEditForm(false);
    } catch (err) {
      setError('Failed to update deadline.');
    } finally {
      setSaving(false);
    }
  };

  const openEditForm = () => {
    setEditForm({ thesisTitle: form.thesisTitle, deadlineDate: form.deadlineDate });
    setShowEditForm(true);
  };

  const handleTaskChange = (newTasks) => {
    setForm((prev) => ({ ...prev, tasks: newTasks }));
    if (deadline) {
      const payload = {
        studentId: STUDENT_ID,
        thesisTitle: form.thesisTitle,
        deadlineDate: form.deadlineDate,
        progressPercent: form.progressPercent,
        tasks: newTasks,
      };
      setSaving(true);
      deadlineService.updateDeadline(deadline._id, payload)
        .then((res) => { setDeadline(res.data.deadline); syncPressure(res.data.deadline); })
        .catch(() => setError('Failed to update tasks.'))
        .finally(() => setSaving(false));
    }
  };

  const handleProgressChange = (val) => {
    const p = Number(val);
    setForm((prev) => ({ ...prev, progressPercent: p }));
    if (deadline) {
      const payload = {
        studentId: STUDENT_ID,
        thesisTitle: form.thesisTitle,
        deadlineDate: form.deadlineDate,
        progressPercent: p,
        tasks: form.tasks,
      };
      setSaving(true);
      deadlineService.updateDeadline(deadline._id, payload)
        .then((res) => { setDeadline(res.data.deadline); syncPressure(res.data.deadline); })
        .catch(() => setError('Failed to update progress.'))
        .finally(() => setSaving(false));
    }
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
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Deadline Tracker</h1>
        <p className="text-gray-500 mt-1 text-sm">Monitor your thesis timeline and pressure level in real time.</p>
      </div>

      {/* Overdue Banner */}
      {isOverdue && deadline && (
        <div className="bg-red-100 border border-red-300 text-red-700 text-sm font-medium rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          ⚠️ Your thesis deadline has already passed! Please update your deadline date.
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 flex justify-between items-center">
          {error}
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-2">✕</button>
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
                type="range" min="0" max="100" value={form.progressPercent}
                onChange={(e) => setForm({ ...form, progressPercent: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={handleCreate} disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white font-medium px-6 py-2.5 rounded-xl transition-colors">
              {saving ? 'Saving...' : 'Create Deadline'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-5 py-2.5 rounded-xl transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Dashboard */}
      {deadline && (
        <div className="space-y-5">
          {/* Single unified card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">

            {/* Title row */}
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{deadline.thesisTitle}</h2>
                <p className={`text-sm mt-0.5 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  {isOverdue ? '⚠️ Deadline passed: ' : 'Deadline: '}
                  {new Date(deadline.deadlineDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {saving && <span className="text-xs text-blue-400 animate-pulse">Saving...</span>}
                <button onClick={openEditForm}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium px-4 py-2 rounded-xl transition-colors">
                  ✏️ Edit
                </button>
              </div>
            </div>

            {/* Inline Edit Form */}
            {showEditForm && (
              <div className="mt-4 mb-4 border border-gray-100 rounded-xl bg-gray-50 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-gray-700">Edit Deadline Details</h3>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Thesis Title *</label>
                  <input type="text" value={editForm.thesisTitle}
                    onChange={(e) => setEditForm({ ...editForm, thesisTitle: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 block mb-1">Deadline Date *</label>
                  <input type="date" value={editForm.deadlineDate}
                    onChange={(e) => setEditForm({ ...editForm, deadlineDate: e.target.value })}
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button onClick={handleEditSubmit} disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button onClick={() => setShowEditForm(false)}
                    className="bg-white hover:bg-gray-100 border border-gray-200 text-gray-600 text-sm font-medium px-4 py-2 rounded-xl transition-colors">
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-gray-100 my-4" />

            {/* Progress */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500 font-medium">Overall Progress</span>
                <span className="text-blue-600 font-semibold">{form.progressPercent}%</span>
              </div>
              <input type="range" min="0" max="100" value={form.progressPercent}
                onChange={(e) => handleProgressChange(e.target.value)}
                className="w-full accent-blue-500 mb-2"
              />
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                  style={{ width: `${form.progressPercent}%` }} />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100 my-4" />

            {/* Tasks inline */}
            <TaskList tasks={form.tasks} onChange={handleTaskChange} />
          </div>

          {/* Pressure Meter */}
          <PressureMeter
            pressureScore={pressureInfo.pressureScore}
            pressureLevel={pressureInfo.pressureLevel}
            daysLeft={pressureInfo.daysLeft}
            remainingTasks={pressureInfo.remainingTasks}
            isOverdue={isOverdue}
          />

          {/* Burnout Indicator */}
          <BurnoutIndicator
            deadline={deadline}
            pressureInfo={pressureInfo}
          />
        </div>
      )}
    </div>
  );
};

export default DeadlinePage;