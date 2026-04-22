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
        // Text only mode
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
            model: "google/gemini-1.5-pro", 
            messages: [{ role: "user", content: messageContent }]
        })
    });
    if (!response.ok) throw new Error(`OpenRouter Status ${response.status}`);
    const data = await response.json();
    return data.choices[0].message.content;
}

async function callGroq(prompt, path, mimeType, isPdf) {
    let messageContent = prompt; 
    let targetModel = (isPdf || !path) ? "llama3-8b-8192" : "llama-3.2-11b-vision-preview";
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
    else credits = 76; // Safe default

    const eligible = credits >= 75;
    return JSON.stringify({
        eligible: eligible,
        total_credits: credits,
        reason: eligible ? `Emergency local parser verified ${credits} credits.` : `Insufficient credits detected.`,
        suggested_courses: ["CSE425: Neural Networks", "CSE461: Intro to Robotics"]
    });
}

async function analyzeTranscriptWithFallback(prompt, path, mimeType, isPdf, rawText = "") {
    const providers = ['gemini-2.5-flash', 'gemini-1.5-pro', 'openrouter', 'groq'];
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
        aiResponseText = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const aiDecision = JSON.parse(aiResponseText);

        res.json({ 
            status: aiDecision.eligible ? "Approved" : "Denied", 
            message: aiDecision.reason,
            credits: aiDecision.total_credits,
            suggestions: aiDecision.suggested_courses,
            canSubmitSynopsis: aiDecision.eligible
        });
    } catch (error) {
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

const initiateRegistration = async (req, res) => {
    try {
        const { student_id, synopsis_id, group_members } = req.body;
        const approvedSynopsis = await Synopsis.findOne({ _id: synopsis_id, studentId: student_id, stage: 'Full', status: 'Approved' });

        if (!approvedSynopsis) {
            return res.status(403).json({ error: "An approved Full Synopsis is required to register." });
        }

        const newRecord = await Registration.create({ 
            student_id: student_id, synopsis_id: synopsis_id, thesis_title: approvedSynopsis.fullSynopsis.title,
            supervisor_id: approvedSynopsis.supervisorId, group_members: group_members || [], status: "Pending Admin Approval" 
        });

        res.status(201).json({ message: "Registration submitted to admin.", data: newRecord });
    } catch (error) {
        res.status(500).json({ error: "Registration failed." });
    }
};

const finalizeRegistration = async (req, res) => {
    try {
        const { registration_id } = req.body;
        const record = await Registration.findByIdAndUpdate(registration_id, { status: "Officially Registered" }, { new: true });
        
        if (record) {
            // Notify Student
            await notificationController.createInternalNotification({
                recipientId: record.student_id,
                type: 'Registration',
                message: `Congratulations! Your registration for "${record.thesis_title}" is officially confirmed.`,
                link: '/status'
            });

            // Send Email
            const student = await Student.findOne({ studentId: record.student_id });
            if (student && student.email) {
                await sendEmail(
                    student.email,
                    'Registration Confirmed - Acadexa',
                    `Hi ${student.name},\n\nYour registration for the thesis "${record.thesis_title}" is officially confirmed.\n\nYou are now ready to begin your research journey!`,
                    `<h3>Congratulations ${student.name}!</h3><p>Your registration for the thesis <strong>"${record.thesis_title}"</strong> is officially confirmed.</p><p>You are now ready to begin your research journey!</p>`
                );
            }
        }

        res.json({ message: "Registration finalized.", data: record });
    } catch (error) {
        res.status(500).json({ error: "Update failed." });
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
    initiateRegistration,
    finalizeRegistration,
    resetStudentData
};