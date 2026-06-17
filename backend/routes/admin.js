import { Router } from 'express';
import {
  getStats,
  recentPosts,
  recentUsers,
  allPosts,
  allUsers,
} from '../controllers/admin-controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorize('admin'));

router.get('/stats', getStats);
router.get('/posts', allPosts);
router.get('/posts/recent', recentPosts);
router.get('/users', allUsers);
router.get('/users/recent', recentUsers);

export default router;
