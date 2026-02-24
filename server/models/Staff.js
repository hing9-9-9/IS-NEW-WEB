const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  position: {
    type: String,
    required: true // e.g., "행정실장", "조교"
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
  duties: [String], // 담당업무
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

staffSchema.index({ order: 1 });
staffSchema.index({ isActive: 1 });

module.exports = mongoose.model('Staff', staffSchema);
