const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 300
  },
  content: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    enum: ['학과', '대학원', '자료실'],
    default: '학과'
  },
  author: {
    type: String,
    default: '관리자'
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
  isPinned: {
    type: Boolean,
    default: false
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

noticeSchema.index({ category: 1, createdAt: -1 });
noticeSchema.index({ isPinned: -1, createdAt: -1 });
noticeSchema.index({ isActive: 1 });

module.exports = mongoose.model('Notice', noticeSchema);
