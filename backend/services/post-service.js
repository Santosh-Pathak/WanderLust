import {
  createPost,
  deletePostById,
  findPostById,
  incrementViews,
  listFeaturedPosts,
  listLatestPosts,
  listPosts,
  listPostsByCategory,
  listRelatedPosts,
  listTrendingPosts,
  listPostsByTag,
  updatePostById,
} from '../repositories/post-repository.js';
import {
  deleteDataFromCache,
  storeDataInCache,
} from '../utils/cache-posts.js';
import { HTTP_STATUS, REDIS_KEYS, RESPONSE_MESSAGES, validCategories } from '../utils/constants.js';
import { ApiError } from '../middleware/error-handler.js';

const invalidatePostCaches = () =>
  Promise.all([
    deleteDataFromCache(REDIS_KEYS.ALL_POSTS),
    deleteDataFromCache(REDIS_KEYS.FEATURED_POSTS),
    deleteDataFromCache(REDIS_KEYS.LATEST_POSTS),
    deleteDataFromCache(REDIS_KEYS.TRENDING_POSTS),
  ]);

const normalizePostPayload = (payload, { partial = false } = {}) => {
  const normalized = { ...payload };
  if (Array.isArray(payload.tags)) {
    normalized.tags = payload.tags.map((tag) => tag.toLowerCase().trim());
  } else if (!partial) {
    normalized.tags = [];
  }
  if (!partial) {
    normalized.status = payload.status || (payload.scheduledFor ? 'scheduled' : 'published');
  } else if (payload.scheduledFor && !payload.status) {
    normalized.status = 'scheduled';
  }
  return normalized;
};

export const createPostService = async (payload) => {
  const post = await createPost(normalizePostPayload(payload));
  await invalidatePostCaches();
  return post;
};

export const getAllPostsService = async (query = {}) => {
  const page = Math.max(Number(query.page || 1), 1);
  const limit = Math.min(Math.max(Number(query.limit || 50), 1), 100);
  const result = await listPosts({
    page,
    limit,
    category: query.category,
    tag: query.tag,
    search: query.search,
    status: query.status || 'published',
    sort: query.sort || '-timeOfPost',
  });
  return result;
};

export const getFeaturedPostsService = async () => {
  const posts = await listFeaturedPosts();
  await storeDataInCache(REDIS_KEYS.FEATURED_POSTS, posts);
  return posts;
};

export const getLatestPostsService = async () => {
  const posts = await listLatestPosts();
  await storeDataInCache(REDIS_KEYS.LATEST_POSTS, posts);
  return posts;
};

export const getTrendingPostsService = async () => {
  const posts = await listTrendingPosts();
  await storeDataInCache(REDIS_KEYS.TRENDING_POSTS, posts);
  return posts;
};

export const getPostByCategoryService = async (category) => {
  if (!validCategories.includes(category)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, RESPONSE_MESSAGES.POSTS.INVALID_CATEGORY);
  }
  return listPostsByCategory(category);
};

export const getPostsByTagService = async (tag) => listPostsByTag(tag);

export const getPostByIdService = async (id, { countView = false } = {}) => {
  const post = countView ? await incrementViews(id) : await findPostById(id);
  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, RESPONSE_MESSAGES.POSTS.NOT_FOUND);
  }
  return post;
};

export const updatePostService = async (id, payload) => {
  const post = await updatePostById(id, normalizePostPayload(payload, { partial: true }));
  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, RESPONSE_MESSAGES.POSTS.NOT_FOUND);
  }
  await invalidatePostCaches();
  return post;
};

export const deletePostService = async (id) => {
  const post = await deletePostById(id);
  if (!post) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, RESPONSE_MESSAGES.POSTS.NOT_FOUND);
  }
  await invalidatePostCaches();
};

export const addReactionService = async (id, reaction = 'like') => {
  const allowed = ['like', 'love', 'insightful'];
  if (!allowed.includes(reaction)) {
    throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Invalid reaction');
  }
  return updatePostById(id, { $inc: { [`reactions.${reaction}`]: 1 } });
};

export const addCommentService = async (id, payload) => {
  const post = await findPostById(id);
  if (!post) throw new ApiError(HTTP_STATUS.NOT_FOUND, RESPONSE_MESSAGES.POSTS.NOT_FOUND);
  post.comments.push(payload);
  await post.save();
  return post.comments.at(-1);
};

export const addReplyService = async (postId, commentId, payload) => {
  const post = await findPostById(postId);
  if (!post) throw new ApiError(HTTP_STATUS.NOT_FOUND, RESPONSE_MESSAGES.POSTS.NOT_FOUND);
  const comment = post.comments.id(commentId);
  if (!comment) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Comment not found');
  comment.replies.push(payload);
  await post.save();
  return comment.replies.at(-1);
};

export const getRelatedPostsService = async (id) => {
  const post = await getPostByIdService(id);
  return listRelatedPosts(post);
};
