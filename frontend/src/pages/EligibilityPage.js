import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../services/apiService'; // <-- Add this import

const EligibilityPage = () => {
  const [file, setFile] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // New Dashboard States
  const [dashboardData, setDashboardData] = useState(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // Module 2 States
  const [thesisTitle, setThesisTitle] = useState('');
  const [teamMembers, setTeamMembers] = useState('');
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  
  // --- NEW: Dev Tool States & Function ---
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    if (!studentId) return alert("Enter a Student ID to reset.");
    
    // Add a quick confirmation so you don't accidentally delete data
    if (!window.confirm(`⚠️ Are you sure you want to wipe all data for student ${studentId}?`)) return;
    
    setIsResetting(true);
    try {
            // Change this:
      // const response = await axios.delete(`http://127.0.0.1:5000/api/registration/reset/${studentId}`);

      // To this:
      const response = await axios.delete(`${API_URL}/registration/reset/${studentId}`);
      alert(response.data.message);
      
      // Wipe the frontend state clean so you can start over instantly
      setDashboardData(null);
      setResult(null);
      setFile(null);
      setThesisTitle('');
      setTeamMembers('');
      setSelectedSupervisor('');
    } catch (error) {
      alert("Failed to reset data. Make sure the backend route is running.");
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [isDarkMode]);

  useEffect(() => {
    if (result && result.status === 'Approved') {
      const fetchSupervisors = async () => {
        try {
          const response = await axios.get('http://127.0.0.1:5000/api/supervisors');
          let fetchedData = response.data.supervisors || response.data;
          if (Array.isArray(fetchedData) && fetchedData.length > 0) setSupervisors(fetchedData);
          else throw new Error("Not an array");
        } catch (error) {
          setSupervisors([
            { supervisor_id: 'prof_001', name: 'Dr. Amitabha Chakrabarty' },
            { supervisor_id: 'prof_002', name: 'Dr. Md. Khalilur Rhaman' },
            { supervisor_id: 'prof_003', name: 'Dr. Jia Uddin' }
          ]);
        }
      };
      fetchSupervisors();
    }
  }, [result]);

  // --- NEW: Check existing status ---
  const handleCheckStatus = async () => {
    if (!studentId) return alert("Enter a Student ID to check your status.");
    setIsCheckingStatus(true);
    try {
      // Change this:
      // const response = await axios.get(`http://127.0.0.1:5000/api/registration/status/${studentId}`);

// To this:
      const response = await axios.get(`${API_URL}/registration/status/${studentId}`);
      setDashboardData(response.data.data);
      setResult(null); // Clear any upload results if they exist
    } catch (error) {
      if (error.response && error.response.status === 404) {
        alert("No existing registration found. Please upload your transcript.");
        setDashboardData(null);
      } else {
        alert("Error checking status.");
      }
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !studentId) return alert("Please select a file and enter Student ID!");

    setIsScanning(true);
    setResult(null);
    setDashboardData(null);

    const formData = new FormData();
    formData.append('transcript', file);
    formData.append('student_id', studentId);

    try {
      // Change this:
// const response = await axios.post('http://127.0.0.1:5000/api/verify-eligibility', formData);

// To this:
    const response = await axios.post(`${API_URL}/registration/verify-eligibility`, formData);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        alert(error.response.data.message); // Alerts the duplicate prevention message
      } else {
        alert("Upload failed. Make sure backend is running.");
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleModule2Submit = async (e) => {
    e.preventDefault();
    if (!thesisTitle || !selectedSupervisor) return alert("Fill all required fields.");
    setIsSubmitting(true);
    
    try {
      const memberArray = teamMembers.split(',').map(id => id.trim()).filter(id => id);
      
      const response = await axios.post(`${API_URL}/registration/initiate`, {
        student_id: studentId,
        synopsis_id: dashboardData._id, 
        group_members: memberArray
      });
      
      setDashboardData(response.data.data); 
      setResult(null);
      
    } catch (error) { // <-- This was the missing catch block!
      alert("Failed to route request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg flex flex-col items-center py-12 px-4 font-sans transition-colors duration-300">
      
      <button onClick={() => setIsDarkMode(!isDarkMode)} className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:scale-110 transition-transform">
        {isDarkMode ? '☀️' : '🌙'}
      </button>

      {/* --- INITIAL ENTRY & VERIFICATION CARD --- */}
      {!dashboardData && (
        <div className="max-w-md w-full bg-white dark:bg-darkCard rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
          <div className="bg-blue-600 dark:bg-gray-900 px-6 py-8 text-center border-b dark:border-gray-800">
            <h2 className="text-4xl font-extrabold text-white animate-breathing-glow">Acadexa</h2>
            <p className="text-blue-100 dark:text-blue-400 mt-2 text-sm font-medium">AI Academic Eligibility Verifier</p>
          </div>

          <div className="p-8">
            <div className="mb-6 flex gap-2">
              <input 
                type="text" 
                placeholder="Student ID (e.g. 23101397)" 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value)} 
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button 
                type="button"
                onClick={handleCheckStatus}
                disabled={isCheckingStatus}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-300 transition-colors whitespace-nowrap"
              >
                {isCheckingStatus ? '...' : 'Check Status'}
              </button>
              {/* --- NEW: DEV TOOL RESET BUTTON --- */}
              <button
                type="button"
                onClick={handleResetData}
                disabled={isResetting || !studentId}
                title="Dev Tool: Wipe data for this ID"
                className="bg-red-100 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-200 disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {isResetting ? '🧹...' : '🧹 Reset'}
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">New Registration? Upload Transcript</label>
                <input 
                  type="file" 
                  accept=".pdf,.png,.jpg" 
                  onChange={(e) => setFile(e.target.files[0])} 
                  className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
                />
              </div>
              
              <button 
                type="submit" 
                disabled={isScanning}
                className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg shadow-md transition-all ${
                  isScanning ? 'bg-blue-400 dark:bg-blue-800 cursor-not-allowed opacity-80' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'
                }`}
              >
                Verify Transcript
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- NEW: SKELETON LOADER (Shows while AI is thinking) --- */}
      {isScanning && (
        <div className="mt-8 max-w-md w-full rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-darkCard animate-pulse">
          <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-5/6 mb-6"></div>
          <div className="h-24 bg-gray-100 dark:bg-gray-800 rounded w-full border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center">
             <span className="text-gray-400 font-medium">Extracting credits and mapping courses...</span>
          </div>
        </div>
      )}

      {/* --- MODULE 2 REGISTRATION FORM --- */}
      {!isScanning && result && result.status === 'Approved' && !dashboardData && (
        <div className="mt-8 max-w-md w-full bg-white dark:bg-darkCard rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 animate-fade-in">
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-400 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-bold text-green-700 dark:text-green-400">✅ {result.status} (Credits: {result.credits})</h3>
            <p className="text-sm text-green-600 dark:text-green-300 mt-1">{result.message}</p>
          </div>

          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-700">Step 2: Team Formation</h3>
          <form onSubmit={handleModule2Submit} className="space-y-5">
            <input type="text" required value={thesisTitle} onChange={(e) => setThesisTitle(e.target.value)} placeholder="Thesis Title" className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-secondary"/>
            <input type="text" value={teamMembers} onChange={(e) => setTeamMembers(e.target.value)} placeholder="Co-Members IDs (Comma separated)" className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-secondary"/>
            <select required value={selectedSupervisor} onChange={(e) => setSelectedSupervisor(e.target.value)} className="w-full px-3 py-2 rounded-lg border dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-secondary">
              <option value="" disabled>Select Supervisor</option>
              {Array.isArray(supervisors) && supervisors.map((prof, i) => <option key={i} value={prof.supervisor_id}>{prof.name}</option>)}
            </select>
            <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold shadow-md">
              {isSubmitting ? 'Routing...' : 'Submit Request'}
            </button>
          </form>
        </div>
      )}

      {/* --- NEW: STUDENT DASHBOARD VIEW --- */}
      {dashboardData && (
        <div className="mt-8 max-w-md w-full bg-white dark:bg-darkCard rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-800 animate-fade-in text-center">
          <div className="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
             <span className="text-3xl">🎓</span>
          </div>
          <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-1">Welcome back!</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">Student ID: {dashboardData.student_id}</p>
          
          <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg text-left space-y-3 border border-gray-200 dark:border-gray-700">
             <p><span className="font-bold text-gray-700 dark:text-gray-300">Thesis Title:</span> <span className="text-blue-600 dark:text-blue-400">{dashboardData.thesis_title}</span></p>
             <p><span className="font-bold text-gray-700 dark:text-gray-300">Current Status:</span> 
               <span className={`ml-2 px-2 py-1 rounded text-xs font-bold ${
                 dashboardData.status.includes('Pending') ? 'bg-yellow-100 text-yellow-800' : 
                 dashboardData.status.includes('Approved') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
               }`}>
                 {dashboardData.status}
               </span>
             </p>
             {dashboardData.group_members && dashboardData.group_members.length > 0 && (
               <p><span className="font-bold text-gray-700 dark:text-gray-300">Co-Members:</span> {dashboardData.group_members.join(', ')}</p>
             )}
          </div>
          
          <button onClick={() => setDashboardData(null)} className="mt-6 text-sm text-blue-500 hover:underline">
            ← Check another ID
          </button>
        </div>
      )}

    </div>
  );
};

export default EligibilityPage;