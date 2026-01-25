import { Router } from 'express';
import {
  register,
  login,
  requestPasswordReset,
  resetPassword,
  registerSchema,
  loginSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from '../controllers/auth.controller';
import { validate } from '../middleware/validation.middleware';
import rateLimit from 'express-rate-limit';

// Rate limiting for auth endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  message: 'Too many authentication attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter rate limiting for password reset
const passwordResetRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 requests per hour
  message: 'Too many password reset attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

router.post('/register', authRateLimiter, validate(registerSchema), register);
router.post('/login', authRateLimiter, validate(loginSchema), login);
router.post('/forgot-password', passwordResetRateLimiter, validate(requestPasswordResetSchema), requestPasswordReset);
router.post('/reset-password', passwordResetRateLimiter, validate(resetPasswordSchema), resetPassword);

export default router;
