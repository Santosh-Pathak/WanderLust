import { env } from '../config/env.js';
import { HTTP_STATUS } from '../utils/constants.js';

const buckets = new Map();

export const rateLimit = ({
  windowMs = env.rateLimitWindowMs,
  max = env.rateLimitMax,
} = {}) => {
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const bucket = buckets.get(key) || { count: 0, resetAt: now + windowMs };

    if (bucket.resetAt <= now) {
      bucket.count = 0;
      bucket.resetAt = now + windowMs;
    }

    bucket.count += 1;
    buckets.set(key, bucket);
    res.setHeader('x-ratelimit-limit', max);
    res.setHeader('x-ratelimit-remaining', Math.max(max - bucket.count, 0));

    if (bucket.count > max) {
      return res.status(HTTP_STATUS.TOO_MANY_REQUESTS).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        requestId: req.requestId,
      });
    }

    next();
  };
};
