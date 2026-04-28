const ProgressUpdate = require('../models/ProgressUpdate');

// Helper: validate task array
const isValidTaskArray = (arr) =>
  Array.isArray(arr) && arr.every(t => typeof t.title === 'string' && t.title.trim() !== '');

// ─────────────────────────────────────────────
// POST /api/progress
// Student submits a monthly update
// ─────────────────────────────────────────────
const submitProgressUpdate = async (req, res) => {
  try {
    const {
      studentId, studentName, supervisorId, thesisTitle,
      month, completedTasks, challengesFaced, upcomingGoals,
    } = req.body;

    // Required field guards
    if (!studentId || !studentName || !supervisorId || !thesisTitle || !month || !challengesFaced) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (!isValidTaskArray(completedTasks)) {
      return res.status(400).json({ error: 'completedTasks must be an array of { title } objects.' });
    }
    if (!isValidTaskArray(upcomingGoals)) {
      return res.status(400).json({ error: 'upcomingGoals must be an array of { title } objects.' });
    }
    if (completedTasks.length === 0 && upcomingGoals.length === 0) {
      return res.status(400).json({ error: 'Please add at least one completed task or upcoming goal.' });
    }

    // Prevent duplicate submission for same student + month
    const existing = await ProgressUpdate.findOne({ studentId, month });
    if (existing) {
      return res.status(400).json({ error: `Progress update for ${month} already submitted.` });
    }

    // All completedTasks are marked done: true by default
    const normalizedCompleted = completedTasks.map(t => ({ title: t.title.trim(), done: true }));
    const normalizedGoals = upcomingGoals.map(t => ({ title: t.title.trim(), done: false }));

    const update = new ProgressUpdate({
      studentId, studentName, supervisorId, thesisTitle,
      month, challengesFaced,
      completedTasks: normalizedCompleted,
      upcomingGoals: normalizedGoals,
    });

    await update.save(); // pre-save hook calculates percentageComplete
    res.status(201).json({ message: 'Progress update submitted successfully.', update });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/progress/:id
// Student edits a pending submission
// ─────────────────────────────────────────────
const editProgressUpdate = async (req, res) => {
  try {
    const update = await ProgressUpdate.findById(req.params.id);
    if (!update) return res.status(404).json({ error: 'Progress update not found.' });
    if (update.status !== 'Pending Review') {
      return res.status(403).json({ error: 'Cannot edit a reviewed update.' });
    }

    const { completedTasks, upcomingGoals, challengesFaced } = req.body;

    if (completedTasks !== undefined) {
      if (!isValidTaskArray(completedTasks)) {
        return res.status(400).json({ error: 'completedTasks must be an array of { title } objects.' });
      }
      update.completedTasks = completedTasks.map(t => ({ title: t.title.trim(), done: true }));
    }
    if (upcomingGoals !== undefined) {
      if (!isValidTaskArray(upcomingGoals)) {
        return res.status(400).json({ error: 'upcomingGoals must be an array of { title } objects.' });
      }
      update.upcomingGoals = upcomingGoals.map(t => ({ title: t.title.trim(), done: false }));
    }
    if (challengesFaced !== undefined) {
      update.challengesFaced = challengesFaced;
    }

    await update.save(); // recalculates percentageComplete
    res.json({ message: 'Progress update edited.', update });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/progress/student/:studentId
// ─────────────────────────────────────────────
const getStudentProgress = async (req, res) => {
  try {
    const updates = await ProgressUpdate
      .find({ studentId: req.params.studentId })
      .sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// GET /api/progress/supervisor/:supervisorId
// ─────────────────────────────────────────────
const getSupervisorProgress = async (req, res) => {
  try {
    const updates = await ProgressUpdate
      .find({ supervisorId: req.params.supervisorId })
      .sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// PATCH /api/progress/:id/status
// Supervisor updates the status
// ─────────────────────────────────────────────
const updateProgressStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Pending Review', 'On Track', 'Delayed', 'Critical'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }

    const update = await ProgressUpdate.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );
    if (!update) return res.status(404).json({ error: 'Progress update not found.' });
    res.json({ message: 'Status updated.', update });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// POST /api/progress/:id/comment
// Supervisor adds a comment
// ─────────────────────────────────────────────
const addProgressComment = async (req, res) => {
  try {
    const { supervisorId, supervisorName, text } = req.body;
    if (!supervisorId || !supervisorName || !text?.trim()) {
      return res.status(400).json({ error: 'supervisorId, supervisorName, and text are required.' });
    }

    const update = await ProgressUpdate.findById(req.params.id);
    if (!update) return res.status(404).json({ error: 'Progress update not found.' });

    update.comments.push({ supervisorId, supervisorName, text: text.trim() });
    update.updatedAt = Date.now();
    await update.save();

    res.json({ message: 'Comment added.', update });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────────
// DELETE /api/progress/:id
// Student deletes their own update (only if Pending Review)
// ─────────────────────────────────────────────
const deleteProgressUpdate = async (req, res) => {
  try {
    const update = await ProgressUpdate.findById(req.params.id);
    if (!update) return res.status(404).json({ error: 'Progress update not found.' });
    if (update.status !== 'Pending Review') {
      return res.status(403).json({ error: 'Cannot delete a reviewed update.' });
    }
    await update.deleteOne();
    res.json({ message: 'Progress update deleted.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  submitProgressUpdate,
  editProgressUpdate,
  getStudentProgress,
  getSupervisorProgress,
  updateProgressStatus,
  addProgressComment,
  deleteProgressUpdate,
};