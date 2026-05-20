// server/controllers/lookupController.js
const Location = require('../models/Location');
const Cuisine  = require('../models/Cuisine');

exports.listLocations = async (req, res) => {
  try {
    const locs = await Location.find();
    res.json(locs);
  } catch (error) {
    console.error('List locations error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};

exports.listCuisines = async (req, res) => {
  try {
    const cuis = await Cuisine.find();
    res.json(cuis);
  } catch (error) {
    console.error('List cuisines error:', error);
    res.status(500).json({ message: 'Server error.' });
  }
};
