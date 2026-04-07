import React, { useState, useEffect } from 'react';
import { useSupervisors } from '../hooks/useAdvisors';
import SupervisorCard from '../components/SupervisorCard';
import RecommendationFilter from '../components/RecommendationFilter';

const SupervisorsPage = () => {
  const { supervisors, loading, error, fetchAllSupervisors, fetchRecommendations } = useSupervisors();
  const [filteredSupervisors, setFilteredSupervisors] = useState([]);
  const [view, setView] = useState('all'); // 'all' or 'recommendations'
  const [filters, setFilters] = useState({
    researchInterests: [],
    minMatchScore: 0,
  });

  useEffect(() => {
    fetchAllSupervisors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [supervisors, filters]);

  const applyFilters = () => {
    let filtered = supervisors;

    if (view === 'recommendations' && filters.researchInterests.length > 0) {
      filtered = filtered.filter(s => s.matchScore >= filters.minMatchScore);
    }

    setFilteredSupervisors(filtered);
  };

  const handleGetRecommendations = async () => {
    if (filters.researchInterests.length === 0) {
      alert('Please select at least one research interest');
      return;
    }
    await fetchRecommendations(filters.researchInterests, []);
    setView('recommendations');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleContact = (supervisor) => {
    alert(`Contact ${supervisor.firstName} ${supervisor.lastName} at ${supervisor.email}`);
    // TODO: Implement contact modal or navigation
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Find Your Supervisor</h1>
          <p className="text-lg text-gray-600">
            Browse available supervisors or get AI-powered recommendations based on your research interests
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              view === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Supervisors ({supervisors.length})
          </button>
          <button
            onClick={() => setView('recommendations')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              view === 'recommendations'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Get Recommendations
          </button>
        </div>

        {view === 'recommendations' && (
          <RecommendationFilter onFilterChange={handleFilterChange} />
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"
            ></div>
            <p className="mt-4 text-gray-600">Loading supervisors...</p>
          </div>
        )}

        {/* Supervisors Grid */}
        {!loading && filteredSupervisors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSupervisors.map((supervisor) => (
              <SupervisorCard
                key={supervisor._id}
                supervisor={supervisor}
                onContact={handleContact}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredSupervisors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {view === 'all'
                ? 'No supervisors found. Try again later.'
                : 'No supervisors match your criteria. Try adjusting your filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupervisorsPage;
