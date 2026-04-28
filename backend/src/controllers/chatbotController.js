const { generateRecommendationResponse, generateEmailDraft } = require('../utils/chatbotHelper');
const { rankSupervisors, rankProfessors } = require('../utils/recommendationEngine');
const Supervisor = require('../models/Supervisor');
const Professor = require('../models/Professor');

// Mock data for testing without database
const mockSupervisors = [
  {
    _id: '1',
    firstName: 'John',
    lastName: 'Smith',
    researchAreas: ['Machine Learning', 'AI', 'Data Science'],
    availableSlots: 3,
    publicationsCount: 45,
    h_index: 12,
    isActive: true,
  },
  {
    _id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    researchAreas: ['AI', 'Natural Language Processing', 'Deep Learning'],
    availableSlots: 2,
    publicationsCount: 38,
    h_index: 10,
    isActive: true,
  },
  {
    _id: '3',
    firstName: 'Michael',
    lastName: 'Chen',
    researchAreas: ['Computer Vision', 'Machine Learning', 'Neural Networks'],
    availableSlots: 1,
    publicationsCount: 52,
    h_index: 15,
    isActive: true,
  },
];

const mockProfessors = [
  {
    _id: '1',
    firstName: 'Robert',
    lastName: 'Williams',
    university: 'Stanford University',
    researchAreas: ['AI', 'Machine Learning'],
    acceptsPhDStudents: true,
    isVerified: true,
  },
  {
    _id: '2',
    firstName: 'Emily',
    lastName: 'Davis',
    university: 'MIT',
    researchAreas: ['Deep Learning', 'Data Science'],
    acceptsPhDStudents: true,
    isVerified: true,
  },
];

/**
 * Get smart recommendations with chat context
 */
const getSmartRecommendation = async (req, res) => {
  try {
    const { 
      query, 
      researchInterests, 
      preferredCountries,
      type = 'supervisor' // 'supervisor' or 'professor'
    } = req.body;

    if (!query || !researchInterests || researchInterests.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'Query and research interests are required' 
      });
    }

    const studentProfile = {
      researchInterests,
      preferredCountries: preferredCountries || [],
    };

    let recommendations = [];
    let chatResponse = '';

    if (type === 'supervisor') {
      // Try to fetch from database, fall back to mock data
      let allSupervisors;
      try {
        allSupervisors = await Supervisor.find({ isActive: true });
      } catch (error) {
        console.log('Database unavailable, using mock data');
        allSupervisors = mockSupervisors;
      }
      recommendations = rankSupervisors(allSupervisors, studentProfile, 5);
    } else {
      // Try to fetch from database, fall back to mock data
      let allProfessors;
      try {
        allProfessors = await Professor.find({ 
          acceptsPhDStudents: true,
          isVerified: true,
        });
      } catch (error) {
        console.log('Database unavailable, using mock data');
        allProfessors = mockProfessors;
      }
      recommendations = rankProfessors(allProfessors, studentProfile, 5);
    }

    // Generate AI-powered response
    chatResponse = await generateRecommendationResponse(studentProfile, recommendations, query);

    res.json({
      success: true,
      data: {
        chatResponse,
        recommendations,
        recommendationType: type,
      },
    });
  } catch (error) {
    console.error('Chatbot error details:', {
      message: error.message,
      stack: error.stack,
      type: error.constructor.name,
    });
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Internal server error'
    });
  }
};

/**
 * Generate email draft for contacting a supervisor/professor
 */
const generateDraftEmail = async (req, res) => {
  try {
    const { advisorId, advisorType = 'supervisor', researchContext } = req.body;

    if (!advisorId || !researchContext) {
      return res.status(400).json({ 
        success: false, 
        error: 'Advisor ID and research context are required' 
      });
    }

    let advisor;

    if (advisorType === 'supervisor') {
      advisor = await Supervisor.findById(advisorId);
    } else {
      advisor = await Professor.findById(advisorId);
    }

    if (!advisor) {
      return res.status(404).json({ 
        success: false, 
        error: 'Advisor not found' 
      });
    }

    // Mock student profile - in real app, get from authenticated user
    const studentProfile = {
      firstName: 'John',
      lastName: 'Doe',
      university: 'Your University',
      researchInterests: ['AI', 'Machine Learning'],
    };

    const emailDraft = await generateEmailDraft(studentProfile, advisor, researchContext);

    res.json({
      success: true,
      data: emailDraft,
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
};

module.exports = {
  getSmartRecommendation,
  generateDraftEmail,
};
