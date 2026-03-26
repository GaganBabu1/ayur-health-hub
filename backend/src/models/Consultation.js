const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // optional
  },
  symptoms: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Symptom',
      required: true,
    },
  ],
  mentalState: {
    stressLevel: { type: Number },
    sleepQuality: { type: Number },
    mood: { type: String },
  },
  diseaseHistory: {
    type: String,
  },
  oldTreatments: {
    type: String,
  },
  predictedDiseases: [
    {
      disease: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Disease',
      },
      name: { type: String }, // store name also for robustness
      confidence: { type: Number }, // 0–1
    },
  ],
  recommendedPlan: {
    herbs: [{ type: String }],
    diet: [{ type: String }],
    lifestyle: [{ type: String }],
  },
  triageLevel: {
    type: String,
    enum: ['normal', 'doctor', 'urgent'],
    default: 'normal',
  },
  patientNotes: {
    type: String,
  },
  doctorNotes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['review_pending', 'completed', 'closed'],
    default: 'review_pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Consultation', consultationSchema);
