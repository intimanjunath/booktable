// server/routes/authRoutes.js
const express = require('express');
const auth    = require('../middleware/authMiddleware');
const role    = require('../middleware/roleMiddleware');

const {
  registerUser,
  loginUser,
  registerManager
} = require('../controllers/authController');

const router = express.Router();

// Public
router.post('/register', registerUser);
router.post('/login',    loginUser);

// Admin-only: create RestaurantManager
router.post(
  '/register-manager',
  auth,
  role('Admin'),
  registerManager
);

module.exports = router;
