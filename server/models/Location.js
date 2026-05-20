// server/models/Location.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const locationSchema = new Schema({
  name: { type: String, required: true, unique: true },
  restaurants: [{ type: Schema.Types.ObjectId, ref: 'Restaurant' }],
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Location', locationSchema);
