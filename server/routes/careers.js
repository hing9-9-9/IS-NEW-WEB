const express = require('express');
const router = express.Router();
const { CareerCategory, CareerStat, CareerPath } = require('../models/Career');
const { requireAdmin } = require('../middleware/adminAuth');

// Get all career data (public)
router.get('/', async (req, res) => {
  try {
    const [categories, stats, paths] = await Promise.all([
      CareerCategory.find({ isActive: true }).sort({ order: 1 }),
      CareerStat.find({ isActive: true }).sort({ order: 1 }),
      CareerPath.find({ isActive: true }).sort({ order: 1 })
    ]);
    res.json({ categories, stats, paths });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Career Categories ---
router.get('/categories', async (req, res) => {
  try {
    const categories = await CareerCategory.find({ isActive: true }).sort({ order: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/categories/:id', async (req, res) => {
  try {
    const category = await CareerCategory.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/categories', requireAdmin, async (req, res) => {
  try {
    const category = new CareerCategory(req.body);
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const category = await CareerCategory.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/categories/:id', requireAdmin, async (req, res) => {
  try {
    const category = await CareerCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Career Stats ---
router.get('/stats', async (req, res) => {
  try {
    const stats = await CareerStat.find({ isActive: true }).sort({ order: 1 });
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/stats/:id', async (req, res) => {
  try {
    const stat = await CareerStat.findById(req.params.id);
    if (!stat) {
      return res.status(404).json({ error: 'Stat not found' });
    }
    res.json(stat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/stats', requireAdmin, async (req, res) => {
  try {
    const stat = new CareerStat(req.body);
    await stat.save();
    res.status(201).json(stat);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/stats/:id', requireAdmin, async (req, res) => {
  try {
    const stat = await CareerStat.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!stat) {
      return res.status(404).json({ error: 'Stat not found' });
    }
    res.json(stat);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/stats/:id', requireAdmin, async (req, res) => {
  try {
    const stat = await CareerStat.findByIdAndDelete(req.params.id);
    if (!stat) {
      return res.status(404).json({ error: 'Stat not found' });
    }
    res.json({ success: true, message: 'Stat deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- Career Paths ---
router.get('/paths', async (req, res) => {
  try {
    const paths = await CareerPath.find({ isActive: true }).sort({ order: 1 });
    res.json(paths);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/paths/:id', async (req, res) => {
  try {
    const path = await CareerPath.findById(req.params.id);
    if (!path) {
      return res.status(404).json({ error: 'Path not found' });
    }
    res.json(path);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/paths', requireAdmin, async (req, res) => {
  try {
    const path = new CareerPath(req.body);
    await path.save();
    res.status(201).json(path);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/paths/:id', requireAdmin, async (req, res) => {
  try {
    const path = await CareerPath.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!path) {
      return res.status(404).json({ error: 'Path not found' });
    }
    res.json(path);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/paths/:id', requireAdmin, async (req, res) => {
  try {
    const path = await CareerPath.findByIdAndDelete(req.params.id);
    if (!path) {
      return res.status(404).json({ error: 'Path not found' });
    }
    res.json({ success: true, message: 'Path deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
