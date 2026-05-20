// server/routes/bookingRoutes.js
const express = require('express');
const auth = require('../middleware/authMiddleware');
const {
  listUserBookings,
  createBooking,
  cancelBooking
} = require('../controllers/bookingController');

const router = express.Router();

// All booking routes require authentication
router.use(auth);

// List this user’s bookings
router.get('/', listUserBookings);

// Create a new booking
router.post('/', createBooking);

// Cancel a booking
router.delete('/:id', cancelBooking);

module.exports = router;
