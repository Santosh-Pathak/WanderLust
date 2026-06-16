import { Router } from 'express';
import {
  createPostHandler,
  addCommentHandler,
  addReactionHandler,
  addReplyHandler,
  deletePostByIdHandler,
  getAllPostsHandler,
  getFeaturedPostsHandler,
  getLatestPostsHandler,
  getPostByCategoryHandler,
  getPostByIdHandler,
  getRelatedPostsHandler,
  getTrendingPostsHandler,
  updatePostHandler,
} from '../controllers/posts-controller.js';
import { REDIS_KEYS } from '../utils/constants.js';
import { cacheHandler } from '../utils/middleware.js';
import { validate } from '../middleware/validate.js';
const router = Router();

const postValidation = [
  { field: 'title', required: true, type: 'string', minLength: 3 },
  { field: 'authorName', required: true, type: 'string', minLength: 2 },
  { field: 'imageLink', required: true, type: 'string', pattern: /\.(jpg|jpeg|png|webp)$/i, message: 'Image URL must end with .jpg, .jpeg, .webp, or .png' },
  { field: 'description', required: true, type: 'string', minLength: 10 },
  { field: 'categories', required: true, type: 'array', maxItems: 3 },
];

// Create a new post
router.post('/', validate(postValidation), createPostHandler);

// Get all posts
router.get('/', cacheHandler(REDIS_KEYS.ALL_POSTS), getAllPostsHandler);

// Route to get featured posts
router.get('/featured', cacheHandler(REDIS_KEYS.FEATURED_POSTS), getFeaturedPostsHandler);
router.get('/trending', cacheHandler(REDIS_KEYS.TRENDING_POSTS), getTrendingPostsHandler);

// Route to get posts by category
router.get('/categories/:category', getPostByCategoryHandler);

// Route for fetching the latest posts
router.get('/latest', cacheHandler(REDIS_KEYS.LATEST_POSTS), getLatestPostsHandler);
// Get a specific post by ID
router.get('/:id', getPostByIdHandler);
router.get('/:id/related', getRelatedPostsHandler);
router.post('/:id/reactions', addReactionHandler);
router.post('/:id/comments', addCommentHandler);
router.post('/:id/comments/:commentId/replies', addReplyHandler);

// Update a post by ID
router.patch('/:id', updatePostHandler);

// Delete a post by ID
router.delete('/:id', deletePostByIdHandler);

export default router;
