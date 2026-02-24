const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  nameEn: {
    type: String
  },
  professor: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  researchAreas: [String],
  location: {
    type: String
  },
  phone: {
    type: String
  },
  email: {
    type: String
  },
  website: {
    type: String
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

labSchema.index({ order: 1 });
labSchema.index({ isActive: 1 });

module.exports = mongoose.model('Lab', labSchema);
