import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/apiService';
import { Link } from 'react-router-dom';
import LoginPrompt from '../components/LoginPrompt';

const ApplicationTrackerPage = () => {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const STATUS_OPTIONS = [
    'Bookmarked',
    'Applied',
    'Replied',
    'Interview Scheduled',
    'Rejected',
    'Accepted',
    'No Response'
  ];

  const fetchApplications = async () => {
    if (!user || user.role !== 'student') return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/applications/${user.id}`);
      if (!res.ok) throw new Error('Failed to fetch applications.');
      const data = await res.json();
      setApplications(data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`${API_URL}/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setApplications(apps => apps.map(app => 
          app._id === id ? { ...app, status: newStatus } : app
        ));
      } else {
        alert('Failed to update status.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateNotes = async (id, notes) => {
    try {
      await fetch(`${API_URL}/applications/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      // Updating optimistic local state is tricky with notes on blur, handled via local unmanaged state usually,
      // but for simplicity we rely on the component state tracking it or re-fetching
    } catch (err) {
      console.error(err);
    }
  };

  const removeApplication = async (id) => {
    if (!window.confirm('Are you sure you want to remove this professor from your tracker?')) return;
    try {
      const res = await fetch(`${API_URL}/applications/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setApplications(apps => apps.filter(app => app._id !== id));
      } else {
        alert('Failed to remove.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || user.role !== 'student') {
    return <LoginPrompt title="Student Access Only" />;
  }

  if (loading) return <div className="p-12 text-center text-gray-500 italic">Loading your application tracker...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">PhD Application Tracker</h1>
          <p className="text-gray-600 mt-2">Manage your outreach and track responses from your bookmarked professors.</p>
        </div>
        <Link to="/phd-professors" className="px-4 py-2 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition">
          + Find More Professors
        </Link>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg mb-6">{error}</div>}

      {applications.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl shadow-sm border border-gray-200">
          <div className="text-5xl mb-4">📚</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">No Saved Professors Yet</h3>
          <p className="text-gray-500 mb-6">You haven't bookmarked any PhD advisors. Explore the global database to start tracking.</p>
          <Link to="/phd-professors" className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700">
            Explore Global Advisors
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Professor</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applications.map(app => (
                <tr key={app._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">
                      Prof. {app.professorId?.firstName} {app.professorId?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{app.professorId?.university}</div>
                    <a 
                      href={app.professorId?.universityProfileUrl || '#'} 
                      target="_blank" rel="noreferrer"
                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                    >
                      View Profile ↗
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app._id, e.target.value)}
                      className={`text-sm rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-semibold p-2 ${
                        app.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        app.status === 'Interview Scheduled' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-50 text-gray-700'
                      }`}
                    >
                      {STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <textarea
                      defaultValue={app.notes}
                      onBlur={(e) => {
                         if (e.target.value !== app.notes) updateNotes(app._id, e.target.value);
                      }}
                      placeholder="Add tracking notes..."
                      className="w-full text-sm border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500 resize-none h-16 p-2"
                    />
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <button
                      onClick={() => removeApplication(app._id)}
                      className="text-red-500 hover:text-red-700 font-bold text-sm bg-red-50 px-3 py-1 rounded"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ApplicationTrackerPage;
