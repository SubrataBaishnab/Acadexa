const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const Supervisor = require('./src/models/Supervisor');

async function main() {
  try {
    // Connect to MongoDB Atlas
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Read the JSON file
    const jsonFile = process.argv[2] || './supervisors.json';
    
    if (!fs.existsSync(jsonFile)) {
      throw new Error(`File not found: ${jsonFile}`);
    }

    console.log(`📂 Reading JSON file: ${jsonFile}`);
    const rawData = fs.readFileSync(jsonFile, 'utf-8');
    const supervisorsData = JSON.parse(rawData);

    console.log(`📊 Found ${supervisorsData.length} supervisors in JSON`);

    if (supervisorsData.length === 0) {
      console.log('⚠️ No supervisors found in JSON file');
      process.exit(1);
    }

    // Drop existing collection
    try {
      await Supervisor.collection.drop();
      console.log('🗑️ Cleared existing supervisors');
    } catch (err) {
      console.log('📝 No existing supervisors collection');
    }

    // Add timestamps if not present
    const supervisorsToInsert = supervisorsData.map(sup => ({
      ...sup,
      createdAt: sup.createdAt || new Date(),
      updatedAt: sup.updatedAt || new Date(),
      isVerified: sup.isVerified !== undefined ? sup.isVerified : true,
      sourceDatabase: sup.sourceDatabase || 'json-import'
    }));

    // Insert into Atlas
    const result = await Supervisor.insertMany(supervisorsToInsert);
    console.log(`✅ Successfully imported ${result.length} supervisors to Atlas`);
    console.log('🎉 Data saved to MongoDB Atlas!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
