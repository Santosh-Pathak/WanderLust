import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';
import { createUser, findUserByEmail, findUserById, updateUserById } from '../repositories/user-repository.js';
import { ApiError } from '../middleware/error-handler.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';

const { hash, compareSync } = bcrypt;

const signAccessToken = (user) =>
  jwt.sign(
    { name: user.name, _id: user._id, role: user.role || 'user' },
    env.jwtSecret,
    { expiresIn: env.accessTokenExpiresIn }
  );

const signRefreshToken = (user) =>
  jwt.sign(
    { name: user.name, _id: user._id, role: user.role || 'user', tokenType: 'refresh' },
    env.jwtSecret,
    { expiresIn: env.refreshTokenExpiresIn }
  );

const hashRefreshToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

const sanitizeUser = (user) => ({
  name: user.name,
  email: user.email,
  _id: user._id,
  id: user._id,
  role: user.role || 'user',
  avatar: user.avatar,
});

const issueTokens = async (user) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  await updateUserById(user._id, { refreshTokenHash: hashRefreshToken(refreshToken) });
  return { accessToken, refreshToken };
};

export const registerWithEmail = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'User already exists.');

  const hashedPassword = await hash(password, 10);
  const user = await createUser({ name, email, password: hashedPassword, role: 'user' });
  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const loginWithEmail = async ({ email, password }) => {
  const user = await findUserByEmail(email, true);
  if (!user) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Email does not exist');
  if (!user.password || !compareSync(password, user.password)) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, RESPONSE_MESSAGES.USERS.INVALID_PASSWORD);
  }
  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const registerOauthUser = async ({ name, email }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new ApiError(HTTP_STATUS.BAD_REQUEST, RESPONSE_MESSAGES.USERS.EMAIL_ALREADY_IN_USE);
  const user = await createUser({ name, email, role: 'user' });
  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const loginOauthUser = async ({ email }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, RESPONSE_MESSAGES.USERS.USER_NOT_EXISTS);
  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const refreshAccessToken = async (refreshToken) => {
  if (!refreshToken) throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token required');
  const payload = jwt.verify(refreshToken, env.jwtSecret);
  if (payload.tokenType !== 'refresh') throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Invalid refresh token');
  const user = await findUserById(payload._id, true);
  if (!user || user.refreshTokenHash !== hashRefreshToken(refreshToken)) {
    throw new ApiError(HTTP_STATUS.UNAUTHORIZED, 'Refresh token revoked');
  }
  const tokens = await issueTokens(user);
  return { user: sanitizeUser(user), ...tokens };
};

export const revokeRefreshToken = async (userId) => {
  if (userId) await updateUserById(userId, { refreshTokenHash: undefined });
};
