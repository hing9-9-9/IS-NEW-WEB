const express = require('express');
const router = express.Router();
const StudentCouncil = require('../models/StudentCouncil');
const { requireAdmin } = require('../middleware/adminAuth');

// Get student council info (public)
router.get('/', async (req, res) => {
  try {
    const data = await StudentCouncil.findOne({ isActive: true }).sort({ order: 1 });
    if (!data) {
      return res.json(null);
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update/create student council info (admin, upsert)
router.put('/', requireAdmin, async (req, res) => {
  try {
    const data = await StudentCouncil.findOneAndUpdate(
      {},
      req.body,
      { new: true, upsert: true, runValidators: true }
    );
    res.json(data);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
