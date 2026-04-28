const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  supervisorId: { type: String, required: true },
  supervisorName: { type: String, required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  done: { type: Boolean, default: false },
});

const progressUpdateSchema = new mongoose.Schema({
  // Identifiers — swap String for ObjectId once auth is added
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  supervisorId: { type: String, required: true },
  thesisTitle: { type: String, required: true },

  // Monthly Update Fields
  month: { type: String, required: true }, // e.g. "April 2026"

  // Task arrays — percentage is auto-calculated from these
  completedTasks: { type: [taskSchema], default: [] },
  upcomingGoals:  { type: [taskSchema], default: [] },
  challengesFaced: { type: String, required: true },

  // Auto-calculated — never set manually
  percentageComplete: { type: Number, min: 0, max: 100, default: 0 },

  // Status set by supervisor
  status: {
    type: String,
    enum: ['Pending Review', 'On Track', 'Delayed', 'Critical'],
    default: 'Pending Review',
  },

  comments: [commentSchema],

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Auto-calculate percentageComplete before every save
progressUpdateSchema.pre('save', async function () {
  const totalTasks = this.completedTasks.length + this.upcomingGoals.length;
  if (totalTasks === 0) {
    this.percentageComplete = 0;
  } else {
    // completedTasks are always done:true; upcomingGoals start as done:false
    const completedCount = this.completedTasks.length + this.upcomingGoals.filter(t => t.done).length;
    this.percentageComplete = Math.round((completedCount / totalTasks) * 100);
  }
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('ProgressUpdate', progressUpdateSchema);