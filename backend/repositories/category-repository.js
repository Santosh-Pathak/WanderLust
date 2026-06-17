import Category from '../models/category.js';

export const createCategory = (payload) => Category.create(payload);
export const listCategories = ({ sort = 'name' } = {}) => Category.find().sort(sort).lean();
export const findCategoryById = (id) => Category.findById(id);
export const findCategoryByName = (name) => Category.findOne({ name: name.toLowerCase().trim() });
export const updateCategoryById = (id, payload) =>
  Category.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
export const deleteCategoryById = (id) => Category.findByIdAndDelete(id);
export const incrementCategoryPostCount = (name) =>
  Category.findOneAndUpdate({ name: name.toLowerCase().trim() }, { $inc: { postCount: 1 } });
export const decrementCategoryPostCount = (name) =>
  Category.findOneAndUpdate({ name: name.toLowerCase().trim() }, { $inc: { postCount: -1 } });
