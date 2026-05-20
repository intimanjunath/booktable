const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Location = require('../models/Location');
const Cuisine = require('../models/Cuisine');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const filePath = path.join(__dirname, 'cleaned-restaurants-eastbay.json');
const rawData = fs.readFileSync(filePath, 'utf-8');
const restaurants = JSON.parse(rawData);

const uniqueLocations = new Set();
const uniqueCuisines = new Set();

restaurants.forEach(r => {
  // Extract city from address
  const parts = r.address.split(',');
  const city = parts.length > 1 ? parts[1].trim() : 'Unknown';
  uniqueLocations.add(city);

  if (r.cuisineType) uniqueCuisines.add(r.cuisineType.trim());
});

(async () => {
  await mongoose.connect(process.env.DB_URI);
  console.log('✅ Connected to MongoDB');

  try {
    const locationDocs = Array.from(uniqueLocations).map(name => ({ name }));
    const cuisineDocs = Array.from(uniqueCuisines).map(name => ({ name }));

    const insertedLocations = await Location.insertMany(locationDocs, { ordered: false });
    const insertedCuisines = await Cuisine.insertMany(cuisineDocs, { ordered: false });

    console.log(`📍 Inserted ${insertedLocations.length} locations`);
    console.log(`🍽️ Inserted ${insertedCuisines.length} cuisines`);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  }

  await mongoose.disconnect();
})();
