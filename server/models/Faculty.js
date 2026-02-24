const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  nameEn: {
    type: String
  },
  position: {
    type: String,
    required: true // e.g., "교수", "부교수", "조교수"
  },
  category: {
    type: String,
    enum: ['교수진', '자문교수', '명예교수'],
    default: '교수진'
  },
  title: {
    type: String // e.g., "학과장", "학부장"
  },
  image: {
    type: String
  },
  email: {
    type: String
  },
  phone: {
    type: String
  },
  office: {
    type: String
  },
  education: [{
    degree: String, // "박사", "석사", "학사"
    school: String,
    major: String,
    year: String
  }],
  researchAreas: [String],
  homepage: {
    type: String
  },
  labName: {
    type: String
  },
  labUrl: {
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

facultySchema.index({ category: 1, order: 1 });
facultySchema.index({ position: 1, order: 1 });
facultySchema.index({ isActive: 1 });

module.exports = mongoose.model('Faculty', facultySchema);
