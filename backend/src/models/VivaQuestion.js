const mongoose = require('mongoose');

const vivaQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    tag: {
      type: String,
      enum: ['Research Methodology', 'Literature Review', 'Data Analysis', 'Defense Q&A'],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    addedBy: { type: String, default: 'admin' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('VivaQuestion', vivaQuestionSchema);
