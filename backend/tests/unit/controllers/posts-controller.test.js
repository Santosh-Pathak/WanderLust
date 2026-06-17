import {
  createPostHandler,
  deletePostByIdHandler,
  getAllPostsHandler,
  getFeaturedPostsHandler,
  getLatestPostsHandler,
  getPostByCategoryHandler,
  getPostByIdHandler,
  updatePostHandler,
} from '../../../controllers/posts-controller.js';
import { ApiError } from '../../../middleware/error-handler.js';
import * as postService from '../../../services/post-service.js';
import { HTTP_STATUS, RESPONSE_MESSAGES, validCategories } from '../../../utils/constants.js';
import { createPostObject, createRequestObject, res } from '../../utils/helper-objects.js';

jest.mock('../../../services/post-service.js');

const next = jest.fn();

describe('createPostHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Post creation: Success - All fields are valid', async () => {
    const postObject = createPostObject();
    const req = createRequestObject({ body: postObject });

    postService.createPostService.mockResolvedValueOnce(postObject);

    await createPostHandler(req, res, next);

    expect(postService.createPostService).toHaveBeenCalledWith({
      ...postObject,
      author: req.user._id,
      authorName: postObject.authorName,
    });
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.CREATED);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Post created',
      data: postObject,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Post creation: Failure - Internal server error', async () => {
    const postObject = createPostObject();
    const req = createRequestObject({ body: postObject });
    const error = new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR);

    postService.createPostService.mockRejectedValueOnce(error);

    await createPostHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('getAllPostsHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Get all posts: Success - Retrieving all posts list', async () => {
    const req = createRequestObject();
    const mockPosts = [
      createPostObject({ title: 'Test Post - 1' }),
      createPostObject({ title: 'Test Post - 2', isFeaturedPost: true }),
      createPostObject({ title: 'Test Post - 3' }),
    ];
    const paginatedResult = {
      items: mockPosts,
      total: 3,
      page: 1,
      limit: 50,
      totalPages: 1,
    };

    postService.getAllPostsService.mockResolvedValueOnce(paginatedResult);

    await getAllPostsHandler(req, res, next);

    expect(postService.getAllPostsService).toHaveBeenCalledWith(req.query);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: undefined,
      data: mockPosts,
      meta: { total: 3, page: 1, limit: 50, totalPages: 1 },
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Get all posts: Failure - Internal Server Error', async () => {
    const req = createRequestObject();
    const error = new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR);

    postService.getAllPostsService.mockRejectedValueOnce(error);

    await getAllPostsHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('getFeaturedPostsHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Get featured posts: Success - Retrieving all featured posts list', async () => {
    const req = createRequestObject();
    const mockFeaturedPosts = [
      createPostObject({ title: 'Test Post - 1', isFeaturedPost: true }),
      createPostObject({ title: 'Test Post - 2', isFeaturedPost: true }),
      createPostObject({ title: 'Test Post - 3', isFeaturedPost: true }),
    ];

    postService.getFeaturedPostsService.mockResolvedValueOnce(mockFeaturedPosts);

    await getFeaturedPostsHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: undefined,
      data: mockFeaturedPosts,
      meta: undefined,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Get featured posts: Failure - Internal Server Error', async () => {
    const req = createRequestObject();
    const error = new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR);

    postService.getFeaturedPostsService.mockRejectedValueOnce(error);

    await getFeaturedPostsHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('getPostByCategoryHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Get posts by category: Success - Retrieving posts list of specified category', async () => {
    const req = createRequestObject({ params: { category: validCategories[1] } });
    const mockPosts = [
      createPostObject({ title: 'Test Post - 1', categories: [validCategories[1]] }),
      createPostObject({ title: 'Test Post - 2', categories: [validCategories[1]] }),
      createPostObject({ title: 'Test Post - 3', categories: [validCategories[1]] }),
    ];

    postService.getPostByCategoryService.mockResolvedValueOnce(mockPosts);

    await getPostByCategoryHandler(req, res, next);

    expect(postService.getPostByCategoryService).toHaveBeenCalledWith(validCategories[1]);
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: undefined,
      data: mockPosts,
      meta: undefined,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Get posts by category: Failure - Invalid category', async () => {
    const req = createRequestObject({ params: { category: 'Invalid Category' } });
    const error = new ApiError(HTTP_STATUS.BAD_REQUEST, RESPONSE_MESSAGES.POSTS.INVALID_CATEGORY);

    postService.getPostByCategoryService.mockRejectedValueOnce(error);

    await getPostByCategoryHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('Get posts by category: Failure - Internal Server Error', async () => {
    const req = createRequestObject({ params: { category: validCategories[1] } });
    const error = new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR);

    postService.getPostByCategoryService.mockRejectedValueOnce(error);

    await getPostByCategoryHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('getLatestPostsHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Get latest posts: Success - Retrieving most recent posts list', async () => {
    const req = createRequestObject();
    const mockPosts = [
      createPostObject({ title: 'Test Post - 1' }),
      createPostObject({ title: 'Test Post - 2' }),
      createPostObject({ title: 'Test Post - 3' }),
    ];

    postService.getLatestPostsService.mockResolvedValueOnce(mockPosts);

    await getLatestPostsHandler(req, res, next);

    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: undefined,
      data: mockPosts,
      meta: undefined,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Get latest posts: Failure - Internal Server Error', async () => {
    const req = createRequestObject();
    const error = new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR);

    postService.getLatestPostsService.mockRejectedValueOnce(error);

    await getLatestPostsHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('getPostByIdHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Get post by ID: Success - Retrieving Specific Post', async () => {
    const req = createRequestObject({ params: { id: '6910293383' } });
    const mockPost = createPostObject({ _id: '6910293383' });

    postService.getPostByIdService.mockResolvedValueOnce(mockPost);

    await getPostByIdHandler(req, res, next);

    expect(postService.getPostByIdService).toHaveBeenCalledWith('6910293383', { countView: true });
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: undefined,
      data: mockPost,
      meta: undefined,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Get post by ID: Failure - Post not found (Specified post ID is invalid)', async () => {
    const req = createRequestObject({ params: { id: '6910293383' } });
    const error = new ApiError(HTTP_STATUS.NOT_FOUND, RESPONSE_MESSAGES.POSTS.NOT_FOUND);

    postService.getPostByIdService.mockRejectedValueOnce(error);

    await getPostByIdHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('Get post by ID: Failure - Internal Server Error', async () => {
    const req = createRequestObject({ params: { id: '6910293383' } });
    const error = new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR);

    postService.getPostByIdService.mockRejectedValueOnce(error);

    await getPostByIdHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('updatePostHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Update post: Success - Modifying post content', async () => {
    const req = createRequestObject({
      params: { id: '6910293383' },
      body: { title: 'Updated Post' },
    });
    const mockPost = createPostObject({ _id: '6910293383', title: 'Updated Post' });

    postService.updatePostService.mockResolvedValueOnce(mockPost);

    await updatePostHandler(req, res, next);

    expect(postService.updatePostService).toHaveBeenCalledWith('6910293383', { title: 'Updated Post' });
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Post updated',
      data: mockPost,
      meta: undefined,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Update post: Failure - Post not found (Specified post ID is invalid)', async () => {
    const req = createRequestObject({
      params: { id: '6910293383' },
      body: { title: 'Updated Post' },
    });
    const error = new ApiError(HTTP_STATUS.NOT_FOUND, RESPONSE_MESSAGES.POSTS.NOT_FOUND);

    postService.updatePostService.mockRejectedValueOnce(error);

    await updatePostHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('Update post: Failure - Internal Server Error', async () => {
    const req = createRequestObject({
      params: { id: '6910293383' },
      body: { title: 'Updated Post' },
    });
    const error = new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR);

    postService.updatePostService.mockRejectedValueOnce(error);

    await updatePostHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe('deletePostByIdHandler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('Delete Post: Success - Removing Post with specified ID', async () => {
    const req = createRequestObject({ params: { id: '6910293383' } });

    postService.deletePostService.mockResolvedValueOnce();

    await deletePostByIdHandler(req, res, next);

    expect(postService.deletePostService).toHaveBeenCalledWith('6910293383');
    expect(res.status).toHaveBeenCalledWith(HTTP_STATUS.OK);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      message: 'Post deleted',
      data: undefined,
      meta: undefined,
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('Delete Post: Failure - Post not found (Specified post ID is invalid)', async () => {
    const req = createRequestObject({ params: { id: '6910293383' } });
    const error = new ApiError(HTTP_STATUS.NOT_FOUND, RESPONSE_MESSAGES.POSTS.NOT_FOUND);

    postService.deletePostService.mockRejectedValueOnce(error);

    await deletePostByIdHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('Delete Post: Failure - Internal Server Error', async () => {
    const req = createRequestObject({ params: { id: '6910293383' } });
    const error = new Error(RESPONSE_MESSAGES.COMMON.INTERNAL_SERVER_ERROR);

    postService.deletePostService.mockRejectedValueOnce(error);

    await deletePostByIdHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
