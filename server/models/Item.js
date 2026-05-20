// server/models/Item.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const itemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String },
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Item', itemSchema);
