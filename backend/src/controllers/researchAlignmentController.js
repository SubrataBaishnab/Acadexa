const analyzeAlignment = async (req, res) => {
  const { topic, abstract: researchAbstract, domains } = req.body;

  if (!topic || topic.trim() === '') {
    return res.status(400).json({ message: 'Research topic is required.' });
  }

  const prompt = `You are a global research trends analyst specializing in computer science and academic research alignment. A university student has submitted their thesis topic for analysis.

Research Topic: "${topic}"
Abstract/Description: "${researchAbstract || 'Not provided'}"
Selected Domains: ${domains || 'General CS'}

Analyze this research topic against:
1. Current global research trends (2024-2025)
2. Top university research domains (MIT, Stanford, CMU, Oxford, ETH Zurich, etc.)
3. Recent major conference themes (NeurIPS, ICML, CVPR, ACL, ICLR, IEEE S&P, ACM CCS, etc.)

Return ONLY a valid JSON object with no markdown, no backticks, no explanation. Use exactly this structure:
{
  "overall_score": <integer 0-100>,
  "trend_score": <integer 0-100>,
  "university_score": <integer 0-100>,
  "conference_score": <integer 0-100>,
  "demand_tier": "<one of: Highly Demanded | Moderately Demanded | Niche Area | Emerging Field>",
  "verdict": "<8-12 word summary of the research global standing>",
  "tagline": "<1 sentence 15-25 words describing the research potential and positioning>",
  "analysis": "<3-4 sentences explaining the alignment score and current interest>",
  "trending_topics": [
    { "topic": "<short topic name>", "relevance": "<high|medium|low>" }
  ],
  "top_universities": ["<university name>"],
  "conference_themes": ["<theme name>"],
  "recommendations": [
    { "type": "strength", "text": "<1-2 sentences on what the student is doing right>" },
    { "type": "strength", "text": "<another strength>" },
    { "type": "gap", "text": "<1-2 sentences on what could be improved>" },
    { "type": "gap", "text": "<another gap>" },
    { "type": "gap", "text": "<another gap>" }
  ]
}`;

  try {
    const analyzeTextWithFallback = req.app.locals.analyzeTextWithFallback;
    const rawText = await analyzeTextWithFallback(prompt);
    const analysisResult = JSON.parse(rawText.replace(/```json|```/g, '').trim());

    return res.status(200).json({
      message: 'Analysis complete.',
      data: analysisResult,
    });
  } catch (error) {
    console.error('Research alignment analysis error:', error.message);
    if (error instanceof SyntaxError) {
      return res.status(500).json({ message: 'Failed to parse AI response. Please try again.' });
    }
    return res.status(500).json({ message: 'Analysis failed. Please try again later.' });
  }
};

module.exports = { analyzeAlignment };