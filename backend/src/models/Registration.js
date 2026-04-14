const mongoose = require('mongoose');

const thesisRegistrationSchema = new mongoose.Schema({
    student_id: { type: String, required: true },
    synopsis_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Synopsis' },
    group_members: [String],
    thesis_title: String,
    supervisor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Supervisor' },
    status: { 
        type: String, 
        enum: ["Eligibility Pending", "Pending Admin Approval", "Officially Registered", "Rejected"],
        default: "Eligibility Pending" 
    },
    gap_analysis: {
        missing_methodologies: [String],
        improvements: [String],
        readiness_score: String
    },
    registration_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Registration', thesisRegistrationSchema);