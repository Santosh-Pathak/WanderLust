import User from '../models/user.js';

export const createUser = (payload) => User.create(payload);

export const findUserByEmail = (email, includeSecrets = false) => {
  const query = User.findOne({ email: email.toLowerCase().trim() });
  return includeSecrets ? query.select('+password +refreshTokenHash') : query;
};

export const findUserById = (id, includeSecrets = false) => {
  const query = User.findById(id);
  return includeSecrets ? query.select('+refreshTokenHash') : query;
};

export const updateUserById = (id, payload) =>
  User.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const listUsers = ({ page = 1, limit = 20, role } = {}) => {
  const query = {};
  if (role) query.role = role;
  return User.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();
};

export const countUsers = (role) => {
  const query = {};
  if (role) query.role = role;
  return User.countDocuments(query);
};

export const addBookmark = (userId, postId) =>
  User.findByIdAndUpdate(userId, { $addToSet: { bookmarks: postId } }, { new: true });

export const removeBookmark = (userId, postId) =>
  User.findByIdAndUpdate(userId, { $pull: { bookmarks: postId } }, { new: true });

export const addReadingHistory = (userId, postId) =>
  User.findByIdAndUpdate(
    userId,
    { $push: { readingHistory: { post: postId, viewedAt: new Date() } } },
    { new: true }
  );

export const getUserWithBookmarks = (userId) => User.findById(userId).populate('bookmarks').lean();

export const getUserWithReadingHistory = (userId) =>
  User.findById(userId).populate('readingHistory.post').lean();
