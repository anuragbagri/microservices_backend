import { rateLimit } from "express-rate-limit";

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: "too many requests, please try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export { globalLimiter, authLimiter };
