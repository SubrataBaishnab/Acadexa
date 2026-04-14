const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Registration = require('../models/Registration');
const Synopsis = require('../models/Synopsis'); // Integrating with Member 4's model

// --- AI WRAPPERS & ORCHESTRATOR (Keep your existing functions here) ---
async function callGemini(modelName, prompt, path, mimeType, isPdf) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    if (isPdf) {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } else {
        const imagePart = { inlineData: { data: Buffer.from(fs.readFileSync(path)).toString("base64"), mimeType } };
        const result = await model.generateContent([prompt, imagePart]);
        return result.response.text();
    }
}
// ... (Include your callOpenRouter, callGroq, and analyzeTranscriptWithFallback functions here) ...
async function analyzeTranscriptWithFallback(prompt, path, mimeType, isPdf) {
    // Note: Assuming your orchestrator logic is pasted here
    return await callGemini('gemini-2.5-flash', prompt, path, mimeType, isPdf); // Simplified for length
}


// --- FEATURE 1: TRANSCRIPT VERIFIER ---
const verifyEligibility = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No transcript uploaded." });
        const studentId = req.body.student_id || "Unknown";
        let isPdf = req.file.mimetype === 'application/pdf';
        
        let basePrompt = `
            You are an expert BRAC University academic advisor.
            1. Calculate the total completed credits.
            2. To be eligible for Pre-Thesis 1, a student must have 75 or more completed credits.
            3. Suggest 2 or 3 advanced CSE courses.
            Reply strictly in raw JSON format: {"eligible": true, "total_credits": 78, "reason": "...", "suggested_courses": []}
        `;

        if (isPdf) {
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(dataBuffer);
            basePrompt += `\n\n--- EXTRACTED TEXT ---\n${pdfData.text}\n---------------------------------`;
        }
        
        let aiResponseText = await analyzeTranscriptWithFallback(basePrompt, req.file.path, req.file.mimetype, isPdf);
        aiResponseText = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const aiDecision = JSON.parse(aiResponseText);

        // DO NOT create a registration record yet. Just return the eligibility.
        res.json({ 
            status: aiDecision.eligible ? "Approved" : "Denied", 
            message: aiDecision.reason,
            credits: aiDecision.total_credits,
            suggestions: aiDecision.suggested_courses,
            canSubmitSynopsis: aiDecision.eligible 
        });

    } catch (error) {
        res.status(500).json({ error: "Failed to process transcript." });
    } finally {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
};

// --- FEATURE 2: RESEARCH GAP ANALYZER & PHD SCORE ---
const analyzeResearchGap = async (req, res) => {
    try {
        const { synopsis_id } = req.body;
        const synopsis = await Synopsis.findById(synopsis_id);
        
        if (!synopsis || !synopsis.fullSynopsis) {
            return res.status(404).json({ error: "Full synopsis not found." });
        }

        const prompt = `
            Act as a strict PhD admissions committee member. Analyze this abstract: "${synopsis.fullSynopsis.abstract}"
            1. Identify missing methodologies.
            2. Suggest areas of improvement.
            3. Calculate PhD readiness score ("Early Stage", "Developing Researcher", or "Competitive Applicant").
            Return strictly in JSON format: {"missing_methodologies": [], "improvements": [], "readiness_score": ""}
        `;

        const aiResponseText = await callGemini('gemini-2.5-flash', prompt, null, null, true);
        const gapAnalysis = JSON.parse(aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim());

        res.json({ success: true, data: gapAnalysis });
    } catch (error) {
        res.status(500).json({ error: "Analysis failed." });
    }
};

// --- FEATURE 3: OFFICIAL REGISTRATION WORKFLOW ---
const initiateRegistration = async (req, res) => {
    try {
        const { student_id, synopsis_id, group_members } = req.body;

        // Verify the synopsis is officially approved
        const approvedSynopsis = await Synopsis.findOne({ 
            _id: synopsis_id, 
            studentId: student_id, 
            stage: 'Full', 
            status: 'Approved' 
        });

        if (!approvedSynopsis) {
            return res.status(403).json({ error: "An approved Full Synopsis is required to register." });
        }

        // Create the official registration
        const newRecord = await Registration.create({ 
            student_id: student_id,
            synopsis_id: synopsis_id,
            thesis_title: approvedSynopsis.fullSynopsis.title,
            supervisor_id: approvedSynopsis.supervisorId, 
            group_members: group_members || [],
            status: "Pending Admin Approval" 
        });

        res.status(201).json({ message: "Registration submitted to admin.", data: newRecord });
    } catch (error) {
        res.status(500).json({ error: "Registration failed." });
    }
};

// Admin finalized endpoint
const finalizeRegistration = async (req, res) => {
    try {
        const { registration_id } = req.body;
        const record = await Registration.findByIdAndUpdate(
            registration_id,
            { status: "Officially Registered" },
            { new: true }
        );
        res.json({ message: "Registration finalized.", data: record });
    } catch (error) {
        res.status(500).json({ error: "Update failed." });
    }
};

module.exports = {
    verifyEligibility,
    analyzeResearchGap,
    initiateRegistration,
    finalizeRegistration
};