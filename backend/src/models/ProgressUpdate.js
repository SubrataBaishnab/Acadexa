const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  supervisorId: { type: String, required: true },
  supervisorName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const progressUpdateSchema = new mongoose.Schema({
  // Identifiers (will link to real User model once auth is added)
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  supervisorId: { type: String, required: true },
  thesisTitle: { type: String, required: true },

  // Monthly Update Fields
  month: { type: String, required: true }, // e.g. "April 2026"
  completedTasks: { type: String, required: true },
  challengesFaced: { type: String, required: true },
  upcomingGoals: { type: String, required: true },
  percentageComplete: { type: Number, min: 0, max: 100, default: 0 },

  // Status set by supervisor
  status: {
    type: String,
    enum: ['Pending Review', 'On Track', 'Delayed', 'Critical'],
    default: 'Pending Review',
  },

  // Supervisor comments
  comments: [commentSchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

progressUpdateSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ProgressUpdate', progressUpdateSchema);
