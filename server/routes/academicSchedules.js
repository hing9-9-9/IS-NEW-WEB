const express = require('express');
const router = express.Router();
const AcademicSchedule = require('../models/AcademicSchedule');
const { requireAdmin } = require('../middleware/adminAuth');

// Get all active academic schedules (public)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;

    const schedules = await AcademicSchedule.find(query).sort({ order: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all academic schedules (admin - includes inactive)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};
    if (type) query.type = type;

    const schedules = await AcademicSchedule.find(query).sort({ order: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single schedule
router.get('/:id', async (req, res) => {
  try {
    const schedule = await AcademicSchedule.findById(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Academic schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create academic schedule (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const schedule = new AcademicSchedule(req.body);
    await schedule.save();
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update academic schedule (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const schedule = await AcademicSchedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!schedule) {
      return res.status(404).json({ error: 'Academic schedule not found' });
    }
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete academic schedule (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const schedule = await AcademicSchedule.findByIdAndDelete(req.params.id);
    if (!schedule) {
      return res.status(404).json({ error: 'Academic schedule not found' });
    }
    res.json({ success: true, message: 'Academic schedule deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
