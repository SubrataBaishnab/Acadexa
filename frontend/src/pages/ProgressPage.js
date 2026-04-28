import React, { useState, useEffect, useCallback } from 'react';
import ProgressForm from '../components/ProgressForm';
import ProgressCard from '../components/ProgressCard';
import { getStudentProgress, deleteProgressUpdate } from '../services/progressService';

// Replace with auth context later
const STUDENT_ID = 'student_001';

export default function ProgressPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState(null);

  const fetchUpdates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudentProgress(STUDENT_ID);
      setUpdates(Array.isArray(res.data) ? res.data : []);
    } catch {
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUpdates(); }, [fetchUpdates]);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this progress update?')) return;
    try {
      await deleteProgressUpdate(id);
      fetchUpdates();
    } catch {
      alert('Failed to delete progress update.');
    }
  };

  const openNewForm = () => { setEditingUpdate(null); setShowForm(true); };
  const openEditForm = (update) => { setEditingUpdate(update); setShowForm(true); };
  const closeForm = () => { setShowForm(false); setEditingUpdate(null); };
  const handleFormSuccess = () => { closeForm(); fetchUpdates(); };

  const stats = {
    total: updates.length,
    onTrack: updates.filter(u => u.status === 'On Track').length,
    delayed: updates.filter(u => u.status === 'Delayed').length,
    critical: updates.filter(u => u.status === 'Critical').length,
  };

  const avgCompletion = updates.length === 0
    ? 0
    : Math.round(updates.reduce((sum, u) => sum + (u.percentageComplete || 0), 0) / updates.length);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Progress</h1>
            <p className="text-gray-500 text-sm mt-1">Track your monthly thesis milestones</p>
          </div>
          {!showForm && (
            <button
              onClick={openNewForm}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              + New Update
            </button>
          )}
        </div>

        {/* Overall completion banner */}
        {updates.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">Overall Thesis Progress</span>
              <span className="font-bold text-blue-600">{avgCompletion}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-700"
                style={{ width: `${avgCompletion}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Average across {updates.length} monthly report{updates.length !== 1 ? 's' : ''}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Total"    value={stats.total}    color="text-gray-700"   bg="bg-white" />
          <StatCard label="On Track" value={stats.onTrack}  color="text-green-600"  bg="bg-green-50" />
          <StatCard label="Delayed"  value={stats.delayed}  color="text-orange-500" bg="bg-orange-50" />
          <StatCard label="Critical" value={stats.critical} color="text-red-600"    bg="bg-red-50" />
        </div>

        {/* Form */}
        {showForm && (
          <div className="relative">
            <button
              onClick={closeForm}
              className="absolute -top-2 right-0 text-sm text-gray-400 hover:text-gray-600 z-10"
            >
              ✕ Cancel
            </button>
            <ProgressForm
              onSubmitSuccess={handleFormSuccess}
              editingUpdate={editingUpdate}
            />
          </div>
        )}

        {/* Updates list */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading updates...</div>
        ) : updates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">No progress updates yet.</p>
            <button
              onClick={openNewForm}
              className="mt-3 text-blue-600 text-sm font-medium hover:underline"
            >
              Submit your first update →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {updates.map(update => (
              <div key={update._id}>
                <ProgressCard update={update} isSupervisor={false} />
                {update.status === 'Pending Review' && (
                  <div className="flex gap-3 justify-end px-2 pt-1.5 pb-0.5">
                    <button
                      onClick={() => openEditForm(update)}
                      className="text-xs text-blue-400 hover:text-blue-600 font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(update._id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, bg }) {
  return (
    <div className={`${bg} rounded-xl p-4 text-center shadow-sm border border-gray-100`}>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}