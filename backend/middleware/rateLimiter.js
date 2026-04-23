const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 30 minutes
  max: parseInt(process.env.LOGIN_RATE_LIMIT) || 50,
  message: { message: 'Too many login attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // only count failed attempts
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 30 minutes
  max: parseInt(process.env.API_RATE_LIMIT) || 500,
  message: { message: 'Too many requests, please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, apiLimiter };