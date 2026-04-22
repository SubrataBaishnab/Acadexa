const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');

router.get('/:studentId', portfolioController.getPortfolio);

module.exports = router;
