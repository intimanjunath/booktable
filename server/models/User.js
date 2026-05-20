// server/models/User.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  city: { type: String },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  role:       { 
    type: String, 
    enum: ['Customer','RestaurantManager','Admin'], 
    default: 'Customer' 
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('User', userSchema);
