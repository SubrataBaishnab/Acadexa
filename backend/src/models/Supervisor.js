const mongoose = require('mongoose');

const supervisorSchema = new mongoose.Schema({
  // User Info
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  code: String, // e.g., [ASRF]
  email: {
    type: String,
    required: true,
  },
  department: {
    type: String,
    required: true,
  },
  university: {
    type: String,
    default: 'BRAC University',
  },
  
  // Professional Info
  designation: String, // Professor, Associate Professor, etc.
  bio: String,
  profileImage: String,
  
  // Research Areas (Tags)
  researchAreas: [{
    type: String,
    enum: ['AI', 'Computer Vision', 'NLP', 'Security', 'Systems', 'Web Development', 'Database', 'Cloud Computing', 'Blockchain', 'IoT', 'Data Science', 'Other']
  }],
  
  // Availability & Status
  isAcceptingStudents: {
    type: Boolean,
    default: true,
  },
  supervisesUndergrad: {
    type: Boolean,
    default: false,
  },
  supervisesPostgrad: {
    type: Boolean,
    default: false,
  },
  availableSlots: {
    type: Number,
    default: 5,
  },
  totalStudents: {
    type: Number,
    default: 0,
  },
  
  // Contact & Social
  officeLocation: String,
  phoneNumber: String,
  websiteUrl: String,
  linkedInUrl: String,
  googleScholarUrl: String,
  
  // Thesis Details
  thesisRequirements: String, // Min GPA, specific skills, etc.
  publicationsCount: {
    type: Number,
    default: 0,
  },
  h_index: Number,
  
  // Status
  isActive: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  sourceDatabase: String,
  
  // Timestamps
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
supervisorSchema.index({ 'researchAreas': 1, email: 1, 'isAcceptingStudents': 1 });

module.exports = mongoose.model('Supervisor', supervisorSchema);
