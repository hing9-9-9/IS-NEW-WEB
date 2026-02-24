const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { requireAdmin } = require('../middleware/adminAuth');

// Get all jobs (public)
router.get('/', async (req, res) => {
  try {
    const { category, limit, page = 1 } = req.query;
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    const pageSize = parseInt(limit) || 20;
    const skip = (parseInt(page) - 1) * pageSize;

    const [jobs, total] = await Promise.all([
      Job.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Job.countDocuments(query)
    ]);

    res.json({
      jobs,
      pagination: {
        page: parseInt(page),
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single job (public)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment views
    job.views += 1;
    await job.save();

    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create job (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const job = new Job(req.body);
    await job.save();
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update job (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json(job);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete job (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    res.json({ success: true, message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
