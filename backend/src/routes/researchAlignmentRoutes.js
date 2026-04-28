const express = require("express");
const router = express.Router();
const {
  analyzeAlignment,
} = require("../controllers/researchAlignmentController");

// POST /api/research-alignment/analyze
router.post("/analyze", analyzeAlignment);

module.exports = router;