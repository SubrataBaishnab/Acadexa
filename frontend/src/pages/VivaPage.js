import React, { useState, useEffect } from 'react';
import { vivaService } from '../services/vivaService';
import FlashCard from '../components/FlashCard';
import MockViva from '../components/MockViva';

const TAGS = ['All', 'Research Methodology', 'Literature Review', 'Data Analysis', 'Defense Q&A'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const VivaPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTag, setActiveTag] = useState('All');
  const [activeDifficulty, setActiveDifficulty] = useState('All');
  const [activeTab, setActiveTab] = useState('flashcards'); // 'flashcards' | 'mockviva'
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, [activeTag, activeDifficulty]);

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (activeTag !== 'All') params.tag = activeTag;
      if (activeDifficulty !== 'All') params.difficulty = activeDifficulty;
      const res = await vivaService.getQuestions(params);
      setQuestions(res.data || []);
    } catch (err) {
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Viva Preparation</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Browse past defense questions as flashcards or simulate a mock viva session.
        </p>
      </div>

      {/* Tab Switch */}
      <div className="flex gap-2 mb-6 bg-gray-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`text-sm font-medium px-5 py-2 rounded-lg transition-all ${
            activeTab === 'flashcards'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          📚 Flashcards
        </button>
        <button
          onClick={() => setActiveTab('mockviva')}
          className={`text-sm font-medium px-5 py-2 rounded-lg transition-all ${
            activeTab === 'mockviva'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          🎓 Mock Viva
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Topic</p>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                    activeTag === tag
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Difficulty</p>
            <div className="flex gap-2">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDifficulty(d)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                    activeDifficulty === d
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-600'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-400 text-sm py-12 animate-pulse">Loading questions...</div>
      )}

      {/* Flashcards Tab */}
      {!loading && activeTab === 'flashcards' && (
        <>
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-400 text-sm">No questions found for the selected filters.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-4">{filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuestions.map((q) => (
                  <FlashCard
                    key={q._id}
                    question={q.question}
                    answer={q.answer}
                    tag={q.tag}
                    difficulty={q.difficulty}
                  />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* Mock Viva Tab */}
      {!loading && activeTab === 'mockviva' && (
        <div className="max-w-xl mx-auto">
          <MockViva questions={filteredQuestions} />
        </div>
      )}
    </div>
  );
};

export default VivaPage;
