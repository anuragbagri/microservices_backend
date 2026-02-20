import { rateLimit } from "express-rate-limit";
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,         
  message: "Too many accounts created, try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: "Too many login attempts, try again later",
  standardHeaders: true,
  legacyHeaders: false,
});
export { registerLimiter, loginLimiter };

