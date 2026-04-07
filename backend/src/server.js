const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const supervisorRoutes = require('./routes/supervisorRoutes');
const professorRoutes = require('./routes/professorRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connectio

mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.log('❌ MongoDB connection error:', err));

// =========================================================================
// --- NAFIZ'S MODULE 1: AI ELIGIBILITY VERIFIER ---
// =========================================================================

// 1. Setup Multer for file uploads
const upload = multer({ dest: 'uploads/' });

// 2. Thesis Registration Schema
const thesisRegistrationSchema = new mongoose.Schema({
    student_id: String,
    group_members: [String],
    thesis_title: String,
    supervisor_id: String,
    status: { type: String, default: "Pending Supervisor Approval" },
    registration_date: { type: Date, default: Date.now }
});
const Registration = mongoose.model('Registration', thesisRegistrationSchema);

// Helper to convert local image to Gemini format
function fileToGenerativePart(path, mimeType) {
    return {
        inlineData: {
            data: Buffer.from(fs.readFileSync(path)).toString("base64"),
            mimeType
        },
    };
}

// 3. The Verifier Route
app.post('/api/verify-eligibility', upload.single('transcript'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: "No transcript uploaded." });
        
        const studentId = req.body.student_id || "Unknown";
        console.log(`Starting Gemini AI scan for Student ${studentId}...`);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        const result = await model.generateContent([prompt, imagePart]);
        let aiResponseText = result.response.text().trim();
        
        // Aggressive JSON cleanup to prevent crashes
        aiResponseText = aiResponseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const aiDecision = JSON.parse(aiResponseText);
        
        const finalStatus = aiDecision.eligible ? "Eligible - Pending Supervisor" : "Denied - Missing Prerequisites";

        const newRecord = await Registration.create({
            student_id: studentId,
            thesis_title: "Pending Title",
            status: finalStatus
        });

        console.log("✅ Gemini Decision saved:", newRecord);
        res.json({ 
            status: aiDecision.eligible ? "Approved" : "Denied", 
            message: aiDecision.reason,
            credits: aiDecision.total_credits,
            suggestions: aiDecision.suggested_courses
        });

    } catch (error) {
        console.error("Backend Error Details:", error.message || error);
        res.status(500).json({ error: "Failed to process transcript: " + (error.message || "Unknown error") });
    } finally {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
            console.log(`🗑️ Cleaned up temporary file: ${req.file.filename}`);
        }
    }
});
// =========================================================================

// Teammate's Routes
app.use('/api/supervisors', supervisorRoutes);
app.use('/api/professors', professorRoutes);
app.use('/api/chatbot', chatbotRoutes);

// Health Check Route
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});