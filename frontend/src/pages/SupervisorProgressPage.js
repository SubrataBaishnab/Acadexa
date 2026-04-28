import React, { useState, useEffect, useCallback } from 'react';
import ProgressCard from '../components/ProgressCard';
import { getSupervisorProgress, updateProgressStatus, addProgressComment } from '../services/progressService';

// Replace with auth context later
const SUPERVISOR_ID = 'supervisor_001';
const SUPERVISOR_NAME = 'Dr. Rahman';

export default function SupervisorProgressPage() {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');

  const fetchUpdates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getSupervisorProgress(SUPERVISOR_ID);
      setUpdates(Array.isArray(res.data) ? res.data : []);
    } catch {
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUpdates(); }, [fetchUpdates]);

  const handleStatusChange = async (id, status) => {
    try {
      await updateProgressStatus(id, status);
      fetchUpdates();
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleAddComment = async (id, text) => {
    try {
      await addProgressComment(id, {
        supervisorId: SUPERVISOR_ID,
        supervisorName: SUPERVISOR_NAME,
        text,
      });
      fetchUpdates();
    } catch {
      alert('Failed to add comment.');
    }
  };

  const STATUSES = ['All', 'Pending Review', 'On Track', 'Delayed', 'Critical'];
  const filtered = filterStatus === 'All'
    ? updates
    : updates.filter(u => u.status === filterStatus);

  const stats = {
    pending:  updates.filter(u => u.status === 'Pending Review').length,
    onTrack:  updates.filter(u => u.status === 'On Track').length,
    delayed:  updates.filter(u => u.status === 'Delayed').length,
    critical: updates.filter(u => u.status === 'Critical').length,
  };

  // Average overall completion across all students
  const avgCompletion = updates.length === 0
    ? 0
    : Math.round(updates.reduce((s, u) => s + (u.percentageComplete || 0), 0) / updates.length);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Progress</h1>
          <p className="text-gray-500 text-sm mt-1">Review and manage your students' monthly updates</p>
        </div>

        {/* Cohort average banner */}
        {updates.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">Cohort Average Completion</span>
              <span className="font-bold text-blue-600">{avgCompletion}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all duration-700"
                style={{ width: `${avgCompletion}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-2">{updates.length} submission{updates.length !== 1 ? 's' : ''} total</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Pending"  value={stats.pending}  color="text-yellow-600"  bg="bg-yellow-50" />
          <StatCard label="On Track" value={stats.onTrack}  color="text-green-600"   bg="bg-green-50" />
          <StatCard label="Delayed"  value={stats.delayed}  color="text-orange-500"  bg="bg-orange-50" />
          <StatCard label="Critical" value={stats.critical} color="text-red-600"     bg="bg-red-50" />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-4 py-2 rounded-full font-medium border transition-colors ${
                filterStatus === s
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {s}{s !== 'All' ? ` (${updates.filter(u => u.status === s).length})` : ''}
            </button>
          ))}
        </div>

        {/* Updates */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading updates...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 text-sm">No updates found for this filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(update => (
              <ProgressCard
                key={update._id}
                update={update}
                isSupervisor={true}
                onStatusChange={handleStatusChange}
                onAddComment={handleAddComment}
              />
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