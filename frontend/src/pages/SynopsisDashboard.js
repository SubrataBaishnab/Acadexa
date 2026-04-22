import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/apiService';
import LoginPrompt from '../components/LoginPrompt';

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

  // Gap Analyzer States
  const [gapAnalysis, setGapAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzeError, setAnalyzeError] = useState('');
  const [notifications, setNotifications] = useState([]);

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

      // Auto-load AI analysis if it exists in DB
      if (data.data && data.data.gapAnalysis && data.data.gapAnalysis.readiness_score) {
          setGapAnalysis(data.data.gapAnalysis);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`${API_URL}/notifications/${user.id}`);
      const data = await res.json();
      setNotifications(data);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAnalyzeGap = async () => {
    setIsAnalyzing(true);
    setAnalyzeError('');
    try {
      const res = await fetch(`${API_URL}/registration/analyze-gap`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ synopsis_id: dashboardData._id })
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setGapAnalysis(result.data);
      } else {
        setAnalyzeError(result.error || "Failed to analyze research gap.");
      }
    } catch (err) {
      setAnalyzeError("Network error while reaching the AI service.");
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  if (!user) {
    return <LoginPrompt title="Welcome to the Synopsis Portal" />;
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

      {user.role === 'student' && notifications.length > 0 && (
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
             <span className="relative flex h-3 w-3">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
             </span>
             <h3 className="font-bold text-gray-800">Recent Notifications</h3>
          </div>
          <div className="flex flex-col gap-3 text-left">
            {notifications.map(n => (
              <div key={n._id} className={`p-4 rounded-xl border flex justify-between items-center transition-all ${n.isRead ? 'bg-white border-gray-100 opacity-75' : 'bg-blue-50 border-blue-100 shadow-sm'}`}>
                <div className="flex flex-col">
                  <p className={`text-sm ${n.isRead ? 'text-gray-600' : 'text-blue-900 font-semibold'}`}>{n.message}</p>
                  <span className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
                {!n.isRead && (
                  <button 
                    onClick={async () => {
                      await fetch(`${API_URL}/notifications/${n._id}/read`, { method: 'PATCH' });
                      fetchNotifications();
                    }}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {user.role === 'student' && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          {!dashboardData || dashboardData.status === 'Rejected' ? (
            <div>
              {dashboardData && dashboardData.status === 'Rejected' && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded">
                  <p className="font-bold text-red-700">Previous Submission Rejected</p>
                  <p className="text-sm text-red-600 mt-1">You may submit a new idea to any supervisor.</p>
                  {dashboardData.feedback && (
                    <p className="mt-2 text-sm text-gray-700 bg-yellow-100 p-2 rounded">
                      <strong>Feedback:</strong> {dashboardData.feedback}
                    </p>
                  )}
                </div>
              )}
              <h2 className="text-xl font-semibold mb-4">Submit Research Idea</h2>
              <form onSubmit={handleSubmitIdea} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Select Supervisor</label>
                  <select 
                    required className="mt-1 block w-full p-2 border border-gray-300 rounded"
                    value={supervisorId} onChange={e => setSupervisorId(e.target.value)}
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
                    required className="mt-1 block w-full p-2 border border-gray-300 rounded h-32"
                    value={ideaText} onChange={e => setIdeaText(e.target.value)}
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
                
                {dashboardData.status === 'Approved' && dashboardData.stage === 'Full' && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-blue-900">Thesis Completed!</h4>
                      <p className="text-sm text-blue-700">Your research portfolio is ready for PhD applications.</p>
                    </div>
                    <Link 
                      to={`/portfolio/${user.id}`} 
                      className="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-shadow shadow-md"
                    >
                      View Portfolio ✦
                    </Link>
                  </div>
                )}
              </div>

              {/* ONLY SHOWS WHEN IDEA IS APPROVED */}
              {dashboardData.stage === 'Idea' && dashboardData.status === 'Approved' && (
                <div className="mt-8 border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4 text-green-700">Your Idea was Approved! Submit Full Synopsis Form</h2>
                  <form onSubmit={handleSubmitFull} className="space-y-4">
                    <div><label className="block text-sm font-medium text-gray-700">Title</label><input required className="w-full p-2 border rounded" value={fullSynopsis.title} onChange={e => setFullSynopsis({...fullSynopsis, title: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Abstract</label><textarea required className="w-full p-2 border rounded" value={fullSynopsis.abstract} onChange={e => setFullSynopsis({...fullSynopsis, abstract: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Methodology</label><textarea required className="w-full p-2 border rounded" value={fullSynopsis.methodology} onChange={e => setFullSynopsis({...fullSynopsis, methodology: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Expected Outcomes</label><textarea required className="w-full p-2 border rounded" value={fullSynopsis.expectedOutcomes} onChange={e => setFullSynopsis({...fullSynopsis, expectedOutcomes: e.target.value})} /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Tools Used</label><input required className="w-full p-2 border rounded" value={fullSynopsis.toolsUsed} onChange={e => setFullSynopsis({...fullSynopsis, toolsUsed: e.target.value})} /></div>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Submit Full Synopsis</button>
                  </form>
                </div>
              )}

              {/* ONLY SHOWS IF REVISION IS REQUESTED */}
              {dashboardData.status === 'Revision Required' && dashboardData.stage === 'Idea' && (
                 <div className="mt-8 border-t pt-6">
                    <h2 className="text-xl font-semibold mb-4 text-yellow-700">Revise Your Idea</h2>
                    <form onSubmit={handleSubmitIdea} className="space-y-4">
                      <textarea required className="mt-1 block w-full p-2 border border-yellow-300 rounded h-32" value={ideaText} onChange={e => setIdeaText(e.target.value)} placeholder="Update your thesis idea..." />
                      <button type="submit" className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700">Resubmit Idea</button>
                    </form>
                 </div>
              )}

              {/* --- YOUR FEATURE: FULL SYNOPSIS & GAP ANALYZER --- */}
              {dashboardData.stage === 'Full' && (
                <div className="mt-8 border-t pt-6 space-y-6">
                  {/* Full Synopsis Display */}
                  <div className="p-4 bg-gray-50 rounded space-y-3 border border-gray-200">
                    <h4 className="font-semibold text-lg text-blue-800">{dashboardData.fullSynopsis?.title}</h4>
                    <div><strong className="text-sm block">Abstract:</strong> <p className="text-sm text-gray-700">{dashboardData.fullSynopsis?.abstract}</p></div>
                    <div><strong className="text-sm block">Methodology:</strong> <p className="text-sm text-gray-700">{dashboardData.fullSynopsis?.methodology}</p></div>
                    <div><strong className="text-sm block">Outcomes:</strong> <p className="text-sm text-gray-700">{dashboardData.fullSynopsis?.expectedOutcomes}</p></div>
                    <div><strong className="text-sm block">Tools:</strong> <p className="text-sm text-gray-700">{dashboardData.fullSynopsis?.toolsUsed}</p></div>
                  </div>

                  {/* Gap Analyzer UI */}
                  <div className="border-t border-gray-200 pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full">✦ AI Powered</span>
                      <h3 className="text-xl font-bold text-gray-800">PhD Readiness & Gap Analyzer</h3>
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Evaluate your finalized abstract against global research standards.</p>
                    
                    {!gapAnalysis ? (
                      <div>
                        {analyzeError && <p className="text-red-500 text-sm mb-3">{analyzeError}</p>}
                        <button 
                          onClick={handleAnalyzeGap} 
                          disabled={isAnalyzing}
                          className="px-5 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white font-bold rounded-lg transition-colors"
                        >
                          {isAnalyzing ? '✦ AI is analyzing your research...' : 'Analyze My Research'}
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white border border-purple-100 shadow-sm rounded-xl p-6 space-y-5 animate-fade-in">
                        <div className="flex items-center justify-between bg-purple-50 p-4 rounded-lg border border-purple-100">
                          <span className="font-bold text-purple-900">PhD Readiness Score:</span>
                          <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                            {gapAnalysis.readiness_score}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><span className="text-red-500">⚠️</span> Missing Methodologies</h4>
                          <ul className="list-disc list-inside pl-5 space-y-1 text-sm text-gray-600">
                            {gapAnalysis.missing_methodologies?.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-2 flex items-center gap-2"><span className="text-green-500">💡</span> Suggested Improvements</h4>
                          <ul className="list-disc list-inside pl-5 space-y-1 text-sm text-gray-600">
                            {gapAnalysis.improvements?.map((item, i) => <li key={i}>{item}</li>)}
                          </ul>
                        </div>
                        <button onClick={() => setGapAnalysis(null)} className="text-sm text-purple-600 hover:underline mt-2 block">
                          Clear Analysis
                        </button>
                      </div>
                    )}
                  </div>
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