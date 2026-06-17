import { validCategories } from '../../utils/constants.js';

export const res = {
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
};

export const createPostObject = (options = {}) => {
  return {
    title: options.title || 'Test Post',
    authorName: options.authorName || 'Test Author',
    imageLink: options.imageLink || 'https://www.forTestingPurposeOnly/my-image.jpg',
    categories: options.categories || [validCategories[0]],
    description: options.description || 'This is a test post.',
    isFeaturedPost: options.isFeaturedPost || false,
    ...options,
  };
};

export const createRequestObject = (options = {}) => {
  return {
    body: options.body || {},
    params: options.params || {},
    query: options.query || {},
    get: () => undefined,
    cookies: {},
    user: options.user || { _id: 'test-user-id', role: 'user', name: 'Test User' },
    ...options,
  };
};

export const createUserObject = (options = {}) => ({
  _id: options._id || 'user-1',
  name: options.name || 'Test User',
  email: options.email || 'test@example.com',
  role: options.role || 'user',
  avatar: options.avatar,
  bookmarks: [],
  readingHistory: [],
  ...options,
});
