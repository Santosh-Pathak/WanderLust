import winston from 'winston';
import { env } from './env.js';

const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  env.isProduction ? winston.format.json() : winston.format.prettyPrint()
);

export const logger = winston.createLogger({
  level: env.isProduction ? 'info' : 'debug',
  levels,
  format,
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error', maxsize: 5242880 }),
    new winston.transports.File({ filename: 'logs/combined.log', maxsize: 5242880 }),
  ],
});
