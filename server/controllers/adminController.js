// server/controllers/adminController.js
const Booking    = require('../models/Booking');
const Restaurant = require('../models/Restaurant');

exports.getAnalytics = async (req, res) => {
  try {
    // 1) Calculate date 30 days ago
    const now       = new Date();
    const thirtyAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 2) Aggregate daily bookings
    const daily = await Booking.aggregate([
      { $match: { booking_time: { $gte: thirtyAgo, $lte: now } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$booking_time" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id": 1 } },
      {
        $project: {
          _id:   0,
          date:  "$_id",
          count: 1
        }
      }
    ]);

    // 3) Aggregate top 5 restaurants by bookings
    const topRestaurants = await Booking.aggregate([
      { $match: { booking_time: { $gte: thirtyAgo, $lte: now } } },
      {
        $group: {
          _id:   "$restaurant",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from:         "restaurants",
          localField:   "_id",
          foreignField: "_id",
          as:           "restaurant"
        }
      },
      { $unwind: "$restaurant" },
      {
        $project: {
          _id:           0,
          restaurantId:  "$_id",
          name:          "$restaurant.name",
          count:         1
        }
      }
    ]);

    return res.json({ dailyBookings: daily, topRestaurants });
  } catch (err) {
    console.error("Analytics error:", err);
    return res.status(500).json({ message: "Server error fetching analytics." });
  }
};
