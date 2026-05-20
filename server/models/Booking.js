// server/models/Booking.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingSchema = new Schema({
  number_of_people: { type: Number, required: true },
  booking_time: { type: Date, required: true },
  booker_email: { type: String, required: true },
  booker_phone: { type: String, required: true },
  booker_first_name: { type: String, required: true },
  booker_last_name: { type: String, required: true },
  booker_occasion: { type: String },
  booker_request: { type: String },
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Booking', bookingSchema);
