import React, { useState } from 'react';
import { vivaService } from '../services/vivaService';
import FlashCard from '../components/FlashCard';
import MockViva from '../components/MockViva';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TAGS = ['Research Methodology', 'Literature Review', 'Data Analysis', 'Defense Q&A'];

const VivaPage = () => {
  const [activeTab, setActiveTab] = useState('flashcards');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [count, setCount] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic to generate questions.');
      return;
    }
    setLoading(true);
    setError('');
    setGenerated(false);
    try {
      const res = await vivaService.generateQuestions({ topic, difficulty, count });
      setQuestions(res.data.questions || []);
      setGenerated(true);
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Viva Preparation</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Generate AI-powered flashcards or simulate a mock viva session for your thesis defense.
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
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          >
            {DIFFICULTIES.map((d) => (
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
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            {loading ? '✦ Generating...' : '✦ Generate'}
          </button>
        </div>

        {error && (
          <div className="mt-3 text-red-500 text-sm flex justify-between items-center">
            {error}
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center py-16">
          <div className="text-3xl mb-3 animate-pulse">✦</div>
          <p className="text-gray-400 text-sm animate-pulse">Claude is generating your questions...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !generated && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🎓</div>
          <p className="text-gray-500 text-sm font-medium">Enter your thesis topic above to get started</p>
          <p className="text-gray-400 text-xs mt-1">Claude will generate relevant viva questions for you</p>
        </div>
      )}

      {/* Flashcards Tab */}
      {!loading && generated && activeTab === 'flashcards' && (
        <>
          <p className="text-sm text-gray-400 mb-4">
            {questions.length} question{questions.length !== 1 ? 's' : ''} generated · <span className="text-blue-500">Click a card to reveal the answer</span>
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {questions.map((q, i) => (
              <FlashCard
                key={i}
                question={q.question}
                answer={q.answer}
                tag={q.tag}
                difficulty={q.difficulty}
              />
            ))}
          </div>
        </>
      )}

      {/* Mock Viva Tab */}
      {!loading && generated && activeTab === 'mockviva' && (
        <div className="max-w-2xl mx-auto">
          <MockViva questions={questions} />
        </div>
      )}

      {/* Prompt to generate when switching to mockviva with no questions */}
      {!loading && !generated && activeTab === 'mockviva' && (
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