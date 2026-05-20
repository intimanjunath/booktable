// server/controllers/restaurantController.js
const axios      = require('axios');
const Restaurant = require('../models/Restaurant');
const Location   = require('../models/Location');
const Item       = require('../models/Item');
const Review     = require('../models/Review');
const Booking    = require('../models/Booking');
const Table      = require('../models/Table');
const Cuisine    = require('../models/Cuisine');
const { getAvailableTables } = require('../utils/availabilityUtils');
const BookingsOnTables = require('../models/BookingsOnTables');

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Helper to check ±30m window
function withinWindow(time, target, minutes = 30) {
  const toMin = t => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };
  return Math.abs(toMin(time) - toMin(target)) <= minutes;
}

// 1. List all approved restaurants
exports.getRestaurants = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const all = await Restaurant.find({ status: 'Approved' })
      .populate('cuisine')
      .populate('location');
    res.json(all);
  } catch (err) {
    console.error('Error fetching all restaurants:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.searchRestaurants = async (req, res) => {
  const { location: locName, time, people, zip, state } = req.query;

  try {
    if (!time || !people) {
      return res.status(400).json({ message: 'Time and number of people are required.' });
    }

    // 1. Resolve Location if filters are passed
    let loc = null;
    const locFilter = {};
    const toFlexibleRegex = (str) => {
      return new RegExp(
        '^' +
          str
            .trim()
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape special chars
            .replace(/\s*/g, '\\s*')                // normalize spaces
          + '$',
        'i'
      );
    };
    if (locName) locFilter.name = toFlexibleRegex(locName);
    if (zip)     locFilter.zip = zip;
    if (state)   locFilter.state = toFlexibleRegex(state);
    if (Object.keys(locFilter).length) {
      loc = await Location.findOne(locFilter);
      if (!loc) return res.status(404).json({ message: 'Location not found.' });
    }

    // 2. Find approved restaurants in that location
    const filter = { status: 'Approved' };
    if (loc) filter.location = loc._id;

    let rests = await Restaurant.find(filter)
      .populate('cuisine')
      .populate('reviews');

    const filtered = [];

    // Helper: build PST time object
    const getPSTDateTime = (hhmm) => {
      const [hours, minutes] = hhmm.split(':').map(Number);
      const now = new Date();
      const pstNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
      pstNow.setHours(hours, minutes, 0, 0);
      return pstNow;
    };

    // Helper: convert any date to PST-local date string
    const toLocalDateString = (date) => {
      return new Date(date).toLocaleDateString('en-CA', {
        timeZone: 'America/Los_Angeles'
      });
    };

    const todayLocal = toLocalDateString(new Date());

    // 3. Filter each restaurant by static table/time config + real-time availability
    for (const r of rests) {
      const isTimeAllowed =
        Array.isArray(r.availableTimes) &&
        r.availableTimes.some(t => withinWindow(t, time));

      const isTableSizeValid =
        Array.isArray(r.tableSizes) &&
        r.tableSizes.some(entry => entry.size >= Number(people));

      if (!isTimeAllowed || !isTableSizeValid) continue;

      const targetTime = getPSTDateTime(time);

      const availableTables = await getAvailableTables(
        r._id,
        targetTime,
        Number(people)
      );

      if (availableTables.length > 0) {
        // ✅ Fetch bookings for this restaurant
        const bookings = await Booking.find({ restaurant: r._id });

        // ✅ Filter bookings for today (in PST)
        const bookingsToday = bookings.filter(b =>
          toLocalDateString(b.booking_time) === todayLocal
        );

        filtered.push({
          restaurant: r,
          availableTables,
          bookingsTodayCount: bookingsToday.length
        });
      }
    }

    // 4. Format response
    const output = filtered.map(({ restaurant: r, availableTables, bookingsTodayCount }) => {
      const avgRating =
        r.reviews.reduce((sum, rv) => sum + rv.rating, 0) / (r.reviews.length || 1);

      return {
        id: r._id.toString(),
        name: r.name,
        main_image: r.main_image,
        cuisine: r.cuisine.name,
        price: r.price,
        reviewsCount: r.reviews.length,
        avgRating: avgRating,
        bookingsCount: bookingsTodayCount,
        availableTimes: r.availableTimes,
        locationCoords: r.locationCoords,
        googlePlaceId: r.googlePlaceId,
        description: r.description
      };
    });

    res.json(output);

  } catch (error) {
    console.error('❌ Search API Error:', error);
    res.status(500).json({
      message: 'An unexpected error occurred while processing the search request.',
      error: error.message
    });
  }
};



exports.getRestaurantAvailability = async (req, res) => {
  try {
    const { date, time, tableSize } = req.query;
    if (!time || !tableSize) {
      return res.status(400).json({ message: "Time and number of people are required." });
    }

    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant || restaurant.status !== 'Approved') {
      return res.status(404).json({ message: 'Restaurant not found or not approved.' });
    }

    // Validate input time
    const parsedTime = new Date(`${new Date().toDateString()} ${time}`);
    const availableTables = await getAvailableTables(
      restaurant._id,
      parsedTime,
      Number(tableSize)
    );
    
    return res.json({
      restaurantId: restaurant._id,
      available: availableTables.length > 0,
      tables: availableTables.map(t => ({
        id: t._id,
        seats: t.seats
      }))
    });
  } catch (err) {
    console.error('Availability check error:', err);
    res.status(500).json({ message: 'Error checking availability.' });
  }
};
// 3. Get single restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const r = await Restaurant.findOne({
      _id: req.params.id,
      status: 'Approved'
    })
      .populate('cuisine')
      .populate('location')
      .populate('reviews')
      .populate('tables');

    if (!r) return res.status(404).json({ message: 'Restaurant not found.' });

    const avgRating =
      r.reviews.reduce((sum, rv) => sum + rv.rating, 0) / (r.reviews.length || 1);

    // ✅ Fetch bookings for this restaurant
    const bookings = await Booking.find({ restaurant: r._id });

    // ✅ Define PST-local date string formatter
    const toLocalDateString = (date) => {
      return new Date(date).toLocaleDateString('en-CA', {
        timeZone: 'America/Los_Angeles'
      });
    };

    const todayLocal = toLocalDateString(new Date());

    // ✅ Filter bookings for today (in PST)
    const bookingsToday = bookings.filter(b => {
      return toLocalDateString(b.booking_time) === todayLocal;
    });

    console.log("Today (PST):", todayLocal);
    bookings.forEach(b => {
      console.log("→", b.booking_time, "| Local:", toLocalDateString(b.booking_time));
    });

    const response = {
      id: r._id.toString(),
      name: r.name,
      main_image: r.main_image,
      cuisine: r.cuisine?.name || r.cuisineType || "N/A",
      price: r.price,
      reviewsCount: r.reviews.length,
      avgRating: parseFloat(avgRating.toFixed(1)),
      bookingsCount: bookingsToday.length,
      availableTimes: r.availableTimes,
      locationCoords: r.locationCoords,
      googlePlaceId: r.googlePlaceId,
      availableTables: r.tables.map(t => ({
        id: t._id.toString(),
        seats: t.seats
      }))
    };

    return res.json(response);
  } catch (error) {
    console.error('Fetch by ID error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// 4. Get menu items
exports.getItems = async (req, res) => {
  try {
    const items = await Item.find({ restaurant: req.params.id });
    res.json(items);
  } catch (error) {
    console.error('Get items error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// 5. Get reviews
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.id });
    res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// 6. Create restaurant (Manager)
exports.createRestaurant = async (req, res) => {
  try {
    const {
      name, address, contactInfo, hours,
      cuisineType, costRating, description,
      main_image, images = [], price,
      tableDistribution = [], availableTimes,
      location, cuisine, locationCoords, googlePlaceId
    } = req.body;

    if (!name || !address || !location || !cuisine || !tableDistribution.length || !availableTimes.length) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // 🔍 Resolve or create Location by name
    let locationDoc = await Location.findOne({ name: location });
    if (!locationDoc) {
      locationDoc = await Location.create({ name: location });
    }

    // 🔍 Resolve or create Cuisine by name
    let cuisineDoc = await Cuisine.findOne({ name: cuisine });
    if (!cuisineDoc) {
      cuisineDoc = await Cuisine.create({ name: cuisine });
    }

    // 🔒 Check for duplicate restaurant (name + address + location)
    const duplicate = await Restaurant.findOne({
      name,
      address,
      location: locationDoc._id
    });
    if (duplicate) {
      return res.status(400).json({ message: "Restaurant already exists at this location." });
    }

    // 🏗️ Create restaurant
    const restaurant = await Restaurant.create({
      name, address, contactInfo, hours,
      cuisineType, costRating, description,
      main_image, images, price,
      tableSizes: tableDistribution,
      availableTimes,
      location: locationDoc._id,
      cuisine: cuisineDoc._id,
      manager: req.user.id,
      locationCoords: locationCoords || { lat: 0, lng: 0 },
      googlePlaceId: googlePlaceId || `${name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(2)}`,
      slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Math.random().toString(36).slice(4, 8)}`,
      status: 'Pending'
    });

    // 🪑 Create tables
    const tablePromises = tableDistribution.flatMap(({ size, count }) =>
      Array.from({ length: count }, () =>
        Table.create({ seats: size, restaurant: restaurant._id })
      )
    );
    const createdTables = await Promise.all(tablePromises);

    // 🔗 Link tables to restaurant
    restaurant.tables = createdTables.map(t => t._id);
    await restaurant.save();

    // 🔁 Update locationDoc.restaurants[]
    if (!locationDoc.restaurants.includes(restaurant._id)) {
      locationDoc.restaurants.push(restaurant._id);
      await locationDoc.save();
    }

    // 🔁 Update cuisineDoc.restaurants[]
    if (!cuisineDoc.restaurants.includes(restaurant._id)) {
      cuisineDoc.restaurants.push(restaurant._id);
      await cuisineDoc.save();
    }

    res.status(201).json({ message: "Restaurant created", restaurant });
  } catch (err) {
    console.error('Create restaurant error:', err);
    res.status(500).json({ message: "Server error" });
  }
};

// 7. Update restaurant (Manager)
exports.updateRestaurant = async (req, res) => {
  try {
    const { name, address, contactInfo, hours, availableTimes, tableSizes, description, main_image, images } = req.body;

    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      manager: req.user.id
    });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found or unauthorized.' });
    }

    // ✅ Update basic fields
    if (name !== undefined) restaurant.name = name;
    if (address !== undefined) restaurant.address = address;
    if (contactInfo !== undefined) restaurant.contactInfo = contactInfo;
    if (hours !== undefined) restaurant.hours = hours;
    if (availableTimes !== undefined) restaurant.availableTimes = availableTimes;

    // ✅ New: Update description & images
    if (description !== undefined) restaurant.description = description;
    if (main_image !== undefined) restaurant.main_image = main_image;
    if (images !== undefined && Array.isArray(images)) restaurant.images = images;

    // ✅ If tableSizes are being updated, sync Table collection
    if (tableSizes !== undefined) {
      // Step 1: Delete all old tables for this restaurant
      await Table.deleteMany({ restaurant: restaurant._id });

      // Step 2: Create new tables based on the updated tableSizes
      const newTables = [];
      for (const { size, count } of tableSizes) {
        for (let i = 0; i < count; i++) {
          const table = await Table.create({ seats: size, restaurant: restaurant._id });
          newTables.push(table._id);
        }
      }

      // Step 3: Update both tableSizes summary and tables[] reference
      restaurant.tableSizes = tableSizes;
      restaurant.tables = newTables;
    }

    await restaurant.save();
    return res.json({ message: 'Restaurant updated successfully.', restaurant });
  } catch (error) {
    console.error('Update restaurant error:', error);
    return res.status(400).json({ message: error.message });
  }
};

// GET /api/restaurants/my (Manager only)
// 7. Get my restaurants (Manager)
exports.getMyRestaurants = async (req, res) => {
  try {
    const validStatuses = ['Pending', 'Approved', 'Rejected'];
    const query = { manager: req.user.id };

    if (req.query.status) {
      const statusParam = req.query.status.trim();
      if (!validStatuses.includes(statusParam)) {
        return res.status(400).json({
          message: `Invalid status '${statusParam}'. Allowed values: ${validStatuses.join(', ')}`
        });
      }
      query.status = statusParam;
    }

    const myRestaurants = await Restaurant.find(query)
      .populate('cuisine')
      .populate('location')
      .populate('tables')
      .populate('bookings')
      .populate('reviews');

    const formatted = myRestaurants.map(r => {
      const avgRating =
        r.reviews.reduce((sum, rv) => sum + rv.rating, 0) / (r.reviews.length || 1);

      return {
        id: r._id,
        name: r.name,
        main_image: r.main_image,
        status: r.status,
        cuisine: r.cuisine?.name || r.cuisineType || "N/A",
        price: r.price,
        availableTimes: r.availableTimes,
        bookingsCount: r.bookings.length,
        avgRating: parseFloat(avgRating.toFixed(1)),
        locationCoords: r.locationCoords,
        googlePlaceId: r.googlePlaceId
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error('Error fetching manager restaurants:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
// 8. Delete restaurant (Admin)
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found.' });
    }

    // Authorization check
    if (
      req.user.role !== 'Admin' &&
      restaurant.manager.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Forbidden.' });
    }

    const restaurantId = restaurant._id;

    // Delete all tables
    await Table.deleteMany({ restaurant: restaurantId });

    // Delete all reviews
    await Review.deleteMany({ restaurant: restaurantId });

    // Delete all bookings and cleanup related BookingsOnTables
    const bookings = await Booking.find({ restaurant: restaurantId });
    const bookingIds = bookings.map(b => b._id);
    await BookingsOnTables.deleteMany({ booking: { $in: bookingIds } });
    await Booking.deleteMany({ _id: { $in: bookingIds } });

    // Remove restaurant ID from Cuisine and Location collections
    await Cuisine.findByIdAndUpdate(restaurant.cuisine, {
      $pull: { restaurants: restaurantId }
    });

    await Location.findByIdAndUpdate(restaurant.location, {
      $pull: { restaurants: restaurantId }
    });

    // Finally, delete the restaurant
    await restaurant.deleteOne();

    res.json({ message: '✅ Restaurant and all associated data deleted.' });
  } catch (error) {
    console.error('❌ Delete restaurant error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

// 9. Approve restaurant (Admin)
exports.approveRestaurant = async (req, res) => {
  try {
    const r = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { status: 'Approved' },
      { new: true }
    );
    if (!r) return res.status(404).json({ message: 'Restaurant not found.' });
    res.json(r);
  } catch (error) {
    console.error('Approve error:', error);
    res.status(500).json({ message: error.message });
  }
};
// 10. List all pending restaurants (Admin)
exports.getPendingRestaurants = async (req, res) => {
  try {
    const pending = await Restaurant.find({ status: 'Pending' })
      .populate('cuisine')
      .populate('location');
    res.json(pending);
  } catch (err) {
    console.error('Error fetching pending restaurants:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};
