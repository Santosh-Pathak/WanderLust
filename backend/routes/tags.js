import { Router } from 'express';
import {
  createTag,
  getAllTags,
  getTagById,
  updateTag,
  deleteTag,
} from '../controllers/tags-controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
const router = Router();

router.get('/', getAllTags);
router.get('/:id', getTagById);
router.post('/', authenticate, authorize('admin'), createTag);
router.patch('/:id', authenticate, authorize('admin'), updateTag);
router.delete('/:id', authenticate, authorize('admin'), deleteTag);

export default router;
