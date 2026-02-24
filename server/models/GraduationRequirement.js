const mongoose = require('mongoose');

const graduationRequirementSchema = new mongoose.Schema({
  category: { type: String, required: true },
  credits: { type: Number, required: true },
  details: { type: String, default: '' },
  type: { type: String, enum: ['학부', '대학원'], required: true },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

graduationRequirementSchema.index({ type: 1, order: 1 });
graduationRequirementSchema.index({ isActive: 1 });

module.exports = mongoose.model('GraduationRequirement', graduationRequirementSchema);
