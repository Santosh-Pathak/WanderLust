import {
  getDashboardStats,
  getRecentPosts,
  getRecentUsers,
  getAllPostsAdmin,
  getAllUsersAdmin,
} from '../services/admin-service.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const getStats = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();
  ApiResponse.success(res, { data: stats });
});

export const recentPosts = asyncHandler(async (req, res) => {
  const posts = await getRecentPosts(Number(req.query.limit) || 10);
  ApiResponse.success(res, { data: posts });
});

export const recentUsers = asyncHandler(async (req, res) => {
  const users = await getRecentUsers(Number(req.query.limit) || 10);
  ApiResponse.success(res, { data: users });
});

export const allPosts = asyncHandler(async (req, res) => {
  const result = await getAllPostsAdmin({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    status: req.query.status,
    search: req.query.search,
  });
  ApiResponse.paginated(res, result);
});

export const allUsers = asyncHandler(async (req, res) => {
  const result = await getAllUsersAdmin({
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
  });
  ApiResponse.paginated(res, result);
});
