// server/models/Table.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const tableSchema = new Schema({
  seats: { type: Number, required: true },
  restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

module.exports = mongoose.model('Table', tableSchema);
