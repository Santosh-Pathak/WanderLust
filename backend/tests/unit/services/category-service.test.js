import {
  createCategoryService,
  getAllCategoriesService,
  getCategoryByIdService,
  updateCategoryService,
  deleteCategoryService,
} from '../../../services/category-service.js';
import * as categoryRepository from '../../../repositories/category-repository.js';

jest.mock('../../../repositories/category-repository.js');

describe('Category Service', () => {
  const mockCategory = { _id: 'cat-1', name: 'Travel', description: 'Travel stories', postCount: 0 };

  beforeEach(() => jest.clearAllMocks());

  it('createCategoryService: creates a new category', async () => {
    categoryRepository.findCategoryByName.mockResolvedValue(null);
    categoryRepository.createCategory.mockResolvedValue(mockCategory);

    const result = await createCategoryService({ name: 'Travel' });
    expect(result).toEqual(mockCategory);
    expect(categoryRepository.createCategory).toHaveBeenCalledWith({ name: 'Travel' });
  });

  it('createCategoryService: throws if category exists', async () => {
    categoryRepository.findCategoryByName.mockResolvedValue(mockCategory);
    await expect(createCategoryService({ name: 'Travel' })).rejects.toThrow('Category already exists');
  });

  it('getAllCategoriesService: returns all categories', async () => {
    categoryRepository.listCategories.mockResolvedValue([mockCategory]);
    const result = await getAllCategoriesService();
    expect(result).toEqual([mockCategory]);
  });

  it('getCategoryByIdService: returns category by id', async () => {
    categoryRepository.findCategoryById.mockResolvedValue(mockCategory);
    const result = await getCategoryByIdService('cat-1');
    expect(result).toEqual(mockCategory);
  });

  it('getCategoryByIdService: throws if not found', async () => {
    categoryRepository.findCategoryById.mockResolvedValue(null);
    await expect(getCategoryByIdService('invalid')).rejects.toThrow('Category not found');
  });

  it('deleteCategoryService: deletes category', async () => {
    categoryRepository.deleteCategoryById.mockResolvedValue(mockCategory);
    const result = await deleteCategoryService('cat-1');
    expect(result).toEqual(mockCategory);
  });
});
