const VivaQuestion = require('../models/VivaQuestion');
const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
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

// POST /api/viva/generate-questions (AI-powered)
const generateQuestions = async (req, res) => {
  try {
    const { topic, difficulty, count = 5 } = req.body;
    if (!topic) return res.status(400).json({ error: 'Topic is required' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Generate ${count} thesis defense viva questions about "${topic}" at ${difficulty || 'Medium'} difficulty level.

Return ONLY a valid JSON array with no extra text, no markdown, no backticks. Each object must have:
- "question": the viva question string
- "answer": a detailed model answer string
- "tag": one of ["Research Methodology", "Literature Review", "Data Analysis", "Defense Q&A"]
- "difficulty": "${difficulty || 'Medium'}"

Example format:
[{"question":"...","answer":"...","tag":"Research Methodology","difficulty":"Medium"}]`
        }
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const raw = completion.choices[0].message.content.trim();
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const questions = JSON.parse(cleaned);
    res.status(200).json({ questions });
  } catch (err) {
    console.error('Generate questions error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

// POST /api/viva/mock-session (AI-powered evaluation)
const mockVivaSession = async (req, res) => {
  try {
    const { studentAnswer, questionId, question, expectedAnswer, tag } = req.body;

    let questionText = question;
    let expectedAnswerText = expectedAnswer;

    if (questionId) {
      const vivaQuestion = await VivaQuestion.findById(questionId).catch(() => null);
      if (vivaQuestion) {
        questionText = vivaQuestion.question;
        expectedAnswerText = vivaQuestion.answer;
      }
    }

    if (!questionText) return res.status(400).json({ error: 'Question is required' });

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `You are a strict but fair PhD thesis defense examiner evaluating a student's viva answer.

Question: ${questionText}
${expectedAnswerText ? `Model Answer: ${expectedAnswerText}` : ''}
Student's Answer: ${studentAnswer}

Evaluate the student's answer and respond ONLY with a valid JSON object with no markdown or backticks:
{
  "score": <number 0-100>,
  "grade": <"Excellent" | "Good" | "Satisfactory" | "Needs Improvement">,
  "feedback": "<2-3 sentences of specific, constructive feedback>",
  "strengths": "<one sentence on what they did well>",
  "improvements": "<one sentence on what to improve>"
}`
        }
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const raw = completion.choices[0].message.content.trim();
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const evaluation = JSON.parse(cleaned);

    res.status(200).json({
      originalQuestion: questionText,
      studentAnswer,
      tag,
      ...evaluation,
      status: 'evaluated'
    });
  } catch (err) {
    console.error('Mock viva error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { addQuestion, getQuestions, generateQuestions, mockVivaSession };