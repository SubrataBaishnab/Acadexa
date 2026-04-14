const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const pdfParse = require('pdf-parse'); 
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const supervisorRoutes = require('./routes/supervisorRoutes');
const professorRoutes = require('./routes/professorRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const deadlineRoutes = require('./routes/deadlineRoutes');
const vivaRoutes = require('./routes/vivaRoutes');
const progressRoutes = require('./routes/progressRoutes');
const thesisArchiveRoutes = require('./routes/thesisArchiveRoutes'); // NEW
const synopsisRoutes = require('./routes/synopsisRoutes'); // NEW
const xlsx = require("xlsx");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// =========================================================================
// --- MODULE 1: MULTI-LLM AI ELIGIBILITY VERIFIER ---
// =========================================================================

const upload = multer({ dest: 'uploads/' });

const thesisRegistrationSchema = new mongoose.Schema({
    student_id: String,
    group_members: [String],
    thesis_title: String,
    supervisor_id: String,
    status: { type: String, default: "Pending Supervisor Approval" },
    registration_date: { type: Date, default: Date.now }
});
const Registration = mongoose.model('Registration', thesisRegistrationSchema);

// --- GEMINI WRAPPER ---
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

// --- OPENROUTER WRAPPER ---
async function callOpenRouter(prompt, path, mimeType, isPdf) {
    let messageContent = prompt; 

    if (!isPdf) {
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

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenRouter Status ${response.status}: ${errText}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
}

// --- GROQ WRAPPER ---
async function callGroq(prompt, path, mimeType, isPdf) {
    let messageContent = prompt; 
    let targetModel = isPdf ? "llama3-8b-8192" : "llama-3.2-11b-vision-preview";

    if (!isPdf) {
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

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Groq Status ${response.status}: ${errText}`);
    }
    const data = await response.json();
    return data.choices[0].message.content;
}

// --- THE FALLBACK ORCHESTRATOR ---
async function analyzeTranscriptWithFallback(prompt, path, mimeType, isPdf) {
    const providers = ['gemini-2.5-flash', 'gemini-1.5-pro', 'openrouter', 'groq'];
    
    console.log("\n=======================================================");
    console.log(`🤖 INITIATING AI ROUTER [Mode: ${isPdf ? 'TEXT (PDF)' : 'VISION (IMAGE)'}]`);
    console.log("=======================================================");

    for (const provider of providers) {
        try {
            console.log(`⏳ Accessing: [${provider.toUpperCase()}]...`);
            
            let resultText;
            if (provider === 'openrouter') resultText = await callOpenRouter(prompt, path, mimeType, isPdf);
            else if (provider === 'groq') resultText = await callGroq(prompt, path, mimeType, isPdf);
            else resultText = await callGemini(provider, prompt, path, mimeType, isPdf);

            console.log(`✅ SUCCESS! Processed by: [${provider.toUpperCase()}]`);
            console.log("=======================================================\n");
            return resultText;

        } catch (error) {
            console.log(`❌ FAILED: [${provider.toUpperCase()}] -> ${error.message}`);
            continue; 
        }
    }
    throw new Error("Critical: All AI models failed.");
}

// --- STUDENT STATUS ROUTE ---
app.get('/api/registration/status/:student_id', async (req, res) => {
    try {
        const record = await Registration.findOne({ student_id: req.params.student_id });
        if (!record) {
            return res.status(404).json({ message: "No registration found." });
        }
        res.json({ data: record });
    } catch (error) {
        res.status(500).json({ error: "Server error checking status." });
    }
});

app.post('/api/import-excel', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No Excel file uploaded" });
        }

        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        console.log("📊 Excel Data:", data);

        await Registration.insertMany(
            data.map(item => ({
                student_id: item.student_id || item.StudentID,
                thesis_title: item.thesis_title || "Imported",
                group_members: item.group_members || [],
                supervisor_id: item.supervisor_id || null,
                status: item.status || "Imported"
            }))
        );

        res.json({
            message: "Excel imported successfully",
            count: data.length
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Import failed" });
    } finally {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
});

app.post('/api/verify-eligibility', upload.single('transcript'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No transcript uploaded." });
        
        const studentId = req.body.student_id || "Unknown";
        
        const existingRecord = await Registration.findOne({ student_id: studentId });
        if (existingRecord) {
            if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
            return res.status(400).json({ 
                error: "Duplicate Entry", 
                message: `Student ${studentId} already has a registration in progress. Status: ${existingRecord.status}` 
            });
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

        if (isPdf) {
            console.log("📄 PDF detected! Extracting raw text locally...");
            const dataBuffer = fs.readFileSync(req.file.path);
            const pdfData = await pdfParse(dataBuffer);
            basePrompt += `\n\n--- EXTRACTED TRANSCRIPT TEXT ---\n${pdfData.text}\n---------------------------------`;
        }
        
        let aiResponseText = await analyzeTranscriptWithFallback(basePrompt, req.file.path, req.file.mimetype, isPdf);
        
        aiResponseText = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const aiDecision = JSON.parse(aiResponseText);
        const finalStatus = aiDecision.eligible ? "Eligible - Pending Supervisor" : "Denied - Missing Prerequisites";

        const newRecord = await Registration.create({ student_id: studentId, thesis_title: "Pending Title", status: finalStatus });

        res.json({ 
            status: aiDecision.eligible ? "Approved" : "Denied", 
            message: aiDecision.reason,
            credits: aiDecision.total_credits,
            suggestions: aiDecision.suggested_courses
        });

    } catch (error) {
        console.error("Backend Error:", error.message || error);
        res.status(500).json({ error: "Failed to process transcript: " + (error.message || "Unknown error") });
    } finally {
        if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    }
});

// =========================================================================
// --- MODULE 2: TEAM FORMATION & SUPERVISOR ROUTING ---
// =========================================================================

app.put('/api/registration/team-setup', async (req, res) => {
    try {
        const { student_id, thesis_title, group_members } = req.body;
        const updatedRecord = await Registration.findOneAndUpdate(
            { student_id: student_id }, 
            { thesis_title: thesis_title || "Pending Title", group_members: group_members || [] },
            { new: true }
        );
        if (!updatedRecord) return res.status(404).json({ error: "Registration not found." });
        res.json({ message: "Team saved.", data: updatedRecord });
    } catch (error) { res.status(500).json({ error: "Failed." }); }
});

app.put('/api/registration/assign-supervisor', async (req, res) => {
    try {
        const { student_id, supervisor_id } = req.body;
        const updatedRecord = await Registration.findOneAndUpdate(
            { student_id: student_id },
            { supervisor_id: supervisor_id, status: "Pending Supervisor Approval" },
            { new: true }
        );
        if (!updatedRecord) return res.status(404).json({ error: "Registration not found." });
        res.json({ message: "Routed to supervisor.", data: updatedRecord });
    } catch (error) { res.status(500).json({ error: "Failed." }); }
});

// =========================================================================
// --- ROUTES ---
// =========================================================================
app.use('/api/supervisors', supervisorRoutes);
app.use('/api/professors', professorRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/deadline', deadlineRoutes);
app.use('/api/viva', vivaRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/archive', thesisArchiveRoutes); // NEW
app.use('/api/synopsis', synopsisRoutes); // NEW

app.get('/api/health', (req, res) => { res.json({ status: 'Server is running' }); });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => { console.log(`🚀 Server running on port ${PORT}`); });