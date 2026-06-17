import Post from '../models/post.js';
import User from '../models/user.js';
import Category from '../models/category.js';
import Tag from '../models/tag.js';
import {
  listUsers,
  countUsers,
} from '../repositories/user-repository.js';
import {
  listPosts,
} from '../repositories/post-repository.js';

export const getDashboardStats = async () => {
  const [totalPosts, totalUsers, totalCategories, totalTags, totalViews, publishedPosts, draftPosts] =
    await Promise.all([
      Post.countDocuments(),
      User.countDocuments(),
      Category.countDocuments(),
      Tag.countDocuments(),
      Post.aggregate([{ $group: { _id: null, total: { $sum: '$viewCount' } } }]),
      Post.countDocuments({ status: 'published' }),
      Post.countDocuments({ status: 'draft' }),
    ]);

  return {
    totalPosts,
    totalUsers,
    totalCategories,
    totalTags,
    totalViews: totalViews[0]?.total || 0,
    publishedPosts,
    draftPosts,
  };
};

export const getRecentPosts = async (limit = 10) => {
  const { items } = await listPosts({ page: 1, limit, status: 'all', sort: '-createdAt' });
  return items;
};

export const getRecentUsers = async (limit = 10) => listUsers({ page: 1, limit });

export const getAllPostsAdmin = async ({ page, limit, status, search }) =>
  listPosts({ page, limit, status: status || 'all', search, sort: '-createdAt' });

export const getAllUsersAdmin = async ({ page, limit }) => listUsers({ page, limit });
