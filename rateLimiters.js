const rateLimit = require("express-rate-limit");

// General API traffic
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down and try again shortly." },
});

// Chat is more expensive (AI calls cost money), so it's limited more tightly.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "You're sending messages too quickly. Please wait a moment." },
});

// Contact form / newsletter — generous but blocks spam bursts.
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many submissions from this device. Please try again later." },
});

// Login attempts — tight, to slow down brute force.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts. Please try again later." },
});

module.exports = { generalLimiter, chatLimiter, formLimiter, loginLimiter };
