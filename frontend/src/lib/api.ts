import axios from 'axios';
import Post from '@/types/post-type';

const baseURL = import.meta.env.VITE_API_PATH || '';

export const api = axios.create({
  baseURL,
  withCredentials: true,
});

export type PostsResponse = {
  data: Post[];
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

const unwrapPosts = (payload: Post[] | { data: Post[]; meta?: PostsResponse['meta'] }): PostsResponse =>
  Array.isArray(payload) ? { data: payload } : { data: payload.data, meta: payload.meta };

export const postApi = {
  async list(params?: Record<string, string | number | undefined>) {
    const response = await api.get('/api/posts', { params });
    return unwrapPosts(response.data);
  },
  async featured() {
    const response = await api.get('/api/posts/featured');
    return response.data.data as Post[];
  },
  async latest() {
    const response = await api.get('/api/posts/latest');
    return response.data.data as Post[];
  },
  async trending() {
    const response = await api.get('/api/posts/trending');
    return response.data.data as Post[];
  },
  async byId(id: string) {
    const response = await api.get(`/api/posts/${id}`);
    return response.data.data as Post;
  },
  async related(id: string) {
    const response = await api.get(`/api/posts/${id}/related`);
    return response.data.data as Post[];
  },
  async react(id: string, reaction: 'like' | 'love' | 'insightful') {
    const response = await api.post(`/api/posts/${id}/reactions`, { reaction });
    return response.data.data as Post;
  },
  async comment(id: string, payload: { authorName: string; content: string }) {
    const response = await api.post(`/api/posts/${id}/comments`, payload);
    return response.data.data;
  },
  async reply(id: string, commentId: string, payload: { authorName: string; content: string }) {
    const response = await api.post(`/api/posts/${id}/comments/${commentId}/replies`, payload);
    return response.data.data;
  },
  async byTag(tag: string) {
    const response = await api.get(`/api/posts/tags/${tag}`);
    return response.data.data as Post[];
  },
};

export const categoriesApi = {
  async list() {
    const response = await api.get('/api/categories');
    return response.data.data;
  },
};

export const tagsApi = {
  async list() {
    const response = await api.get('/api/tags');
    return response.data.data;
  },
};

export const usersApi = {
  async getProfile() {
    const response = await api.get('/api/users/me');
    return response.data.data;
  },
  async updateProfile(payload: { name?: string; avatar?: string }) {
    const response = await api.patch('/api/users/me', payload);
    return response.data.data;
  },
  async toggleBookmark(postId: string) {
    const response = await api.post(`/api/users/bookmarks/${postId}`);
    return response.data.data;
  },
  async getBookmarks() {
    const response = await api.get('/api/users/bookmarks');
    return response.data.data;
  },
  async recordReadingHistory(postId: string) {
    await api.post(`/api/users/history/${postId}`);
  },
  async getReadingHistory() {
    const response = await api.get('/api/users/history');
    return response.data.data;
  },
};

export const adminApi = {
  async getStats() {
    const response = await api.get('/api/admin/stats');
    return response.data.data;
  },
  async getPosts(params?: Record<string, string | number | undefined>) {
    const response = await api.get('/api/admin/posts', { params });
    return response.data;
  },
  async getUsers(params?: Record<string, string | number | undefined>) {
    const response = await api.get('/api/admin/users', { params });
    return response.data;
  },
};
