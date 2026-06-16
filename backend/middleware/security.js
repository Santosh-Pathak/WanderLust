const dangerousKeys = ['$where', '$regex'];

const cleanString = (value) =>
  value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .trim();

const sanitizeValue = (value) => {
  if (typeof value === 'string') return cleanString(value);
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
  res.setHeader('x-content-type-options', 'nosniff');
  res.setHeader('x-frame-options', 'DENY');
  res.setHeader('referrer-policy', 'no-referrer');
  res.setHeader('permissions-policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader(
    'content-security-policy',
    "default-src 'self'; img-src 'self' https: data:; style-src 'self' 'unsafe-inline'; script-src 'self'"
  );
  next();
};
