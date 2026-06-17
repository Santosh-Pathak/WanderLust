import xss from 'xss';

const dangerousKeys = ['$where', '$regex', '$ne', '$gt', '$lt', '$gte', '$lte', '$in', '$nin', '$or', '$and', '$exists'];

const sanitizeValue = (value) => {
  if (typeof value === 'string') return xss(value.trim());
  if (Array.isArray(value)) return value.map(sanitizeValue);
  if (value && typeof value === 'object') {
    return Object.entries(value).reduce((safe, [key, nestedValue]) => {
      if (key.startsWith('$') || key.includes('.') || dangerousKeys.includes(key)) return safe;
      safe[key] = sanitizeValue(nestedValue);
      return safe;
    }, {});
  }
  return value;
};

export const sanitizeRequest = (req, res, next) => {
  req.body = sanitizeValue(req.body || {});
  req.query = sanitizeValue(req.query || {});
  req.params = sanitizeValue(req.params || {});
  next();
};

export const securityHeaders = (req, res, next) => {
  res.setHeader('x-request-id', req.requestId);
  next();
};
