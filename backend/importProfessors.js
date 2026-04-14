const mongoose = require('mongoose');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Professor = require('./src/models/Professor');

// Function to import professors from Excel
async function importProfessorsFromExcel(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    console.log(`📂 Reading Excel file: ${filePath}`);
    
    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Read first sheet
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log(`📊 Found ${data.length} professors in the Excel file`);

    if (data.length === 0) {
      console.log('⚠️ No data found in Excel file');
      return;
    }

    // Map Excel columns to Professor schema
    // Parse Faculty name into firstName and lastName
    const splitName = (fullName) => {
      if (!fullName) return { firstName: '', lastName: '' };
      const parts = fullName.trim().split(/\s+/);
      return {
        firstName: parts[0] || '',
        lastName: parts.slice(1).join(' ') || parts[0] || ''
      };
    };

    // Parse positions to determine if they accept PhD students
    const acceptsPhD = (positionsStr) => {
      if (!positionsStr) return true;
      const lower = positionsStr.toLowerCase();
      return lower.includes('phd') || lower.includes('ph.d');
    };

    // Extract PhD focus areas from positions/research interests
    const extractPhDFocusAreas = (researchInterests) => {
      if (!researchInterests) return [];
      return researchInterests.split(',').map(a => a.trim());
    };

    const professorsToInsert = data.map(row => {
      const { firstName, lastName } = splitName(row['Faculty']);
      return {
        firstName: firstName,
        lastName: lastName,
        email: row['How to Reach out'] ? row['How to Reach out'].toLowerCase() : '',
        university: row['University'] || '',
        country: 'United States', // Default to USA as per your data
        designation: 'Professor',
        bio: row['Notes'] || '',
        researchAreas: extractPhDFocusAreas(row['Research Interests']),
        researchInterests: row['Research Interests'] || '',
        researchKeywords: extractPhDFocusAreas(row['Research Interests']),
        universityProfileUrl: row['Homepage'] || '',
        personalWebsite: row['Homepage'] || '',
        publicationsCount: 0,
        acceptsPhDStudents: acceptsPhD(row['Positions']),
        phdFocusAreas: extractPhDFocusAreas(row['Research Interests']),
        fundingAvailable: row['Positions'] ? row['Positions'].includes('RA') : false,
        estimatedFundingAmount: row['Positions'] || '',
        preferredQualifications: row['Requirements'] ? row['Requirements'].split(',').map(q => q.trim()) : [],
        languageRequirements: row['Requirements'] ? row['Requirements'].split(',').map(l => l.trim()).filter(l => l.includes('TOEFL') || l.includes('IELTS') || l.includes('GRE') || l.includes('English')) : [],
        sourceDatabase: 'excel-import',
        isVerified: true, // Mark as verified since imported from trusted source
        lastUpdated: new Date(),
      };
    });

    // Filter out invalid entries (check required fields)
    const validProfessors = professorsToInsert.filter(prof => {
      return prof.firstName && prof.university && prof.email;
    });

    if (validProfessors.length === 0) {
      console.log('❌ No valid professors found. Check Excel file structure.');
      process.exit(1);
    }

    console.log(`✅ ${validProfessors.length} valid professors ready to import`);

    // Clear existing professors if needed (optional)
    // await Professor.deleteMany({});
    // console.log('🗑️ Cleared existing professors');

    // Insert professors
    const result = await Professor.insertMany(validProfessors);
    console.log(`✅ Successfully imported ${result.length} professors`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Get file path from command line or use default
const filePath = process.argv[2] || './professors.xlsx';

// Main import function
async function main() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Drop existing collection and indexes
    try {
      await Professor.collection.drop();
      console.log('🗑️ Dropped existing Professor collection and indexes');
    } catch (err) {
      if (err.code === 26) {
        console.log('📝 No existing collection found (first time import)');
      } else {
        console.log('⚠️ Could not drop collection:', err.message);
      }
    }

    // Now run the import
    await importProfessorsFromExcel(filePath);
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
