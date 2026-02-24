const express = require('express');
const router = express.Router();
const SiteSetting = require('../models/SiteSetting');
const { requireAdmin } = require('../middleware/adminAuth');

// Get single setting by key (public)
router.get('/:key', async (req, res) => {
  try {
    const setting = await SiteSetting.findOne({ key: req.params.key });
    if (!setting) {
      return res.json({ key: req.params.key, value: null });
    }
    res.json(setting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all settings (admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const settings = await SiteSetting.find().sort({ key: 1 });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update setting by key (admin) — upsert
router.put('/:key', requireAdmin, async (req, res) => {
  try {
    const setting = await SiteSetting.findOneAndUpdate(
      { key: req.params.key },
      { key: req.params.key, value: req.body.value },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(setting);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
