const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.analyzeAlignment = async (req, res) => {
    try {
        const { topic, abstract, domains } = req.body;
        if (!topic || topic.trim() === '') {
            return res.status(400).json({ message: 'Research topic is required.' });
        }

        const prompt = `You are a global research trends analyst...
        Research Topic: "${topic}"
        Abstract/Description: "${abstract || 'Not provided'}"
        Selected Domains: "${domains || 'General CS'}"
        
        Analyze this research topic against global trends...
        Return ONLY a valid JSON object with: "overall_score", "trend_score", "university_score", "conference_score", "demand_tier", "verdict", "tagline".`;

        // Using your robust Gemini setup from Module 1
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
        const result = await model.generateContent(prompt);
        
        let rawText = result.response.text();
        rawText = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
        
        res.json(JSON.parse(rawText));
    } catch (error) {
        console.error("Alignment Error:", error);
        res.status(500).json({ error: "Failed to analyze alignment." });
    }
};