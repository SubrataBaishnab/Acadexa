import React, { useState, useEffect } from 'react';
import { deadlineService } from '../services/deadlineService';

const IS_ADMIN = true; // Replace with auth context later

function StatCard({ label, value, sub, color = 'text-blue-600', icon, bg = 'bg-white' }) {
  return (
    <div className={`${bg} rounded-2xl border border-gray-100 shadow-sm p-5`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">{children}</h2>;
}

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    deadlineService.getAdminAnalytics()
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load admin analytics.'))
      .finally(() => setLoading(false));
  }, []);

  if (!IS_ADMIN) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Access denied.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Loading admin dashboard...</div>
      </div>
    );
  }

  const {
    totalDeadlines = 0,
    avgProgress = 0,
    totalMeetings = 0,
    supervisorWorkload = [],
    popularDomains = [],
    statusBreakdown = {},
    pressureBreakdown = {},
  } = data || {};

  const maxWorkload = Math.max(...supervisorWorkload.map(s => s.studentCount), 1);
  const maxDomain   = Math.max(...popularDomains.map(d => d.count), 1);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">Monitor all theses, supervisor workload, and system health.</p>
        </div>

      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">{error}</div>}
      {msg   && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">{msg}</div>}

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Active Theses"      value={totalDeadlines}                    icon="📚" color="text-blue-600" />
        <StatCard label="Avg Progress"         value={`${avgProgress}%`}                 icon="📈" color="text-green-600" />
        <StatCard label="Meetings Scheduled"   value={totalMeetings || 0}                icon="📅" color="text-teal-600" />
        <StatCard label="Critical"             value={statusBreakdown['Critical'] || 0}  icon="🔥" color="text-red-600" bg="bg-red-50" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Supervisor Workload */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionTitle>Supervisor Workload</SectionTitle>
          {supervisorWorkload.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {supervisorWorkload.map((s, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{s.supervisorId}</span>
                    <span className="text-gray-500">{s.studentCount} student{s.studentCount !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${(s.studentCount / maxWorkload) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Popular Research Domains */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionTitle>Popular Research Domains</SectionTitle>
          {popularDomains.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No archived theses yet.</p>
          ) : (
            <div className="space-y-3">
              {popularDomains.map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700 capitalize">{d.keyword}</span>
                    <span className="text-gray-500">{d.count} thesis{d.count !== 1 ? 'es' : ''}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-indigo-400 transition-all duration-500"
                      style={{ width: `${(d.count / maxDomain) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

        {/* Pressure breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionTitle>Deadline Pressure Breakdown</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {['Low','Moderate','High','Critical'].map(level => {
              const colors = {
                Low:      'bg-green-50 text-green-600 border-green-100',
                Moderate: 'bg-yellow-50 text-yellow-600 border-yellow-100',
                High:     'bg-orange-50 text-orange-500 border-orange-100',
                Critical: 'bg-red-50 text-red-600 border-red-100',
              };
              return (
                <div key={level} className={`rounded-xl border p-4 text-center ${colors[level]}`}>
                  <p className="text-2xl font-bold">{pressureBreakdown[level] || 0}</p>
                  <p className="text-xs mt-0.5 opacity-75">{level}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <SectionTitle>Progress Status Breakdown</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Pending Review', color: 'bg-yellow-50 text-yellow-600 border-yellow-100' },
              { label: 'On Track',       color: 'bg-green-50 text-green-600 border-green-100' },
              { label: 'Delayed',        color: 'bg-orange-50 text-orange-500 border-orange-100' },
              { label: 'Critical',       color: 'bg-red-50 text-red-600 border-red-100' },
            ].map(({ label, color }) => (
              <div key={label} className={`rounded-xl border p-4 text-center ${color}`}>
                <p className="text-2xl font-bold">{statusBreakdown[label] || 0}</p>
                <p className="text-xs mt-0.5 opacity-75">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>


    </div>
  );
}