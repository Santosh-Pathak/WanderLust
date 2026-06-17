import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
} from '../services/category-service.js';
import { ApiResponse } from '../utils/api-response.js';
import { asyncHandler } from '../middleware/error-handler.js';

export const createCategory = asyncHandler(async (req, res) => {
  const category = await createCategoryService(req.body);
  ApiResponse.created(res, { data: category, message: 'Category created' });
});

export const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await getAllCategoriesService();
  ApiResponse.success(res, { data: categories });
});

export const getCategoryById = asyncHandler(async (req, res) => {
  const category = await getCategoryByIdService(req.params.id);
  ApiResponse.success(res, { data: category });
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await updateCategoryService(req.params.id, req.body);
  ApiResponse.success(res, { data: category, message: 'Category updated' });
});

export const deleteCategory = asyncHandler(async (req, res) => {
  await deleteCategoryService(req.params.id);
  ApiResponse.success(res, { message: 'Category deleted' });
});
