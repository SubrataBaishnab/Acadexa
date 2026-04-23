const mongoose = require('mongoose');

const applicationTrackerSchema = new mongoose.Schema({ 
  studentId: {
    type: String,
    required: true,
  },
  professorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Professor',
    required: true,
  },
  status: {
    type: String,
    enum: [
      'Bookmarked',
      'Applied',
      'Replied',
      'Interview Scheduled',
      'Rejected',
      'Accepted',
      'No Response'
    ],
    default: 'Bookmarked',
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
applicationTrackerSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Compound index to ensure a student can only track a specific professor once
applicationTrackerSchema.index({ studentId: 1, professorId: 1 }, { unique: true });

module.exports = mongoose.model('ApplicationTracker', applicationTrackerSchema);
