const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const Restaurant = require('../models/Restaurant');

const LOCATION_ID = new mongoose.Types.ObjectId('6812da2c9524078ce1c46457');
const CUISINE_ID  = new mongoose.Types.ObjectId('6812da2c9524078ce1c4645a');

const restaurants = [
  {
    _id: '6812da2e9524078ce1c46463',
    name: 'The French Laundry',
    address: '6640 Washington St, Yountville, CA 94599',
    contactInfo: '707-944-2380',
    hours: '12:00 PM - 9:00 PM',
    cuisineType: 'French',
    costRating: 'EXPENSIVE',
    description: 'World-renowned for its exquisite French tasting menus.',
    main_image: 'https://example.com/french_laundry_main.jpg',
    images: [
      'https://example.com/french_laundry_1.jpg',
      'https://example.com/french_laundry_2.jpg'
    ],
    slug: 'the-french-laundry',
    price: 'EXPENSIVE',
    tableSizes: [2, 4, 6],
    availableTimes: ['18:00', '19:30', '21:00'],
    locationCoords: { lat: 38.4043, lng: -122.3647 },
    googlePlaceId: 'french-laundry-123',
    location: LOCATION_ID,
    cuisine: CUISINE_ID,
    status: 'Approved',
    seeded: true,
    reviews: [],
    bookings: [],
    tables: []
  },
  {
    _id: '6812da2e9524078ce1c46464',
    name: 'Sushi Nakazawa',
    address: '63 W 56th St, New York, NY 10019',
    contactInfo: '212-889-0905',
    hours: '5:00 PM - 11:00 PM',
    cuisineType: 'Japanese',
    costRating: 'EXPENSIVE',
    description: 'Elegant sushi omakase experience in NYC.',
    main_image: 'https://example.com/sushi_nakazawa_main.jpg',
    images: ['https://example.com/sushi_nakazawa_1.jpg'],
    slug: 'sushi-nakazawa',
    price: 'EXPENSIVE',
    tableSizes: [2, 4],
    availableTimes: ['18:30', '20:00', '21:30'],
    locationCoords: { lat: 40.7634, lng: -73.9772 },
    googlePlaceId: 'sushi-nakazawa-456',
    location: LOCATION_ID,
    cuisine: CUISINE_ID,
    status: 'Approved',
    seeded: true,
    reviews: [],
    bookings: [],
    tables: []
  }
];

(async () => {
  await mongoose.connect(process.env.DB_URI);
  try {
    const result = await Restaurant.insertMany(restaurants, { ordered: false });
    console.log(`✅ Inserted ${result.length} restaurants`);
  } catch (err) {
    console.error('❌ Insert failed:', err.message);
  }
  await mongoose.disconnect();
})();
