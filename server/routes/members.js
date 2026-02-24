const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff');
const { requireAdmin } = require('../middleware/adminAuth');

// Get all staff members (public)
router.get('/', async (req, res) => {
  try {
    const staff = await Staff.find({ isActive: true }).sort({ order: 1, name: 1 });
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single staff (public)
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create staff (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const staff = new Staff(req.body);
    await staff.save();
    res.status(201).json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update staff (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete staff (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json({ success: true, message: 'Staff deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
