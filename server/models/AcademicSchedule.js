const mongoose = require('mongoose');

const scheduleItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  date: { type: String, required: true },
  highlight: { type: String, enum: ['key', 'break', ''], default: '' },
}, { _id: false });

const academicScheduleSchema = new mongoose.Schema({
  semesterLabel: { type: String, required: true },
  items: [scheduleItemSchema],
  type: { type: String, enum: ['학부', '대학원'], required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

academicScheduleSchema.index({ type: 1, order: 1 });
academicScheduleSchema.index({ isActive: 1 });

module.exports = mongoose.model('AcademicSchedule', academicScheduleSchema);
