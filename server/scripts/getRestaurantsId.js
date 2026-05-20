// scripts/getRestaurantIds.js
require('dotenv').config();
const mongoose = require('mongoose');
const Restaurant = require('../models/Restaurant');

const MONGO_URI = process.env.DB_URI;

async function getRestaurantIds() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const restaurants = await Restaurant.find({}, '_id'); // get only _id and name

    const ids = restaurants.map(r => r._id.toString());

    console.log('📋 Unique Restaurant IDs:\n');
    restaurants.forEach(r => {
      console.log(`${r.name}: ${r._id}`);
    });

    console.log(`\n✅ Total: ${ids.length} unique restaurants found.`);
    process.exit(0);
  } catch (err) {
    console.error('❌ Error fetching restaurant IDs:', err);
    process.exit(1);
  }
}

getRestaurantIds();
