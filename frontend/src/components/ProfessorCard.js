import React from 'react';

const ProfessorCard = ({ professor, onContact }) => {
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
        <p className="text-sm text-gray-600">
          <strong>H-Index:</strong> {professor.h_index || 'N/A'}
        </p>
        <p className="text-sm text-gray-600">
          <strong>Publications:</strong> {professor.publicationsCount || 0}
        </p>
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

      {professor.universityProfileUrl && (
        <div className="mb-4">
          <a
            href={professor.universityProfileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm hover:underline"
          >
            View University Profile ↗
          </a>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onContact(professor)}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-lg transition-colors"
        >
          Contact
        </button>
        <button className="flex-1 border border-purple-600 text-purple-600 hover:bg-purple-50 font-semibold py-2 rounded-lg transition-colors">
          View Profile
        </button>
      </div>
    </div>
  );
};

export default ProfessorCard;
