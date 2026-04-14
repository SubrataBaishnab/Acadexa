const mongoose = require('mongoose');

const synopsisSchema = new mongoose.Schema({
  studentId: {
    type: String, // Referencing Student's studentId
    required: true,
  },
  supervisorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supervisor',
    required: true,
  },
  stage: {
    type: String,
    enum: ['Idea', 'Full'],
    default: 'Idea',
  },
  shortSummary: {
    type: String,
    required: true, // initial idea submission
  },
  fullSynopsis: {
    title: String,
    abstract: String,
    methodology: String,
    expectedOutcomes: String,
    toolsUsed: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Revision Required', 'Rejected'],
    default: 'Pending',
  },
  feedback: {
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

module.exports = mongoose.model('Synopsis', synopsisSchema);
