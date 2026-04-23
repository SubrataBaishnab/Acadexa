import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../services/apiService';

export default function AdminWorkloadPage() {
  const [workloadData, setWorkloadData] = useState([]);
  const [supervisorsMap, setSupervisorsMap] = useState({}); // <-- NEW: Holds ID-to-Name translations
  const [loading, setLoading] = useState(true);
  
  const [studentToApprove, setStudentToApprove] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  const fetchWorkload = async () => {
    try {
      // 1. Fetch the workload data
      const response = await axios.get(`${API_URL}/registration/admin/workload`);
      setWorkloadData(response.data.data);

      // 2. Fetch supervisors and build a translation map
      const supResponse = await axios.get(`${API_URL}/supervisors`);
      const mapping = {};
      if (supResponse.data && Array.isArray(supResponse.data.data)) {
        supResponse.data.data.forEach(prof => {
          mapping[prof._id] = `Dr. ${prof.firstName} ${prof.lastName}`;
        });
      }
      setSupervisorsMap(mapping);

    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkload();
  }, []);

  const handleApprove = async () => {
    if (!studentToApprove) return alert("Please enter a Student ID to approve.");
    setIsApproving(true);
    try {
      await axios.put(`${API_URL}/registration/finalize`, { student_id: studentToApprove });
      alert(`✅ Success! Student ${studentToApprove} is now officially registered.`);
      setStudentToApprove(''); 
      fetchWorkload(); 
    } catch (error) {
      alert("Failed to approve. Make sure the ID is correct and pending.");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Faculty Workload Dashboard</h1>
        <p className="text-gray-500 mb-8">Real-time thesis group allocation powered by MongoDB Aggregation.</p>

        {/* --- ADMIN ACTIONS PANEL --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200 mb-8 flex items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-bold text-blue-900 mb-2">Admin Actions: Finalize Registration</label>
            <input 
              type="text" 
              placeholder="Enter Student ID (e.g. 23101397)" 
              value={studentToApprove}
              onChange={(e) => setStudentToApprove(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={handleApprove}
            disabled={isApproving}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg shadow-md transition-colors"
          >
            {isApproving ? 'Approving...' : 'Approve Student'}
          </button>
        </div>

        {/* --- THE WORKLOAD TABLE --- */}
        {loading ? (
          <div className="text-center text-gray-500">Loading live data...</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/* Changed Header to Supervisor Name */}
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Supervisor Name</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Active Groups</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Students</th>
                  <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {workloadData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500 font-medium">
                      No officially registered students yet. Pending applications await admin approval.
                    </td>
                  </tr>
                ) : (
                  workloadData.map((row, index) => {
                    const isFull = row.active_groups >= 1; 
                    return (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        
                        {/* TRANSLATING THE ID TO THE NAME */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                           {supervisorsMap[row._id] || row._id}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <span className="font-bold text-indigo-600">{row.active_groups}</span> / 1
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {row.students.join(', ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {isFull ? (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">At Capacity</span>
                          ) : (
                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Accepting</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}