const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: String, // studentId or supervisorId
    required: true,
  },
  senderId: {
    type: String,
    default: 'System',
  },
  type: {
    type: String,
    enum: ['Synopsis', 'Registration', 'Deadline', 'Progress', 'General'],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  link: {
    type: String, // e.g., /synopsis-dashboard
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Notification', notificationSchema);
