const requireAdmin = (req, res, next) => {
  if (!req.session || !req.session.isAdmin) {
    return res.status(401).json({ error: '인증이 필요합니다' });
  }
  next();
};

const optionalAdmin = (req, res, next) => {
  req.isAdmin = !!(req.session && req.session.isAdmin);
  next();
};

module.exports = { requireAdmin, optionalAdmin };
