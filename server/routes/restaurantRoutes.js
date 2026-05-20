// server/routes/restaurantRoutes.js
const express    = require('express');
const auth       = require('../middleware/authMiddleware');
const role       = require('../middleware/roleMiddleware');
const controller = require('../controllers/restaurantController');

const {
  getRestaurants,
  searchRestaurants,
  getRestaurantById,
  getItems,
  getReviews,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  approveRestaurant,
  getRestaurantAvailability,
  getPendingRestaurants,
  getMyRestaurants   
} = controller;

const router = express.Router();

// Public
router.get('/search',     searchRestaurants);
router.get('/',           getRestaurants);

// Admin - View pending restaurants
router.get(
  '/pending',
  auth,
  role('Admin'),
  getPendingRestaurants
);
// Admin
router.delete(
  '/:id', 
  auth, 
  role('Admin'), 
  deleteRestaurant
);
router.put(
  '/:id/approve', 
  auth, 
  role('Admin'), 
  approveRestaurant
);
// Manager-only: Get my restaurants (must be before /:id!)
router.get(
  '/my',
  auth,
  role('RestaurantManager'),
  getMyRestaurants
);

// Admin - View all restaurants (optionally filtered by status)
router.get(
  '/',
  auth,
  role('Admin'),
  getRestaurants
);


// Check availability for a specific restaurant
router.get('/:id/availability', getRestaurantAvailability);
router.get('/:id/items',  getItems);
router.get('/:id/reviews',getReviews);
router.get('/:id',        getRestaurantById);

// Manager-only create/update
router.post(
  '/', 
  auth, 
  role('RestaurantManager'), 
  createRestaurant
);
router.put(
  '/:id', 
  auth, 
  role('RestaurantManager'), 
  updateRestaurant
);


module.exports = router;
