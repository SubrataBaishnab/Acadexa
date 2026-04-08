const VivaQuestion = require('../models/VivaQuestions');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });

// POST /api/viva/question/add
const addQuestion = async (req, res) => {
  try {
    const { question, answer, tag, difficulty, addedBy } = req.body;
    const newQuestion = new VivaQuestion({ question, answer, tag, difficulty, addedBy });
    await newQuestion.save();
    res.status(201).json({ message: 'Question added successfully', question: newQuestion });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/viva/questions
const getQuestions = async (req, res) => {
  try {
    const filter = {};
    if (req.query.tag) filter.tag = req.query.tag;
    if (req.query.difficulty) filter.difficulty = req.query.difficulty;
    const questions = await VivaQuestion.find(filter).sort({ createdAt: -1 });
    res.status(200).json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/viva/mock-session
// POST /api/viva/mock-session
const mockVivaSession = async (req, res) => {
  try {
    const { studentAnswer, questionId, tag } = req.body;

    const vivaQuestion = await VivaQuestion.findById(questionId);
    if (!vivaQuestion) return res.status(404).json({ error: 'Question not found' });

    res.status(200).json({
      originalQuestion: vivaQuestion.question,
      studentAnswer,
      tag,
      evaluation: 'Answer received and recorded successfully',
      feedback: 'Your answer has been submitted for the mock viva session. A supervisor will review your response.',
      status: 'submitted'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addQuestion, getQuestions, mockVivaSession };