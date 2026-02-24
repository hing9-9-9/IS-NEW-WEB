const express = require('express');
const router = express.Router();
const GraduationRequirement = require('../models/GraduationRequirement');
const SiteSetting = require('../models/SiteSetting');
const { requireAdmin } = require('../middleware/adminAuth');

// Get all active graduation requirements (public)
router.get('/', async (req, res) => {
  try {
    const { type } = req.query;
    const query = { isActive: true };
    if (type) query.type = type;

    const requirements = await GraduationRequirement.find(query).sort({ order: 1 });
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all graduation requirements (admin - includes inactive)
router.get('/all', requireAdmin, async (req, res) => {
  try {
    const { type } = req.query;
    const query = {};
    if (type) query.type = type;

    const requirements = await GraduationRequirement.find(query).sort({ order: 1 });
    res.json(requirements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get HTML content for a type (학부 or 대학원) — must be before /:id
router.get('/content/:type', async (req, res) => {
  try {
    const key = `graduation_content_${req.params.type}`;
    const setting = await SiteSetting.findOne({ key });
    res.json({ content: setting ? setting.value : '' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Save HTML content for a type (admin) — must be before /:id
router.put('/content/:type', requireAdmin, async (req, res) => {
  try {
    const key = `graduation_content_${req.params.type}`;
    const { content } = req.body;
    await SiteSetting.findOneAndUpdate(
      { key },
      { key, value: content },
      { upsert: true, new: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single requirement
router.get('/:id', async (req, res) => {
  try {
    const requirement = await GraduationRequirement.findById(req.params.id);
    if (!requirement) {
      return res.status(404).json({ error: 'Graduation requirement not found' });
    }
    res.json(requirement);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create graduation requirement (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const requirement = new GraduationRequirement(req.body);
    await requirement.save();
    res.status(201).json(requirement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update graduation requirement (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const requirement = await GraduationRequirement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!requirement) {
      return res.status(404).json({ error: 'Graduation requirement not found' });
    }
    res.json(requirement);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete graduation requirement (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const requirement = await GraduationRequirement.findByIdAndDelete(req.params.id);
    if (!requirement) {
      return res.status(404).json({ error: 'Graduation requirement not found' });
    }
    res.json({ success: true, message: 'Graduation requirement deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
