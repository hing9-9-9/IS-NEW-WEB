const express = require('express');
const router = express.Router();
const Lab = require('../models/Lab');
const { requireAdmin } = require('../middleware/adminAuth');

// Get all labs (public)
router.get('/', async (req, res) => {
  try {
    const labs = await Lab.find({ isActive: true }).sort({ order: 1, nameEn: 1, name: 1 });
    res.json(labs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single lab (public)
router.get('/:id', async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab) {
      return res.status(404).json({ error: 'Lab not found' });
    }
    res.json(lab);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create lab (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const lab = new Lab(req.body);
    await lab.save();
    res.status(201).json(lab);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update lab (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const lab = await Lab.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!lab) {
      return res.status(404).json({ error: 'Lab not found' });
    }
    res.json(lab);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete lab (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const lab = await Lab.findByIdAndDelete(req.params.id);
    if (!lab) {
      return res.status(404).json({ error: 'Lab not found' });
    }
    res.json({ success: true, message: 'Lab deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
