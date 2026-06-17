import Tag from '../models/tag.js';

export const createTag = (payload) => Tag.create(payload);
export const listTags = ({ sort = 'name' } = {}) => Tag.find().sort(sort).lean();
export const findTagById = (id) => Tag.findById(id);
export const findTagByName = (name) => Tag.findOne({ name: name.toLowerCase().trim() });
export const updateTagById = (id, payload) =>
  Tag.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
export const deleteTagById = (id) => Tag.findByIdAndDelete(id);
export const incrementTagPostCount = (name) =>
  Tag.findOneAndUpdate({ name: name.toLowerCase().trim() }, { $inc: { postCount: 1 } });
export const decrementTagPostCount = (name) =>
  Tag.findOneAndUpdate({ name: name.toLowerCase().trim() }, { $inc: { postCount: -1 } });
export const findOrCreateTag = async (name) => {
  const trimmed = name.toLowerCase().trim();
  let tag = await findTagByName(trimmed);
  if (!tag) tag = await createTag({ name: trimmed });
  return tag;
};
