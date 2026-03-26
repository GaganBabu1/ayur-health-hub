const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    index: true,
  },
  scientificName: {
    type: String,
  },
  ayurvedicName: {
    type: String,
    index: true,
  },
  description: {
    type: String,
  },
  dosha: [String], // e.g., ['vata', 'pitta', 'kapha']
  symptoms: [
    {
      name: String,
      weight: { type: Number, default: 1 },
    },
  ],
  severity: String,
  severityLevel: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'low',
  },
  triageLevel: {
    type: String,
    enum: ['normal', 'doctor', 'urgent'],
    default: 'normal',
  },
  baseConfidence: { type: Number, default: 0.7 },
  durationDays: Number,
  treatments: {
    herbs: [{ name: String, dosage: String }],
    diet: [String],
    lifestyle: [String],
    avoidance: [String],
  },
  whenToSeekDoctor: [String],
  seasonality: [String],
  contagious: Boolean,
  preventionTips: [String],
  complications: [String],
  relatedDiseases: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Disease',
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Disease', diseaseSchema);
