const Professor = require('../models/Professor');
const { rankProfessors } = require('../utils/recommendationEngine');

/**
 * Get all professors with optional filtering
 */
const getAllProfessors = async (req, res) => {
  try {
    const { country, researchArea, acceptsPhD } = req.query;
    
    let query = { isVerified: true };
    
    if (country) {
      query.country = country;
    }
    
    if (researchArea) {
      query.researchAreas = researchArea;
    }

    if (acceptsPhD === 'true') {
      query.acceptsPhDStudents = true;
    }

    const professors = await Professor.find(query);

    res.json({
      success: true,
      data: professors,
      count: professors.length,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Get professor by ID
 */
const getProfessorById = async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);
    
    if (!professor) {
      return res.status(404).json({ 
        success: false, 
        error: 'Professor not found' 
      });
    }

    res.json({
      success: true,
      data: professor,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

/**
 * Get recommended professors based on student profile
 */
const getRecommendedProfessors = async (req, res) => {
  try {
    const { 
      researchInterests, 
      preferredCountries, 
      careerGoals 
    } = req.body;

    if (!researchInterests || researchInterests.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Research interests are required' 
      });
    }

    const allProfessors = await Professor.find({ 
      acceptsPhDStudents: true,
      isVerified: true,
    });

    const studentProfile = {
      researchInterests,
      preferredCountries: preferredCountries || [],
      careerGoals: careerGoals || [],
    };

    const recommendations = rankProfessors(allProfessors, studentProfile, 15);

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
 * Search professors by university, country, or research area
 */
const searchProfessors = async (req, res) => {
  try {
    const { keyword, country } = req.query;

    if (!keyword && !country) {
      return res.status(400).json({ 
        success: false, 
        error: 'Search keyword or country is required' 
      });
    }

    let query = { acceptsPhDStudents: true, isVerified: true };

    if (country) {
      query.country = country;
    }

    if (keyword) {
      query.$or = [
        { firstName: { $regex: keyword, $options: 'i' } },
        { lastName: { $regex: keyword, $options: 'i' } },
        { university: { $regex: keyword, $options: 'i' } },
        { email: { $regex: keyword, $options: 'i' } },
        { researchAreas: { $regex: keyword, $options: 'i' } },
        { researchKeywords: { $regex: keyword, $options: 'i' } },
      ];
    }

    const professors = await Professor.find(query);

    res.json({
      success: true,
      data: professors,
      count: professors.length,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = {
  getAllProfessors,
  getProfessorById,
  getRecommendedProfessors,
  searchProfessors,
};
