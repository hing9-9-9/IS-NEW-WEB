const express = require('express');
const router = express.Router();

// Build accounts list from environment variables
function getAdminAccounts() {
  const accounts = [];
  for (let i = 1; i <= 10; i++) {
    const id = process.env[`ADMIN_USER_${i}_ID`];
    const pw = process.env[`ADMIN_USER_${i}_PW`];
    if (id && pw) {
      accounts.push({ id, pw });
    }
  }
  return accounts;
}

// Login
router.post('/login', (req, res) => {
  const { id, password } = req.body;

  if (!id || !password) {
    return res.status(400).json({ error: 'ID와 비밀번호를 입력해주세요' });
  }

  const accounts = getAdminAccounts();
  const account = accounts.find((acc) => acc.id === id && acc.pw === password);

  if (!account) {
    return res.status(401).json({ error: '잘못된 ID 또는 비밀번호입니다' });
  }

  req.session.isAdmin = true;
  req.session.adminId = id;
  res.json({ success: true, message: 'Logged in successfully' });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

// Check session status
router.get('/session', (req, res) => {
  res.json({
    isLoggedIn: !!req.session.isAdmin,
    adminId: req.session.adminId || null,
  });
});

module.exports = router;
