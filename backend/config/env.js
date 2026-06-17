import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().positive().default(5000),
  MONGODB_URI: z.string().url().optional(),
  REDIS_URL: z.string().optional(),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters').default('dev-secret-key-at-least-32-characters-long-for-hs256'),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  ACCESS_COOKIE_MAXAGE: z.coerce.number().positive().default(15 * 60 * 1000),
  REFRESH_COOKIE_MAXAGE: z.coerce.number().positive().default(7 * 24 * 60 * 60 * 1000),
  CLIENT_ORIGIN: z.string().default('*'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().positive().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().positive().default(300),
  GAUTH_CLIENT_ID: z.string().optional(),
  GAUTH_CLIENT_SECRET: z.string().optional(),
  GAUTH_TOKEN_URL: z.string().url().default('https://oauth2.googleapis.com/token'),
  GAUTH_USER_URL: z.string().url().default('https://www.googleapis.com/oauth2/v2/userinfo'),
  REDIRECTION_URL: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GITHUB_TOKEN_URL: z.string().url().default('https://github.com/login/oauth/access_token'),
  GITHUB_USER_URL: z.string().url().default('https://api.github.com/user'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

const isProduction = parsed.data.NODE_ENV === 'production';

export const env = {
  nodeEnv: parsed.data.NODE_ENV,
  isProduction,
  port: parsed.data.PORT,
  mongoUri: parsed.data.MONGODB_URI,
  redisUrl: parsed.data.REDIS_URL,
  jwtSecret: parsed.data.JWT_SECRET,
  accessTokenExpiresIn: parsed.data.ACCESS_TOKEN_EXPIRES_IN,
  refreshTokenExpiresIn: parsed.data.REFRESH_TOKEN_EXPIRES_IN,
  accessCookieMaxAge: parsed.data.ACCESS_COOKIE_MAXAGE,
  refreshCookieMaxAge: parsed.data.REFRESH_COOKIE_MAXAGE,
  clientOrigin: parsed.data.CLIENT_ORIGIN,
  rateLimitWindowMs: parsed.data.RATE_LIMIT_WINDOW_MS,
  rateLimitMax: parsed.data.RATE_LIMIT_MAX,
  gauthClientId: parsed.data.GAUTH_CLIENT_ID,
  gauthClientSecret: parsed.data.GAUTH_CLIENT_SECRET,
  gauthTokenUrl: parsed.data.GAUTH_TOKEN_URL,
  gauthUserUrl: parsed.data.GAUTH_USER_URL,
  redirectionUrl: parsed.data.REDIRECTION_URL,
  githubClientId: parsed.data.GITHUB_CLIENT_ID,
  githubClientSecret: parsed.data.GITHUB_CLIENT_SECRET,
  githubTokenUrl: parsed.data.GITHUB_TOKEN_URL,
  githubUserUrl: parsed.data.GITHUB_USER_URL,
};
