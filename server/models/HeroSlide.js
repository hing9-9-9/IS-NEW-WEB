const mongoose = require('mongoose');

const heroSlideSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, default: '' },
  badge: { type: String, default: '' },
  image: { type: String, required: true },
  link: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, {
  timestamps: true
});

heroSlideSchema.index({ order: 1 });
heroSlideSchema.index({ isActive: 1 });

module.exports = mongoose.model('HeroSlide', heroSlideSchema);
