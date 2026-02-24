const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../../middleware/adminAuth');

// Get settings
router.get('/', requireAdmin, (req, res) => {
  res.json({
    siteName: '한양대학교 정보시스템학과',
    adminEmail: 'admin@hanyang.ac.kr'
  });
});

// Update settings
router.put('/', requireAdmin, (req, res) => {
  // TODO: Implement settings update
  res.json({ success: true, message: 'Settings updated' });
});

module.exports = router;
