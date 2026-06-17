import {
  findUserById,
  updateUserById,
  listUsers,
  countUsers,
  addBookmark,
  removeBookmark,
  addReadingHistory,
  getUserWithBookmarks,
  getUserWithReadingHistory,
} from '../repositories/user-repository.js';
import { findPostById } from '../repositories/post-repository.js';
import { ApiError } from '../middleware/error-handler.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const getProfileService = async (userId) => {
  const user = await findUserById(userId);
  if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  return user;
};

export const updateProfileService = async (userId, payload) => {
  const updatableFields = ['name', 'avatar'];
  const filtered = {};
  for (const key of updatableFields) {
    if (payload[key] !== undefined) filtered[key] = payload[key];
  }
  const user = await updateUserById(userId, filtered);
  if (!user) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'User not found');
  return user;
};

export const toggleBookmarkService = async (userId, postId) => {
  const post = await findPostById(postId);
  if (!post) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');

  const user = await findUserById(userId);
  const isBookmarked = user.bookmarks.some((id) => id.toString() === postId);

  if (isBookmarked) {
    await removeBookmark(userId, postId);
    return { bookmarked: false };
  }
  await addBookmark(userId, postId);
  return { bookmarked: true };
};

export const getBookmarksService = async (userId) => {
  const user = await getUserWithBookmarks(userId);
  return user?.bookmarks || [];
};

export const recordReadingHistoryService = async (userId, postId) => {
  const post = await findPostById(postId);
  if (!post) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Post not found');
  await addReadingHistory(userId, postId);
};

export const getReadingHistoryService = async (userId) => {
  const user = await getUserWithReadingHistory(userId);
  return user?.readingHistory || [];
};

export const getAllUsersService = async ({ page, limit, role }) => {
  const [items, total] = await Promise.all([
    listUsers({ page, limit, role }),
    countUsers(role),
  ]);
  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
};
