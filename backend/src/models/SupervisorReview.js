const mongoose = require('mongoose');

const supervisorReviewSchema = new mongoose.Schema({
  // 'supervisor' or 'professor'
  type:         { type: String, enum: ['supervisor', 'professor'], default: 'supervisor' },
  supervisorId: { type: mongoose.Schema.Types.ObjectId, required: true },

  // Stored for duplicate prevention — never exposed to frontend
  studentId: { type: String, required: true },

  // Ratings (1–5)
  overallRating:        { type: Number, required: true, min: 1, max: 5 },
  communicationRating:  { type: Number, required: true, min: 1, max: 5 },
  availabilityRating:   { type: Number, required: true, min: 1, max: 5 },
  feedbackQualityRating:{ type: Number, required: true, min: 1, max: 5 },

  // Written review
  reviewText: { type: String, trim: true, maxlength: 1000 },

  // Anonymous display
  anonymousLabel: { type: String },

  createdAt: { type: Date, default: Date.now },
});

// One review per student per supervisor/professor
supervisorReviewSchema.index({ supervisorId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('SupervisorReview', supervisorReviewSchema);
