import {
  createTag,
  listTags,
  findTagById,
  findTagByName,
  updateTagById,
  deleteTagById,
} from '../repositories/tag-repository.js';
import { ApiError } from '../middleware/error-handler.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const createTagService = async (payload) => {
  const existing = await findTagByName(payload.name);
  if (existing) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Tag already exists');
  return createTag(payload);
};

export const getAllTagsService = async () => listTags();

export const getTagByIdService = async (id) => {
  const tag = await findTagById(id);
  if (!tag) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tag not found');
  return tag;
};

export const updateTagService = async (id, payload) => {
  const tag = await updateTagById(id, payload);
  if (!tag) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tag not found');
  return tag;
};

export const deleteTagService = async (id) => {
  const tag = await deleteTagById(id);
  if (!tag) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Tag not found');
  return tag;
};
