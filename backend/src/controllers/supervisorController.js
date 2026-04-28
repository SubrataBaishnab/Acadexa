const Supervisor = require('../models/Supervisor');
const SupervisorReview = require('../models/SupervisorReview');
const { rankSupervisors } = require('../utils/recommendationEngine');

// Helper: inject avg rating into supervisor objects
const injectRatings = async (supervisors) => {
  const summaries = await SupervisorReview.aggregate([
    { $group: { _id: '$supervisorId', avgOverall: { $avg: '$overallRating' }, totalReviews: { $sum: 1 } } },
    { $project: { supervisorId: '$_id', avgOverall: { $round: ['$avgOverall', 1] }, totalReviews: 1 } },
  ]);

  const ratingMap = {};
  summaries.forEach(s => { ratingMap[s._id.toString()] = s; });

  return supervisors.map(sup => {
    const s = sup.toObject ? sup.toObject() : sup;
    const rating = ratingMap[s._id.toString()];
    return {
      ...s,
      avgRating:    rating?.avgOverall   || null,
      totalReviews: rating?.totalReviews || 0,
    };
  });
};

const getAllSupervisors = async (req, res) => {
  try {
    const { researchArea, department, sortBy } = req.query;
    let query = { isActive: true };
    if (researchArea) query.researchAreas = researchArea;
    if (department)   query.department    = department;

    let supervisors = await Supervisor.find(query);
    if (sortBy === 'slots') supervisors.sort((a, b) => b.availableSlots - a.availableSlots);

    const withRatings = await injectRatings(supervisors);

    res.json({ success: true, data: withRatings, count: withRatings.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getSupervisorById = async (req, res) => {
  try {
    const supervisor = await Supervisor.findById(req.params.id);
    if (!supervisor) return res.status(404).json({ success: false, error: 'Supervisor not found' });

    const [withRating] = await injectRatings([supervisor]);
    res.json({ success: true, data: withRating });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRecommendedSupervisors = async (req, res) => {
  try {
    const { researchInterests, skills } = req.body;
    if (!researchInterests || researchInterests.length === 0) {
      return res.status(400).json({ success: false, error: 'Research interests are required' });
    }
    const allSupervisors = await Supervisor.find({ isActive: true });
    const studentProfile = { researchInterests, skills: skills || [] };
    const recommendations = rankSupervisors(allSupervisors, studentProfile, 10);
    const withRatings = await injectRatings(recommendations);
    res.json({ success: true, data: withRatings, count: withRatings.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const searchSupervisors = async (req, res) => {
  try {
    const { keyword } = req.query;
    if (!keyword) return res.status(400).json({ success: false, error: 'Search keyword is required' });

    const supervisors = await Supervisor.find({
      $or: [
        { firstName:    { $regex: keyword, $options: 'i' } },
        { lastName:     { $regex: keyword, $options: 'i' } },
        { email:        { $regex: keyword, $options: 'i' } },
        { researchAreas:{ $regex: keyword, $options: 'i' } },
        { department:   { $regex: keyword, $options: 'i' } },
      ],
      isActive: true,
    });

    const withRatings = await injectRatings(supervisors);
    res.json({ success: true, data: withRatings, count: withRatings.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAllSupervisors, getSupervisorById, getRecommendedSupervisors, searchSupervisors };