const express = require('express');
const router = express.Router();
const HeroSlide = require('../models/HeroSlide');
const { requireAdmin } = require('../middleware/adminAuth');

// Get all active hero slides (public)
router.get('/', async (req, res) => {
  try {
    const query = { isActive: true };
    const slides = await HeroSlide.find(query).sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all hero slides (admin - includes inactive)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const slides = await HeroSlide.find().sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single hero slide
router.get('/:id', async (req, res) => {
  try {
    const slide = await HeroSlide.findById(req.params.id);
    if (!slide) {
      return res.status(404).json({ error: 'Hero slide not found' });
    }
    res.json(slide);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create hero slide (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const slide = new HeroSlide(req.body);
    await slide.save();
    res.status(201).json(slide);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update hero slide (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!slide) {
      return res.status(404).json({ error: 'Hero slide not found' });
    }
    res.json(slide);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete hero slide (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const slide = await HeroSlide.findByIdAndDelete(req.params.id);
    if (!slide) {
      return res.status(404).json({ error: 'Hero slide not found' });
    }
    res.json({ success: true, message: 'Hero slide deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
