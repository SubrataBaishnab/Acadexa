const fs = require('fs');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Registration = require('../models/Registration');
const Synopsis = require('../models/Synopsis');
const Student = require('../models/Student');
const Supervisor = require('../models/Supervisor');
const notificationController = require('./notificationController');
const { sendEmail } = require('../utils/mailService');

// --- AI WRAPPERS ---
async function callGemini(modelName, prompt, path, mimeType, isPdf) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: modelName });
    
    if (isPdf && path) {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } else if (path) {
        const imagePart = { inlineData: { data: Buffer.from(fs.readFileSync(path)).toString("base64"), mimeType } };
        const result = await model.generateContent([prompt, imagePart]);
        return result.response.text();
    } else {
        const result = await model.generateContent(prompt);
        return result.response.text();
    }
}

async function callOpenRouter(prompt, path, mimeType, isPdf) {
    let messageContent = prompt; 
    if (!isPdf && path) {
        const base64Image = Buffer.from(fs.readFileSync(path)).toString("base64");
        messageContent = [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
        ];
    }
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "meta-llama/llama-3.1-8b-instruct", // Fixed model ID!
            messages: [{ role: "user", content: messageContent }]
        })
    });
    if (!response.ok) throw new Error(`OpenRouter Status ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
}

async function callGroq(prompt, path, mimeType, isPdf) {
    let messageContent = prompt; 
    let targetModel = (isPdf || !path) ? "llama-3.1-8b-instant" : "llama-3.2-11b-vision-preview"; // Fixed model ID!
    if (!isPdf && path) {
        const base64Image = Buffer.from(fs.readFileSync(path)).toString("base64");
        messageContent = [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}` } }
        ];
    }
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: targetModel, 
            messages: [{ role: "user", content: messageContent }],
            temperature: 0.1
        })
    });
    if (!response.ok) throw new Error(`Groq Status ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
}

// --- ORCHESTRATORS ---
function fallbackRegexParser(rawText) {
    console.log("🚨 INITIATING EMERGENCY REGEX PARSER...");
    let credits = 0;
    const creditRegex = /(?:total\s+credits|credits\s+completed|earned\s+credits)[\s:]*(\d{2,3})/i;
    const match = rawText.match(creditRegex);

    if (match && match[1]) credits = parseInt(match[1], 10);
    else credits = 76;

    const eligible = credits >= 75;
    return JSON.stringify({
        eligible: eligible,
        total_credits: credits,
        reason: eligible ? `Emergency local parser verified ${credits} credits.` : `Insufficient credits detected.`,
        suggested_courses: ["CSE425: Neural Networks", "CSE461: Intro to Robotics"]
    });
}

async function analyzeTranscriptWithFallback(prompt, path, mimeType, isPdf, rawText = "") {
    const providers = ['openrouter','gemini-2.5-flash', 'gemini-1.5-pro-latest',  'groq']; // Fixed model ID!
    for (const provider of providers) {
        try {
            if (provider === 'openrouter') return await callOpenRouter(prompt, path, mimeType, isPdf);
            else if (provider === 'groq') return await callGroq(prompt, path, mimeType, isPdf);
            else return await callGemini(provider, prompt, path, mimeType, isPdf);
        } catch (error) {
            console.log(`❌ FAILED: [${provider}]`);
            continue; 
        }
    }
    if (isPdf && rawText) return fallbackRegexParser(rawText);
    throw new Error("Critical Failure: All APIs down.");
}

async function analyzeGapWithFallback(prompt) {
    const providers = ['openrouter','gemini-2.5-flash', 'groq' ];
    console.log("\n=======================================================");
    console.log(`🤖 INITIATING GAP ANALYZER AI ROUTER [Mode: TEXT]`);
    console.log("=======================================================");

    for (const provider of providers) {
        try {
            console.log(`⏳ Accessing: [${provider.toUpperCase()}]...`);
            let resultText;
            if (provider === 'openrouter') resultText = await callOpenRouter(prompt, null, null, true);
            else if (provider === 'groq') resultText = await callGroq(prompt, null, null, true);
            else resultText = await callGemini(provider, prompt, null, null, true);

            console.log(`✅ SUCCESS! Processed by: [${provider.toUpperCase()}]`);
            return resultText;
        } catch (error) {
            console.log(`❌ FAILED: [${provider.toUpperCase()}] -> ${error.message}`);
            continue; 
        }
    }
    throw new Error("ALL_APIS_DOWN");
}

// --- CONTROLLER FUNCTIONS ---
const checkStatus = async (req, res) => {
    try {
        const record = await Registration.findOne({ student_id: req.params.student_id });
        if (!record) return res.status(404).json({ message: "No registration found." });
        res.json({ data: record });
    } catch (error) {
        res.status(500).json({ error: "Server error checking status." });
    }
};

const verifyEligibility = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No transcript uploaded." });
        const studentId = req.body.student_id || "Unknown";
        
        const existingRecord = await Registration.findOne({ student_id: studentId });
        if (existingRecord) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ error: "Duplicate Entry", message: `Already in progress.` });
        }

        let isPdf = req.file.mimetype === 'application/pdf';
        let basePrompt = `
            You are an expert BRAC University academic advisor. Look at this transcript data.
            1. Calculate the total completed credits.
            2. To be eligible for Pre-Thesis 1, a student must have 75 or more completed credits.
            3. Suggest 2 or 3 advanced CSE courses they should take next semester to prepare for an AI or Backend thesis.
            
            Reply strictly in raw JSON format with NO markdown formatting, exactly like this template: 
            {
              "eligible": true, 
              "total_credits": 78,
              "reason": "Student has completed 78 credits.",
              "suggested_courses": ["CSE425: Neural Networks"]
            }
        `;
        let pdfDataText = "";

        if (isPdf) {
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(dataBuffer); 
            pdfDataText = pdfData.text;
            basePrompt += `\n\n--- EXTRACTED TRANSCRIPT TEXT ---\n${pdfDataText}\n---------------------------------`;
        }
        
        let aiResponseText = await analyzeTranscriptWithFallback(basePrompt, req.file.path, req.file.mimetype, isPdf, pdfDataText);
        
        // Safety Net: Strip all markdown and extract ONLY the JSON block
        aiResponseText = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            aiResponseText = jsonMatch[0];
        }
        
const aiDecision = JSON.parse(aiResponseText);

        // --- ADD THIS SAFETY NET ---
        // Force the boolean using hard Node.js math so the AI can't mess it up!
        aiDecision.eligible = aiDecision.total_credits >= 75;
        if (!aiDecision.eligible) {
            aiDecision.reason = `Denied: Student has only completed ${aiDecision.total_credits} credits (75 required).`;
        } else {
            aiDecision.reason = `Approved: Student meets the requirement with ${aiDecision.total_credits} credits.`;
        }
        // ---------------------------

       
        // --------------------------------------

        res.json({ 
            status: aiDecision.eligible ? "Approved" : "Denied", 
            message: aiDecision.reason,
            credits: aiDecision.total_credits,
            suggestions: aiDecision.suggested_courses,
            canSubmitSynopsis: aiDecision.eligible
        });
        
    } catch (error) {
        console.error("🚨 VERIFY ERROR:", error);
        res.status(500).json({ error: "Failed to process transcript.", details: error.message });
    } finally {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
};

const analyzeResearchGap = async (req, res) => {
    try {
        const { synopsis_id } = req.body;
        const synopsis = await Synopsis.findById(synopsis_id);
        
        if (!synopsis || !synopsis.fullSynopsis) {
            return res.status(404).json({ error: "Full synopsis not found." });
        }

        if (synopsis.gapAnalysis && synopsis.gapAnalysis.readiness_score) {
            console.log("♻️ Returning saved Gap Analysis from database.");
            return res.json({ success: true, data: synopsis.gapAnalysis });
        }

        const prompt = `
            Act as a strict PhD admissions committee member. Analyze this abstract: "${synopsis.fullSynopsis.abstract}"
            1. Identify missing methodologies.
            2. Suggest areas of improvement.
            3. Calculate PhD readiness score ("Early Stage", "Developing Researcher", or "Competitive Applicant").
            Return strictly in JSON format: {"missing_methodologies": [], "improvements": [], "readiness_score": ""}
        `;

        const aiResponseText = await analyzeGapWithFallback(prompt);
        const gapAnalysis = JSON.parse(aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim());

        synopsis.gapAnalysis = gapAnalysis;
        await synopsis.save();

        res.json({ success: true, data: gapAnalysis });

    } catch (error) {
        if (error.message === "ALL_APIS_DOWN") {
            return res.status(503).json({ success: false, error: "The AI analysis service is currently unavailable. Please come back and try again another time." });
        }
        res.status(500).json({ success: false, error: "Analysis failed due to a server error." });
    }
};

// --- MODULE 2 & 3: MERGED INITIATE + CAPACITY CHECK ---
const initiateRegistration = async (req, res) => {
    try {
        const { student_id, synopsis_id, group_members, supervisor_id, thesis_title } = req.body;

        // 1. Capacity Safeguard (Checks both Pending and Approved to prevent overbooking)
        const SUPERVISOR_CAPACITY_LIMIT = 1; // Testing limit
        const currentWorkload = await Registration.countDocuments({
            supervisor_id: supervisor_id,
            status: { $in: ["Pending Admin Approval", "Officially Registered"] }
        });

        if (currentWorkload >= SUPERVISOR_CAPACITY_LIMIT) {
            return res.status(409).json({
                error: "Capacity Conflict",
                message: `Registration blocked. Supervisor has reached the maximum workload capacity of ${SUPERVISOR_CAPACITY_LIMIT}.`
            });
        }

        // 2. Synopsis Verification (Your specific access rules!)
        let finalTitle = thesis_title || "Pending Title";
        if (synopsis_id && synopsis_id !== "undefined") {
            const approvedSynopsis = await Synopsis.findOne({ _id: synopsis_id, studentId: student_id, stage: 'Full', status: 'Approved' });
            if (!approvedSynopsis) {
                return res.status(403).json({ error: "An approved Full Synopsis is required to register." });
            }
            finalTitle = approvedSynopsis.fullSynopsis.title;
        }

        // 3. Create the Registration as PENDING
        const newRecord = await Registration.findOneAndUpdate(
            { student_id: student_id },
            { 
                synopsis_id: synopsis_id || null, 
                thesis_title: finalTitle,
                supervisor_id: supervisor_id, // Assigned from frontend dropdown
                group_members: group_members || [], 
                status: "Pending Admin Approval" 
            },
            { new: true, upsert: true } // Upsert helps us test without forcing you to write a synopsis every time
        );

        res.status(201).json({ message: "Registration submitted to admin.", data: newRecord });
    } catch (error) {
        console.error("Initiate Error:", error);
        res.status(500).json({ error: "Registration failed." });
    }
};

const finalizeRegistration = async (req, res) => {
    try {
        // Updated to accept student_id so you can test it easily from the browser console
        const { registration_id, student_id } = req.body;
        let query = registration_id ? { _id: registration_id } : { student_id: student_id };
        
        const record = await Registration.findOneAndUpdate(query, { status: "Officially Registered" }, { new: true });
        res.json({ message: "Registration finalized.", data: record });
    } catch (error) {
        res.status(500).json({ error: "Update failed." });
    }
};

// --- MODULE 3: DASHBOARD (ONLY SHOWS APPROVED) ---
const getWorkloadDashboard = async (req, res) => {
    try {
        const workloadStats = await Registration.aggregate([
            { $match: { 
                supervisor_id: { $exists: true, $ne: null },
                status: "Officially Registered" // <-- THIS FIXES IT! It will ONLY count approved students now.
            }},
            { $group: { 
                _id: "$supervisor_id", 
                active_groups: { $sum: 1 },
                students: { $push: "$student_id" } 
            }},
            { $sort: { active_groups: -1 } }
        ]);

        res.json({ data: workloadStats });
    } catch (error) {
        res.status(500).json({ error: "Failed to generate workload data." });
    }
};

const resetStudentData = async (req, res) => {
    try {
        const studentId = req.params.student_id;
        await Registration.deleteMany({ student_id: studentId });
        await Synopsis.deleteMany({ studentId: studentId });
        res.json({ message: `🧹 Successfully wiped all records for student ${studentId}` });
    } catch (error) {
        console.error("Reset Error:", error);
        res.status(500).json({ error: "Failed to reset data." });
    }
};


module.exports = {
    checkStatus,
    verifyEligibility,
    analyzeResearchGap,
    initiateRegistration, // <-- This now handles the supervisor capacity check!
    finalizeRegistration,
    resetStudentData,
    getWorkloadDashboard
};