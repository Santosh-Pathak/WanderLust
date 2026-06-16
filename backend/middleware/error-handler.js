import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';

export class ApiError extends Error {
  constructor(statusCode, message, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export const asyncHandler = (handler) => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    next(error);
  }
};

export const notFoundHandler = (req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    requestId: req.requestId,
  });
};

export const errorHandler = (error, req, res, next) => {
  const statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  const message =
    statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR
      ? error.message || RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR
      : error.message;

  if (statusCode === HTTP_STATUS.INTERNAL_SERVER_ERROR) {
    console.error(`[${req.requestId}]`, error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    details: error.details,
    requestId: req.requestId,
  });
};
