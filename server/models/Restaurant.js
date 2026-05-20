// server/models/Restaurant.js
const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  address:      { type: String, required: true },
  contactInfo:  { type: String },
  hours:        { type: String },
  cuisineType:  { type: String },
  costRating:   { type: String, enum: ['CHEAP','REGULAR','EXPENSIVE'] },
  description:  { type: String },
  main_image:   { type: String },
  images:       [{ type: String }],
  tableSizes: [{
    size: { type: Number, required: true },
    count: { type: Number, required: true }
  }],  
  availableTimes: [{ type: String, required: true }],
  seeded: { type: Boolean, default: false },
  slug:         { type: String, unique: true },
  price:        { type: String, enum: ['CHEAP','REGULAR','EXPENSIVE'] },

  location:     { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  cuisine:      { type: mongoose.Schema.Types.ObjectId, ref: 'Cuisine', required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviews:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  bookings:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  tables:       [{ type: mongoose.Schema.Types.ObjectId, ref: 'Table' }],

  status:       { type: String, enum: ['Pending','Approved','Rejected'], default: 'Pending' },
  locationCoords: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },

  googlePlaceId: { type: String, required: true, unique: true },

  created_at:   { type: Date, default: Date.now },
  updated_at:   { type: Date, default: Date.now }
});

restaurantSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
