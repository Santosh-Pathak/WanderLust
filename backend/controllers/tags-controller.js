import {
  createTagService,
  getAllTagsService,
  getTagByIdService,
  updateTagService,
  deleteTagService,
} from '../services/tag-service.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const createTag = asyncHandler(async (req, res) => {
  const tag = await createTagService(req.body);
  ApiResponse.created(res, { data: tag, message: 'Tag created' });
});

export const getAllTags = asyncHandler(async (req, res) => {
  const tags = await getAllTagsService();
  ApiResponse.success(res, { data: tags });
});

export const getTagById = asyncHandler(async (req, res) => {
  const tag = await getTagByIdService(req.params.id);
  ApiResponse.success(res, { data: tag });
});

export const updateTag = asyncHandler(async (req, res) => {
  const tag = await updateTagService(req.params.id, req.body);
  ApiResponse.success(res, { data: tag, message: 'Tag updated' });
});

export const deleteTag = asyncHandler(async (req, res) => {
  await deleteTagService(req.params.id);
  ApiResponse.success(res, { message: 'Tag deleted' });
});
