import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from './error-handler.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const authenticate = (req, res, next) => {
  const bearerToken = req.get('authorization')?.replace(/^Bearer\s+/i, '');
  const token = bearerToken || req.cookies?.access_token;

  if (!token) {
    return next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Authentication required'));
  }

  try {
    req.user = jwt.verify(token, env.jwtSecret);
    next();
  } catch (error) {
    next(new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid or expired token'));
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user?.role)) {
    return next(new ApiError(HTTP_STATUS.FORBIDDEN, 'You do not have permission for this action'));
  }
  next();
};
