// server/models/Review.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  text: { type: String, required: true },
  rating: { type: Number, required: true },
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Review', reviewSchema);
