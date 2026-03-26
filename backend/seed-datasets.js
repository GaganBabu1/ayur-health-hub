#!/usr/bin/env node

/**
 * Dataset Seeding Script
 * Loads diseases and symptoms from JSON files into MongoDB
 * Run: node seed-datasets.js
 */

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ayur-health-hub';

// Import actual models
const Disease = require('./src/models/Disease');
const Symptom = require('./src/models/Symptom');

async function seedDatasets() {
  try {
    console.log('🚀 Starting dataset seeding...');

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Read JSON files
    const diseasesPath = path.join(process.cwd(), 'src', 'datasets', 'diseases.json');
    const symptomsPath = path.join(process.cwd(), 'src', 'datasets', 'symptoms.json');

    if (!fs.existsSync(diseasesPath)) {
      console.error('❌ diseases.json not found at', diseasesPath);
      process.exit(1);
    }

    if (!fs.existsSync(symptomsPath)) {
      console.error('❌ symptoms.json not found at', symptomsPath);
      process.exit(1);
    }

    const diseasesData = JSON.parse(fs.readFileSync(diseasesPath, 'utf-8'));
    const symptomsData = JSON.parse(fs.readFileSync(symptomsPath, 'utf-8'));

    // Remove _id field from dataset documents (they have string IDs which MongoDB doesn't like)
    const diseasesDataClean = diseasesData.map(d => {
      const { _id, ...rest } = d;
      return rest;
    });

    const symptomsDataClean = symptomsData.map(s => {
      const { _id, ...rest } = s;
      return rest;
    });

    console.log(`📖 Loaded ${diseasesDataClean.length} diseases from diseases.json`);
    console.log(`📖 Loaded ${symptomsDataClean.length} symptoms from symptoms.json`);

    // Clear existing data before seeding fresh
    await Disease.deleteMany({});
    await Symptom.deleteMany({});
    console.log('🗑️  Cleared existing disease and symptom data');

    // Insert diseases
    console.log('\n📥 Inserting diseases...');
    console.log(`   Attempting to insert ${diseasesDataClean.length} disease documents...`);
    let insertedDiseases = [];
    try {
      insertedDiseases = await Disease.insertMany(diseasesDataClean, { ordered: false });
      console.log(`✅ Inserted ${insertedDiseases.length} diseases`);
    } catch (err) {
      console.error('Insert error:', err.message);
      if (err.code === 11000 || err.insertedDocs) {
        insertedDiseases = err.insertedDocs || [];
        console.log(`⚠️  Inserted ${insertedDiseases.length} diseases (some duplicates skipped)`);
      } else {
        throw err;
      }
    }

    // Insert symptoms
    console.log('\n📥 Inserting symptoms...');
    let insertedSymptoms = [];
    try {
      insertedSymptoms = await Symptom.insertMany(symptomsDataClean, { ordered: false });
      console.log(`✅ Inserted ${insertedSymptoms.length} symptoms`);
    } catch (err) {
      if (err.code === 11000 || err.insertedDocs) {
        insertedSymptoms = err.insertedDocs || [];
        console.log(`⚠️  Inserted ${insertedSymptoms.length} symptoms (some duplicates skipped)`);
      } else {
        throw err;
      }
    }

    // Wait a moment for writes to complete
    await new Promise(resolve => setTimeout(resolve, 500));

    // Verify data
    const diseaseCount = await Disease.countDocuments();
    const symptomCount = await Symptom.countDocuments();

    console.log('\n📊 Dataset Summary:');
    console.log(`   - Total Diseases: ${diseaseCount}`);
    console.log(`   - Total Symptoms: ${symptomCount}`);

    // List sample diseases
    const sampleDiseases = await Disease.find().limit(3).select('name');
    console.log('\n📋 Sample Diseases:');
    sampleDiseases.forEach(d => console.log(`   - ${d.name}`));

    // List sample symptoms
    const sampleSymptoms = await Symptom.find().limit(3).select('name category');
    console.log('\n📋 Sample Symptoms:');
    sampleSymptoms.forEach(s => console.log(`   - ${s.name} (${s.category})`));

    console.log('\n✅ Dataset seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding datasets:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seedDatasets();
