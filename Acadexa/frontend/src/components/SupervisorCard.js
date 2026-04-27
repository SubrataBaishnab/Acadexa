import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StarDisplay } from './StarRating';

const SupervisorCard = ({ supervisor }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">
            {supervisor.firstName} {supervisor.lastName}
          </h3>
          <p className="text-sm text-gray-600">{supervisor.designation}</p>
          <p className="text-sm text-gray-600">{supervisor.department}</p>

          {/* Rating summary */}
          <div className="flex items-center gap-2 mt-1">
            {supervisor.avgRating ? (
              <>
                <StarDisplay value={supervisor.avgRating} size="sm" />
                <span className="text-xs text-gray-500">
                  {supervisor.avgRating} ({supervisor.totalReviews} review{supervisor.totalReviews !== 1 ? 's' : ''})
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400 italic">No reviews yet</span>
            )}
          </div>
        </div>

        {supervisor.matchScore && (
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
            {supervisor.matchScore.toFixed(1)}% Match
          </div>
        )}
      </div>

      <div className="mb-4">
        <h4 className="font-semibold text-gray-700 text-sm mb-2">Research Areas</h4>
        <div className="flex flex-wrap gap-2">
          {supervisor.researchAreas?.map((area, idx) => (
            <span key={idx} className="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">
              {area}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">
          <strong>Available Slots:</strong> {supervisor.availableSlots}
        </p>
        <p className="text-sm text-gray-600 mb-2">
          <strong>Publications:</strong> {supervisor.publicationsCount || 0}
        </p>
        {supervisor.h_index && (
          <p className="text-sm text-gray-600 mb-2">
            <strong>H-Index:</strong> {supervisor.h_index}
          </p>
        )}
      </div>

      {supervisor.matchReason && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4 rounded">
          <p className="text-sm text-gray-700 italic">{supervisor.matchReason}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2 mt-auto pt-2">
        <button
          onClick={() => navigate(`/supervisor-reviews/${supervisor._id}`)}
          className="flex-1 border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-2 rounded-lg transition-colors text-sm"
        >
          View Reviews
        </button>
        <button
          onClick={() => navigate(`/supervisor-reviews/${supervisor._id}?rate=true`)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors text-sm"
        >
          Rate
        </button>
      </div>
    </div>
  );
};

export default SupervisorCard;