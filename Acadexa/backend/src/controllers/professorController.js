const Professor = require('../models/Professor');
const SupervisorReview = require('../models/SupervisorReview');
const { rankProfessors } = require('../utils/recommendationEngine');

// Helper: inject avg rating into professor objects
const injectRatings = async (professors) => {
  const summaries = await SupervisorReview.aggregate([
    { $match: { type: 'professor' } },
    { $group: { _id: '$supervisorId', avgOverall: { $avg: '$overallRating' }, totalReviews: { $sum: 1 } } },
    { $project: { supervisorId: '$_id', avgOverall: { $round: ['$avgOverall', 1] }, totalReviews: 1 } },
  ]);

  const ratingMap = {};
  summaries.forEach(s => { ratingMap[s._id.toString()] = s; });

  return professors.map(prof => {
    const p = prof.toObject ? prof.toObject() : prof;
    const rating = ratingMap[p._id.toString()];
    return {
      ...p,
      avgRating:    rating?.avgOverall   || null,
      totalReviews: rating?.totalReviews || 0,
    };
  });
};

const getAllProfessors = async (req, res) => {
  try {
    const { country, researchArea, acceptsPhD } = req.query;
    let query = { isVerified: true };
    if (country)           query.country = country;
    if (researchArea)      query.researchAreas = researchArea;
    if (acceptsPhD === 'true') query.acceptsPhDStudents = true;

    const professors = await Professor.find(query);
    const withRatings = await injectRatings(professors);
    res.json({ success: true, data: withRatings, count: withRatings.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getProfessorById = async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);
    if (!professor) return res.status(404).json({ success: false, error: 'Professor not found' });
    const [withRating] = await injectRatings([professor]);
    res.json({ success: true, data: withRating });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const getRecommendedProfessors = async (req, res) => {
  try {
    const { researchInterests, preferredCountries, careerGoals } = req.body;
    if (!researchInterests || researchInterests.length === 0) {
      return res.status(400).json({ success: false, error: 'Research interests are required' });
    }
    const allProfessors = await Professor.find({ acceptsPhDStudents: true, isVerified: true });
    const studentProfile = { researchInterests, preferredCountries: preferredCountries || [], careerGoals: careerGoals || [] };
    const recommendations = rankProfessors(allProfessors, studentProfile, 15);
    const withRatings = await injectRatings(recommendations);
    res.json({ success: true, data: withRatings, count: withRatings.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const searchProfessors = async (req, res) => {
  try {
    const { keyword, country } = req.query;
    if (!keyword && !country) {
      return res.status(400).json({ success: false, error: 'Search keyword or country is required' });
    }
    let query = { acceptsPhDStudents: true, isVerified: true };
    if (country) query.country = country;
    if (keyword) {
      query.$or = [
        { firstName:       { $regex: keyword, $options: 'i' } },
        { lastName:        { $regex: keyword, $options: 'i' } },
        { university:      { $regex: keyword, $options: 'i' } },
        { email:           { $regex: keyword, $options: 'i' } },
        { researchAreas:   { $regex: keyword, $options: 'i' } },
        { researchKeywords:{ $regex: keyword, $options: 'i' } },
      ];
    }
    const professors = await Professor.find(query);
    const withRatings = await injectRatings(professors);
    res.json({ success: true, data: withRatings, count: withRatings.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getAllProfessors, getProfessorById, getRecommendedProfessors, searchProfessors };