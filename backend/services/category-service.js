import {
  createCategory,
  listCategories,
  findCategoryById,
  findCategoryByName,
  updateCategoryById,
  deleteCategoryById,
} from '../repositories/category-repository.js';
import { ApiError } from '../middleware/error-handler.js';
import { HTTP_STATUS } from '../utils/constants.js';

export const createCategoryService = async (payload) => {
  const existing = await findCategoryByName(payload.name);
  if (existing) throw new ApiError(HTTP_STATUS.BAD_REQUEST, 'Category already exists');
  return createCategory(payload);
};

export const getAllCategoriesService = async () => listCategories();

export const getCategoryByIdService = async (id) => {
  const category = await findCategoryById(id);
  if (!category) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
  return category;
};

export const updateCategoryService = async (id, payload) => {
  const category = await updateCategoryById(id, payload);
  if (!category) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
  return category;
};

export const deleteCategoryService = async (id) => {
  const category = await deleteCategoryById(id);
  if (!category) throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Category not found');
  return category;
};
