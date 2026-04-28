const SupervisorReview = require('../models/SupervisorReview');
const Supervisor = require('../models/Supervisor');
const Professor  = require('../models/Professor');

// ─────────────────────────────────────────────
// Helper: get entity (supervisor or professor)
// ─────────────────────────────────────────────
const getEntity = async (type, id) => {
  if (type === 'professor') return Professor.findById(id);
  return Supervisor.findById(id);
};

// ─────────────────────────────────────────────
// POST /api/reviews/:type/:id
// type = 'supervisor' | 'professor'
// ─────────────────────────────────────────────
const submitReview = async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!['supervisor', 'professor'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type. Must be supervisor or professor.' });
    }

    const {
      studentId, overallRating, communicationRating,
      availabilityRating, feedbackQualityRating, reviewText,
    } = req.body;

    if (!studentId) return res.status(400).json({ error: 'studentId is required.' });

    const ratings = [overallRating, communicationRating, availabilityRating, feedbackQualityRating];
    if (ratings.some(r => !r || r < 1 || r > 5)) {
      return res.status(400).json({ error: 'All ratings must be between 1 and 5.' });
    }

    const entity = await getEntity(type, id);
    if (!entity) return res.status(404).json({ error: `${type} not found.` });

    const existing = await SupervisorReview.findOne({ supervisorId: id, studentId });
    if (existing) return res.status(400).json({ error: `You have already reviewed this ${type}.` });

    const reviewCount = await SupervisorReview.countDocuments({ supervisorId: id });
    const anonymousLabel = `Student #${reviewCount + 1}`;

    const review = await SupervisorReview.create({
      type,
      supervisorId: id,
      studentId,
      overallRating,
      communicationRating,
      availabilityRating,
      feedbackQualityRating,
      reviewText: reviewText?.trim() || '',
      anonymousLabel,
    });

    const safeReview = review.toObject();
    delete safeReview.studentId;

    res.status(201).json({ message: 'Review submitted successfully.', review: safeReview });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'You have already reviewed this person.' });
    }
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/reviews/:type/:id
// ─────────────────────────────────────────────
const getReviewsById = async (req, res) => {
  try {
    const { type, id } = req.params;
    if (!['supervisor', 'professor'].includes(type)) {
      return res.status(400).json({ error: 'Invalid type.' });
    }

    const entity = await getEntity(type, id);
    if (!entity) return res.status(404).json({ error: `${type} not found.` });

    const reviews = await SupervisorReview.find({ supervisorId: id })
      .select('-studentId')
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avg = (field) =>
      total === 0 ? 0 : Math.round((reviews.reduce((s, r) => s + r[field], 0) / total) * 10) / 10;

    const stats = {
      totalReviews:       total,
      avgOverall:         avg('overallRating'),
      avgCommunication:   avg('communicationRating'),
      avgAvailability:    avg('availabilityRating'),
      avgFeedbackQuality: avg('feedbackQualityRating'),
      distribution: [5, 4, 3, 2, 1].map(star => ({
        star,
        count: reviews.filter(r => r.overallRating === star).length,
        pct:   total === 0 ? 0 : Math.round(
          (reviews.filter(r => r.overallRating === star).length / total) * 100
        ),
      })),
    };

    // Build entity info for both types
    const entityInfo = type === 'professor'
      ? {
          _id:           entity._id,
          firstName:     entity.firstName,
          lastName:      entity.lastName,
          designation:   entity.designation,
          department:    entity.department,
          university:    entity.university,
          country:       entity.country,
          researchAreas: entity.researchAreas,
          profileImage:  entity.profileImage,
          type:          'professor',
        }
      : {
          _id:           entity._id,
          firstName:     entity.firstName,
          lastName:      entity.lastName,
          designation:   entity.designation,
          department:    entity.department,
          researchAreas: entity.researchAreas,
          profileImage:  entity.profileImage,
          type:          'supervisor',
        };

    res.json({ entity: entityInfo, stats, reviews });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/reviews/check/:type/:id/:studentId
// ─────────────────────────────────────────────
const checkReviewed = async (req, res) => {
  try {
    const { id, studentId } = req.params;
    const existing = await SupervisorReview.findOne({ supervisorId: id, studentId });
    res.json({ hasReviewed: Boolean(existing) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/reviews/summary/all
// ─────────────────────────────────────────────
const getAllSupervisorSummaries = async (req, res) => {
  try {
    const summaries = await SupervisorReview.aggregate([
      {
        $group: {
          _id:          '$supervisorId',
          avgOverall:   { $avg: '$overallRating' },
          totalReviews: { $sum: 1 },
          type:         { $first: '$type' },
        },
      },
      {
        $project: {
          supervisorId: '$_id',
          avgOverall:   { $round: ['$avgOverall', 1] },
          totalReviews: 1,
          type:         1,
        },
      },
    ]);
    res.json(summaries);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  submitReview,
  getReviewsById,
  checkReviewed,
  getAllSupervisorSummaries,
  // keep old name as alias for backward compat
  getReviewsBySupervisor: getReviewsById,
};