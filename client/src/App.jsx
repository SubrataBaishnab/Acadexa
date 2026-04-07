import { useState } from 'react';
import axios from 'axios';

function App() {
  const [file, setFile] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState(null);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file!");
    if (!studentId) return alert("Please enter a Student ID!");

    setIsScanning(true);
    setResult(null); // Clear previous results

    const formData = new FormData();
    formData.append('transcript', file);
    formData.append('student_id', studentId);

    try {
      const response = await axios.post('http://127.0.0.1:5005/api/verify-eligibility', formData);
      
      // Save the full intelligence package to our React state
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
    <div style={{ padding: '50px', fontFamily: 'sans-serif', maxWidth: '500px' }}>
      <h2>Acadexa: Academic Eligibility Verifier</h2>
      
      <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" 
          placeholder="Enter Student ID (e.g. 21101234)" 
          value={studentId} 
          onChange={(e) => setStudentId(e.target.value)} 
          style={{ padding: '8px' }}
        />
        
        <input 
          type="file" 
          accept=".pdf,.png,.jpg" 
          onChange={(e) => setFile(e.target.files[0])} 
        />
        
        <button 
          type="submit" 
          disabled={isScanning}
          style={{ 
            padding: '10px', 
            cursor: isScanning ? 'not-allowed' : 'pointer', 
            backgroundColor: isScanning ? '#9ca3af' : '#007BFF', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px' 
          }}>
          {isScanning ? 'AI is analyzing...' : 'Verify & Save to Database'}
        </button>
      </form>

      {/* --- AI RESULTS DISPLAY --- */}
      {result && (
        <div style={{ 
          marginTop: '25px', 
          padding: '15px', 
          borderRadius: '8px', 
          border: result.status === 'Approved' ? '2px solid #4ade80' : '2px solid #f87171',
          backgroundColor: result.status === 'Approved' ? '#f0fdf4' : '#fef2f2'
        }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, color: result.status === 'Approved' ? '#166534' : '#991b1b' }}>
              {result.status}
            </h3>
            {result.credits && (
              <span style={{ fontWeight: 'bold', background: 'white', padding: '4px 8px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px' }}>
                Total Credits: {result.credits}
              </span>
            )}
          </div>
          
          <p style={{ marginTop: 0 }}>{result.message}</p>

          {/* Render Course Suggestions if Gemini found any */}
          {result.suggestions && result.suggestions.length > 0 && (
            <div style={{ marginTop: '15px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '6px', border: '1px solid #bfdbfe' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>💡 AI Recommended Next Courses:</h4>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e3a8a', fontSize: '14px', lineHeight: '1.5' }}>
                {result.suggestions.map((course, index) => (
                  <li key={index}>{course}</li>
                ))}
              </ul>
            </div>
          )}
          
        </div>
      )}
    </div>
  );
}

export default App;