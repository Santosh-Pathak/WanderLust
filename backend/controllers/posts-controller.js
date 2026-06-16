import {
  addCommentService,
  addReactionService,
  addReplyService,
  createPostService,
  deletePostService,
  getAllPostsService,
  getFeaturedPostsService,
  getLatestPostsService,
  getPostByCategoryService,
  getPostByIdService,
  getRelatedPostsService,
  getTrendingPostsService,
  updatePostService,
} from '../services/post-service.js';
import { HTTP_STATUS, RESPONSE_MESSAGES } from '../utils/constants.js';
export const createPostHandler = async (req, res) => {
  try {
    const {
      title,
      authorName,
      imageLink,
      categories,
      description,
      isFeaturedPost = false,
    } = req.body;

    // Validation - check if all fields are filled
    if (!title || !authorName || !imageLink || !description || !categories) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: RESPONSE_MESSAGES.COMMON.REQUIRED_FIELDS });
    }

    // Validation - check if imageLink is a valid URL
    const imageLinkRegex = /\.(jpg|jpeg|png|webp)$/i;
    if (!imageLinkRegex.test(imageLink)) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: RESPONSE_MESSAGES.POSTS.INVALID_IMAGE_URL });
    }

    // Validation - check if categories array has more than 3 items
    if (categories.length > 3) {
      return res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ message: RESPONSE_MESSAGES.POSTS.MAX_CATEGORIES });
    }

    const savedPost = await createPostService({
      title,
      authorName,
      imageLink,
      description,
      categories,
      isFeaturedPost,
      tags: req.body.tags,
      status: req.body.status,
      scheduledFor: req.body.scheduledFor,
    });

    res.status(HTTP_STATUS.OK).json(savedPost);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const getAllPostsHandler = async (req, res) => {
  try {
    const result = await getAllPostsService(req.query);
    if (Object.keys(req.query).length > 0) {
      return res.status(HTTP_STATUS.OK).json({ success: true, data: result.items, meta: result });
    }
    return res.status(HTTP_STATUS.OK).json(result.items);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const getFeaturedPostsHandler = async (req, res) => {
  try {
    const featuredPosts = await getFeaturedPostsService();
    res.status(HTTP_STATUS.OK).json(featuredPosts);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const getPostByCategoryHandler = async (req, res) => {
  const category = req.params.category;
  try {
    const categoryPosts = await getPostByCategoryService(category);
    res.status(HTTP_STATUS.OK).json(categoryPosts);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const getLatestPostsHandler = async (req, res) => {
  try {
    const latestPosts = await getLatestPostsService();
    res.status(HTTP_STATUS.OK).json(latestPosts);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const getPostByIdHandler = async (req, res) => {
  try {
    const post = await getPostByIdService(req.params.id, { countView: true });
    res.status(HTTP_STATUS.OK).json(post);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const updatePostHandler = async (req, res) => {
  try {
    const updatedPost = await updatePostService(req.params.id, req.body);
    res.status(HTTP_STATUS.OK).json(updatedPost);
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const deletePostByIdHandler = async (req, res) => {
  try {
    await deletePostService(req.params.id);
    res.status(HTTP_STATUS.OK).json({ message: RESPONSE_MESSAGES.POSTS.DELETED });
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const getTrendingPostsHandler = async (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).json(await getTrendingPostsService());
  } catch (err) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const getRelatedPostsHandler = async (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).json(await getRelatedPostsService(req.params.id));
  } catch (err) {
    res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const addReactionHandler = async (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).json(await addReactionService(req.params.id, req.body.reaction));
  } catch (err) {
    res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const addCommentHandler = async (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).json(await addCommentService(req.params.id, req.body));
  } catch (err) {
    res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

export const addReplyHandler = async (req, res) => {
  try {
    res.status(HTTP_STATUS.OK).json(await addReplyService(req.params.id, req.params.commentId, req.body));
  } catch (err) {
    res.status(err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};
