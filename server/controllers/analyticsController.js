// server/controllers/analyticsController.js
const Booking = require('../models/Booking');

exports.bookingsLastMonth = async (req, res) => {
  try {
    const end   = new Date();
    const start = new Date();
    start.setMonth(end.getMonth() - 1);

    const data = await Booking.aggregate([
      { $match: { created_at: { $gte: start, $lte: end } } },
      { $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$created_at" } },
          count: { $sum: 1 }
      }},
      { $sort: { "_id": 1 } }
    ]);

    res.json(data); // [{ _id: "2025-03-22", count: 5 }, …]
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: error.message });
  }
};
