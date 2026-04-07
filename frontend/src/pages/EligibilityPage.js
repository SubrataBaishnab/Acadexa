import React, { useState } from 'react';
import axios from 'axios';

const EligibilityPage = () => {
  const [file, setFile] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file!");
    if (!studentId) return alert("Please enter a Student ID!");

    setIsScanning(true);
    setResult(null);

    const formData = new FormData();
    formData.append('transcript', file);
    formData.append('student_id', studentId);

    try {
      // Pointing to the unified port 5000
      const response = await axios.post('http://127.0.0.1:5000/api/verify-eligibility', formData);
      setResult({
        status: response.data.status,
        message: response.data.message,
        credits: response.data.credits,
        suggestions: response.data.suggestions
      });
    } catch (error) {
      console.error(error);
      alert("Upload failed. Check the console for details.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Main Card */}
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="bg-blue-600 px-6 py-8 text-center">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Acadexa</h2>
          <p className="text-blue-100 mt-2 text-sm font-medium">AI Academic Eligibility Verifier</p>
        </div>

        {/* Upload Form */}
        <div className="p-8">
          <form onSubmit={handleUpload} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Student ID</label>
              <input 
                type="text" 
                placeholder="e.g. 23101397" 
                value={studentId} 
                onChange={(e) => setStudentId(e.target.value)} 
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-800"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Transcript</label>
              <input 
                type="file" 
                accept=".pdf,.png,.jpg" 
                onChange={(e) => setFile(e.target.files[0])} 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer transition-all"
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isScanning}
              className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg shadow-md transition-all ${
                isScanning 
                  ? 'bg-blue-400 cursor-not-allowed animate-pulse' 
                  : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:transform active:scale-95'
              }`}
            >
              {isScanning ? 'AI is analyzing...' : 'Verify Transcript'}
            </button>
          </form>
        </div>
      </div>

      {/* Results Dashboard */}
      {result && (
        <div className={`mt-8 max-w-md w-full rounded-2xl p-6 shadow-lg border-2 animate-fadeIn ${
          result.status === 'Approved' 
            ? 'bg-green-50 border-green-400' 
            : 'bg-red-50 border-red-400'
        }`}>
          
          <div className="flex justify-between items-center mb-4 border-b border-opacity-20 pb-3 border-black">
            <h3 className={`text-2xl font-black ${result.status === 'Approved' ? 'text-green-700' : 'text-red-700'}`}>
              {result.status}
            </h3>
            {result.credits && (
              <span className="bg-white px-3 py-1 rounded-md shadow-sm border text-gray-800 font-bold text-sm">
                Credits: {result.credits}
              </span>
            )}
          </div>
          
          <p className="text-gray-700 font-medium">{result.message}</p>

          {/* AI Course Recommendations */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div className="mt-6 bg-white p-5 rounded-xl shadow-sm border border-blue-100">
              <h4 className="text-blue-800 font-bold text-sm uppercase tracking-wider flex items-center gap-2 mb-3">
                <span>💡</span> Recommended Next Courses
              </h4>
              <ul className="space-y-2">
                {result.suggestions.map((course, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    <span className="text-gray-700 text-sm font-medium">{course}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default EligibilityPage;