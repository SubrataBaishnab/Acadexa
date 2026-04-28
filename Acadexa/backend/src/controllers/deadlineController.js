const Deadline = require('../models/Deadline');
const ProgressUpdate = require('../models/ProgressUpdate');
const { createMeetingEvent } = require('../utils/googleCalendar');

// ─────────────────────────────────────────────
// Pressure calculator
// ─────────────────────────────────────────────
const calculatePressure = (tasks, deadlineDate, progressPercent) => {
  const now = new Date();
  const deadline = new Date(deadlineDate);
  const daysLeft = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));

  const totalTasks      = tasks.length || 1;
  const completedTasks  = tasks.filter(t => t.completed).length;
  const remainingTasks  = totalTasks - completedTasks;

  const daysPressure     = daysLeft === 0 ? 100 : Math.min(100, (1 / daysLeft) * 400);
  const taskPressure     = (remainingTasks / totalTasks) * 100;
  const progressPressure = 100 - progressPercent;

  const pressureScore = Math.round(daysPressure * 0.4 + taskPressure * 0.35 + progressPressure * 0.25);
  const pressureLevel =
    pressureScore <= 25 ? 'Low' :
    pressureScore <= 50 ? 'Moderate' :
    pressureScore <= 75 ? 'High' : 'Critical';

  return { pressureScore, pressureLevel, daysLeft, remainingTasks };
};

// ─────────────────────────────────────────────
// POST /api/deadline/create
// ─────────────────────────────────────────────
const createDeadline = async (req, res) => {
  try {
    const {
      studentId, supervisorId, supervisorEmail, studentEmail,
      thesisTitle, deadlineDate, progressPercent, tasks,
    } = req.body;

    const { pressureScore, pressureLevel } = calculatePressure(
      tasks || [], deadlineDate, progressPercent
    );

    const deadline = new Deadline({
      studentId,
      supervisorId:    supervisorId    || 'supervisor_001',
      supervisorEmail: supervisorEmail || '',
      studentEmail:    studentEmail    || '',
      thesisTitle,
      deadlineDate,
      progressPercent,
      tasks: tasks || [],
      pressureScore,
      pressureLevel,
    });

    await deadline.save();
    res.status(201).json({ message: 'Deadline created successfully', deadline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/deadline/:studentId
// ─────────────────────────────────────────────
const getDeadlineByStudent = async (req, res) => {
  try {
    const deadlines = await Deadline.find({ studentId: req.params.studentId })
      .sort({ deadlineDate: 1 });
    res.status(200).json(deadlines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// PUT /api/deadline/update/:id
// ─────────────────────────────────────────────
const updateDeadline = async (req, res) => {
  try {
    const {
      progressPercent, tasks, deadlineDate,
      thesisTitle, supervisorEmail, studentEmail,
    } = req.body;

    const existing = await Deadline.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Deadline not found' });

    const updatedTasks    = tasks           ?? existing.tasks;
    const updatedProgress = progressPercent ?? existing.progressPercent;
    const updatedDeadline = deadlineDate    ?? existing.deadlineDate;

    const { pressureScore, pressureLevel } = calculatePressure(
      updatedTasks, updatedDeadline, updatedProgress
    );

    const updated = await Deadline.findByIdAndUpdate(
      req.params.id,
      {
        progressPercent: updatedProgress,
        tasks:           updatedTasks,
        deadlineDate:    updatedDeadline,
        pressureScore,
        pressureLevel,
        ...(thesisTitle     !== undefined && { thesisTitle }),
        ...(supervisorEmail !== undefined && { supervisorEmail }),
        ...(studentEmail    !== undefined && { studentEmail }),
      },
      { returnDocument: 'after' }
    );

    res.status(200).json({ message: 'Deadline updated', deadline: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/deadline/analytics/:studentId
// ─────────────────────────────────────────────
const getStudentAnalytics = async (req, res) => {
  try {
    const { studentId } = req.params;

    const deadlines       = await Deadline.find({ studentId }).sort({ deadlineDate: 1 });
    const deadline        = deadlines[0] || null;
    const progressUpdates = await ProgressUpdate.find({ studentId }).sort({ createdAt: -1 });
    const latestUpdate    = progressUpdates[0] || null;
    const revisionCount   = progressUpdates.length;

    // Supervisor response time — only for reviewed updates with comments
    const responseTimes = [];
    for (const update of progressUpdates) {
      if (update.status !== 'Pending Review' && update.comments?.length > 0) {
        const submittedAt  = new Date(update.createdAt);
        const firstComment = [...update.comments].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        )[0];
        const hours = (new Date(firstComment.createdAt) - submittedAt) / (1000 * 60 * 60);
        if (hours >= 0) responseTimes.push(hours);
      }
    }
    const avgResponseTimeHours = responseTimes.length > 0
      ? Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length * 10) / 10
      : null;

    // Meetings scheduled — count from Deadline meetingsScheduled field
    const meetingsScheduled = deadline?.meetingsScheduled || 0;

    const daysLeft = deadline
      ? Math.max(0, Math.ceil(
          (new Date(deadline.deadlineDate) - new Date()) / (1000 * 60 * 60 * 24)
        ))
      : null;

    res.json({
      deadline,
      latestProgress: latestUpdate,
      revisionCount,
      avgResponseTimeHours,
      meetingsScheduled,
      daysLeft,
      totalUpdates: progressUpdates.length,
      statusBreakdown: {
        onTrack:  progressUpdates.filter(u => u.status === 'On Track').length,
        delayed:  progressUpdates.filter(u => u.status === 'Delayed').length,
        critical: progressUpdates.filter(u => u.status === 'Critical').length,
        pending:  progressUpdates.filter(u => u.status === 'Pending Review').length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/deadline/analytics/admin
// ─────────────────────────────────────────────
const getAdminAnalytics = async (req, res) => {
  try {
    const totalDeadlines = await Deadline.countDocuments();

    const workloadAgg = await ProgressUpdate.aggregate([
      {
        $group: {
          _id: '$supervisorId',
          studentCount:   { $addToSet: '$studentId' },
          supervisorName: { $first: '$supervisorName' },
        },
      },
      {
        $project: {
          supervisorId:   '$_id',
          supervisorName: 1,
          studentCount:   { $size: '$studentCount' },
        },
      },
      { $sort: { studentCount: -1 } },
    ]);

    let popularDomains = [];
    try {
      const ThesisArchive = require('../models/ThesisArchive');
      const keywordAgg = await ThesisArchive.aggregate([
        { $unwind: '$keywords' },
        { $group: { _id: '$keywords', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]);
      popularDomains = keywordAgg.map(k => ({ keyword: k._id, count: k.count }));
    } catch { /* ThesisArchive might be empty */ }

    const statusAgg = await ProgressUpdate.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const statusBreakdown = {};
    statusAgg.forEach(s => { statusBreakdown[s._id] = s.count; });

    const pressureAgg = await Deadline.aggregate([
      { $group: { _id: '$pressureLevel', count: { $sum: 1 } } },
    ]);
    const pressureBreakdown = {};
    pressureAgg.forEach(p => { pressureBreakdown[p._id] = p.count; });

    const progressAgg = await Deadline.aggregate([
      { $group: { _id: null, avgProgress: { $avg: '$progressPercent' } } },
    ]);
    const avgProgress = progressAgg[0] ? Math.round(progressAgg[0].avgProgress) : 0;

    // Total meetings scheduled
    const meetingsAgg = await Deadline.aggregate([
      { $group: { _id: null, total: { $sum: '$meetingsScheduled' } } },
    ]);
    const totalMeetings = meetingsAgg[0]?.total || 0;

    res.json({
      totalDeadlines,
      avgProgress,
      totalMeetings,
      supervisorWorkload: workloadAgg,
      popularDomains,
      statusBreakdown,
      pressureBreakdown,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/deadline/schedule-meeting
// ─────────────────────────────────────────────
const scheduleMeeting = async (req, res) => {
  try {
    const {
      studentId, supervisorId, supervisorEmail, studentEmail,
      thesisTitle, meetingDate, meetingLink, deadlineId,
    } = req.body;

    if (!meetingDate) return res.status(400).json({ error: 'meetingDate is required.' });

    // Create Google Calendar event
    let calEvent = null;
    if (process.env.GOOGLE_SERVICE_ACCOUNT_JSON) {
      try {
        calEvent = await createMeetingEvent({
          thesisTitle, studentEmail, supervisorEmail, meetingDate, meetingLink,
        });
      } catch (calErr) {
        console.error('Calendar event failed:', calErr.message);
      }
    }

    // Increment meetingsScheduled counter on the deadline
    if (deadlineId) {
      try {
        await Deadline.findByIdAndUpdate(deadlineId, { $inc: { meetingsScheduled: 1 } });
      } catch (e) {
        console.error('Meeting count update failed:', e.message);
      }
    } else {
      // fallback: find by studentId
      try {
        await Deadline.findOneAndUpdate(
          { studentId },
          { $inc: { meetingsScheduled: 1 } }
        );
      } catch (e) {
        console.error('Meeting count fallback failed:', e.message);
      }
    }

    res.json({
      message: 'Meeting scheduled successfully.',
      calendarEventLink: calEvent?.htmlLink || null,
    });
  } catch (err) {
    console.error('scheduleMeeting error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createDeadline,
  getDeadlineByStudent,
  updateDeadline,
  getStudentAnalytics,
  getAdminAnalytics,
  scheduleMeeting,
};