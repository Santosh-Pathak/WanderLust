const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'WanderLust Blogging API',
    version: '1.0.0',
    description: 'Versioned REST API for posts, auth, comments, reactions, search, and discovery.',
  },
  servers: [{ url: '/api/v1' }, { url: '/api' }],
  paths: {
    '/posts': {
      get: {
        summary: 'List posts',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
          { name: 'category', in: 'query', schema: { type: 'string' } },
          { name: 'tag', in: 'query', schema: { type: 'string' } },
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'sort', in: 'query', schema: { type: 'string', example: '-timeOfPost' } },
        ],
        responses: { 200: { description: 'Posts returned' } },
      },
      post: {
        summary: 'Create a post',
        requestBody: { required: true },
        responses: { 200: { description: 'Post created' }, 400: { description: 'Validation error' } },
      },
    },
    '/posts/featured': { get: { summary: 'Featured posts', responses: { 200: { description: 'Posts returned' } } } },
    '/posts/latest': { get: { summary: 'Latest posts', responses: { 200: { description: 'Posts returned' } } } },
    '/posts/trending': { get: { summary: 'Trending posts', responses: { 200: { description: 'Posts returned' } } } },
    '/posts/categories/{category}': {
      get: {
        summary: 'Posts by category',
        parameters: [{ name: 'category', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Posts returned' }, 400: { description: 'Invalid category' } },
      },
    },
    '/posts/{id}': {
      get: { summary: 'Get post and count a view', responses: { 200: { description: 'Post returned' } } },
      patch: { summary: 'Update post', responses: { 200: { description: 'Post updated' } } },
      delete: { summary: 'Delete post', responses: { 200: { description: 'Post deleted' } } },
    },
    '/posts/{id}/comments': {
      post: { summary: 'Add comment', responses: { 200: { description: 'Comment created' } } },
    },
    '/posts/{id}/comments/{commentId}/replies': {
      post: { summary: 'Add nested reply', responses: { 200: { description: 'Reply created' } } },
    },
    '/posts/{id}/reactions': {
      post: { summary: 'Add reaction', responses: { 200: { description: 'Reaction recorded' } } },
    },
    '/posts/{id}/related': {
      get: { summary: 'Related posts', responses: { 200: { description: 'Posts returned' } } },
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
      post: { summary: 'Sign out and revoke refresh token', responses: { 200: { description: 'Signed out' } } },
    },
  },
};

export default swaggerDocument;
