import React, { useState, useEffect } from 'react';
import { useSupervisors } from '../hooks/useAdvisors';
import SupervisorCard from '../components/SupervisorCard';
import SupervisorFilter from '../components/SupervisorFilter';
import SupervisorSearchBar from '../components/SupervisorSearchBar';

const SupervisorsPage = () => {
  const { supervisors, loading, error, fetchAllSupervisors } = useSupervisors();
  const [filteredSupervisors, setFilteredSupervisors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'All',
    level: 'Both',
    type: 'Thesis',
  });

  useEffect(() => {
    fetchAllSupervisors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [supervisors, filters, searchTerm]);

  const applyFilters = () => {
    let filtered = supervisors;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(s => {
        // Search by name
        const nameMatch = 
          s.firstName.toLowerCase().includes(term) || 
          s.lastName.toLowerCase().includes(term);
        
        // Search by email
        const emailMatch = s.email.toLowerCase().includes(term);
        
        // Search by code
        const codeMatch = s.code && s.code.toLowerCase().includes(term);
        
        // Search by designation
        const designationMatch = s.designation && s.designation.toLowerCase().includes(term);

        return nameMatch || emailMatch || codeMatch || designationMatch;
      });
    }

    // Filter by status
    if (filters.status === 'Accepting') {
      filtered = filtered.filter(s => s.isAcceptingStudents);
    } else if (filters.status === 'Not Accepting') {
      filtered = filtered.filter(s => !s.isAcceptingStudents);
    }

    // Filter by level
    if (filters.level === 'Undergraduate') {
      filtered = filtered.filter(s => s.supervisesUndergrad);
    } else if (filters.level === 'Postgraduate') {
      filtered = filtered.filter(s => s.supervisesPostgrad);
    }

    // Filter by type (if applicable)
    // This can be extended if the supervisor model has project/thesis/internship fields

    setFilteredSupervisors(filtered);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Supervisor</h1>
          <p className="text-lg text-gray-600">
            Browse available supervisors and filter by your preferences
          </p>
        </div>

        {/* Search Bar */}
        <SupervisorSearchBar onSearch={handleSearch} />

        {/* Filter Section */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <div className="col-span-4 lg:col-span-1">
            <SupervisorFilter onFilterChange={handleFilterChange} />
          </div>

          <div className="col-span-4 lg:col-span-3">
            {/* Error Message */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">Loading supervisors...</p>
              </div>
            )}

            {/* Results Count */}
            {!loading && (
              <div className="mb-6 text-gray-600">
                <p className="text-sm">
                  {searchTerm ? (
                    <>Showing <strong>{filteredSupervisors.length}</strong> result{filteredSupervisors.length !== 1 ? 's' : ''} for "{searchTerm}"</>
                  ) : (
                    <>Showing <strong>{filteredSupervisors.length}</strong> supervisor{filteredSupervisors.length !== 1 ? 's' : ''}</>
                  )}
                </p>
              </div>
            )}

            {/* Supervisors Grid */}
            {!loading && filteredSupervisors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredSupervisors.map(supervisor => (
                  <SupervisorCard
                    key={supervisor._id}
                    supervisor={supervisor}
                  />
                ))}
              </div>
            ) : !loading ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-500 text-lg">
                  {searchTerm 
                    ? `No supervisors found matching "${searchTerm}". Try different search terms.`
                    : 'No supervisors match your filters. Try adjusting your preferences.'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorsPage;
