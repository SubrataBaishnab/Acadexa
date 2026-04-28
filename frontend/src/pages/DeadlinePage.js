import React, { useState, useEffect, useCallback } from 'react';
import { deadlineService } from '../services/deadlineService';
import PressureMeter from '../components/PressureMeter';
import TaskList from '../components/TaskList';

const STUDENT_ID = 'student_001';

function MeetingModal({ onClose, onSchedule, loading }) {
  const [form, setForm] = useState({ meetingDate: '', meetingLink: '' });
  const handleSubmit = (e) => { e.preventDefault(); if (!form.meetingDate) return; onSchedule(form); };
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">📅 Schedule Meeting</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Meeting Date & Time *</label>
            <input type="datetime-local" value={form.meetingDate}
              onChange={e => setForm({ ...form, meetingDate: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Meeting Link (optional)</label>
            <input type="url" value={form.meetingLink}
              onChange={e => setForm({ ...form, meetingLink: e.target.value })}
              placeholder="https://meet.google.com/..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading || !form.meetingDate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {loading ? 'Scheduling...' : 'Schedule & Add to Calendar'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditDeadlineModal({ deadline, onClose, onSave, saving }) {
  const [form, setForm] = useState({
    thesisTitle:     deadline.thesisTitle     || '',
    deadlineDate:    deadline.deadlineDate?.split('T')[0] || '',
    supervisorEmail: deadline.supervisorEmail || '',
    studentEmail:    deadline.studentEmail    || '',
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.thesisTitle.trim()) return setError('Thesis title is required.');
    if (!form.deadlineDate)       return setError('Deadline date is required.');
    setError('');
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">✏️ Edit Deadline</h3>
        {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Thesis Title *</label>
            <input type="text" value={form.thesisTitle}
              onChange={e => setForm({ ...form, thesisTitle: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Deadline Date *</label>
            <input type="date" value={form.deadlineDate}
              onChange={e => setForm({ ...form, deadlineDate: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Supervisor Email</label>
            <input type="email" value={form.supervisorEmail}
              onChange={e => setForm({ ...form, supervisorEmail: e.target.value })}
              placeholder="supervisor@university.edu"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-600 block mb-1">Your Email</label>
            <input type="email" value={form.studentEmail}
              onChange={e => setForm({ ...form, studentEmail: e.target.value })}
              placeholder="student@university.edu"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const DeadlinePage = () => {
  const [deadline, setDeadline]             = useState(null);
  const [loading, setLoading]               = useState(true);
  const [saving, setSaving]                 = useState(false);
  const [showForm, setShowForm]             = useState(false);
  const [showMeeting, setShowMeeting]       = useState(false);
  const [showEdit, setShowEdit]             = useState(false);
  const [meetingLoading, setMeetingLoading] = useState(false);
  const [error, setError]                   = useState('');
  const [successMsg, setSuccessMsg]         = useState('');
  const [isOverdue, setIsOverdue]           = useState(false);

  const [form, setForm] = useState({
    thesisTitle: '', deadlineDate: '', progressPercent: 0,
    tasks: [], supervisorEmail: '', studentEmail: '',
  });

  const [pressureInfo, setPressureInfo] = useState({
    pressureScore: 0, pressureLevel: 'Low', daysLeft: 0, remainingTasks: 0,
  });

  const syncPressure = (d) => {
    const now = new Date();
    const dl = new Date(d.deadlineDate);
    const daysLeft = Math.max(0, Math.ceil((dl - now) / (1000 * 60 * 60 * 24)));
    setIsOverdue(dl < now);
    const remainingTasks = (d.tasks || []).filter(t => !t.completed).length;
    setPressureInfo({ pressureScore: d.pressureScore || 0, pressureLevel: d.pressureLevel || 'Low', daysLeft, remainingTasks });
  };

  const fetchDeadline = useCallback(async () => {
    setLoading(true);
    try {
      const res = await deadlineService.getDeadlineByStudent(STUDENT_ID);
      if (res.data?.length > 0) {
        const d = res.data[0];
        setDeadline(d);
        setForm({
          thesisTitle: d.thesisTitle, deadlineDate: d.deadlineDate?.split('T')[0] || '',
          progressPercent: d.progressPercent, tasks: d.tasks || [],
          supervisorEmail: d.supervisorEmail || '', studentEmail: d.studentEmail || '',
        });
        syncPressure(d);
      }
    } catch { setError('Failed to load deadline data.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchDeadline(); }, [fetchDeadline]);

  const handleCreate = async () => {
    if (!form.thesisTitle || !form.deadlineDate) { setError('Please fill in all required fields.'); return; }
    setSaving(true); setError('');
    try {
      const res = await deadlineService.createDeadline({ ...form, studentId: STUDENT_ID });
      setDeadline(res.data.deadline); syncPressure(res.data.deadline); setShowForm(false);
    } catch { setError('Failed to create deadline.'); }
    finally { setSaving(false); }
  };

  const handleUpdate = async (updatedFields) => {
    if (!deadline) return;
    setSaving(true);
    try {
      const payload = { ...form, ...updatedFields };
      const res = await deadlineService.updateDeadline(deadline._id, payload);
      setDeadline(res.data.deadline);
      setForm(prev => ({ ...prev, ...updatedFields }));
      syncPressure(res.data.deadline);
    } catch { setError('Failed to update.'); }
    finally { setSaving(false); }
  };

  const handleEditSave = async (editedFields) => {
    if (!deadline) return;
    setSaving(true);
    try {
      const payload = { ...form, ...editedFields };
      const res = await deadlineService.updateDeadline(deadline._id, payload);
      const updated = res.data.deadline;
      setDeadline(updated);
      setForm(prev => ({ ...prev, ...editedFields }));
      syncPressure(updated);
      setShowEdit(false);
      setSuccessMsg('Deadline updated successfully.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch { setError('Failed to update deadline.'); }
    finally { setSaving(false); }
  };

  const handleTaskChange     = (newTasks) => { setForm(p => ({ ...p, tasks: newTasks })); if (deadline) handleUpdate({ tasks: newTasks }); };
  const handleProgressChange = (val)      => { const p = Number(val); setForm(p2 => ({ ...p2, progressPercent: p })); if (deadline) handleUpdate({ progressPercent: p }); };

  const handleScheduleMeeting = async (meetingForm) => {
    setMeetingLoading(true);
    try {
      await deadlineService.scheduleMeeting({
        studentId:       STUDENT_ID,
        supervisorId:    deadline?.supervisorId    || 'supervisor_001',
        supervisorEmail: deadline?.supervisorEmail || form.supervisorEmail,
        studentEmail:    deadline?.studentEmail    || form.studentEmail,
        thesisTitle:     deadline?.thesisTitle     || form.thesisTitle,
        deadlineId:      deadline?._id,
        meetingDate:     meetingForm.meetingDate,
        meetingLink:     meetingForm.meetingLink,
      });
      setShowMeeting(false);
      setSuccessMsg('Meeting scheduled! Calendar event created.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchDeadline();
    } catch { setError('Failed to schedule meeting.'); }
    finally { setMeetingLoading(false); }
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
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Deadline Tracker</h1>
          <p className="text-gray-500 mt-1 text-sm">Monitor your thesis timeline and pressure level in real time.</p>
        </div>
        {deadline && (
          <button onClick={() => setShowMeeting(true)}
            className="text-sm bg-teal-600 hover:bg-teal-700 text-white font-semibold px-4 py-2.5 rounded-xl transition-colors">
            📅 Schedule Meeting
          </button>
        )}
      </div>

      {isOverdue && deadline && (
        <div className="bg-red-100 border border-red-300 text-red-700 text-sm font-medium rounded-xl px-4 py-3 mb-6 flex items-center gap-2">
          ⚠️ Your thesis deadline has already passed! Please update your deadline date.
        </div>
      )}

      {error    && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5 flex justify-between items-center">{error} <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button></div>}
      {successMsg && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">{successMsg}</div>}

      {!deadline && !showForm && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-5xl mb-4">📅</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No deadline set yet</h2>
          <p className="text-sm text-gray-400 mb-6">Set your thesis deadline to start tracking your progress and pressure level.</p>
          <button onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors">
            + Set Deadline
          </button>
        </div>
      )}

      {showForm && !deadline && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-semibold text-gray-800 mb-5">Set Your Thesis Deadline</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Thesis Title *</label>
              <input type="text" value={form.thesisTitle} onChange={e => setForm({ ...form, thesisTitle: e.target.value })}
                placeholder="e.g. Deep Learning for Medical Imaging"
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">Deadline Date *</label>
              <input type="date" value={form.deadlineDate} onChange={e => setForm({ ...form, deadlineDate: e.target.value })}
                className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Supervisor Email</label>
                <input type="email" value={form.supervisorEmail} onChange={e => setForm({ ...form, supervisorEmail: e.target.value })}
                  placeholder="supervisor@university.edu"
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Your Email</label>
                <input type="email" value={form.studentEmail} onChange={e => setForm({ ...form, studentEmail: e.target.value })}
                  placeholder="student@university.edu"
                  className="w-full text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 block mb-1">
                Current Progress: <span className="text-blue-600 font-semibold">{form.progressPercent}%</span>
              </label>
              <input type="range" min="0" max="100" value={form.progressPercent}
                onChange={e => setForm({ ...form, progressPercent: Number(e.target.value) })}
                className="w-full accent-blue-500" />
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

      {deadline && (
        <>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-800">{deadline.thesisTitle}</h2>
                <p className={`text-sm mt-0.5 ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                  {isOverdue ? '⚠️ Deadline passed: ' : 'Deadline: '}
                  {new Date(deadline.deadlineDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {saving && <span className="text-xs text-blue-400 animate-pulse">Saving...</span>}
                <button onClick={() => setShowEdit(true)}
                  className="text-xs text-blue-500 hover:text-blue-700 font-semibold border border-blue-200 hover:border-blue-400 px-3 py-1.5 rounded-lg transition-colors">
                  ✏️ Edit
                </button>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 font-medium">Overall Progress</span>
                <span className="text-blue-600 font-semibold">{form.progressPercent}%</span>
              </div>
              <input type="range" min="0" max="100" value={form.progressPercent}
                onChange={e => handleProgressChange(e.target.value)} className="w-full accent-blue-500" />
              <div className="w-full bg-gray-100 rounded-full h-2 mt-1">
                <div className="h-2 rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${form.progressPercent}%` }} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <PressureMeter
              pressureScore={pressureInfo.pressureScore}
              pressureLevel={pressureInfo.pressureLevel}
              daysLeft={pressureInfo.daysLeft}
              remainingTasks={pressureInfo.remainingTasks}
              isOverdue={isOverdue}
            />
            <TaskList tasks={form.tasks} onChange={handleTaskChange} />
          </div>
        </>
      )}

      {showMeeting && (
        <MeetingModal onClose={() => setShowMeeting(false)} onSchedule={handleScheduleMeeting} loading={meetingLoading} />
      )}
      {showEdit && deadline && (
        <EditDeadlineModal deadline={{ ...deadline, ...form }} onClose={() => setShowEdit(false)} onSave={handleEditSave} saving={saving} />
      )}
    </div>
  );
};

export default DeadlinePage;