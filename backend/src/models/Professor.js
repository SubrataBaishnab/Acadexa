const mongoose = require('mongoose');

const professorSchema = new mongoose.Schema({
  // Personal Info
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  
  // Institution & Location
  university: {
    type: String,
    required: true,
  },
  department: String,
  country: {
    type: String,
    required: true,
  },
  city: String,
  
  // Professional Info
  designation: String,
  bio: String,
  profileImage: String,
  
  // Research
  researchAreas: [{
    type: String,
  }],
  researchInterests: String, // Detailed description
  researchKeywords: [String],
  
  // Contact
  officialEmail: String,
  alternateEmail: String,
  phoneNumber: String,
  officePhone: String,
  
  // URLs
  universityProfileUrl: String,
  personalWebsite: String,
  linkedInUrl: String,
  googleScholarUrl: String,
  researchGateUrl: String,
  
  // Academic Info
  publicationsCount: {
    type: Number,
    default: 0,
  },
  h_index: Number,
  citations: Number,
  
  // PhD Program Info
  acceptsPhDStudents: {
    type: Boolean,
    default: true,
  },
  phdFocusAreas: [String],
  fundingAvailable: Boolean,
  estimatedFundingAmount: String,
  
  // Admission Preferences
  preferredQualifications: [String],
  languageRequirements: [String],
  
  // Status & Metadata
  isVerified: {
    type: Boolean,
    default: false,
  },
  sourceDatabase: String, // 'semantic-scholar', 'manual-entry', etc.
  sourceId: String, // ID from external database
  lastUpdated: Date,
  
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for searching
professorSchema.index({ 
  'researchAreas': 1, 
  'country': 1,
  'researchKeywords': 1 
});

module.exports = mongoose.model('Professor', professorSchema);
