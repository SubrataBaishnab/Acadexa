import React, { useState, useEffect } from 'react';
import { useProfessors } from '../hooks/useAdvisors';
import ProfessorCard from '../components/ProfessorCard';
import ProfessorSearchBar from '../components/ProfessorSearchBar';

const ProfessorsPage = () => {
  const { professors, loading, error, fetchAllProfessors } = useProfessors();
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllProfessors();
  }, []);

  useEffect(() => {
    applySearch();
  }, [professors, searchTerm]);

  const applySearch = () => {
    if (!searchTerm.trim()) {
      setFilteredProfessors(professors);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = professors.filter(p => {
      // Search by professor name
      const nameMatch = 
        p.firstName.toLowerCase().includes(term) || 
        p.lastName.toLowerCase().includes(term);
      
      // Search by country
      const countryMatch = p.country.toLowerCase().includes(term);
      
      // Search by research area
      const researchMatch = p.researchAreas?.some(area => 
        area.toLowerCase().includes(term)
      );

      return nameMatch || countryMatch || researchMatch;
    });

    setFilteredProfessors(filtered);
  };

  const handleSearch = (term) => {
    setSearchTerm(term);
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

        {/* Search Bar */}
        <ProfessorSearchBar onSearch={handleSearch} />

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">Loading professors...</p>
          </div>
        )}

        {/* Results Count */}
        {!loading && (
          <div className="mb-6 text-gray-600">
            <p className="text-sm">
              {searchTerm ? (
                <>Showing <strong>{filteredProfessors.length}</strong> result{filteredProfessors.length !== 1 ? 's' : ''} for "{searchTerm}"</>
              ) : (
                <>Total <strong>{filteredProfessors.length}</strong> professors available</>
              )}
            </p>
          </div>
        )}

        {/* Professors Grid */}
        {!loading && filteredProfessors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfessors.map(professor => (
              <ProfessorCard
                key={professor._id}
                professor={professor}
              />
            ))}
          </div>
        ) : !loading ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-500 text-lg">
              {searchTerm 
                ? `No professors found matching "${searchTerm}". Try different search terms.`
                : 'No professors available.'}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProfessorsPage;
