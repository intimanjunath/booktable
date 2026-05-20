// server/routes/adminRoutes.js
const express  = require('express');
const auth     = require('../middleware/authMiddleware');
const role     = require('../middleware/roleMiddleware');
const { getAnalytics } = require('../controllers/adminController');

const router = express.Router();

// Protect everything under here as Admin-only
router.use(auth, role('Admin'));

// GET /api/admin/analytics
router.get('/analytics', getAnalytics);

module.exports = router;
