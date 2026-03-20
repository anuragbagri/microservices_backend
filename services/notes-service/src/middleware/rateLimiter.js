import { rateLimit } from "express-rate-limit";

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  message: "Too many requests, try again later",
  standardHeaders: true,
  legacyHeaders: false,
});

export { apiLimiter };
