const express = require("express");
const axios = require("axios");
const router = express.Router();

const GOOGLE_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

router.get("/reviews", async (req, res) => {
  const { placeId } = req.query;

  if (!placeId) return res.status(400).json({ error: "Missing placeId" });

  try {
    const response = await axios.get(
      "https://maps.googleapis.com/maps/api/place/details/json",
      {
        params: {
          place_id: placeId,
          fields: "name,rating,user_ratings_total,reviews",
          key: GOOGLE_API_KEY,
        },
      }
    );

    res.json(response.data);
  } catch (error) {
    console.error("Google API error:", error.message);
    res.status(500).json({ error: "Failed to fetch Google reviews" });
  }
});

module.exports = router;
