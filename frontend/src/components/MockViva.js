import React, { useState } from 'react';
import { vivaService } from '../services/vivaService';

const MockViva = ({ questions = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleStart = () => {
    setSessionStarted(true);
    setResult(null);
    setAnswer('');
  };

  const handleSubmit = async () => {
    if (!answer.trim() || !currentQuestion) return;
    setLoading(true);
    try {
      const res = await vivaService.mockVivaSession({
        questionId: currentQuestion._id,
        studentAnswer: answer,
        tag: currentQuestion.tag,
      });
      setResult(res.data);
    } catch (err) {
      setResult({ feedback: 'Could not connect to server. Please try again.', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setAnswer('');
      setResult(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setAnswer('');
    setResult(null);
    setSessionStarted(false);
  };

  if (questions.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-3">🎓</div>
        <p className="text-gray-500 text-sm">No questions available for mock viva.</p>
      </div>
    );
  }

  if (!sessionStarted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <div className="text-4xl mb-4">🎓</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Mock Viva Session</h3>
        <p className="text-sm text-gray-500 mb-6">
          {questions.length} question{questions.length !== 1 ? 's' : ''} ready. Answer each one and get feedback.
        </p>
        <button
          onClick={handleStart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
        >
          Start Session
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Mock Viva</h3>
        <span className="text-xs text-gray-400">
          Question {currentIndex + 1} / {questions.length}
        </span>
      </div>

      {/* Progress */}
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
        <p className="text-sm font-medium text-gray-800">{currentQuestion.question}</p>
      </div>

      {/* Answer input */}
      {!result && (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="w-full text-sm border border-gray-200 rounded-xl px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent resize-none"
          />
          <button
            onClick={handleSubmit}
            disabled={!answer.trim() || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-xl transition-colors"
          >
            {loading ? 'Submitting...' : 'Submit Answer'}
          </button>
        </>
      )}

      {/* Result / Feedback */}
      {result && (
        <div className="mt-2">
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
            {/* AI Coming Soon Badge */}
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full flex items-center gap-1">
                ✦ AI Evaluation
                <span className="bg-purple-200 text-purple-700 text-xs px-1.5 py-0.5 rounded-full ml-1">Coming Soon</span>
              </span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">{result.feedback}</p>
          </div>

          <div className="flex gap-2">
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-xl transition-colors"
              >
                Next Question →
              </button>
            ) : (
              <div className="flex-1 text-center">
                <p className="text-sm font-semibold text-green-600 mb-2">🎉 Session Complete!</p>
                <button
                  onClick={handleRestart}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition-colors"
                >
                  Restart Session
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MockViva;
