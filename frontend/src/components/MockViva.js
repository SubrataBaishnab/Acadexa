import React, { useState } from 'react';
import { vivaService } from '../services/vivaService';

const gradeColors = {
  Excellent: 'bg-green-100 text-green-700 border-green-200',
  Good: 'bg-blue-100 text-blue-700 border-blue-200',
  Satisfactory: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Needs Improvement': 'bg-red-100 text-red-700 border-red-200',
};

const scoreColor = (score) => {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-blue-600';
  if (score >= 40) return 'text-yellow-600';
  return 'text-red-600';
};

const MockViva = ({ questions = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isComplete = sessionStarted && isLastQuestion && result;

  const handleStart = () => {
    setSessionStarted(true);
    setResult(null);
    setAnswer('');
    setSessionResults([]);
    setCurrentIndex(0);
  };

  const handleSubmit = async () => {
    if (!answer.trim() || !currentQuestion) return;
    setLoading(true);
    try {
      const res = await vivaService.mockVivaSession({
        question: currentQuestion.question,
        expectedAnswer: currentQuestion.answer,
        studentAnswer: answer,
        tag: currentQuestion.tag,
      });
      setResult(res.data);
      setSessionResults((prev) => [...prev, { ...res.data, questionIndex: currentIndex }]);
    } catch (err) {
      setResult({
        feedback: 'Could not connect to server. Please try again.',
        grade: 'Needs Improvement',
        score: 0,
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setCurrentIndex(currentIndex + 1);
    setAnswer('');
    setResult(null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswer('');
    setResult(null);
    setSessionStarted(false);
    setSessionResults([]);
  };

  const avgScore = sessionResults.length > 0
    ? Math.round(sessionResults.reduce((sum, r) => sum + (r.score || 0), 0) / sessionResults.length)
    : 0;

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-3">🎓</div>
        <p className="text-gray-500 text-sm">No questions available. Generate some questions first.</p>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="text-5xl mb-4">🎓</div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Mock Viva Session</h3>
        <p className="text-sm text-gray-500 mb-2">
          {questions.length} question{questions.length !== 1 ? 's' : ''} ready
        </p>
        <p className="text-xs text-gray-400 mb-6">
          Claude AI will evaluate each of your answers and give you a score and detailed feedback
        </p>
        <button
          onClick={handleStart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-3 rounded-xl transition-colors"
        >
          Start Session
        </button>
      </div>
    );
  }

  // Session complete summary
  if (isComplete) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-3">🎉</div>
          <h3 className="text-xl font-semibold text-gray-800">Session Complete!</h3>
          <p className="text-sm text-gray-400 mt-1">Here's how you performed</p>
        </div>

        {/* Average score */}
        <div className="bg-gray-50 rounded-xl p-5 mb-5 text-center border border-gray-100">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Average Score</p>
          <p className={`text-5xl font-bold ${scoreColor(avgScore)}`}>{avgScore}</p>
          <p className="text-xs text-gray-400 mt-1">out of 100</p>
        </div>

        {/* Per-question results */}
        <div className="space-y-3 mb-5">
          {sessionResults.map((r, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="text-sm text-gray-600">Question {i + 1}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${gradeColors[r.grade] || 'bg-gray-100 text-gray-600'}`}>
                  {r.grade}
                </span>
                <span className={`text-sm font-bold ${scoreColor(r.score)}`}>{r.score}/100</span>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleRestart}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Mock Viva</h3>
          <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">✦ AI</span>
        </div>
        <span className="text-xs text-gray-400">
          Question {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
        <div
          className="h-1.5 rounded-full bg-blue-500 transition-all duration-500"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-100">
        <div className="flex gap-2 mb-2">
          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full">
            {currentQuestion.tag}
          </span>
          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
            {currentQuestion.difficulty}
          </span>
        </div>
        <p className="text-sm font-medium text-gray-800 leading-relaxed">{currentQuestion.question}</p>
      </div>

      {/* Answer input */}
      {!result && (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={5}
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl transition-colors"
          >
            {loading ? '✦ Claude is evaluating...' : 'Submit Answer'}
          </button>
        </>
      )}

      {/* AI Feedback */}
      {result && (
        <div className="mt-2 space-y-3">
          {/* Score + Grade */}
          <div className="flex items-center gap-3">
            <div className="bg-gray-50 rounded-xl px-5 py-3 text-center border border-gray-100 flex-shrink-0">
              <p className={`text-3xl font-bold ${scoreColor(result.score)}`}>{result.score}</p>
              <p className="text-xs text-gray-400">/ 100</p>
            </div>
            <div className="flex-1">
              <span className={`text-xs font-medium px-3 py-1.5 rounded-full border inline-block mb-2 ${gradeColors[result.grade] || 'bg-gray-100 text-gray-600'}`}>
                {result.grade}
              </span>
              <p className="text-sm text-gray-600 leading-relaxed">{result.feedback}</p>
            </div>
          </div>

          {/* Strengths & Improvements */}
          {result.strengths && (
            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
              <p className="text-xs font-semibold text-green-600 mb-1">✓ Strength</p>
              <p className="text-sm text-gray-700">{result.strengths}</p>
            </div>
          )}
          {result.improvements && (
            <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
              <p className="text-xs font-semibold text-orange-600 mb-1">↑ Improve</p>
              <p className="text-sm text-gray-700">{result.improvements}</p>
            </div>
          )}

          {/* Next / Finish */}
          {!isLastQuestion ? (
            <button
              onClick={handleNext}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Next Question →
            </button>
          ) : (
            <button
              onClick={() => setResult(result)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              View Results 🎉
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MockViva;