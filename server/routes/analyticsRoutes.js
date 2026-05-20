// server/routes/analyticsRoutes.js
const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const role   = require('../middleware/roleMiddleware');
const { bookingsLastMonth } = require('../controllers/analyticsController');

router.get(
  '/analytics/bookings',
  auth,
  role('Admin'),
  bookingsLastMonth
);

module.exports = router;
