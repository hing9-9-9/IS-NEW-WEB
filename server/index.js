const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
require('dotenv').config();

const app = express();

// Trust nginx reverse proxy (required for secure session cookies over HTTPS)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'is-web-admin-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 2 * 60 * 60 * 1000 // 2 hours
  }
}));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27108/is-web';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
const adminAuthRoutes = require('./routes/admin/auth');
const adminSettingsRoutes = require('./routes/admin/settings');
const noticesRoutes = require('./routes/notices');
const jobsRoutes = require('./routes/jobs');
const membersRoutes = require('./routes/members');
const facultyRoutes = require('./routes/faculty');
const labsRoutes = require('./routes/labs');
const careersRoutes = require('./routes/careers');
const heroSlidesRoutes = require('./routes/heroSlides');
const academicSchedulesRoutes = require('./routes/academicSchedules');
const graduationRequirementsRoutes = require('./routes/graduationRequirements');
const siteSettingsRoutes = require('./routes/siteSettings');
const studentCouncilRoutes = require('./routes/studentCouncil');
const uploadRoutes = require('./routes/upload');
const curriculumRoutes = require('./routes/curriculum');

app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/settings', adminSettingsRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/faculty', facultyRoutes);
app.use('/api/labs', labsRoutes);
app.use('/api/careers', careersRoutes);
app.use('/api/hero-slides', heroSlidesRoutes);
app.use('/api/academic-schedules', academicSchedulesRoutes);
app.use('/api/graduation-requirements', graduationRequirementsRoutes);
app.use('/api/settings', siteSettingsRoutes);
app.use('/api/student-council', studentCouncilRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/curriculum', curriculumRoutes);

// Health check
app.get('/api/health', async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    mongodb: mongoStatus
  });
});

const PORT = process.env.PORT || 8070;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
