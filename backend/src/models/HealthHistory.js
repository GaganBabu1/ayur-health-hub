const mongoose = require('mongoose');

const healthHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  weight: {
    type: Number, // in kg
  },
  activityLevel: {
    type: String,
    enum: ['low', 'moderate', 'high'],
  },
  sleepQuality: {
    type: Number, // 0-10 scale
  },
  notes: {
    type: String,
  },
  chronicConditions: [
    {
      type: String,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries by userId and date
healthHistorySchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('HealthHistory', healthHistorySchema);
