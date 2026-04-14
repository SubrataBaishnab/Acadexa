import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/apiService';

const SynopsisDashboard = () => {
  const { user, availableUsers, loginAsStudent, loginAsSupervisor, logout } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Forms
  const [ideaText, setIdeaText] = useState('');
  const [supervisorId, setSupervisorId] = useState('');
  const [fullSynopsis, setFullSynopsis] = useState({
    title: '', abstract: '', methodology: '', expectedOutcomes: '', toolsUsed: ''
  });

  // Login Form
  const [loginForm, setLoginForm] = useState({ name: '', id: '' });
  const [loginError, setLoginError] = useState('');

  // Removed availableUsers query destructure since we're going to get it from `useAuth()` entirely.

  const fetchDashboard = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const endpoint = user.role === 'student' 
        ? `${API_URL}/synopsis/student/${user.id}`
        : `${API_URL}/synopsis/supervisor/${user.id}`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      setDashboardData(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmitIdea = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/synopsis/idea`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.id,
          supervisorId,
          shortSummary: ideaText
        })
      });
      const result = await res.json();
      if (res.ok) fetchDashboard();
      else alert(result.error);
    } catch (err) { console.error(err); }
  };

  const handleSubmitFull = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/synopsis/${dashboardData._id}/full`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullSynopsis)
      });
      const result = await res.json();
      if (res.ok) fetchDashboard();
      else alert(result.error);
    } catch (err) { console.error(err); }
  };

  const handleUpdateStatus = async (synopsisId, status, feedback) => {
    try {
      const res = await fetch(`${API_URL}/synopsis/${synopsisId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, feedback })
      });
      if (res.ok) fetchDashboard();
      else {
        const result = await res.json();
        alert(result.error);
      }
    } catch (err) { console.error(err); }
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const { name, id } = loginForm;

    if (!availableUsers) {
      setLoginError('User data is still loading... Please wait.');
      return;
    }

    const checkName = name.trim().toLowerCase();
    const checkId = id.trim();

    // Try finding in students
    const student = availableUsers.students?.find(s => s.studentId === checkId && s.name.toLowerCase() === checkName);
    if (student) {
      loginAsStudent(student.studentId);
      return;
    }

    // Try finding in supervisors (ID is their serial number 1-11)
    const supervisor = availableUsers.supervisors?.find(s => s.serial.toString() === checkId && s.name.toLowerCase() === checkName);
    if (supervisor) {
      loginAsSupervisor(supervisor._id);
      return;
    }

    setLoginError('Invalid Name or ID. Please try again.');
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto p-4 md:p-8 text-center mt-12 bg-white rounded-xl shadow-lg border border-gray-100">
        <h1 className="text-3xl font-extrabold text-blue-900 mb-8">Welcome to the Synopsis Portal</h1>
        
        <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
          {loginError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{loginError}</div>}
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <input 
              type="text" 
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 font-medium"
              placeholder="Enter your name"
              value={loginForm.name}
              onChange={e => setLoginForm({...loginForm, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">ID</label>
            <input 
              type="text" 
              required
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 font-medium"
              placeholder="Enter your ID"
              value={loginForm.id}
              onChange={e => setLoginForm({...loginForm, id: e.target.value})}
            />
          </div>

          <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-md font-bold text-lg hover:bg-blue-700 transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  if (loading) return <div className="p-12 text-center text-xl text-gray-500 italic">Loading your dashboard...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h1 className="text-3xl font-extrabold text-gray-800">
          {user.role === 'student' ? 'Student Synopsis Dashboard' : 'Supervisor Approvals'}
        </h1>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <p className="text-sm text-gray-500">Logged in as {user.role === 'student' ? 'Student' : 'Supervisor'}</p>
             <p className="font-bold text-gray-800">{user.name}</p>
           </div>
           <button onClick={logout} className="px-4 py-2 border border-red-500 text-red-600 rounded-lg hover:bg-red-50 font-medium transition-colors">
             Logout
           </button>
        </div>
      </div>

      {user.role === 'student' && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          {!dashboardData ? (
            <div>
              <h2 className="text-xl font-semibold mb-4">Submit Research Idea</h2>
              <form onSubmit={handleSubmitIdea} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Supervisor</label>
                  <select 
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded"
                    value={supervisorId}
                    onChange={e => setSupervisorId(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {availableUsers?.supervisors?.map(s => (
                      <option key={s._id} value={s._id}>S{s.serial} - {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Short Summary</label>
                  <textarea 
                    required
                    className="mt-1 block w-full p-2 border border-gray-300 rounded h-32"
                    value={ideaText}
                    onChange={e => setIdeaText(e.target.value)}
                    placeholder="Enter a brief summary of your thesis idea..."
                  />
                </div>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Submit Idea
                </button>
              </form>
            </div>
          ) : (
            <div>
              <div className="mb-6 p-4 bg-gray-50 border-l-4 border-blue-500 rounded">
                <p><strong>Current Stage:</strong> {dashboardData.stage}</p>
                <p><strong>Status:</strong> <span className={`font-semibold ${dashboardData.status === 'Approved' ? 'text-green-600' : dashboardData.status === 'Rejected' ? 'text-red-600' : 'text-blue-600'}`}>{dashboardData.status}</span></p>
                {dashboardData.feedback && (
                  <p className="mt-2 text-sm text-gray-700 bg-yellow-100 p-2 rounded">
                    <strong>Feedback:</strong> {dashboardData.feedback}
                  </p>
                )}
              </div>

              {dashboardData.stage === 'Idea' && dashboardData.status === 'Approved' && (
                <div className="mt-8 border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4 text-green-700">Your Idea was Approved! Submit Full Synopsis Form</h2>
                  <form onSubmit={handleSubmitFull} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Title</label>
                      <input required className="w-full p-2 border rounded" value={fullSynopsis.title} onChange={e => setFullSynopsis({...fullSynopsis, title: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Abstract</label>
                      <textarea required className="w-full p-2 border rounded" value={fullSynopsis.abstract} onChange={e => setFullSynopsis({...fullSynopsis, abstract: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Methodology</label>
                      <textarea required className="w-full p-2 border rounded" value={fullSynopsis.methodology} onChange={e => setFullSynopsis({...fullSynopsis, methodology: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expected Outcomes</label>
                      <textarea required className="w-full p-2 border rounded" value={fullSynopsis.expectedOutcomes} onChange={e => setFullSynopsis({...fullSynopsis, expectedOutcomes: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tools Used</label>
                      <input required className="w-full p-2 border rounded" value={fullSynopsis.toolsUsed} onChange={e => setFullSynopsis({...fullSynopsis, toolsUsed: e.target.value})} />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Submit Full Synopsis</button>
                  </form>
                </div>
              )}

              {dashboardData.status === 'Revision Required' && dashboardData.stage === 'Idea' && (
                 <div className="mt-8 border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4 text-yellow-700">Revise Your Idea</h2>
                    <form onSubmit={handleSubmitIdea} className="space-y-4">
                      <textarea 
                        required
                        className="mt-1 block w-full p-2 border border-yellow-300 rounded h-32"
                        value={ideaText}
                        onChange={e => setIdeaText(e.target.value)}
                        placeholder="Update your thesis idea..."
                      />
                      <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">
                        Resubmit Idea
                      </button>
                    </form>
                 </div>
              )}
            </div>
          )}
        </div>
      )}

      {user.role === 'supervisor' && (
        <div className="space-y-6">
          {dashboardData && dashboardData.length > 0 ? dashboardData.map(syn => (
            <div key={syn._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold">{syn.studentName} <span className="text-sm text-gray-500">({syn.studentId})</span></h3>
                  <p className="text-sm">Stage: <span className="font-semibold">{syn.stage}</span> | Status: <span className={`font-semibold ${syn.status==='Approved'?'text-green-600':syn.status==='Revision Required'?'text-yellow-600':'text-gray-600'}`}>{syn.status}</span></p>
                </div>
                <div className="text-xs text-gray-400">{new Date(syn.updatedAt).toLocaleDateString()}</div>
              </div>

              {syn.stage === 'Idea' ? (
                <div className="mb-4 p-4 bg-gray-50 rounded">
                  <h4 className="font-semibold mb-2">Research Idea:</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{syn.shortSummary}</p>
                </div>
              ) : (
                <div className="mb-4 p-4 bg-gray-50 rounded space-y-3">
                  <h4 className="font-semibold text-lg text-blue-800">{syn.fullSynopsis?.title}</h4>
                  <div><strong className="text-sm block">Abstract:</strong> <p className="text-sm text-gray-700">{syn.fullSynopsis?.abstract}</p></div>
                  <div><strong className="text-sm block">Methodology:</strong> <p className="text-sm text-gray-700">{syn.fullSynopsis?.methodology}</p></div>
                  <div><strong className="text-sm block">Outcomes:</strong> <p className="text-sm text-gray-700">{syn.fullSynopsis?.expectedOutcomes}</p></div>
                  <div><strong className="text-sm block">Tools:</strong> <p className="text-sm text-gray-700">{syn.fullSynopsis?.toolsUsed}</p></div>
                </div>
              )}

              {syn.status === 'Pending' && (
                <div className="border-t pt-4 mt-4 flex flex-col gap-3">
                  <textarea id={`feedback-${syn._id}`} placeholder="Add feedback (optional but recommended for revisions/rejections)..." className="w-full p-2 border rounded" />
                  <div className="flex gap-2">
                     <button onClick={() => { const fb = document.getElementById(`feedback-${syn._id}`).value; handleUpdateStatus(syn._id, 'Approved', fb); }} className="px-4 py-2 bg-green-600 text-white rounded font-medium hover:bg-green-700">Approve</button>
                     <button onClick={() => { const fb = document.getElementById(`feedback-${syn._id}`).value; handleUpdateStatus(syn._id, 'Revision Required', fb); }} className="px-4 py-2 bg-yellow-500 text-white rounded font-medium hover:bg-yellow-600">Request Revision</button>
                     <button onClick={() => { const fb = document.getElementById(`feedback-${syn._id}`).value; handleUpdateStatus(syn._id, 'Rejected', fb); }} className="px-4 py-2 bg-red-600 text-white rounded font-medium hover:bg-red-700">Reject</button>
                  </div>
                </div>
              )}
            </div>
          )) : (
            <div className="bg-white p-8 text-center text-gray-500 rounded-lg shadow-sm border border-gray-200">
              No synopses assigned to you at the moment.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SynopsisDashboard;
