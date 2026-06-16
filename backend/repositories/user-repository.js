import User from '../models/user.js';

export const createUser = (payload) => User.create(payload);

export const findUserByEmail = (email, includeSecrets = false) => {
  const query = User.findOne({ email: email.toLowerCase() });
  return includeSecrets ? query.select('+password +refreshTokenHash') : query;
};

export const findUserById = (id, includeSecrets = false) => {
  const query = User.findById(id);
  return includeSecrets ? query.select('+refreshTokenHash') : query;
};

export const updateUserById = (id, payload) => User.findByIdAndUpdate(id, payload, { new: true });

export const listUsers = ({ page = 1, limit = 20 } = {}) =>
  User.find()
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
