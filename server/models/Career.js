const mongoose = require('mongoose');

const careerCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: 'Building2' // lucide icon name
  },
  description: {
    type: String
  },
  companies: [String],
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const careerStatSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true
  },
  value: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const careerPathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

careerCategorySchema.index({ order: 1 });
careerStatSchema.index({ order: 1 });
careerPathSchema.index({ order: 1 });

const CareerCategory = mongoose.model('CareerCategory', careerCategorySchema);
const CareerStat = mongoose.model('CareerStat', careerStatSchema);
const CareerPath = mongoose.model('CareerPath', careerPathSchema);

module.exports = { CareerCategory, CareerStat, CareerPath };
