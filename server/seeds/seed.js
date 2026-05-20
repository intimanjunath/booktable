// server/seeds/seed.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load environment variables from project root .env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import models
const User = require('../models/User');
const Location = require('../models/Location');
const Cuisine = require('../models/Cuisine');
const Restaurant = require('../models/Restaurant');
const Item = require('../models/Item');
const Table = require('../models/Table');
const Booking = require('../models/Booking');
const Review = require('../models/Review');
const BookingsOnTables = require('../models/BookingsOnTables');

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Location.deleteMany({}),
      Cuisine.deleteMany({}),
      Restaurant.deleteMany({}),
      Item.deleteMany({}),
      Table.deleteMany({}),
      Booking.deleteMany({}),
      Review.deleteMany({}),
      BookingsOnTables.deleteMany({})
    ]);
    console.log('🧹 Cleared existing data');

    // — Add this block to create an initial Admin user —
    const adminHash = await bcrypt.hash('admin123', 10);
    await User.create({
      first_name: 'Priya',
      last_name:  'patel',
      email:      'Priya@admin.com',
      password:   adminHash,
      phone:      '001-000-0000',
      city:       'HQ',
      role:       'Admin'
    });
    console.log('👤 Admin user seeded');

    // Seed Locations
    const locationsData = [
      { name: 'San Francisco' },
      { name: 'New York' }
    ];
    const locations = await Location.insertMany(locationsData);
    console.log('📍 Locations seeded');

    // Seed Cuisines
    const cuisinesData = [
      { name: 'French' },
      { name: 'Japanese' }
    ];
    const cuisines = await Cuisine.insertMany(cuisinesData);
    console.log('🍽️ Cuisines seeded');

    // Seed Users
    const usersData = [
      {
        first_name: 'Alice',
        last_name: 'Johnson',
        city: 'San Francisco',
        password: 'password123',
        email: 'alice.johnson@example.com',
        phone: '415-555-0123'
      },
      {
        first_name: 'Michael',
        last_name: 'Smith',
        city: 'New York',
        password: 'password123',
        email: 'michael.smith@example.com',
        phone: '212-555-0456'
      }
    ];
    const users = await User.insertMany(usersData);
    console.log('👥 Users seeded');

    // Seed Restaurants
    const restaurantsData = [
        {
          name:           'The French Laundry',
          address:        '6640 Washington St, Yountville, CA 94599',
          contactInfo:    '707-944-2380',
          hours:          '12:00 PM - 9:00 PM',
          cuisineType:    'French',
          costRating:     'EXPENSIVE',
          description:    'World-renowned for its exquisite French tasting menus.',
          main_image:     'https://example.com/french_laundry_main.jpg',
          images:         [
            'https://example.com/french_laundry_1.jpg',
            'https://example.com/french_laundry_2.jpg'
          ],
          slug:           'the-french-laundry',
          price:          'EXPENSIVE',
      
          // ← THESE MUST BE HERE
          status:         'Approved',
          tableSizes:     [2, 4, 6],
          availableTimes: ['18:00', '19:30', '21:00'],
      
          location:       locations[0]._id,
          cuisine:        cuisines[0]._id
        },
        {
          name:           'Sushi Nakazawa',
          address:        '63 W 56th St, New York, NY 10019',
          contactInfo:    '212-555-0456',
          hours:          '5:00 PM - 11:00 PM',
          cuisineType:    'Japanese',
          costRating:     'EXPENSIVE',
          description:    'Elegant sushi omakase experience in NYC.',
          main_image:     'https://example.com/sushi_nakazawa_main.jpg',
          images:         [ 'https://example.com/sushi_nakazawa_1.jpg' ],
          slug:           'sushi-nakazawa',
          price:          'EXPENSIVE',
      
          // ← AND HERE
          status:         'Approved',
          tableSizes:     [2, 4],
          availableTimes: ['18:30', '20:00', '21:30'],
      
          location:       locations[1]._id,
          cuisine:        cuisines[1]._id
        }
      ];
      
      const restaurants = await Restaurant.insertMany(restaurantsData);
      console.log('🏨 Restaurants seeded');

    // Seed Items
    const itemsData = [
      { name: 'Oysters and Pearls', price: '120', description: 'Caviar-topped oysters.', restaurant: restaurants[0]._id },
      { name: 'Truffle Pasta', price: '95', description: 'Handmade pasta with black truffles.', restaurant: restaurants[0]._id },
      { name: 'Omakase Set', price: '150', description: 'Chef’s selection of 20 pieces.', restaurant: restaurants[1]._id }
    ];
    const items = await Item.insertMany(itemsData);
    console.log('🍴 Items seeded');

    // Seed Tables
    const tablesData = [];
    restaurants.forEach((rest) => {
      tablesData.push(
        { seats: 2, restaurant: rest._id },
        { seats: 4, restaurant: rest._id }
      );
    });
    const tables = await Table.insertMany(tablesData);
    console.log('🪑 Tables seeded');

    // Seed Bookings
    const bookingsData = [
      {
        number_of_people: 2,
        booking_time: new Date('2025-04-15T18:30:00Z'),
        booker_email: users[0].email,
        booker_phone: users[0].phone,
        booker_first_name: users[0].first_name,
        booker_last_name: users[0].last_name,
        restaurant: restaurants[0]._id
      },
      {
        number_of_people: 4,
        booking_time: new Date('2025-04-16T19:00:00Z'),
        booker_email: users[1].email,
        booker_phone: users[1].phone,
        booker_first_name: users[1].first_name,
        booker_last_name: users[1].last_name,
        restaurant: restaurants[1]._id
      }
    ];
    const bookings = await Booking.insertMany(bookingsData);
    console.log('📅 Bookings seeded');

    // Seed Reviews
    const reviewsData = [
      {
        first_name: users[0].first_name,
        last_name: users[0].last_name,
        text: 'Incredible flavors and impeccable service.',
        rating: 5,
        restaurant: restaurants[0]._id,
        user: users[0]._id
      },
      {
        first_name: users[1].first_name,
        last_name: users[1].last_name,
        text: 'A sushi experience like no other!',
        rating: 5,
        restaurant: restaurants[1]._id,
        user: users[1]._id
      }
    ];
    const reviews = await Review.insertMany(reviewsData);
    console.log('📝 Reviews seeded');

    // Seed BookingsOnTables (link each booking to one table)
    const bookingsOnTablesData = bookings.map((bk, idx) => ({
      booking: bk._id,
      table: tables[idx * 2]._id // assign first table of each restaurant
    }));
    await BookingsOnTables.insertMany(bookingsOnTablesData);
    console.log('🔗 BookingsOnTables seeded');

    // Close connection
    await mongoose.connection.close();
    console.log('🔒 Database connection closed. Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seedDatabase();
