const { GoogleGenerativeAI } = require('@google/generative-ai');
const Student = require('../models/Student');
const Synopsis = require('../models/Synopsis');
const Registration = require('../models/Registration');
const ThesisArchive = require('../models/ThesisArchive');
const Supervisor = require('../models/Supervisor');

// AI Wrapper for Portfolio Summary
async function generateAISummary(portfolioData) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Act as a professional academic career coach. Based on this student's research data, generate a compelling 3-4 sentence "Research Profile Summary" for their PhD application.
            Highlight their technical skills, research domain, and the significance of their work.
            
            DATA:
            Title: ${portfolioData.title}
            Domain: ${portfolioData.domain}
            Abstract: ${portfolioData.abstract}
            Tools Used: ${portfolioData.toolsUsed}
            Key Outcomes: ${portfolioData.expectedOutcomes}
            
            Return strictly the summary text.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (error) {
        console.error('AI Summary Error:', error);
        return "A dedicated researcher focused on advancing knowledge in their field through rigorous methodology and technical expertise.";
    }
}

exports.getPortfolio = async (req, res) => {
    try {
        const { studentId } = req.params;

        // 1. Fetch Student Info
        const student = await Student.findOne({ studentId });
        if (!student) return res.status(404).json({ error: 'Student not found' });

        // 2. Fetch Latest Full Synopsis (Approved)
        const synopsis = await Synopsis.findOne({ studentId, stage: 'Full', status: 'Approved' }).populate('supervisorId');

        // 3. Fetch Registration Info
        const registration = await Registration.findOne({ student_id: studentId, status: 'Officially Registered' });

        // 4. Fetch Archived Thesis (if exists)
        const archive = await ThesisArchive.findOne({ studentName: student.name });

        if (!synopsis && !archive) {
            return res.status(404).json({ error: 'No completed or approved research found for this student.' });
        }

        // Aggregate Data
        const portfolioData = {
            name: student.name,
            studentId: student.studentId,
            email: student.email,
            title: archive ? archive.thesisTitle : (synopsis ? synopsis.fullSynopsis.title : 'Research Project'),
            abstract: archive ? archive.abstract : (synopsis ? synopsis.fullSynopsis.abstract : ''),
            domain: archive ? archive.department : 'Computer Science & Engineering',
            toolsUsed: synopsis ? synopsis.fullSynopsis.toolsUsed : 'Standard Research Tools',
            methodology: synopsis ? synopsis.fullSynopsis.methodology : '',
            expectedOutcomes: synopsis ? synopsis.fullSynopsis.expectedOutcomes : '',
            supervisor: archive ? archive.supervisorName : (synopsis ? `${synopsis.supervisorId.firstName} ${synopsis.supervisorId.lastName}` : 'N/A'),
            pdfUrl: archive ? archive.pdfUrl : null,
            year: archive ? archive.yearDefended : new Date().getFullYear(),
        };

        // 5. Generate AI Summary if requested or missing
        const aiSummary = await generateAISummary(portfolioData);
        portfolioData.aiSummary = aiSummary;

        res.json(portfolioData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
