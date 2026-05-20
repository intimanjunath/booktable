const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // <-- Load .env

const Restaurant = require('../models/Restaurant');
const Location = require('../models/Location');
const Cuisine = require('../models/Cuisine');

const MONGO_URI = process.env.DB_URI;

if (!MONGO_URI) {
  console.error('❌ DB_URI not found in environment variables');
  process.exit(1);
}

async function fixLocationReferences() {
  const locations = await Location.find({});
  for (const loc of locations) {
    const restaurants = await Restaurant.find({ location: loc._id }, '_id');
    loc.restaurants = restaurants.map(r => r._id);
    await loc.save();
  }
}

async function fixCuisineReferences() {
  const cuisines = await Cuisine.find({});
  for (const cui of cuisines) {
    const restaurants = await Restaurant.find({ cuisine: cui._id }, '_id');
    cui.restaurants = restaurants.map(r => r._id);
    await cui.save();
  }
}

(async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await fixLocationReferences();
    await fixCuisineReferences();

    console.log('🎉 Location and Cuisine references updated');
  } catch (err) {
    console.error('❌ Error updating references:', err);
  } finally {
    mongoose.connection.close();
  }
})();
