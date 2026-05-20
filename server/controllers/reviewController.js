// server/controllers/reviewController.js
const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  try {
    const { restaurantId, text, rating } = req.body;
    const rv = await Review.create({
      restaurant:    restaurantId,
      user:          req.user.id,
      first_name:    req.user.first_name,
      last_name:     req.user.last_name,
      text,
      rating
    });
    res.status(201).json(rv);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(400).json({ message: error.message });
  }
};
