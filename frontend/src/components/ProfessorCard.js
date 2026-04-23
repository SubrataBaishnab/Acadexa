import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../services/apiService';

const ProfessorCard = ({ professor, onContact }) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);

  const handleBookmark = async () => {
    if (!user || user.role !== 'student') {
      alert('Please log in as a student to bookmark professors.');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/applications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId: user.id, professorId: professor._id }),
      });
      
      const data = await res.json();
      if (res.ok) {
        setIsBookmarked(true);
      } else {
        alert(data.error || 'Failed to bookmark professor.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred.');
    }
  };
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            Prof. {professor.firstName} {professor.lastName}
          </h3>
          <p className="text-sm text-gray-600">{professor.university}</p>
          <p className="text-sm text-gray-600">{professor.city}, {professor.country}</p>
        </div>
        {professor.totalScore && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            {professor.totalScore.toFixed(1)}% Match
          </div>
        )}
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 text-sm mb-2">Research Areas</h4>
        <div className="flex flex-wrap gap-2">
          {professor.researchAreas?.map((area, idx) => (
            <span
              key={idx}
              className="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full"
            >
              {area}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-2">
        {professor.h_index && (
          <p className="text-sm text-gray-600">
            <strong>H-Index:</strong> {professor.h_index}
          </p>
        )}
        {professor.publicationsCount > 0 && (
          <p className="text-sm text-gray-600">
            <strong>Publications:</strong> {professor.publicationsCount}
          </p>
        )}
        {professor.fundingAvailable && (
          <p className="text-sm text-green-600 font-semibold">
            ✓ Funding Available
          </p>
        )}
        {professor.acceptsPhDStudents && (
          <p className="text-sm text-green-600 font-semibold">
            ✓ Accepts PhD Students
          </p>
        )}
      </div>

      {professor.matchReason && (
        <div className="bg-purple-50 border-l-4 border-purple-400 p-3 mb-4 rounded">
          <p className="text-sm text-gray-700 italic">{professor.matchReason}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button 
          onClick={() => {
            if (professor.universityProfileUrl) {
              window.open(professor.universityProfileUrl, '_blank');
            }
          }}
          className="flex-1 border border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-2 rounded-lg transition-colors"
        >
          View Profile
        </button>
        {user?.role === 'student' && (
          <button 
            onClick={handleBookmark}
            disabled={isBookmarked}
            className={`flex-1 font-semibold py-2 rounded-lg transition-colors ${
              isBookmarked 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-purple-600 text-white hover:bg-purple-700'
            }`}
          >
            {isBookmarked ? '✓ Tracked' : 'Bookmark'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfessorCard;
