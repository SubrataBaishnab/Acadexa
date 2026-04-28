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

  const [topic, setTopic] = useState('');
  const [generateDifficulty, setGenerateDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [generated, setGenerated] = useState(false);
  const [generating, setGenerating] = useState(false);

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
      setGenerated(true);
    } catch (err) {
      setError('Failed to load questions.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate questions.');
      return;
    }
    setGenerating(true);
    setError('');
    setGenerated(false);
    try {
      const res = await vivaService.generateQuestions({ topic, difficulty: generateDifficulty, count });
      setQuestions(res.data.questions || []);
      setGenerated(true);
      setActiveTag('All');
      setActiveDifficulty('All');
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
    } finally {
      setGenerating(false);
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

      {/* AI Generator Card */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full">✦ AI Powered</span>
          <h2 className="text-sm font-semibold text-gray-700">Generate Questions</h2>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
            placeholder="Enter your thesis topic, e.g. Machine Learning in Healthcare"
            className="flex-1 text-sm border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <select
            value={generateDifficulty}
            onChange={(e) => setGenerateDifficulty(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            {DIFFICULTIES.filter(d => d !== 'All').map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            {[3, 5, 8, 10].map((n) => (
              <option key={n} value={n}>{n} questions</option>
            ))}
          </select>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            {generating ? '✦ Generating...' : '✦ Generate'}
          </button>
        </div>

        {error && (
          <div className="mt-3 text-red-500 text-sm flex justify-between items-center">
            {error}
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
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

      {/* Loading state */}
      {generating && (
        <div className="text-center py-16">
          <div className="text-3xl mb-3 animate-pulse">✦</div>
          <p className="text-gray-400 text-sm animate-pulse">Claude is generating your questions...</p>
        </div>
      )}
      {loading && !generating && (
        <div className="text-center text-gray-400 text-sm py-12 animate-pulse">Loading questions...</div>
      )}

      {/* Empty state */}
      {!loading && !generating && !generated && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎓</div>
          <p className="text-gray-500 text-sm font-medium">Enter your thesis topic above to get started</p>
          <p className="text-gray-400 text-xs mt-1">Claude will generate relevant viva questions for you</p>
        </div>
      )}

      {/* Flashcards Tab */}
      {!loading && !generating && generated && activeTab === 'flashcards' && (
        <>
          {filteredQuestions.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-4xl mb-3">🔍</div>
              <p className="text-gray-400 text-sm">No questions found for the selected filters.</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-400 mb-4">{filteredQuestions.length} question{filteredQuestions.length !== 1 ? 's' : ''} found · <span className="text-blue-500">Click a card to reveal the answer</span></p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredQuestions.map((q, i) => (
                  <FlashCard
                    key={q._id || i}
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
      {!loading && !generating && generated && activeTab === 'mockviva' && (
        <div className="max-w-xl mx-auto">
          <MockViva questions={filteredQuestions} />
        </div>
      )}

      {/* Prompt to generate when switching to mockviva with no questions */}
      {!loading && !generating && !generated && activeTab === 'mockviva' && (
        <div className="text-center py-16 max-w-md mx-auto">
          <div className="text-5xl mb-4">🎓</div>
          <p className="text-gray-500 text-sm font-medium">Generate questions first to start your Mock Viva</p>
          <p className="text-gray-400 text-xs mt-1">Enter your topic above and click Generate</p>
        </div>
      )}
    </div>
  );
};

export default VivaPage;