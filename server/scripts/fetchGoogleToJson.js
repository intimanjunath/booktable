const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;
const OUTPUT_FILE = path.resolve(__dirname, './restaurants-eastbay.json');

// East Bay (Oakland downtown)
const lat = 37.8044;
const lng = -122.2712;

async function fetchOnceFromGooglePlaces() {
  try {
    console.log('🌍 Requesting restaurant data for East Bay...');

    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/place/nearbysearch/json',
      {
        params: {
          location: `${lat},${lng}`,
          radius: 10000, // 10 km radius
          type: 'restaurant',
          key: GOOGLE_API_KEY
        }
      }
    );

    const results = response.data.results || [];

    console.log(`✅ Fetched ${results.length} restaurants.`);
    console.log(`💾 Saving to file: ${OUTPUT_FILE}`);

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), 'utf-8');

    console.log('🎉 Done. You can now upload the JSON here for validation.');
  } catch (err) {
    console.error('❌ Error fetching from Google Places:', err.message);
  }
}

fetchOnceFromGooglePlaces();
