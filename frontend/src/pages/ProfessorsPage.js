import React, { useState, useEffect } from 'react';
import { useProfessors } from '../hooks/useAdvisors';
import ProfessorCard from '../components/ProfessorCard';
import RecommendationFilter from '../components/RecommendationFilter';

const ProfessorsPage = () => {
  const { professors, loading, error, fetchAllProfessors, fetchRecommendations } = useProfessors();
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [view, setView] = useState('all'); // 'all' or 'recommendations'
  const [filters, setFilters] = useState({
    researchInterests: [],
    preferredCountries: [],
    minMatchScore: 0,
  });

  useEffect(() => {
    fetchAllProfessors();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [professors, filters]);

  const applyFilters = () => {
    let filtered = professors;

    if (view === 'recommendations' && filters.researchInterests.length > 0) {
      filtered = filtered.filter(p => (p.totalScore || p.matchScore) >= filters.minMatchScore);
    }

    setFilteredProfessors(filtered);
  };

  const handleGetRecommendations = async () => {
    if (filters.researchInterests.length === 0) {
      alert('Please select at least one research interest');
      return;
    }
    await fetchRecommendations(filters.researchInterests, filters.preferredCountries);
    setView('recommendations');
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleContact = (professor) => {
    alert(`Contact ${professor.firstName} ${professor.lastName} at ${professor.email}`);
    // TODO: Implement contact modal or email draft generation
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Explore Global PhD Advisors</h1>
          <p className="text-lg text-gray-600">
            Discover professors worldwide who match your research interests and PhD goals
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setView('all')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              view === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Professors ({professors.length})
          </button>
          <button
            onClick={() => setView('recommendations')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              view === 'recommendations'
                ? 'bg-purple-600 text-white'
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
              className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"
            ></div>
            <p className="mt-4 text-gray-600">Loading professors...</p>
          </div>
        )}

        {/* Professors Grid */}
        {!loading && filteredProfessors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessors.map((professor) => (
              <ProfessorCard
                key={professor._id}
                professor={professor}
                onContact={handleContact}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredProfessors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">
              {view === 'all'
                ? 'No professors found. Try again later.'
                : 'No professors match your criteria. Try adjusting your filters.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfessorsPage;
