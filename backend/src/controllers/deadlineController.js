const Deadline = require('../models/Deadline');

const calculatePressure = (tasks, deadlineDate, progressPercent) => {
  const now = new Date();
  const deadline = new Date(deadlineDate);
  const daysLeft = Math.max(0, Math.ceil((deadline - now) / (1000 * 60 * 60 * 24)));

  const totalTasks = tasks.length || 1;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const remainingTasks = totalTasks - completedTasks;

  const daysPressure = daysLeft === 0 ? 100 : Math.min(100, (1 / daysLeft) * 400);
  const taskPressure = (remainingTasks / totalTasks) * 100;
  const progressPressure = 100 - progressPercent;

  const pressureScore = Math.round(
    daysPressure * 0.4 + taskPressure * 0.35 + progressPressure * 0.25
  );

  let pressureLevel;
  if (pressureScore <= 25) pressureLevel = 'Low';
  else if (pressureScore <= 50) pressureLevel = 'Moderate';
  else if (pressureScore <= 75) pressureLevel = 'High';
  else pressureLevel = 'Critical';

  return { pressureScore, pressureLevel, daysLeft, remainingTasks };
};

// POST /api/deadline/create
const createDeadline = async (req, res) => {
  try {
    const { studentId, thesisTitle, deadlineDate, progressPercent, tasks } = req.body;

    const { pressureScore, pressureLevel } = calculatePressure(
      tasks || [],
      deadlineDate,
      progressPercent
    );

    const deadline = new Deadline({
      studentId,
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

// GET /api/deadline/:studentId
const getDeadlineByStudent = async (req, res) => {
  try {
    const deadlines = await Deadline.find({ studentId: req.params.studentId }).sort({ deadlineDate: 1 });
    res.status(200).json(deadlines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/deadline/update/:id
const updateDeadline = async (req, res) => {
  try {
    const { progressPercent, tasks, deadlineDate } = req.body;

    const existing = await Deadline.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Deadline not found' });

    const updatedTasks = tasks ?? existing.tasks;
    const updatedProgress = progressPercent ?? existing.progressPercent;
    const updatedDeadline = deadlineDate ?? existing.deadlineDate;

    const { pressureScore, pressureLevel } = calculatePressure(
      updatedTasks,
      updatedDeadline,
      updatedProgress
    );

    const updated = await Deadline.findByIdAndUpdate(
      req.params.id,
      { progressPercent: updatedProgress, tasks: updatedTasks, deadlineDate: updatedDeadline, pressureScore, pressureLevel },
      { new: true }
    );

    res.status(200).json({ message: 'Deadline updated', deadline: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { createDeadline, getDeadlineByStudent, updateDeadline };