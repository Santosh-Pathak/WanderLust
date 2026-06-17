import {
  getProfileService,
  updateProfileService,
  toggleBookmarkService,
  getBookmarksService,
  recordReadingHistoryService,
  getReadingHistoryService,
} from '../services/user-service.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const getProfile = asyncHandler(async (req, res) => {
  const user = await getProfileService(req.user._id);
  ApiResponse.success(res, { data: user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await updateProfileService(req.user._id, req.body);
  ApiResponse.success(res, { data: user, message: 'Profile updated' });
});

export const toggleBookmark = asyncHandler(async (req, res) => {
  const result = await toggleBookmarkService(req.user._id, req.params.postId);
  ApiResponse.success(res, { data: result, message: result.bookmarked ? 'Bookmarked' : 'Bookmark removed' });
});

export const getBookmarks = asyncHandler(async (req, res) => {
  const bookmarks = await getBookmarksService(req.user._id);
  ApiResponse.success(res, { data: bookmarks });
});

export const recordReadingHistory = asyncHandler(async (req, res) => {
  await recordReadingHistoryService(req.user._id, req.params.postId);
  ApiResponse.success(res, { message: 'Reading history recorded' });
});

export const getReadingHistory = asyncHandler(async (req, res) => {
  const history = await getReadingHistoryService(req.user._id);
  ApiResponse.success(res, { data: history });
});
