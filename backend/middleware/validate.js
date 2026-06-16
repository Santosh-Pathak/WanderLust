import { ApiError } from './error-handler.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const validate = (schema) => (req, res, next) => {
  const errors = [];
  const target = {
    body: req.body || {},
    query: req.query || {},
    params: req.params || {},
  };

  for (const rule of schema) {
    const value = target[rule.location || 'body'][rule.field];
    if (rule.required && (value === undefined || value === null || value === '')) {
      errors.push(`${rule.field} is required`);
      continue;
    }
    if (value === undefined || value === null || value === '') continue;
    if (rule.type === 'array' && !Array.isArray(value)) errors.push(`${rule.field} must be an array`);
    if (rule.type === 'boolean' && typeof value !== 'boolean') errors.push(`${rule.field} must be a boolean`);
    if (rule.type === 'string' && typeof value !== 'string') errors.push(`${rule.field} must be a string`);
    if (rule.minLength && String(value).trim().length < rule.minLength) {
      errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
    }
    if (rule.maxItems && Array.isArray(value) && value.length > rule.maxItems) {
      errors.push(`${rule.field} can contain at most ${rule.maxItems} items`);
    }
    if (rule.pattern && typeof value === 'string' && !rule.pattern.test(value)) {
      errors.push(rule.message || `${rule.field} is invalid`);
    }
  }

  if (errors.length > 0) {
    return next(new ApiError(HTTP_STATUS.BAD_REQUEST, errors[0], errors));
  }

  next();
};
