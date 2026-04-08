const Supervisor = require('../models/Supervisor');
const { rankSupervisors } = require('../utils/recommendationEngine');

/**
 * Get all supervisors with optional filtering
 */
const getAllSupervisors = async (req, res) => {
  try {
    const { researchArea, department, sortBy } = req.query;
    
    let query = { isActive: true };
    
    if (researchArea) {
      query.researchAreas = researchArea;
    }
    
    if (department) {
      query.department = department;
    }

    let supervisors = await Supervisor.find(query);

    if (sortBy === 'slots') {
      supervisors.sort((a, b) => b.availableSlots - a.availableSlots);
    }

    res.json({
      success: true,
      data: supervisors,
      count: supervisors.length,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Get supervisor by ID
 */
const getSupervisorById = async (req, res) => {
  try {
    const supervisor = await Supervisor.findById(req.params.id);
    
    if (!supervisor) {
      return res.status(404).json({ 
        success: false, 
        error: 'Supervisor not found' 
      });
    }

    res.json({
      success: true,
      data: supervisor,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Get recommended supervisors based on student profile
 */
const getRecommendedSupervisors = async (req, res) => {
  try {
    const { researchInterests, skills } = req.body;

    if (!researchInterests || researchInterests.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Research interests are required' 
      });
    }

    const allSupervisors = await Supervisor.find({ isActive: true });

    const studentProfile = {
      researchInterests,
      skills: skills || [],
    };

    const recommendations = rankSupervisors(allSupervisors, studentProfile, 10);

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Search supervisors by keyword
 */
const searchSupervisors = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search keyword is required' 
      });
    }

    const supervisors = await Supervisor.find({
      $or: [
        { firstName: { $regex: keyword, $options: 'i' } },
        { lastName: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { researchAreas: { $regex: keyword, $options: 'i' } },
        { department: { $regex: keyword, $options: 'i' } },
      ],
      isActive: true,
    });

    res.json({
      success: true,
      data: supervisors,
      count: supervisors.length,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = {
  getAllSupervisors,
  getSupervisorById,
  getRecommendedSupervisors,
  searchSupervisors,
};
