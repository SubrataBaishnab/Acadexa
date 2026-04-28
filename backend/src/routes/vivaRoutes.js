const express = require('express');
const router = express.Router();
const {
  addQuestion,
  getQuestions,
  generateQuestions,
  mockVivaSession,
} = require('../controllers/vivaController');

router.post('/question/add', addQuestion);
router.get('/questions', getQuestions);
router.post('/generate-questions', generateQuestions);
router.post('/mock-session', mockVivaSession);

module.exports = router;