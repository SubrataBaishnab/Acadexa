const mongoose = require('mongoose');
const Synopsis = require('../models/Synopsis');
const Student = require('../models/Student');
const Supervisor = require('../models/Supervisor');
const notificationController = require('./notificationController');
const { sendEmail } = require('../utils/mailService');

// --- USER & SEED ENDPOINTS ---

exports.seedStudents = async (req, res) => {
  try {
    const studentsData = [
      { studentId: '23101397', name: 'Nafiz Imtius' },
      { studentId: '23201066', name: 'Tasnuva Karim Samiha' },
      { studentId: '23201002', name: 'Tasnoor Jahan Dipi' },
      { studentId: '22101642', name: 'Subrata Baishnab' },
      { studentId: '22101640', name: 'Subrata Barbar', email: 'sbaishnab137@gmail.com' }
    ];

    // Clear existing and insert to avoid duplicates if run multiple times
    await Student.deleteMany({});
    const inserted = await Student.insertMany(studentsData);
    
    res.json({ message: 'Students seeded successful', data: inserted });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getLoginUsers = async (req, res) => {
  try {
    const students = await Student.find({});
    // Fetch some supervisors. In real db, they have specific names. 
    // We'll return first 11 to fulfill "1 to 11" requirement.
    const supervisors = await Supervisor.find({}).limit(11);
    
    const mappedSupervisors = supervisors.map((s, index) => ({
      serial: index + 1,
      _id: s._id,
      name: `${s.firstName} ${s.lastName}`
    }));

    res.json({
      students,
      supervisors: mappedSupervisors
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- SYNOPSIS ENDPOINTS ---

exports.submitIdea = async (req, res) => {
  try {
    const { studentId, supervisorId, shortSummary } = req.body;
    
    // Check if student already has a pending or approved submission
    const existing = await Synopsis.findOne({ studentId, stage: 'Idea', status: { $in: ['Pending', 'Approved', 'Revision Required'] } });
    
    if (existing && existing.status !== 'Rejected') {
      // If there's an existing one we might just update it if revision required
      if (existing.status === 'Revision Required') {
        existing.shortSummary = shortSummary;
        existing.status = 'Pending';
        existing.updatedAt = Date.now();
        await existing.save();
        return res.json({ message: 'Idea revised and resubmitted successfully', data: existing });
      }
      return res.status(400).json({ error: 'You already have an active idea submission.' });
    }

    const synopsis = new Synopsis({
      studentId,
      supervisorId,
      shortSummary,
      stage: 'Idea'
    });
    await synopsis.save();
    
    // Notify Supervisor
    const student = await Student.findOne({ studentId });
    await notificationController.createInternalNotification({
      recipientId: supervisorId,
      senderId: studentId,
      type: 'Synopsis',
      message: `New research idea submitted by ${student ? student.name : studentId}`,
      link: '/supervisor-dashboard'
    });

    res.status(201).json({ message: 'Idea submitted successfully', data: synopsis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.submitFullSynopsis = async (req, res) => {
  try {
    const { id } = req.params; // Synopsis ID
    const { title, abstract, methodology, expectedOutcomes, toolsUsed } = req.body;
    
    const synopsis = await Synopsis.findById(id);
    if (!synopsis) return res.status(404).json({ error: 'Synopsis not found' });
    if (synopsis.stage !== 'Idea' || synopsis.status !== 'Approved') {
      return res.status(400).json({ error: 'Cannot submit full synopsis at this stage.' });
    }

    // Upgrade to Full stage
    synopsis.stage = 'Full';
    synopsis.status = 'Pending';
    synopsis.fullSynopsis = { title, abstract, methodology, expectedOutcomes, toolsUsed };
    synopsis.updatedAt = Date.now();
    await synopsis.save();

    // Notify Supervisor
    const student = await Student.findOne({ studentId: synopsis.studentId });
    await notificationController.createInternalNotification({
      recipientId: synopsis.supervisorId,
      senderId: synopsis.studentId,
      type: 'Synopsis',
      message: `Full synopsis submitted by ${student ? student.name : synopsis.studentId}`,
      link: '/supervisor-dashboard'
    });

    res.json({ message: 'Full synopsis submitted successfully', data: synopsis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;
    
    if (!['Approved', 'Rejected', 'Revision Required'].includes(status)) {
         return res.status(400).json({ error: 'Invalid status' });
    }

    const synopsis = await Synopsis.findByIdAndUpdate(
      id,
      { status, feedback, updatedAt: Date.now() },
      { new: true }
    );
    
    if (!synopsis) return res.status(404).json({ error: 'Synopsis not found' });
    
    // Notify Student
    const supervisor = await Supervisor.findById(synopsis.supervisorId);
    const supervisorName = supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : 'Supervisor';
    
    await notificationController.createInternalNotification({
      recipientId: synopsis.studentId,
      senderId: synopsis.supervisorId,
      type: 'Synopsis',
      message: `Your synopsis has been ${status} by ${supervisorName}. Feedback: ${feedback || 'None'}`,
      link: '/student-dashboard'
    });

    // Send Email
    const student = await Student.findOne({ studentId: synopsis.studentId });
    if (student && student.email) {
      await sendEmail(
        student.email,
        `Synopsis ${status} - Acadexa`,
        `Hi ${student.name},\n\nYour thesis synopsis has been ${status} by your supervisor ${supervisorName}.\n\nFeedback: ${feedback || 'None'}\n\nCheck your dashboard for details.`,
        `<p>Hi ${student.name},</p><p>Your thesis synopsis has been <strong>${status}</strong> by your supervisor <strong>${supervisorName}</strong>.</p><p><strong>Feedback:</strong> ${feedback || 'None'}</p><p><a href="${process.env.FRONTEND_URL}/student-dashboard">Click here to view your dashboard</a></p>`
      );
    }

    res.json({ message: `Synopsis updated to ${status}`, data: synopsis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentDashboard = async (req, res) => {
  try {
    const { studentId } = req.params;
    // Get the latest synopsis to show on dashboard
    const synopsis = await Synopsis.findOne({ studentId }).sort({ createdAt: -1 }).populate('supervisorId', 'firstName lastName');
    
    res.json({ data: synopsis || null });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSupervisorDashboard = async (req, res) => {
  try {
    const { supervisorId } = req.params;

    // Validate it's a real ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(supervisorId)) {
      return res.status(400).json({ error: 'Invalid supervisor ID format' });
    }

    const synopses = await Synopsis.find({ supervisorId: new mongoose.Types.ObjectId(supervisorId) }).sort({ createdAt: -1 }).lean();
    
    // Manually attach student names since studentId is a plain string, not an ObjectId ref
    const populated = await Promise.all(synopses.map(async (syn) => {
      const student = await Student.findOne({ studentId: syn.studentId });
      return {
        ...syn,
        studentName: student ? student.name : 'Unknown Student'
      };
    }));

    res.json({ data: populated });
  } catch (error) {
    console.error('Supervisor dashboard error:', error);
    res.status(500).json({ error: error.message });
  }
};
