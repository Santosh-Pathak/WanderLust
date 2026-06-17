import {
  addCommentService,
  addReactionService,
  addReplyService,
  createPostService,
  deletePostService,
  getAllPostsService,
  getFeaturedPostsService,
  getLatestPostsService,
  getPostByCategoryService,
  getPostByIdService,
  getRelatedPostsService,
  getTrendingPostsService,
  updatePostService,
  getPostsByTagService,
} from '../services/post-service.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const createPostHandler = asyncHandler(async (req, res) => {
  const savedPost = await createPostService({
    ...req.body,
    author: req.user?._id,
    authorName: req.body.authorName || req.user?.name,
  });
  ApiResponse.created(res, { data: savedPost, message: 'Post created' });
});

export const getAllPostsHandler = asyncHandler(async (req, res) => {
  const result = await getAllPostsService(req.query);
  ApiResponse.paginated(res, {
    items: result.items,
    total: result.total,
    page: result.page,
    limit: result.limit,
    totalPages: result.totalPages,
  });
});

export const getFeaturedPostsHandler = asyncHandler(async (req, res) => {
  const featuredPosts = await getFeaturedPostsService();
  ApiResponse.success(res, { data: featuredPosts });
});

export const getPostByCategoryHandler = asyncHandler(async (req, res) => {
  const categoryPosts = await getPostByCategoryService(req.params.category);
  ApiResponse.success(res, { data: categoryPosts });
});

export const getLatestPostsHandler = asyncHandler(async (req, res) => {
  const latestPosts = await getLatestPostsService();
  ApiResponse.success(res, { data: latestPosts });
});

export const getPostByIdHandler = asyncHandler(async (req, res) => {
  const post = await getPostByIdService(req.params.id, { countView: true });
  ApiResponse.success(res, { data: post });
});

export const updatePostHandler = asyncHandler(async (req, res) => {
  const updatedPost = await updatePostService(req.params.id, req.body);
  ApiResponse.success(res, { data: updatedPost, message: 'Post updated' });
});

export const deletePostByIdHandler = asyncHandler(async (req, res) => {
  await deletePostService(req.params.id);
  ApiResponse.success(res, { message: 'Post deleted' });
});

export const getTrendingPostsHandler = asyncHandler(async (req, res) => {
  const posts = await getTrendingPostsService();
  ApiResponse.success(res, { data: posts });
});

export const getRelatedPostsHandler = asyncHandler(async (req, res) => {
  const posts = await getRelatedPostsService(req.params.id);
  ApiResponse.success(res, { data: posts });
});

export const addReactionHandler = asyncHandler(async (req, res) => {
  const post = await addReactionService(req.params.id, req.body.reaction);
  ApiResponse.success(res, { data: post, message: 'Reaction recorded' });
});

export const addCommentHandler = asyncHandler(async (req, res) => {
  const comment = await addCommentService(req.params.id, req.body);
  ApiResponse.created(res, { data: comment, message: 'Comment added' });
});

export const addReplyHandler = asyncHandler(async (req, res) => {
  const reply = await addReplyService(req.params.id, req.params.commentId, req.body);
  ApiResponse.created(res, { data: reply, message: 'Reply added' });
});

export const getPostsByTagHandler = asyncHandler(async (req, res) => {
  const posts = await getPostsByTagService(req.params.tag);
  ApiResponse.success(res, { data: posts });
});
