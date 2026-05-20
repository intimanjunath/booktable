// server/models/BookingsOnTables.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const bookingsOnTablesSchema = new Schema({
  booking: { type: Schema.Types.ObjectId, ref: 'Booking', required: true },
  table: { type: Schema.Types.ObjectId, ref: 'Table', required: true }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
});

// Composite unique index on booking + table
bookingsOnTablesSchema.index({ booking: 1, table: 1 }, { unique: true });

module.exports = mongoose.model('BookingsOnTables', bookingsOnTablesSchema);
