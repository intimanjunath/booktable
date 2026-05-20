const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const RAW_FILE = path.resolve(__dirname, './restaurants-sanjose.json');
const CLEAN_FILE = path.resolve(__dirname, './restaurants-sanjose-cleaned.json');

const lat = 37.3382;
const lng = -121.8863;

async function fetchAndCleanRestaurants() {
  try {
    console.log('🌍 Fetching restaurant data for San Jose...');

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: `${lat},${lng}`,
          radius: 10000,
          type: 'restaurant',
          key: GOOGLE_API_KEY
        }
      }
    );

    const allResults = response.data.results || [];

    // 🧹 Strictly filter out non-restaurants
    const onlyRestaurants = allResults.filter(r =>
      r.types.includes('restaurant') &&
      !r.types.includes('lodging') &&
      !r.types.includes('clothing_store') &&
      !r.types.includes('movie_theater')
    );

    console.log(`✅ Original: ${allResults.length} | Filtered Restaurants: ${onlyRestaurants.length}`);

    // Save both versions if needed
    fs.writeFileSync(RAW_FILE, JSON.stringify(allResults, null, 2), 'utf-8');
    fs.writeFileSync(CLEAN_FILE, JSON.stringify(onlyRestaurants, null, 2), 'utf-8');

    console.log(`💾 Cleaned data written to: ${CLEAN_FILE}`);
  } catch (err) {
    console.error('❌ Error fetching restaurants:', err.message);
  }
}

fetchAndCleanRestaurants();
