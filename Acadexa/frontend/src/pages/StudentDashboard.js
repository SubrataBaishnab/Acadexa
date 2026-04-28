import React, { useState, useEffect, useCallback } from 'react';
import { deadlineService } from '../services/deadlineService';

const STUDENT_ID = 'student_001'; // Replace with auth context later

function StatCard({ label, value, sub, color = 'text-blue-600', icon, bg = 'bg-white' }) {
  return (
    <div className={`${bg} rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-1`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
        {icon && <span className="text-lg">{icon}</span>}
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value ?? '—'}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  );
}

export default function StudentDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await deadlineService.getStudentAnalytics(STUDENT_ID);
      setAnalytics(res.data);
    } catch {
      setError('Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  const daysLeft = analytics?.daysLeft ?? null;
  const daysColor =
    daysLeft === null     ? 'text-gray-400' :
    daysLeft <= 7         ? 'text-red-600'  :
    daysLeft <= 14        ? 'text-orange-500' : 'text-blue-600';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Your thesis analytics at a glance.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">
          {error}
        </div>
      )}

      {!analytics?.deadline && !error && (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h2 className="text-lg font-semibold text-gray-700 mb-2">No data yet</h2>
          <p className="text-sm text-gray-400">
            Set a deadline in the Deadline Tracker to start seeing your analytics here.
          </p>
        </div>
      )}

      {analytics?.deadline && (
        <>
          {/* Thesis info banner */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 mb-6">
            <h2 className="text-lg font-semibold text-gray-800">
              {analytics.deadline.thesisTitle}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              Deadline:{' '}
              {new Date(analytics.deadline.deadlineDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>

            {/* Overall progress bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500 font-medium">Overall Progress</span>
                <span className="text-blue-600 font-semibold">
                  {analytics.deadline.progressPercent}%
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="h-3 rounded-full bg-blue-500 transition-all duration-700"
                  style={{ width: `${analytics.deadline.progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Days Left"
              value={daysLeft ?? 'N/A'}
              color={daysColor}
              icon="⏳"
            />
            <StatCard
              label="Revisions"
              value={analytics.revisionCount ?? 0}
              sub="progress updates submitted"
              color="text-indigo-600"
              icon="📝"
            />
            <StatCard
              label="Avg Response"
              value={
                analytics.avgResponseTimeHours != null
                  ? analytics.avgResponseTimeHours === 0
                    ? '< 1h'
                    : `${analytics.avgResponseTimeHours}h`
                  : 'N/A'
              }
              sub="supervisor response time"
              color="text-teal-600"
              icon="💬"
            />
            <StatCard
              label="Meetings Scheduled"
              value={analytics.meetingsScheduled ?? 0}
              sub="via Google Calendar"
              color="text-teal-600"
              icon="📅"
            />
          </div>

          {/* Progress status breakdown */}
          {analytics.statusBreakdown && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                Progress Update Status
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {analytics.statusBreakdown.pending || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Pending</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">
                    {analytics.statusBreakdown.onTrack || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">On Track</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-orange-500">
                    {analytics.statusBreakdown.delayed || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Delayed</p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {analytics.statusBreakdown.critical || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Critical</p>
                </div>
              </div>
            </div>
          )}

          {/* Latest progress update */}
          {analytics.latestProgress && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                Latest Progress Update
              </h2>
              <div className="flex items-center justify-between mb-3">
                <p className="text-base font-semibold text-gray-800">
                  {analytics.latestProgress.month}
                </p>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  analytics.latestProgress.status === 'On Track'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : analytics.latestProgress.status === 'Delayed'
                    ? 'bg-orange-50 text-orange-600 border-orange-200'
                    : analytics.latestProgress.status === 'Critical'
                    ? 'bg-red-50 text-red-600 border-red-200'
                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                }`}>
                  {analytics.latestProgress.status}
                </span>
              </div>

              {/* Completion bar */}
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Completion</span>
                  <span className="font-semibold">
                    {analytics.latestProgress.percentageComplete}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${analytics.latestProgress.percentageComplete}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                <div>
                  <p className="font-semibold text-gray-700 mb-1">
                    ✓ {analytics.latestProgress.completedTasks?.length || 0} Completed Tasks
                  </p>
                  <ul className="space-y-0.5">
                    {analytics.latestProgress.completedTasks?.slice(0, 3).map((t, i) => (
                      <li key={i} className="truncate">• {t.title}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="font-semibold text-gray-700 mb-1">
                    ○ {analytics.latestProgress.upcomingGoals?.length || 0} Upcoming Goals
                  </p>
                  <ul className="space-y-0.5">
                    {analytics.latestProgress.upcomingGoals?.slice(0, 3).map((t, i) => (
                      <li key={i} className="truncate">• {t.title}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {analytics.latestProgress.comments?.length > 0 && (
                <div className="mt-3 bg-blue-50 rounded-xl px-3 py-2.5">
                  <p className="text-xs font-semibold text-blue-700 mb-1">
                    Latest Supervisor Comment
                  </p>
                  <p className="text-xs text-gray-600">
                    "{analytics.latestProgress.comments[analytics.latestProgress.comments.length - 1].text}"
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}