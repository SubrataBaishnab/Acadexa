const ProgressUpdate = require('../models/ProgressUpdate');

// POST /api/progress — Student submits a monthly update
const submitProgressUpdate = async (req, res) => {
  try {
    const {
      studentId, studentName, supervisorId, thesisTitle,
      month, completedTasks, challengesFaced, upcomingGoals, percentageComplete,
    } = req.body;

    // Prevent duplicate submission for same month
    const existing = await ProgressUpdate.findOne({ studentId, month });
    if (existing) {
      return res.status(400).json({ error: `Progress update for ${month} already submitted.` });
    }

    const update = new ProgressUpdate({
      studentId, studentName, supervisorId, thesisTitle,
      month, completedTasks, challengesFaced, upcomingGoals, percentageComplete,
    });

    await update.save();
    res.status(201).json({ message: 'Progress update submitted successfully.', update });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/progress/student/:studentId — Get all updates for a student
const getStudentProgress = async (req, res) => {
  try {
    const updates = await ProgressUpdate.find({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/progress/supervisor/:supervisorId — Get all updates assigned to a supervisor
const getSupervisorProgress = async (req, res) => {
  try {
    const updates = await ProgressUpdate.find({ supervisorId: req.params.supervisorId }).sort({ createdAt: -1 });
    res.json(updates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PATCH /api/progress/:id/status — Supervisor updates the status
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

// POST /api/progress/:id/comment — Supervisor adds a comment
const addProgressComment = async (req, res) => {
  try {
    const { supervisorId, supervisorName, text } = req.body;
    const update = await ProgressUpdate.findById(req.params.id);
    if (!update) return res.status(404).json({ error: 'Progress update not found.' });

    update.comments.push({ supervisorId, supervisorName, text });
    update.updatedAt = Date.now();
    await update.save();

    res.json({ message: 'Comment added.', update });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/progress/:id — Student deletes their own update (only if Pending Review)
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
  getStudentProgress, 
  getSupervisorProgress, 
  updateProgressStatus, 
  addProgressComment, 
  deleteProgressUpdate 
};
