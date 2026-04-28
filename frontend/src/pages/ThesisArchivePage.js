import React, { useState, useEffect, useCallback } from 'react';
import ThesisCard from '../components/ThesisCard';
import UploadThesisForm from '../components/UploadThesisForm';
import { getTheses, getArchiveFilters, deleteThesis } from '../services/thesisArchiveService';

// Toggle true to show supervisor upload panel — replace with auth context later
const IS_SUPERVISOR = true;

export default function ThesisArchivePage() {
  const [theses, setTheses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ departments: [], years: [] });
  const [showUpload, setShowUpload] = useState(false);
  const [filterError, setFilterError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('All');
  const [year, setYear] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const LIMIT = 12;

  // Fetch filter dropdowns once on mount
  useEffect(() => {
    getArchiveFilters()
      .then(res => {
        console.log('Filters response:', res.data); // debug
        const data = res.data || {};
        setFilters({
          departments: Array.isArray(data.departments) ? data.departments : [],
          years: Array.isArray(data.years) ? data.years : [],
        });
      })
      .catch((err) => {
        console.error('Filter fetch error:', err?.response?.data || err?.message || err);
        setFilterError('Could not load filters.');
        setFilters({ departments: [], years: [] });
      });
  }, []);

  const fetchTheses = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTheses({ search, department, year, page, limit: LIMIT });
      const data = res.data || {};
      setTheses(Array.isArray(data.theses) ? data.theses : []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch theses error:', err?.response?.data || err?.message || err);
      setTheses([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, department, year, page]);

  useEffect(() => { fetchTheses(); }, [fetchTheses]);
  useEffect(() => { setPage(1); }, [search, department, year]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchInput('');
    setDepartment('All');
    setYear('All');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this thesis from the archive?')) return;
    try {
      await deleteThesis(id);
      fetchTheses();
    } catch {
      alert('Failed to remove thesis.');
    }
  };

  const hasActiveFilters = search || department !== 'All' || year !== 'All';

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero banner */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-blue-200 text-xs font-semibold uppercase tracking-widest mb-3">
            Acadexa · Institutional Knowledge
          </p>
          <h1 className="text-4xl font-extrabold mb-3 leading-tight">Thesis Archive</h1>
          <p className="text-blue-100 text-sm max-w-xl mx-auto mb-8">
            A searchable repository of defended and approved theses. Browse past research to inspire your own work.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              placeholder="Search by title, student, keyword..."
              className="flex-1 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300 shadow"
            />
            <button
              type="submit"
              className="bg-white text-blue-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors shadow"
            >
              Search
            </button>
            {searchInput && (
              <button
                type="button"
                onClick={() => { setSearchInput(''); setSearch(''); }}
                className="bg-blue-600 border border-blue-300 text-white text-sm px-4 py-3 rounded-xl hover:bg-blue-500 transition-colors"
              >
                ✕
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">

        {/* Supervisor upload toggle */}
        {IS_SUPERVISOR && (
          <div>
            <button
              onClick={() => setShowUpload(!showUpload)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              {showUpload ? '✕ Cancel Upload' : '+ Publish Thesis'}
            </button>
            {showUpload && (
              <div className="mt-4 max-w-2xl">
                <UploadThesisForm onUploadSuccess={() => { setShowUpload(false); fetchTheses(); }} />
              </div>
            )}
          </div>
        )}

        {/* Filters row */}
        <div className="flex flex-wrap gap-3 items-center bg-white rounded-2xl border border-gray-100 shadow-sm px-5 py-4">
          <span className="text-xs font-semibold text-gray-500">Filter by:</span>

          {/* Department */}
          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Departments</option>
            {filters.departments.length === 0 && (
              <option disabled>Loading...</option>
            )}
            {filters.departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          {/* Year */}
          <select
            value={year}
            onChange={e => setYear(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Years</option>
            {filters.years.length === 0 && (
              <option disabled>Loading...</option>
            )}
            {filters.years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {/* Filter error */}
          {filterError && (
            <span className="text-xs text-red-400">{filterError}</span>
          )}

          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="text-xs text-gray-400 hover:text-red-500 underline transition-colors"
            >
              Clear all filters
            </button>
          )}

          <span className="ml-auto text-xs text-gray-400 font-medium">
            {loading ? '...' : `${total} thesis${total !== 1 ? 'es' : ''} found`}
          </span>
        </div>

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div className="flex gap-2 flex-wrap">
            {search && (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full flex items-center gap-1">
                Search: "{search}"
                <button onClick={() => { setSearch(''); setSearchInput(''); }} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}
            {department !== 'All' && (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full flex items-center gap-1">
                Dept: {department}
                <button onClick={() => setDepartment('All')} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}
            {year !== 'All' && (
              <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full flex items-center gap-1">
                Year: {year}
                <button onClick={() => setYear('All')} className="hover:text-red-500 ml-1">✕</button>
              </span>
            )}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="text-center py-24 text-gray-400">
            <div className="text-4xl mb-3 animate-pulse">📚</div>
            Loading archive...
          </div>
        ) : theses.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-600 font-semibold">No theses found.</p>
            <p className="text-gray-400 text-sm mt-1">
              {hasActiveFilters ? 'Try adjusting your filters or search term.' : 'The archive is empty.'}
            </p>
            {hasActiveFilters && (
              <button onClick={handleClearFilters} className="mt-4 text-sm text-blue-600 hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {theses.map(thesis => (
              <ThesisCard
                key={thesis._id}
                thesis={thesis}
                isSupervisor={IS_SUPERVISOR}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex justify-center gap-2 pt-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              ← Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`text-sm px-4 py-2 rounded-xl border transition-colors ${
                  page === p
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white border-gray-200 hover:bg-gray-50 text-gray-700'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-sm px-4 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}