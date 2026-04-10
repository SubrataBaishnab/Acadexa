import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EligibilityPage = () => {
  // --- Module 1 State (AI Verifier) ---
  const [file, setFile] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // --- Module 2 State (Registration Flow) ---
  const [thesisTitle, setThesisTitle] = useState('');
  const [teamMembers, setTeamMembers] = useState(''); // Comma separated IDs
  const [supervisors, setSupervisors] = useState([]);
  const [selectedSupervisor, setSelectedSupervisor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Toggle Dark Mode globally
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch Supervisors when AI approves the student
  useEffect(() => {
    if (result && result.status === 'Approved') {
      const fetchSupervisors = async () => {
        try {
          const response = await axios.get('http://127.0.0.1:5000/api/supervisors');
          
          // Try to find the array in the response
          let fetchedData = response.data.supervisors || response.data;
          
          // Strict check: Is it actually an array?
          if (Array.isArray(fetchedData) && fetchedData.length > 0) {
            setSupervisors(fetchedData);
          } else {
            throw new Error("Backend did not return a valid array of supervisors.");
          }
        } catch (error) {
          console.warn("⚠️ Teammate's route failed or returned non-array data. Loading dummy data.");
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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file!");
    if (!studentId) return alert("Please enter a Student ID!");

    setIsScanning(true);
    setResult(null);
    setRegistrationComplete(false); // Reset Module 2 state on new scan

    const formData = new FormData();
    formData.append('transcript', file);
    formData.append('student_id', studentId);

    try {
      const response = await axios.post('http://127.0.0.1:5000/api/verify-eligibility', formData);
      setResult({
        status: response.data.status,
        message: response.data.message,
        credits: response.data.credits,
        suggestions: response.data.suggestions
      });
    } catch (error) {
      console.error(error);
      alert("Upload failed. Make sure your GEMINI_API_KEY is in the .env file!");
    } finally {
      setIsScanning(false);
    }
  };

  const handleModule2Submit = async (e) => {
    e.preventDefault();
    if (!thesisTitle || !selectedSupervisor) return alert("Please fill in the title and select a supervisor.");
    
    setIsSubmitting(true);
    
    try {
      // 1. Team Setup API Call
      const memberArray = teamMembers.split(',').map(id => id.trim()).filter(id => id);
      await axios.put('http://127.0.0.1:5000/api/registration/team-setup', {
        student_id: studentId,
        thesis_title: thesisTitle,
        group_members: memberArray
      });

      // 2. Assign Supervisor API Call
      await axios.put('http://127.0.0.1:5000/api/registration/assign-supervisor', {
        student_id: studentId,
        supervisor_id: selectedSupervisor
      });

      setRegistrationComplete(true);
    } catch (error) {
      console.error(error);
      alert("Failed to submit registration request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-darkBg flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans transition-colors duration-300">
      
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-yellow-300 shadow-md hover:scale-110 transition-transform"
      >
        {isDarkMode ? '☀️ Light' : '🌙 Dark'}
      </button>

      {/* --- MODULE 1: AI VERIFIER CARD --- */}
      <div className="max-w-md w-full bg-white dark:bg-darkCard rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="bg-blue-600 dark:bg-gray-900 px-6 py-8 text-center border-b dark:border-gray-800">
          <h2 className="text-4xl font-extrabold text-white tracking-tight animate-breathing-glow">
            Acadexa
          </h2>
          <p className="text-blue-100 dark:text-blue-400 mt-2 text-sm font-medium">AI Academic Eligibility Verifier</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Student ID</label>
              <input 
                type="text" 
                placeholder="e.g. 23101397" 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value)} 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Upload Transcript</label>
              <input 
                type="file" 
                accept=".pdf,.png,.jpg" 
                onChange={(e) => setFile(e.target.files[0])} 
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-lg text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 cursor-pointer"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isScanning}
              className={`w-full flex justify-center items-center py-3 px-4 rounded-lg text-white font-bold text-lg shadow-md transition-all ${
                isScanning ? 'bg-blue-400 dark:bg-blue-800 cursor-not-allowed opacity-80' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 hover:shadow-lg active:scale-95'
              }`}
            >
              {isScanning ? <div className="spinner mr-3"></div> : null}
              {isScanning ? 'AI is analyzing...' : 'Verify Transcript'}
            </button>
          </form>
        </div>
      </div>

      {/* --- AI RESULTS DISPLAY --- */}
      {result && !registrationComplete && (
        <div className={`mt-8 max-w-md w-full rounded-2xl p-6 shadow-lg border-2 animate-fade-in ${
          result.status === 'Approved' ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600' : 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
        }`}>
          <div className="flex justify-between items-center mb-4 border-b border-opacity-20 pb-3 border-gray-300 dark:border-gray-600">
            <h3 className={`text-2xl font-black ${result.status === 'Approved' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {result.status}
            </h3>
            {result.credits && (
              <span className="bg-white dark:bg-gray-800 px-3 py-1 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-bold text-sm">
                Credits: {result.credits}
              </span>
            )}
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">{result.message}</p>
        </div>
      )}

      {/* --- MODULE 2: REGISTRATION FORM (Fades in ONLY if approved) --- */}
      {result && result.status === 'Approved' && !registrationComplete && (
        <div className="mt-8 max-w-md w-full bg-white dark:bg-darkCard rounded-2xl p-6 shadow-xl border border-gray-100 dark:border-gray-800 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
            Step 2: Thesis Registration
          </h3>
          
          <form onSubmit={handleModule2Submit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Thesis Title</label>
              <input 
                type="text" 
                required
                value={thesisTitle}
                onChange={(e) => setThesisTitle(e.target.value)}
                placeholder="e.g. AI-driven Fraud Detection"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-secondary"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Co-Members (Student IDs)</label>
              <input 
                type="text" 
                value={teamMembers}
                onChange={(e) => setTeamMembers(e.target.value)}
                placeholder="e.g. 23101455, 23101688"
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-secondary"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Separate IDs with a comma</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Preferred Supervisor</label>
              <select 
                required
                value={selectedSupervisor}
                onChange={(e) => setSelectedSupervisor(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="" disabled>Select a Professor</option>
                {/* Safe map: Only run if supervisors is an array */}
                {Array.isArray(supervisors) && supervisors.map((prof, index) => (
                  <option key={index} value={prof.supervisor_id || prof._id || `dummy_${index}`}>
                    {prof.name || 'Unknown Professor'}
                  </option>
                ))}
              </select>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg shadow-md transition-all ${
                isSubmitting ? 'bg-purple-400 cursor-not-allowed opacity-80' : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/50 hover:shadow-lg'
              }`}
            >
              {isSubmitting ? 'Routing Request...' : 'Submit Registration Request'}
            </button>
          </form>
        </div>
      )}

      {/* --- SUCCESS STATE --- */}
      {registrationComplete && (
        <div className="mt-8 max-w-md w-full rounded-2xl p-8 bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-400 dark:border-purple-500 shadow-lg text-center animate-fade-in">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-2xl font-black text-purple-800 dark:text-purple-300 mb-2">Request Sent!</h3>
          <p className="text-gray-700 dark:text-gray-300">
            Your thesis group for <strong>"{thesisTitle}"</strong> has been successfully routed to the supervisor for final approval.
          </p>
        </div>
      )}

    </div>
  );
};

export default EligibilityPage;