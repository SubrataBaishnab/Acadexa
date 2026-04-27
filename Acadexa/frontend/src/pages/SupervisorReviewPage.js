import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { reviewService } from '../services/reviewService';
import { StarPicker, StarDisplay } from '../components/StarRating';

// Replace with auth context later
const STUDENT_ID = 'student_001';

// ─── Rating Row ───────────────────────────────
function RatingRow({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-600">{label}</span>
      <div className="flex items-center gap-2">
        <StarDisplay value={value} size="sm" />
        <span className="text-sm font-semibold text-gray-700 w-6 text-right">{value}</span>
      </div>
    </div>
  );
}

// ─── Distribution Bar ─────────────────────────
function DistributionBar({ star, count, pct }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-4 text-gray-500">{star}★</span>
      <div className="flex-1 bg-gray-100 rounded-full h-2">
        <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-6 text-gray-400 text-right">{count}</span>
    </div>
  );
}

// ─── Review Card ──────────────────────────────
function ReviewCard({ review }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">{review.anonymousLabel}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(review.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <StarDisplay value={review.overallRating} size="sm" />
          <span className="text-sm font-bold text-gray-700">{review.overallRating}.0</span>
        </div>
      </div>

      {review.reviewText && (
        <p className="text-sm text-gray-600 leading-relaxed mb-3 bg-gray-50 rounded-xl px-3 py-2.5">
          "{review.reviewText}"
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 text-xs text-center">
        {[
          { label: 'Communication', val: review.communicationRating },
          { label: 'Availability',  val: review.availabilityRating },
          { label: 'Feedback',      val: review.feedbackQualityRating },
        ].map(({ label, val }) => (
          <div key={label} className="bg-gray-50 rounded-lg py-1.5 px-2">
            <p className="font-semibold text-gray-700">{val}/5</p>
            <p className="text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Review Form ──────────────────────────────
function ReviewForm({ supervisorId, onSuccess, onCancel }) {
  const [form, setForm] = useState({
    overallRating: 0,
    communicationRating: 0,
    availabilityRating: 0,
    feedbackQualityRating: 0,
    reviewText: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const setRating = (field, val) => { setForm(p => ({ ...p, [field]: val })); setError(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { overallRating, communicationRating, availabilityRating, feedbackQualityRating } = form;
    if (!overallRating || !communicationRating || !availabilityRating || !feedbackQualityRating) {
      return setError('Please fill in all star ratings.');
    }
    setLoading(true);
    try {
      await reviewService.submitReview('supervisor', supervisorId, { ...form, studentId: STUDENT_ID });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  const ratingFields = [
    { key: 'overallRating',        label: 'Overall Rating',     hint: 'Your general experience' },
    { key: 'communicationRating',  label: 'Communication',      hint: 'Clarity and responsiveness' },
    { key: 'availabilityRating',   label: 'Availability',       hint: 'Meeting accessibility' },
    { key: 'feedbackQualityRating',label: 'Feedback Quality',   hint: 'Helpfulness of comments' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-bold text-gray-800">Leave a Review</h3>
          <p className="text-xs text-gray-400 mt-0.5">Your review is completely anonymous</p>
        </div>
        <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">🔒 Anonymous</span>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {ratingFields.map(({ key, label, hint }) => (
          <div key={key}>
            <div className="flex items-baseline justify-between mb-1">
              <label className="text-sm font-semibold text-gray-700">{label}</label>
              <span className="text-xs text-gray-400">{hint}</span>
            </div>
            <StarPicker value={form[key]} onChange={val => setRating(key, val)} size="md" />
          </div>
        ))}

        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-1">
            Written Review <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={form.reviewText}
            onChange={e => setForm(p => ({ ...p, reviewText: e.target.value }))}
            rows={4}
            maxLength={1000}
            placeholder="Share your experience working with this supervisor..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 resize-none"
          />
          <p className="text-xs text-gray-400 text-right mt-1">{form.reviewText.length}/1000</p>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            {loading ? 'Submitting...' : 'Submit Anonymous Review'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-600 font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Main Page ────────────────────────────────
export default function SupervisorReviewPage() {
  const { supervisorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [data, setData]             = useState(null);
  const [loading, setLoading]       = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [showForm, setShowForm]     = useState(searchParams.get('rate') === 'true');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewRes, checkRes] = await Promise.all([
        reviewService.getReviews('supervisor', supervisorId),
        reviewService.checkReviewed('supervisor', supervisorId, STUDENT_ID),
      ]);
      setData(reviewRes.data);
      setHasReviewed(checkRes.data.hasReviewed);
    } catch {
      // supervisor not found or no reviews yet
    } finally {
      setLoading(false);
    }
  }, [supervisorId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleReviewSuccess = () => {
    setShowForm(false);
    setHasReviewed(true);
    setSuccessMsg('Your anonymous review has been submitted!');
    fetchData();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm animate-pulse">Loading reviews...</div>
      </div>
    );
  }

  const { supervisor, stats, reviews } = data || {};

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Back */}
        <button
          onClick={() => navigate('/supervisors')}
          className="text-sm text-gray-400 hover:text-blue-600 flex items-center gap-1 transition-colors"
        >
          ← Back to Supervisors
        </button>

        {/* Supervisor header */}
        {supervisor && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {supervisor.firstName} {supervisor.lastName}
                </h1>
                <p className="text-gray-500 text-sm mt-0.5">{supervisor.designation} · {supervisor.department}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {supervisor.researchAreas?.map((area, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{area}</span>
                  ))}
                </div>
              </div>
              {stats?.avgOverall > 0 && (
                <div className="text-center">
                  <p className="text-4xl font-black text-gray-900">{stats.avgOverall}</p>
                  <StarDisplay value={stats.avgOverall} size="md" />
                  <p className="text-xs text-gray-400 mt-1">{stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success message */}
        {successMsg && (
          <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">{successMsg}</div>
        )}

        {/* Stats panel */}
        {stats && stats.totalReviews > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Rating Breakdown</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category ratings */}
              <div>
                <RatingRow label="Overall"           value={stats.avgOverall} />
                <RatingRow label="Communication"     value={stats.avgCommunication} />
                <RatingRow label="Availability"      value={stats.avgAvailability} />
                <RatingRow label="Feedback Quality"  value={stats.avgFeedbackQuality} />
              </div>
              {/* Star distribution */}
              <div className="space-y-2">
                {stats.distribution.map(d => (
                  <DistributionBar key={d.star} star={d.star} count={d.count} pct={d.pct} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Rate button or already reviewed */}
        {!showForm && (
          <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">
                {hasReviewed ? '✅ You have already reviewed this supervisor' : 'Worked with this supervisor?'}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {hasReviewed ? 'Only one review per supervisor is allowed.' : 'Your review is completely anonymous and helps future students.'}
              </p>
            </div>
            {!hasReviewed && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors"
              >
                Write a Review
              </button>
            )}
          </div>
        )}

        {/* Review form */}
        {showForm && !hasReviewed && (
          <ReviewForm
            supervisorId={supervisorId}
            onSuccess={handleReviewSuccess}
            onCancel={() => setShowForm(false)}
          />
        )}

        {/* Reviews list */}
        <div>
          <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
            {stats?.totalReviews || 0} Review{stats?.totalReviews !== 1 ? 's' : ''}
          </h2>

          {!reviews || reviews.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-200">
              <p className="text-4xl mb-3">💬</p>
              <p className="text-gray-500 font-medium">No reviews yet.</p>
              <p className="text-gray-400 text-sm mt-1">Be the first to review this supervisor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <ReviewCard key={review._id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}