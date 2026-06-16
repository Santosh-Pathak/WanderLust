import { env } from '../config/env.js';

export const accessCookieOptions = {
  httpOnly: true,
  sameSite: env.isProduction ? 'none' : 'lax',
  secure: env.isProduction,
  maxAge: env.accessCookieMaxAge,
};
export const refreshCookieOptions = {
  httpOnly: true,
  sameSite: env.isProduction ? 'none' : 'lax',
  secure: env.isProduction,
  maxAge: env.refreshCookieMaxAge,
};
