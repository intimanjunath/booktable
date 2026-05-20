const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const INPUT_FILE = path.resolve(__dirname, 'restaurants-eastbay.json');
const OUTPUT_FILE = path.resolve(__dirname, 'cleaned-restaurants-eastbay.json');

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

function generateMockRestaurant(raw, index) {
  const location = raw.geometry?.location;

  if (!location || !raw.name || !raw.vicinity) return null;

  const photoReference = raw.photos?.[0]?.photo_reference;
  const mainImage = photoReference
    ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_API_KEY}`
    : '';

  return {
    name: raw.name,
    address: raw.vicinity,
    contactInfo: raw.business_status || 'N/A',
    hours: '5:00 PM - 11:00 PM',
    cuisineType: 'Mixed',
    costRating: ['CHEAP', 'REGULAR', 'EXPENSIVE'][index % 3],
    description: 'Imported from Google Places API',
    main_image: mainImage,
    images: [],
    slug: raw.name.toLowerCase().replace(/\s+/g, '-'),
    price: ['CHEAP', 'REGULAR', 'EXPENSIVE'][index % 3],
    tableSizes: [2, 4, 6],
    availableTimes: ['18:00', '19:30', '21:00'],
    status: Math.random() > 0.25 ? 'Approved' : 'Pending',
    locationCoords: {
      lat: location.lat,
      lng: location.lng
    },
    googlePlaceId: raw.place_id
  };
}

function runTransformation() {
  const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  const cleaned = [];

  let count = 0;
  for (let i = 0; i < rawData.length && count < 50; i++) {
    const r = rawData[i];

    // Filter only real restaurants (exclude lodging, theaters, etc.)
    if (!r.types?.includes('restaurant')) continue;

    const transformed = generateMockRestaurant(r, count);
    if (transformed) {
      cleaned.push(transformed);
      count++;
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleaned, null, 2), 'utf-8');
  console.log(`✅ Transformed and saved ${cleaned.length} restaurants → ${OUTPUT_FILE}`);
}

runTransformation();
