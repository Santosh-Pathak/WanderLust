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
  getPostsByTagHandler,
} from '../controllers/posts-controller.js';
import { REDIS_KEYS } from '../utils/constants.js';
import { cacheHandler } from '../utils/middleware.js';
import { validate } from '../middleware/validate.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

const postValidation = [
  { field: 'title', required: true, type: 'string', minLength: 3 },
  { field: 'authorName', required: true, type: 'string', minLength: 2 },
  { field: 'imageLink', required: true, type: 'string', pattern: /\.(jpg|jpeg|png|webp)$/i, message: 'Image URL must end with .jpg, .jpeg, .webp, or .png' },
  { field: 'description', required: true, type: 'string', minLength: 10 },
  { field: 'categories', required: true, type: 'array', maxItems: 3 },
];

router.get('/', cacheHandler(REDIS_KEYS.ALL_POSTS), getAllPostsHandler);
router.get('/featured', cacheHandler(REDIS_KEYS.FEATURED_POSTS), getFeaturedPostsHandler);
router.get('/trending', cacheHandler(REDIS_KEYS.TRENDING_POSTS), getTrendingPostsHandler);
router.get('/latest', cacheHandler(REDIS_KEYS.LATEST_POSTS), getLatestPostsHandler);
router.get('/categories/:category', getPostByCategoryHandler);
router.get('/tags/:tag', getPostsByTagHandler);
router.get('/:id/related', getRelatedPostsHandler);
router.get('/:id', getPostByIdHandler);

router.post('/', authenticate, validate(postValidation), createPostHandler);
router.post('/:id/reactions', addReactionHandler);
router.post('/:id/comments', addCommentHandler);
router.post('/:id/comments/:commentId/replies', addReplyHandler);

router.patch('/:id', authenticate, updatePostHandler);
router.delete('/:id', authenticate, deletePostByIdHandler);

export default router;
