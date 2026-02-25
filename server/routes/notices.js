const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const Notice = require('../models/Notice');
const { requireAdmin } = require('../middleware/adminAuth');

// Multer setup
const UPLOADS_ROOT = process.env.UPLOADS_ROOT || path.join(__dirname, '../uploads');
const uploadDir = path.join(UPLOADS_ROOT, 'notices');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB per file
});

// Get all notices (public)
router.get('/', async (req, res) => {
  try {
    const { category, limit, page = 1 } = req.query;
    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    const pageSize = parseInt(limit) || 20;
    const skip = (parseInt(page) - 1) * pageSize;

    const [notices, total] = await Promise.all([
      Notice.find(query)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Notice.countDocuments(query)
    ]);

    res.json({
      notices,
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

// Get single notice (public)
router.get('/:id', async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Increment views
    notice.views += 1;
    await notice.save();

    res.json(notice);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create notice (admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const notice = new Notice(req.body);
    await notice.save();
    res.status(201).json(notice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update notice (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const notice = await Notice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    res.json(notice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete notice (admin) - also removes attachment files
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ error: 'Notice not found' });
    }

    // Delete attachment files from disk
    for (const att of notice.attachments) {
      const filePath = path.join(UPLOADS_ROOT, att.path.replace(/^\/uploads/, ''));
      if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch {}
      }
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notice deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload attachments to existing notice (admin)
router.post('/:id/attachments', requireAdmin, upload.array('files', 10), async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      // Clean up uploaded files
      (req.files || []).forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
      return res.status(404).json({ error: 'Notice not found' });
    }

    const newAttachments = (req.files || []).map(file => ({
      filename: file.filename,
      originalName: file.originalname,
      path: `/uploads/notices/${file.filename}`,
      size: file.size
    }));

    notice.attachments.push(...newAttachments);
    await notice.save();
    res.json(notice);
  } catch (error) {
    (req.files || []).forEach(f => { try { fs.unlinkSync(f.path); } catch {} });
    res.status(500).json({ error: error.message });
  }
});

// Delete specific attachment (admin)
router.delete('/:id/attachments/:attachmentId', requireAdmin, async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) return res.status(404).json({ error: 'Notice not found' });

    const attachment = notice.attachments.id(req.params.attachmentId);
    if (!attachment) return res.status(404).json({ error: 'Attachment not found' });

    const filePath = path.join(UPLOADS_ROOT, attachment.path.replace(/^\/uploads/, ''));
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch {}
    }

    attachment.deleteOne();
    await notice.save();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
