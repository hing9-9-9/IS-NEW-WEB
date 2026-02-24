const express = require('express');
const router = express.Router();
const Faculty = require('../models/Faculty');
const { requireAdmin } = require('../middleware/adminAuth');

// Get all faculty (public)
router.get('/', async (req, res) => {
  try {
    const { position, category } = req.query;
    const query = { isActive: true };

    if (position) {
      query.position = position;
    }
    if (category) {
      query.category = category;
    }

    const faculty = await Faculty.find(query).sort({ order: 1, name: 1 });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all faculty including inactive (admin)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const { category } = req.query;
    const query = {};
    if (category) {
      query.category = category;
    }
    const faculty = await Faculty.find(query).sort({ order: 1, name: 1 });
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single faculty (public)
router.get('/:id', async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json(faculty);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create faculty (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const faculty = new Faculty(req.body);
    await faculty.save();
    res.status(201).json(faculty);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update faculty (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json(faculty);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete faculty (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const faculty = await Faculty.findByIdAndDelete(req.params.id);
    if (!faculty) {
      return res.status(404).json({ error: 'Faculty not found' });
    }
    res.json({ success: true, message: 'Faculty deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
