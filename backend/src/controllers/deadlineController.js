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

const createDeadline = async (req, res) => {
  try {
    const { studentId, thesisTitle, deadlineDate, progressPercent, tasks } = req.body;
    const { pressureScore, pressureLevel } = calculatePressure(tasks || [], deadlineDate, progressPercent);
    const deadline = new Deadline({ studentId, thesisTitle, deadlineDate, progressPercent, tasks: tasks || [], pressureScore, pressureLevel });
    await deadline.save();
    res.status(201).json({ message: 'Deadline created successfully', deadline });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDeadlineByStudent = async (req, res) => {
  try {
    const deadlines = await Deadline.find({ studentId: req.params.studentId }).sort({ deadlineDate: 1 });
    res.status(200).json(deadlines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDeadline = async (req, res) => {
  try {
    const { progressPercent, tasks, deadlineDate, thesisTitle } = req.body;
    const existing = await Deadline.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Deadline not found' });

    const updatedTasks = tasks ?? existing.tasks;
    const updatedProgress = progressPercent ?? existing.progressPercent;
    const updatedDeadline = deadlineDate ?? existing.deadlineDate;

    const { pressureScore, pressureLevel } = calculatePressure(updatedTasks, updatedDeadline, updatedProgress);

    const updated = await Deadline.findByIdAndUpdate(
      req.params.id,
      { thesisTitle: thesisTitle ?? existing.thesisTitle, progressPercent: updatedProgress, tasks: updatedTasks, deadlineDate: updatedDeadline, pressureScore, pressureLevel },
      { new: true }
    );
    res.status(200).json({ message: 'Deadline updated', deadline: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const analyzeBurnout = async (req, res) => {
  const { thesisTitle, deadlineDate, progressPercent, pressureScore, pressureLevel, daysLeft, remainingTasks, totalTasks, extraContext } = req.body;

  if (!thesisTitle || !deadlineDate) {
    return res.status(400).json({ message: 'Thesis title and deadline date are required.' });
  }

  const completedTasks = totalTasks - remainingTasks;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const prompt = `You are an academic wellbeing advisor specializing in student burnout detection. Analyze the following thesis student data and detect signs of burnout risk.

Student Data:
- Thesis Title: "${thesisTitle}"
- Deadline: ${new Date(deadlineDate).toDateString()} (${daysLeft} days remaining)
- Overall Progress: ${progressPercent}%
- Deadline Pressure Score: ${pressureScore}/100 (Level: ${pressureLevel})
- Tasks: ${completedTasks} completed out of ${totalTasks} total (${taskCompletionRate}% completion rate)
- Remaining Tasks: ${remainingTasks}
- Extra context from student: "${extraContext || 'None provided'}"

Analyze for burnout indicators such as:
1. High workload vs time remaining imbalance
2. Low progress despite approaching deadline
3. Too many remaining tasks relative to days left
4. High pressure score patterns
5. Any patterns mentioned in the extra context

Return ONLY a valid JSON object with no markdown, no backticks, no explanation. Use exactly this structure:
{
  "burnout_score": <integer 0-100>,
  "risk_level": "<one of: Low Risk | Moderate Risk | High Risk | Critical Risk>",
  "headline": "<8-12 word summary of the student burnout situation>",
  "summary": "<2-3 sentences explaining the burnout risk assessment based on their data>",
  "warning_signs": ["<specific warning sign>", "<another warning sign>"],
  "suggestions": [
    { "category": "<Time Management | Self Care | Task Strategy | Mental Health | Academic>", "tip": "<1-2 sentence actionable suggestion>" },
    { "category": "...", "tip": "..." },
    { "category": "...", "tip": "..." },
    { "category": "...", "tip": "..." }
  ],
  "encouraging_note": "<1 warm encouraging sentence>"
}`;

  try {
    const analyzeTextWithFallback = req.app.locals.analyzeTextWithFallback;
    const rawText = await analyzeTextWithFallback(prompt);
    const result = JSON.parse(rawText.replace(/```json|```/g, '').trim());

    return res.status(200).json({ message: 'Burnout analysis complete.', data: result });
  } catch (error) {
    console.error('Burnout analysis error:', error.message);
    if (error instanceof SyntaxError) {
      return res.status(500).json({ message: 'Failed to parse AI response. Please try again.' });
    }
    return res.status(500).json({ message: 'Analysis failed. Please try again later.' });
  }
};

module.exports = { createDeadline, getDeadlineByStudent, updateDeadline, analyzeBurnout };