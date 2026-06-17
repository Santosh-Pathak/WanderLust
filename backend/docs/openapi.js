const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'WanderLust Blogging API',
    version: '2.0.0',
    description: 'Versioned REST API for posts, auth, comments, reactions, search, categories, tags, bookmarks, admin dashboard, and discovery.',
    contact: { name: 'WanderLust Team' },
  },
  servers: [
    { url: '/api/v1', description: 'Versioned API' },
    { url: '/api', description: 'Unversioned API' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'access_token',
      },
    },
    schemas: {
      Post: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          title: { type: 'string' },
          slug: { type: 'string' },
          authorName: { type: 'string' },
          imageLink: { type: 'string' },
          categories: { type: 'array', items: { type: 'string' } },
          tags: { type: 'array', items: { type: 'string' } },
          description: { type: 'string' },
          excerpt: { type: 'string' },
          status: { type: 'string', enum: ['draft', 'published', 'scheduled', 'archived'] },
          isFeaturedPost: { type: 'boolean' },
          viewCount: { type: 'integer' },
          readTimeMinutes: { type: 'integer' },
          reactions: {
            type: 'object',
            properties: {
              like: { type: 'integer' },
              love: { type: 'integer' },
              insightful: { type: 'integer' },
            },
          },
          comments: { type: 'array', items: { $ref: '#/components/schemas/Comment' } },
          publishedAt: { type: 'string', format: 'date-time' },
          timeOfPost: { type: 'string', format: 'date-time' },
        },
      },
      Comment: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          authorName: { type: 'string' },
          content: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          replies: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                _id: { type: 'string' },
                authorName: { type: 'string' },
                content: { type: 'string' },
                createdAt: { type: 'string', format: 'date-time' },
              },
            },
          },
        },
      },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          avatar: { type: 'string' },
          role: { type: 'string', enum: ['user', 'admin'] },
        },
      },
      Category: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          color: { type: 'string' },
          postCount: { type: 'integer' },
        },
      },
      Tag: {
        type: 'object',
        properties: {
          _id: { type: 'string' },
          name: { type: 'string' },
          postCount: { type: 'integer' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          requestId: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/posts': {
      get: {
        summary: 'List posts with pagination, search, and filters',
        security: [],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'tag', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['published', 'draft', 'scheduled', 'all'], default: 'published' } },
          { name: 'sort', in: 'query', schema: { type: 'string', example: '-timeOfPost' } },
        ],
        responses: {
          200: { description: 'Paginated posts' },
        },
      },
      post: {
        summary: 'Create a post (authenticated)',
        security: [{ bearerAuth: [] }, { cookieAuth: [] }],
        requestBody: { required: true, content: { 'application/json': { schema: { $ref: '#/components/schemas/Post' } } } },
        responses: { 201: { description: 'Post created' }, 400: { description: 'Validation error' } },
      },
    },
    '/posts/featured': {
      get: { summary: 'Featured posts', responses: { 200: { description: 'Posts returned' } } },
    },
    '/posts/latest': {
      get: { summary: 'Latest posts', responses: { 200: { description: 'Posts returned' } } },
    },
    '/posts/trending': {
      get: { summary: 'Trending posts (by view count)', responses: { 200: { description: 'Posts returned' } } },
    },
    '/posts/categories/{category}': {
      get: {
        summary: 'Posts by category',
        parameters: [{ name: 'category', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Posts returned' }, 400: { description: 'Invalid category' } },
      },
    },
    '/posts/tags/{tag}': {
      get: {
        summary: 'Posts by tag',
        parameters: [{ name: 'tag', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Posts returned' } },
      },
    },
    '/posts/{id}': {
      get: { summary: 'Get post by ID (counts a view)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Post returned' } } },
      patch: { summary: 'Update post', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Post updated' } } },
      delete: { summary: 'Delete post', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Post deleted' } } },
    },
    '/posts/{id}/related': {
      get: { summary: 'Related posts', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Related posts' } } },
    },
    '/posts/{id}/comments': {
      post: { summary: 'Add comment', responses: { 201: { description: 'Comment created' } } },
    },
    '/posts/{id}/comments/{commentId}/replies': {
      post: { summary: 'Add nested reply', responses: { 201: { description: 'Reply created' } } },
    },
    '/posts/{id}/reactions': {
      post: {
        summary: 'Add reaction',
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { reaction: { type: 'string', enum: ['like', 'love', 'insightful'] } },
              },
            },
          },
        },
        responses: { 200: { description: 'Reaction recorded' } },
      },
    },
    '/auth/email-password/signup': {
      post: { summary: 'Email/password signup', responses: { 200: { description: 'Signed up' } } },
    },
    '/auth/email-password/signin': {
      post: { summary: 'Email/password signin', responses: { 200: { description: 'Signed in' } } },
    },
    '/auth/refresh': {
      post: { summary: 'Refresh access token', responses: { 200: { description: 'Token refreshed' } } },
    },
    '/auth/signout': {
      post: { summary: 'Sign out and revoke refresh token', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Signed out' } } },
    },
    '/users/me': {
      get: { summary: 'Get current user profile', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Profile returned' } } },
      patch: { summary: 'Update profile', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Profile updated' } } },
    },
    '/users/bookmarks': {
      get: { summary: 'Get user bookmarks', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Bookmarks returned' } } },
    },
    '/users/bookmarks/{postId}': {
      post: { summary: 'Toggle bookmark on a post', security: [{ bearerAuth: [] }], parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'string' } }], responses: { 200: { description: 'Bookmark toggled' } } },
    },
    '/users/history': {
      get: { summary: 'Get reading history', security: [{ bearerAuth: [] }], responses: { 200: { description: 'History returned' } } },
    },
    '/users/history/{postId}': {
      post: { summary: 'Record reading history', security: [{ bearerAuth: [] }], responses: { 200: { description: 'History recorded' } } },
    },
    '/categories': {
      get: { summary: 'List all categories', responses: { 200: { description: 'Categories returned' } } },
      post: { summary: 'Create category (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Category created' } } },
    },
    '/categories/{id}': {
      get: { summary: 'Get category by ID', responses: { 200: { description: 'Category returned' } } },
      patch: { summary: 'Update category (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Category updated' } } },
      delete: { summary: 'Delete category (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Category deleted' } } },
    },
    '/tags': {
      get: { summary: 'List all tags', responses: { 200: { description: 'Tags returned' } } },
      post: { summary: 'Create tag (admin)', security: [{ bearerAuth: [] }], responses: { 201: { description: 'Tag created' } } },
    },
    '/tags/{id}': {
      get: { summary: 'Get tag by ID', responses: { 200: { description: 'Tag returned' } } },
      patch: { summary: 'Update tag (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Tag updated' } } },
      delete: { summary: 'Delete tag (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Tag deleted' } } },
    },
    '/admin/stats': {
      get: { summary: 'Dashboard stats (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Stats returned' } } },
    },
    '/admin/posts': {
      get: { summary: 'All posts (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Posts returned' } } },
    },
    '/admin/users': {
      get: { summary: 'All users (admin)', security: [{ bearerAuth: [] }], responses: { 200: { description: 'Users returned' } } },
    },
  },
};

export default swaggerDocument;
