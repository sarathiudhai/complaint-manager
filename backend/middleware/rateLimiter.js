const rateLimit = require('express-rate-limit');

// Rate limiter for authentication attempts (Login / Register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // limit each IP to 30 requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again after 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300, // limit each IP to 300 requests per 15 mins
  message: {
    success: false,
    message: 'Too many API requests from this IP, please try again later',
  },
});

module.exports = { authLimiter, apiLimiter };
