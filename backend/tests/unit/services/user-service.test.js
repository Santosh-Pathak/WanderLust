import {
  getProfileService,
  toggleBookmarkService,
  getBookmarksService,
} from '../../../services/user-service.js';
import * as userRepository from '../../../repositories/user-repository.js';
import * as postRepository from '../../../repositories/post-repository.js';

jest.mock('../../../repositories/user-repository.js');
jest.mock('../../../repositories/post-repository.js');

describe('User Service', () => {
  const mockUser = {
    _id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    role: 'user',
    bookmarks: [],
  };

  const mockPost = {
    _id: 'post-1',
    title: 'Test Post',
    authorName: 'Author',
    imageLink: 'https://example.com/image.jpg',
    categories: ['Travel'],
    description: 'A test post',
  };

  beforeEach(() => jest.clearAllMocks());

  it('getProfileService: returns user profile', async () => {
    userRepository.findUserById.mockResolvedValue(mockUser);
    const result = await getProfileService('user-1');
    expect(result).toEqual(mockUser);
  });

  it('getProfileService: throws if user not found', async () => {
    userRepository.findUserById.mockResolvedValue(null);
    await expect(getProfileService('invalid')).rejects.toThrow('User not found');
  });

  it('toggleBookmarkService: adds bookmark', async () => {
    postRepository.findPostById.mockResolvedValue(mockPost);
    userRepository.findUserById.mockResolvedValue(mockUser);
    userRepository.addBookmark.mockResolvedValue({ ...mockUser, bookmarks: ['post-1'] });

    const result = await toggleBookmarkService('user-1', 'post-1');
    expect(result.bookmarked).toBe(true);
  });

  it('toggleBookmarkService: removes existing bookmark', async () => {
    postRepository.findPostById.mockResolvedValue(mockPost);
    userRepository.findUserById.mockResolvedValue({ ...mockUser, bookmarks: ['post-1'] });
    userRepository.removeBookmark.mockResolvedValue(mockUser);

    const result = await toggleBookmarkService('user-1', 'post-1');
    expect(result.bookmarked).toBe(false);
  });

  it('getBookmarksService: returns bookmarked posts', async () => {
    userRepository.getUserWithBookmarks.mockResolvedValue({ ...mockUser, bookmarks: [mockPost] });
    const result = await getBookmarksService('user-1');
    expect(result).toEqual([mockPost]);
  });
});
