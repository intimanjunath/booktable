// server/middleware/authMiddleware.js
const jwt  = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const token = header.split(' ')[1];
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.id);
    if (!user) {
      return res.status(401).json({ message: 'Access denied. User not found.' });
    }

    req.user = {
      id:           user._id.toString(),
      role:         user.role,
      first_name:   user.first_name,
      last_name:    user.last_name,
      email:        user.email,
      phone:        user.phone,
      city:         user.city
    };
    next();
  } catch (error) {
    console.error('JWT Verification Error:', error);
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};
