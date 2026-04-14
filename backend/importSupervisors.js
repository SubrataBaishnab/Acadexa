const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Supervisor = require('./src/models/Supervisor');

// Main import function
async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Drop existing collection
    try {
      await Supervisor.collection.drop();
      console.log('🗑️ Dropped existing Supervisor collection and indexes');
    } catch (err) {
      if (err.code === 26) {
        console.log('📝 No existing collection found (first time import)');
      }
    }

    // Parse and import supervisors
    await importSupervisorsFromText();
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

async function importSupervisorsFromText() {
  // Sample data - replace with your actual data source
  const supervisorData = [
    { name: 'Ashraful Islam Shanto Sikder', code: 'ASRF', status: 'Accepting', designation: 'Lecturer', email: 'ashraful.islam@bracu.ac.bd', level: 'U' },
    { name: 'Mohammad Naveed Hossain', code: 'MVH', status: 'Accepting', designation: 'Lecturer', email: 'mohammad.naveed@bracu.ac.bd', level: 'U' },
    { name: 'Nazmus Sakib Ahmed', code: 'SKIB', status: 'Accepting', designation: 'Lecturer', email: 'nazmus.sakib@bracu.ac.bd', level: 'U' },
    { name: 'Md. Ishrak Ahsan', code: 'ISAS', status: 'Accepting', designation: 'Lecturer', email: 'ishrak.ahsan@bracu.ac.bd', level: 'U' },
    { name: 'Mahir Labib Dihan', code: 'MLDH', status: 'Not Accepting', designation: 'Lecturer', email: 'labib.mahir@bracu.ac.bd', level: 'U' },
    // Add more supervisors...
  ];

  const splitName = (fullName) => {
    if (!fullName) return { firstName: '', lastName: '' };
    const parts = fullName.trim().split(/\s+/);
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || parts[0] || ''
    };
  };

  const parseLevels = (levelStr) => {
    const supervisesUndergrad = levelStr.includes('U');
    const supervisesPostgrad = levelStr.includes('P');
    return { supervisesUndergrad, supervisesPostgrad };
  };

  const supervisorsToInsert = supervisorData.map(row => {
    const { firstName, lastName } = splitName(row.name);
    const { supervisesUndergrad, supervisesPostgrad } = parseLevels(row.level);

    return {
      firstName: firstName,
      lastName: lastName,
      code: row.code,
      email: row.email,
      department: 'Computer Science and Engineering',
      university: 'BRAC University',
      designation: row.designation,
      isAcceptingStudents: row.status === 'Accepting',
      supervisesUndergrad: supervisesUndergrad,
      supervisesPostgrad: supervisesPostgrad,
      isVerified: true,
      sourceDatabase: 'brac-import',
      lastUpdated: new Date(),
    };
  });

  console.log(`📂 Parsed ${supervisorData.length} supervisors`);

  if (supervisorsToInsert.length === 0) {
    console.log('⚠️ No supervisors to import');
    process.exit(1);
  }

  try {
    const result = await Supervisor.insertMany(supervisorsToInsert);
    console.log(`✅ Successfully imported ${result.length} supervisors`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

main();
