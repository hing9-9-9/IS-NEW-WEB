const mongoose = require('mongoose');

const siteSettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
}, {
  timestamps: true
});

siteSettingSchema.index({ key: 1 }, { unique: true });

module.exports = mongoose.model('SiteSetting', siteSettingSchema);
