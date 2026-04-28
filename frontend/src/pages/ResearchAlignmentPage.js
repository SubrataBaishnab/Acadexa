import React, { useState } from "react";
import { analyzeResearchAlignment } from "../services/researchAlignmentService";

const DOMAIN_OPTIONS = [
  "AI/ML",
  "Cybersecurity",
  "IoT/Edge Computing",
  "NLP",
  "Computer Vision",
  "Distributed Systems",
  "Bioinformatics",
  "Blockchain",
  "HCI",
  "Robotics",
  "Cloud Computing",
  "Data Engineering",
];

const TIER_STYLES = {
  "Highly Demanded": {
    bg: "bg-green-50",
    text: "text-green-800",
    border: "border-green-300",
    ring: "#16a34a",
  },
  "Moderately Demanded": {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-300",
    ring: "#ca8a04",
  },
  "Emerging Field": {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-300",
    ring: "#2563eb",
  },
  "Niche Area": {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-300",
    ring: "#6b7280",
  },
};

const RELEVANCE_STYLES = {
  high: "bg-red-50 text-red-800 border border-red-200",
  medium: "bg-yellow-50 text-yellow-800 border border-yellow-200",
  low: "bg-gray-100 text-gray-600 border border-gray-200",
};

const ScoreRing = ({ score, color, size = 100 }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const center = size / 2;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="6"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-semibold text-gray-800">{score}</span>
        <span className="text-xs text-gray-400">/100</span>
      </div>
    </div>
  );
};

const MiniScoreBar = ({ label, score, color }) => (
  <div className="bg-white rounded-xl border border-gray-100 p-4">
    <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
      {label}
    </p>
    <p className="text-xl font-semibold text-gray-800 mb-2">
      {score}
      <span className="text-sm font-normal text-gray-400">/100</span>
    </p>
    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${score}%`, backgroundColor: color }}
      />
    </div>
  </div>
);

export default function ResearchAlignmentPage() {
  const [topic, setTopic] = useState("");
  const [abstract, setAbstract] = useState("");
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const toggleDomain = (domain) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
  };

  const handleAnalyze = async () => {
    if (!topic.trim()) {
      setError("Please enter your research topic.");
      return;
    }
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const domains =
        selectedDomains.length > 0
          ? selectedDomains.join(", ")
          : "General CS";
      const response = await analyzeResearchAlignment({
        topic,
        abstract,
        domains,
      });
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setTopic("");
    setAbstract("");
    setSelectedDomains([]);
    setError("");
  };

  const tierStyle =
    result && TIER_STYLES[result.demand_tier]
      ? TIER_STYLES[result.demand_tier]
      : TIER_STYLES["Niche Area"];

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          
          <h1 className="text-3xl font-semibold text-gray-900">
            Global Research Alignment Score
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Analyze how well your thesis topic aligns with trending global
            research areas, top university domains, and major conference themes.
          </p>
        </div>

        {/* Input Card */}
        {!result && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            {/* Topic */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Research Topic / Thesis Title{" "}
                <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Federated Learning for Privacy-Preserving Medical Diagnosis"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent"
              />
            </div>

            {/* Abstract */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Brief Abstract{" "}
                <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                rows={3}
                placeholder="Describe your methodology, tools, dataset, and key contributions..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-transparent resize-none"
              />
            </div>

            {/* Domains */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Research Domain{" "}
                <span className="text-gray-400 font-normal">
                  (select all that apply)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {DOMAIN_OPTIONS.map((domain) => (
                  <button
                    key={domain}
                    onClick={() => toggleDomain(domain)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 ${
                      selectedDomains.includes(domain)
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    {domain}
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-medium py-3 rounded-xl transition-colors duration-150"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Analyzing...
                </span>
              ) : (
                "Analyze Research Alignment →"
              )}
            </button>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-5 animate-fade-in">

            {/* Score Hero */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-6">
              <ScoreRing
                score={result.overall_score}
                color={tierStyle.ring}
                size={100}
              />
              <div className="flex-1">
                <span
                  className={`inline-block text-xs px-3 py-1 rounded-full border font-medium mb-2 ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}
                >
                  {result.demand_tier}
                </span>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">
                  {result.verdict}
                </h2>
                <p className="text-sm text-gray-500">{result.tagline}</p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="grid grid-cols-3 gap-3">
              <MiniScoreBar
                label="Trend Alignment"
                score={result.trend_score}
                color="#16a34a"
              />
              <MiniScoreBar
                label="University Fit"
                score={result.university_score}
                color="#2563eb"
              />
              <MiniScoreBar
                label="Conference Impact"
                score={result.conference_score}
                color="#d97706"
              />
            </div>

            {/* Analysis */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Analysis
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {result.analysis}
              </p>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                Trending Global Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.trending_topics.map((t, i) => (
                  <span
                    key={i}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium ${
                      RELEVANCE_STYLES[t.relevance] ||
                      RELEVANCE_STYLES["low"]
                    }`}
                  >
                    {t.topic}
                    <span className="ml-1.5 opacity-60 capitalize">
                      · {t.relevance}
                    </span>
                  </span>
                ))}
              </div>
            </div>

            {/* Universities + Conferences */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Top Universities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.top_universities.map((u, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                  Conference Themes
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.conference_themes.map((c, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                Strengths & Gaps
              </h3>
              <ul className="space-y-3">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex gap-3">
                    <span
                      className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        rec.type === "strength"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}
                    >
                      {rec.type === "strength" ? "✓" : "!"}
                    </span>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {rec.text}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Reset */}
            <button
              onClick={handleReset}
              className="w-full border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-medium py-3 rounded-xl transition-colors duration-150"
            >
              ← Analyze Another Topic
            </button>
          </div>
        )}
      </div>
    </div>
  );
}