const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 300
  },
  company: {
    type: String,
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['채용', '인턴', '공모전', '기타'],
    default: '채용'
  },
  deadline: {
    type: Date
  },
  link: {
    type: String
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number
  }],
  views: {
    type: Number,
    default: 0
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

jobSchema.index({ category: 1, createdAt: -1 });
jobSchema.index({ deadline: 1 });
jobSchema.index({ isActive: 1 });

module.exports = mongoose.model('Job', jobSchema);
