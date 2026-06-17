import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  toggleBookmark,
  getBookmarks,
  recordReadingHistory,
  getReadingHistory,
} from '../controllers/users-controller.js';
import { authenticate } from '../middleware/auth.js';
const router = Router();

router.get('/me', authenticate, getProfile);
router.patch('/me', authenticate, updateProfile);
router.post('/bookmarks/:postId', authenticate, toggleBookmark);
router.get('/bookmarks', authenticate, getBookmarks);
router.post('/history/:postId', authenticate, recordReadingHistory);
router.get('/history', authenticate, getReadingHistory);

export default router;
