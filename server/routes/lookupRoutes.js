// server/routes/lookupRoutes.js
const router = require('express').Router();
const {
  listLocations,
  listCuisines
} = require('../controllers/lookupController');

router.get('/locations', listLocations);
router.get('/cuisines',  listCuisines);

module.exports = router;
