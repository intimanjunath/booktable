// server/routes/reviewRoutes.js
const router = require('express').Router();
const auth   = require('../middleware/authMiddleware');
const { createReview } = require('../controllers/reviewController');

router.post('/', auth, createReview);

module.exports = router;
