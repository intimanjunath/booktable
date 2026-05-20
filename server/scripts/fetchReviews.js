const axios = require('axios');
const fs = require('fs');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// 🔧 Replace with your actual Google Maps API Key
const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// 🔍 Replace this with any Google Place ID you want to query
const placeId = 'ChIJ6XYD2ZGAhYARhDX0sVfc6Cc';

async function fetchPlaceDetails(placeId) {
  const url = `https://maps.googleapis.com/maps/api/place/details/json`;
  
  try {
    const response = await axios.get(url, {
      params: {
        place_id: placeId,
        fields: 'name,rating,user_ratings_total,reviews',
        key: GOOGLE_API_KEY,
      }
    });

    if (response.data.status !== 'OK') {
      console.error('Error fetching place details:', response.data.status);
      return;
    }

    const result = response.data.result;

    const output = {
      place_id: placeId,
      name: result.name,
      average_rating: result.rating,
      total_reviews: result.user_ratings_total,
      top_5_reviews: result.reviews?.map(r => ({
        author_name: r.author_name,
        rating: r.rating,
        text: r.text,
        relative_time: r.relative_time_description
      })) || []
    };

    fs.writeFileSync('restaurant_reviews.json', JSON.stringify(output, null, 2));
    console.log('✅ Reviews saved to restaurant_reviews.json');

  } catch (err) {
    console.error('❌ Failed to fetch reviews:', err.message);
  }
}

fetchPlaceDetails(placeId);
