const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title:     { type: String, required: true },
  completed: { type: Boolean, default: false },
});

const deadlineSchema = new mongoose.Schema(
  {
    studentId:       { type: String, required: true },
    supervisorId:    { type: String, default: 'supervisor_001' },
    supervisorEmail: { type: String, default: '' },
    studentEmail:    { type: String, default: '' },
    thesisTitle:     { type: String, required: true },
    deadlineDate:    { type: Date, required: true },
    progressPercent: { type: Number, required: true, min: 0, max: 100 },
    tasks:           [taskSchema],

    pressureLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Critical'],
      default: 'Low',
    },
    pressureScore: { type: Number, default: 0 },

    // Meetings scheduled via Google Calendar
    meetingsScheduled: { type: Number, default: 0 },

    // Revision count
    revisionCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Deadline', deadlineSchema);