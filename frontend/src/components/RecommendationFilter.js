import React, { useState } from 'react';

const RecommendationFilter = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    researchInterests: [],
    preferredCountries: [],
    minMatchScore: 0,
  });

  const researchOptions = [
    'AI',
    'Computer Vision',
    'NLP',
    'Security',
    'Systems',
    'Web Development',
    'Database',
    'Cloud Computing',
    'Blockchain',
    'IoT',
    'Data Science',
  ];

  const countryOptions = [
    'USA',
    'UK',
    'Canada',
    'Australia',
    'Germany',
    'Netherlands',
    'Singapore',
    'Japan',
  ];

  const handleResearchChange = (interest) => {
    const updated = filters.researchInterests.includes(interest)
      ? filters.researchInterests.filter(i => i !== interest)
      : [...filters.researchInterests, interest];
    
    const newFilters = { ...filters, researchInterests: updated };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCountryChange = (country) => {
    const updated = filters.preferredCountries.includes(country)
      ? filters.preferredCountries.filter(c => c !== country)
      : [...filters.preferredCountries, country];
    
    const newFilters = { ...filters, preferredCountries: updated };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const resetFilters = () => {
    const reset = { researchInterests: [], preferredCountries: [], minMatchScore: 0 };
    setFilters(reset);
    onFilterChange(reset);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Filter Recommendations</h3>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
        >
          Reset Filters
        </button>
      </div>

      <div className="space-y-6">
        {/* Research Interests */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Research Interests</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {researchOptions.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.researchInterests.includes(option)}
                  onChange={() => handleResearchChange(option)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Preferred Countries */}
        <div>
          <h4 className="font-semibold text-gray-700 mb-3">Preferred Countries (PhD)</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {countryOptions.map(option => (
              <label key={option} className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.preferredCountries.includes(option)}
                  onChange={() => handleCountryChange(option)}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Match Score Threshold */}
        <div>
          <label className="font-semibold text-gray-700 block mb-2">
            Minimum Match Score: {filters.minMatchScore}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={filters.minMatchScore}
            onChange={(e) => {
              const newFilters = { ...filters, minMatchScore: parseInt(e.target.value) };
              setFilters(newFilters);
              onFilterChange(newFilters);
            }}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default RecommendationFilter;
