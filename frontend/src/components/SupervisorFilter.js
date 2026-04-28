import React, { useState } from 'react';

const SupervisorFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    status: 'All',
    level: 'Both',
    type: 'Thesis',
  });

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const reset = { status: 'All', level: 'Both', type: 'Thesis' };
    setFilters(reset);
    onFilterChange(reset);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Filters</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors"
        >
          Reset
        </button>
      </div>

      <div className="space-y-6">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Status:</label>
          <div className="space-y-2">
            {['All', 'Accepting', 'Not Accepting'].map(option => (
              <label key={option} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value={option}
                  checked={filters.status === option}
                  onChange={() => handleFilterChange('status', option)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Level Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Level:</label>
          <div className="space-y-2">
            {['Both', 'Undergraduate', 'Postgraduate'].map(option => (
              <label key={option} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="level"
                  value={option}
                  checked={filters.level === option}
                  onChange={() => handleFilterChange('level', option)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Type:</label>
          <div className="space-y-2">
            {['Thesis', 'Project', 'Internship'].map(option => (
              <label key={option} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="type"
                  value={option}
                  checked={filters.type === option}
                  onChange={() => handleFilterChange('type', option)}
                  className="w-4 h-4 text-blue-600 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorFilter;
