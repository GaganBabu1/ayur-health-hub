const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  category: {
    type: String,
    default: 'general', // e.g., respiratory, digestive, neurological
    index: true,
  },
  description: {
    type: String,
  },
  relatedDiseases: [String], // Disease names for easy lookup
  severity: String, // e.g., mild, moderate, severe
  duration: String, // e.g., acute, chronic
  commonCauses: [String],
  whenToSeekHelp: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Symptom', symptomSchema);
