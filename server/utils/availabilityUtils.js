// server/utils/availabilityUtils.js
const Booking = require('../models/Booking');
const Table = require('../models/Table');
const BookingsOnTables = require('../models/BookingsOnTables');

async function getAvailableTables(restaurantId, targetTime, peopleCount) {
  // Get all tables for this restaurant
  const allTables = await Table.find({ restaurant: restaurantId });

  // Get all bookings within ±30 minutes of target time
  const timeWindowStart = new Date(targetTime.getTime() - 30 * 60 * 1000);
  const timeWindowEnd = new Date(targetTime.getTime() + 30 * 60 * 1000);

  const conflictingBookings = await Booking.find({
    restaurant: restaurantId,
    booking_time: { $gte: timeWindowStart, $lte: timeWindowEnd }
  });

  const conflictingBookingIds = conflictingBookings.map(b => b._id);

  const bookedTables = await BookingsOnTables.find({
    booking: { $in: conflictingBookingIds }
  }).distinct('table');

  // Convert bookedTables ObjectIds to strings for comparison
  const bookedTableIds = new Set(bookedTables.map(id => id.toString()));

  // Return available tables
  return allTables
    .filter(t => !bookedTableIds.has(t._id.toString()))
    .filter(t => t.seats >= peopleCount)
    .sort((a, b) => a.seats - b.seats);
}

module.exports = { getAvailableTables };
