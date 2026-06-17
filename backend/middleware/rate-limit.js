import rateLimiter from 'express-rate-limit';
import { env } from '../config/env.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const rateLimit = ({
  windowMs = env.rateLimitWindowMs,
  max = env.rateLimitMax,
} = {}) =>
  rateLimiter({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        requestId: req.requestId,
      });
    },
  });

export const authRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Please try again later.' },
});
