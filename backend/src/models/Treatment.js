const mongoose = require('mongoose');

const treatmentSchema = new mongoose.Schema({
  disease: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Disease',
    required: true,
  },
  herbs: [
    {
      type: String,
    },
  ],
  dietRecommendations: [
    {
      type: String,
    },
  ],
  lifestyleRecommendations: [
    {
      type: String,
    },
  ],
  notes: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Treatment', treatmentSchema);
