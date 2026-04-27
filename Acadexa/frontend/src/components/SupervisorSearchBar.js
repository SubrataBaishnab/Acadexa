import React, { useState } from 'react';

const SupervisorSearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSearch('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative">
        <div className="flex items-center bg-white rounded-lg shadow-md border border-gray-200 focus-within:border-blue-600 focus-within:shadow-lg transition-all">
          {/* Magnifying Glass Icon */}
          <span className="pl-4 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </span>
          
          {/* Search Input */}
          <input
            type="text"
            placeholder="Search by supervisor name, email, code, or designation..."
            value={searchTerm}
            onChange={handleSearch}
            className="flex-1 px-4 py-3 outline-none text-gray-700 placeholder-gray-400"
          />
          
          {/* Clear Button */}
          {searchTerm && (
            <button
              onClick={handleClear}
              className="pr-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupervisorSearchBar;
