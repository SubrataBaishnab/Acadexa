const ApplicationTracker = require('../models/ApplicationTracker');

// Bookmark / Track a new professor
exports.trackProfessor = async (req, res) => {
  try {
    const { studentId, professorId } = req.body;

    if (!studentId || !professorId) {
      return res.status(400).json({ error: 'Student ID and Professor ID are required.' });
    }

    // Check if already tracking
    const existing = await ApplicationTracker.findOne({ studentId, professorId });
    if (existing) {
      return res.status(400).json({ error: 'You are already tracking this professor.' });
    }

    const application = new ApplicationTracker({
      studentId,
      professorId,
      status: 'Bookmarked'
    });

    await application.save();

    // Populate professor details before returning
    const populatedApp = await ApplicationTracker.findById(application._id).populate('professorId');
    
    res.status(201).json({ message: 'Professor bookmarked successfully.', data: populatedApp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all applications/bookmarked professors for a student
exports.getStudentApplications = async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const applications = await ApplicationTracker.find({ studentId })
      .populate('professorId')
      .sort({ updatedAt: -1 });

    res.json({ data: applications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update status or notes for an application
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const application = await ApplicationTracker.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('professorId');

    if (!application) {
      return res.status(404).json({ error: 'Application record not found.' });
    }

    res.json({ message: 'Application updated successfully.', data: application });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove a tracked professor
exports.removeApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await ApplicationTracker.findByIdAndDelete(id);
    if (!application) {
      return res.status(404).json({ error: 'Application record not found.' });
    }

    res.json({ message: 'Professor removed from tracker.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
