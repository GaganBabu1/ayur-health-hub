const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  },
  // Doctor-specific fields
  specialization: {
    type: String,
    enum: ['Ayurvedic Physician', 'Holistic Health', 'Digestive Health', 'Mental Wellness', 'General Practice'],
    default: 'General Practice',
  },
  experience: {
    type: Number, // in years
    default: 0,
  },
  rating: {
    type: Number, // 0-5
    default: 4.5,
  },
  // Patient-specific fields
  age: {
    type: Number,
  },
  gender: {
    type: String,
  },
  height: {
    type: Number, // in cm, optional
  },
  weight: {
    type: Number, // in kg, optional
  },
  lifestyle: {
    type: String, // sedentary/moderate/active
  },
  sleepQuality: {
    type: Number, // 1–5
  },
  chronicConditions: [
    {
      type: String,
    },
  ],
  allergies: [
    {
      type: String,
    },
  ],
  diseaseHistory: {
    type: String,
  },
  preferences: {
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    appointmentReminders: {
      type: Boolean,
      default: true,
    },
    healthTips: {
      type: Boolean,
      default: true,
    },
    dataSharing: {
      type: Boolean,
      default: false,
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-save hook to hash password if it is new or modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Instance method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
