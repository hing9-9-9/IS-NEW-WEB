const mongoose = require('mongoose');

const studentCouncilSchema = new mongoose.Schema({
  introduction: {
    type: String,
    default: ''
  },
  instagramUrl: {
    type: String,
    default: ''
  },
  image: {
    type: String
  },
  members: [{
    name: String,
    role: String,
    image: String
  }],
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

module.exports = mongoose.model('StudentCouncil', studentCouncilSchema);
