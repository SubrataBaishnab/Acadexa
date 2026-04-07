import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import multer from 'multer';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Successfully connected to MongoDB Atlas!"))
    .catch((err) => console.error("❌ MongoDB connection error:", err));

// --- 2. DATA MODELS ---
const thesisRegistrationSchema = new mongoose.Schema({
    student_id: String,
    group_members: [String],
    thesis_title: String,
    supervisor_id: String,
    status: { type: String, default: "Pending Supervisor Approval" },
    registration_date: { type: Date, default: Date.now }
});

const Registration = mongoose.model('Registration', thesisRegistrationSchema);

// --- 3. MODULE 1: AI ELIGIBILITY VERIFIER (GEMINI 2.5 FLASH) ---
const upload = multer({ dest: 'uploads/' });

// Helper to convert local image to Gemini format
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

app.post('/api/verify-eligibility', upload.single('transcript'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No transcript uploaded." });
        
        const studentId = req.body.student_id || "Unknown";
        console.log(`Starting Gemini AI scan for Student ${studentId}...`);

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" }); // or gemini-1.5-flash

        const prompt = `
            You are an expert BRAC University academic advisor. Look at this uploaded transcript.
            1. Calculate the total completed credits.
            2. To be eligible for Pre-Thesis 1, a student must have 75 or more completed credits.
            3. Based on what they have already taken, suggest 2 or 3 advanced CSE courses they should take next semester to prepare for a thesis in AI, Machine Learning, or Backend systems. Ensure you suggest courses they have NOT taken yet.
            
            Reply strictly in raw JSON format with NO markdown formatting, exactly like this template: 
            {
              "eligible": true, 
              "total_credits": 78,
              "reason": "Student has completed 78 credits, passing the 75 credit threshold.",
              "suggested_courses": ["CSE425: Neural Networks", "CSE470: Software Engineering"]
            }
        `;
        
        const imagePart = fileToGenerativePart(req.file.path, req.file.mimetype);
        
        // Ask Gemini!
        const result = await model.generateContent([prompt, imagePart]);
        let aiResponseText = result.response.text().trim();
        
        // Clean up markdown if Gemini accidentally adds it
        if (aiResponseText.startsWith("```json")) {
            aiResponseText = aiResponseText.replace(/^```json/, '').replace(/```$/, '').trim();
        }

        const aiDecision = JSON.parse(aiResponseText);

        // Delete the temporary file
        fs.unlinkSync(req.file.path);

        const finalStatus = aiDecision.eligible ? "Eligible - Pending Supervisor" : "Denied - Missing Prerequisites";

        // SAVE TO MONGODB
        const newRecord = await Registration.create({
            student_id: studentId,
            thesis_title: "Pending Title",
            status: finalStatus
        });

        console.log("✅ Gemini Decision saved:", newRecord);

        res.json({ 
            status: aiDecision.eligible ? "Approved" : "Denied", 
            message: aiDecision.reason 
        });

    } catch (error) {
        console.error("Gemini AI Error:", error);
        res.status(500).json({ error: "Failed to process transcript with AI." });
    }
});

// --- 4. ASSIGNMENT 3 APIs ---
app.post('/api/register-thesis', async (req, res) => {
    try {
        const newRegistration = await Registration.create(req.body);
        res.json({ message: "Thesis registration successfully submitted!", data: newRegistration });
    } catch (error) {
        res.status(500).json({ error: "Failed to submit registration." });
    }
});

app.get('/api/supervisor-workload/:supervisor_id', async (req, res) => {
    try {
        const supervisorId = req.params.supervisor_id;
        const MAX_GROUPS = 3; 
        const assignedGroups = await Registration.countDocuments({ supervisor_id: supervisorId });
        const isAvailable = assignedGroups < MAX_GROUPS;

        res.json({
            feature: "Supervisor Workload Management",
            supervisor_id: supervisorId,
            current_groups_assigned: assignedGroups,
            maximum_capacity: MAX_GROUPS,
            is_available_for_new_groups: isAvailable
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch supervisor workload." });
    }
});

// --- 5. START SERVER ---
const PORT = 5005;
app.listen(PORT, '127.0.0.1', () => {
    console.log(`🚀 Server running on http://127.0.0.1:${PORT}`);
});