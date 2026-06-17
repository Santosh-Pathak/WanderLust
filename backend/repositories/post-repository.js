import Post from '../models/post.js';

const publicStatuses = ['published', 'scheduled'];

export const createPost = (payload) => Post.create(payload);

export const listPosts = async ({
  page = 1,
  limit = 20,
  category,
  tag,
  search,
  status = 'published',
  sort = '-timeOfPost',
} = {}) => {
  const query = {};
  if (status !== 'all') query.status = status;
  if (category) query.categories = category;
  if (tag) query.tags = tag.toLowerCase();
  if (search) query.$text = { $search: search };

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Post.find(query).sort(sort).skip(skip).limit(limit).lean(),
    Post.countDocuments(query),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) || 1 };
};

export const listFeaturedPosts = () =>
  Post.find({ isFeaturedPost: true, status: { $in: publicStatuses } }).sort({ timeOfPost: -1 }).lean();

export const listLatestPosts = () =>
  Post.find({ status: { $in: publicStatuses } }).sort({ timeOfPost: -1 }).lean();

export const listPostsByCategory = (category) =>
  Post.find({ categories: category, status: { $in: publicStatuses } }).sort({ timeOfPost: -1 }).lean();

export const listPostsByTag = (tag) =>
  Post.find({ tags: tag.toLowerCase(), status: { $in: publicStatuses } }).sort({ timeOfPost: -1 }).lean();

export const findPostById = (id) => Post.findById(id);

export const updatePostById = (id, payload) =>
  Post.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

export const deletePostById = (id) => Post.findByIdAndDelete(id);

export const incrementViews = (id) =>
  Post.findByIdAndUpdate(id, { $inc: { viewCount: 1 } }, { new: true });

export const listTrendingPosts = () =>
  Post.find({ status: { $in: publicStatuses } })
    .sort({ viewCount: -1, timeOfPost: -1 })
    .limit(10)
    .lean();

export const listRelatedPosts = (post) =>
  Post.find({
    _id: { $ne: post._id },
    status: { $in: publicStatuses },
    $or: [{ categories: { $in: post.categories } }, { tags: { $in: post.tags || [] } }],
  })
    .sort({ timeOfPost: -1 })
    .limit(4)
    .lean();
