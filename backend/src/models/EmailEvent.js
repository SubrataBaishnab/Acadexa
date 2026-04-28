const mongoose = require('mongoose');

const emailEventSchema = new mongoose.Schema({
  studentId:      { type: String, required: true },
  supervisorId:   { type: String, required: true },
  supervisorEmail:{ type: String, required: true },
  studentEmail:   { type: String },
  deadlineId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Deadline' },
  messageId:      { type: String }, // SendGrid message ID
  subject:        { type: String },
  type:           { type: String, enum: ['deadline_reminder', 'milestone_approved', 'meeting_scheduled'], default: 'deadline_reminder' },

  // Timing chain
  sentAt:       { type: Date },
  openedAt:     { type: Date },   // set by SendGrid webhook
  respondedAt:  { type: Date },   // set when supervisor adds a comment

  // Computed (in hours)
  openTimeHours:    { type: Number },  // openedAt - sentAt
  responseTimeHours:{ type: Number },  // respondedAt - sentAt

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('EmailEvent', emailEventSchema);