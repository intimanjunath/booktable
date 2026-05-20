const { sendEmail } = require('../services/emailService');
const amqplib = require('amqplib');
const Booking = require('../models/Booking');
const Table = require('../models/Table');
const BookingsOnTables = require('../models/BookingsOnTables');
const Restaurant = require('../models/Restaurant');
const { getAvailableTables } = require('../utils/availabilityUtils');
const QUEUE_NAME = 'sms_notifications';

// ✅ Create Booking API
exports.createBooking = async (req, res) => {
  try {
    const { restaurantId, number_of_people, booking_time, special_requests, tables = [] } = req.body;
    if (!restaurantId || !number_of_people || !booking_time) {
      return res.status(400).json({ message: 'Missing required fields: restaurantId, number_of_people, or booking_time.' });
    }
    const bookingTime = new Date(booking_time);
    if (isNaN(bookingTime) || bookingTime < new Date()) {
      return res.status(400).json({ message: 'Invalid or past booking time.' });
    }

    // 🔍 Fetch the restaurant to check availableTimes
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    // 🕓 Validate that the booking_time is within ±30 minutes of allowed slots
    const inputMin = bookingTime.getHours() * 60 + bookingTime.getMinutes();
    const isTimeAllowed = restaurant.availableTimes.some(t => {
      const [h, m] = t.split(':').map(Number);
      const slotMin = h * 60 + m;
      return Math.abs(inputMin - slotMin) <= 30;
    });

    if (!isTimeAllowed) {
      return res.status(400).json({
        message: `Time not allowed. Please select a time within 30 minutes of these: ${restaurant.availableTimes.join(', ')}`
      });
    }

    // 🔎 Find available tables
    const availableTables = await getAvailableTables(
      restaurantId,
      bookingTime,
      number_of_people
    );

    if (availableTables.length === 0) {
      return res.status(400).json({ message: 'No available tables at requested time.' });
    }

    // 📌 Use smallest fitting table or provided ones (validated)
    const tableIds = tables.length
      ? tables.filter(tid => availableTables.map(t => t._id.toString()).includes(tid))
      : [availableTables[0]._id];

    if (!tableIds.length) {
      return res.status(400).json({ message: 'Requested tables are not available.' });
    }

    // 💾 Save the booking
    const booking = new Booking({
      restaurant: restaurantId,
      number_of_people,
      booking_time: bookingTime,
      booker_email: req.user.email,
      booker_phone: req.user.phone,
      booker_first_name: req.user.first_name,
      booker_last_name: req.user.last_name,
      special_requests: special_requests || '',
      status: 'CONFIRMED'
    });

    const savedBooking = await booking.save();

    // 🪑 Link to tables
    await Promise.all(
      tableIds.map(tid =>
        BookingsOnTables.create({ booking: booking._id, table: tid })
      )
    );

    // 📧 Send confirmation email
    if (req.user.email) {
      try {
        // Format booking time nicely for the email
        const formattedTime = new Date(booking.booking_time).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short', 
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        });

        const emailSubject = 'Your Restaurant Reservation Confirmation';
        const emailMessage = `
          Dear ${req.user.first_name || req.user.name || 'Customer'},
          
          Your reservation at ${restaurant.name} has been confirmed!
          
          Details:
          - Date/Time: ${formattedTime}
          - Party Size: ${number_of_people} people
          - Booking Reference: ${booking._id.toString().slice(-6)}
          
          ${special_requests ? `Special Requests: ${special_requests}` : ''}
          
          If you need to cancel this reservation, please login to your account.
          
          Thank you for using BookTable!
        `;
        
        sendEmail(req.user.email, emailSubject, emailMessage)
          .catch(err => console.error('Email sending error:', err));
      } catch (err) {
        console.error('Email preparation error:', err);
        // Don't fail the API call if email fails
      }
    }

    return res.status(201).json({ message: 'Booking successful', booking: savedBooking });
  } catch (err) {
    console.error('❌ Booking error:', err);
    return res.status(500).json({ message: 'Server error during booking.' });
  }
};

// 📜 List User Bookings API
exports.listUserBookings = async (req, res) => {
  try {
    const userEmail = req.user?.email;
    if (!userEmail) {
      return res.status(401).json({ message: 'Unauthorized: Missing user info in token.' });
    }

    const bookings = await Booking.find({ booker_email: userEmail })
      .populate('restaurant', 'name main_image location price cuisine');

    res.json({
      email: userEmail,
      total: bookings.length,
      bookings
    });
  } catch (err) {
    console.error('❌ Error fetching user bookings:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
  
// ❌ Cancel Booking API
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;

    // 🔐 Validate booking belongs to current user
    const booking = await Booking.findOne({
      _id: bookingId,
      booker_email: req.user.email
    }).populate('restaurant', 'name');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found or not owned by user.' });
    }

    // Get restaurant name and booking time for the SMS
    const restaurantName = booking.restaurant.name;
    const bookingTime = new Date(booking.booking_time).toLocaleString();

    // 🪑 Delete associated entries in BookingsOnTables
    await BookingsOnTables.deleteMany({ booking: bookingId });

    // Format the booking time for display
    const formattedTime = new Date(booking.booking_time).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });

    // 📧 Send cancellation email
    if (req.user.email) {
      try {
        const emailSubject = 'Your Restaurant Reservation Cancellation';
        const emailMessage = `
          Dear ${req.user.first_name},
          
          Your reservation at ${restaurantName} for ${formattedTime} has been cancelled.
          
          Booking Reference: ${booking._id.toString().slice(-6)}
          
          Thank you for using BookTable.
        `;
        
        sendEmail(req.user.email, emailSubject, emailMessage)
          .catch(err => console.error('Email sending error:', err));
      } catch (err) {
        console.error('Email preparation error:', err);
        // Don't fail the API call if email fails
      }
    }

    // 🧹 Delete the booking itself
    await Booking.findByIdAndDelete(bookingId);

    // ✅ Respond to client
    res.status(200).json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    console.error('❌ Cancel booking error:', err);
    res.status(500).json({ message: 'Server error while cancelling booking.' });
  }
};
