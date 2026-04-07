const mongoose = require('mongoose');
require('dotenv').config();

// Temporary schemas just for the seeding script
const supervisorSchema = new mongoose.Schema({}, { strict: false });
const Supervisor = mongoose.model('Supervisor', supervisorSchema);

const professorSchema = new mongoose.Schema({}, { strict: false });
const Professor = mongoose.model('Professor', professorSchema);

const mockSupervisors = [
  {
    firstName: 'John', lastName: 'Smith', email: 'john.smith@bracu.ac.bd',
    department: 'Computer Science and Engineering', designation: 'Professor',
    researchAreas: ['Machine Learning', 'AI', 'Data Science'],
    availableSlots: 3, publicationsCount: 45, h_index: 12, isActive: true
  },
  {
    firstName: 'Sarah', lastName: 'Johnson', email: 'sarah.j@bracu.ac.bd',
    department: 'Computer Science and Engineering', designation: 'Associate Professor',
    researchAreas: ['AI', 'Natural Language Processing', 'Deep Learning'],
    availableSlots: 2, publicationsCount: 38, h_index: 10, isActive: true
  },
  {
    firstName: 'Michael', lastName: 'Chen', email: 'm.chen@bracu.ac.bd',
    department: 'Computer Science and Engineering', designation: 'Assistant Professor',
    researchAreas: ['Computer Vision', 'Machine Learning', 'Neural Networks'],
    availableSlots: 1, publicationsCount: 52, h_index: 15, isActive: true
  }
];

const mockProfessors = [
  {
    firstName: 'Robert', lastName: 'Williams', email: 'robert.williams@stanford.edu',
    university: 'Stanford University', country: 'USA', city: 'Stanford',
    researchAreas: ['AI', 'Machine Learning'],
    acceptsPhDStudents: true, isVerified: true, publicationsCount: 120, h_index: 45
  },
  {
    firstName: 'Emily', lastName: 'Davis', email: 'emily.davis@mit.edu',
    university: 'MIT', country: 'USA', city: 'Cambridge',
    researchAreas: ['Deep Learning', 'Data Science'],
    acceptsPhDStudents: true, isVerified: true, publicationsCount: 89, h_index: 38
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected!');

    console.log('Clearing old data...');
    await Supervisor.deleteMany({});
    await Professor.deleteMany({});

    console.log('Pushing new dummy data...');
    await Supervisor.insertMany(mockSupervisors);
    await Professor.insertMany(mockProfessors);

    console.log('🎉 Successfully pushed supervisors and professors to the database!');
    process.exit();
  } catch (error) {
    console.error('❌ Error pushing data:', error);
    process.exit(1);
  }
}

seedDatabase();
