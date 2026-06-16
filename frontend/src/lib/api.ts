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
    const response = await api.get<Post[]>('/api/posts/featured');
    return response.data;
  },
  async latest() {
    const response = await api.get<Post[]>('/api/posts/latest');
    return response.data;
  },
  async trending() {
    const response = await api.get<Post[]>('/api/posts/trending');
    return response.data;
  },
  async byId(id: string) {
    const response = await api.get<Post>(`/api/posts/${id}`);
    return response.data;
  },
  async related(id: string) {
    const response = await api.get<Post[]>(`/api/posts/${id}/related`);
    return response.data;
  },
  async react(id: string, reaction: 'like' | 'love' | 'insightful') {
    const response = await api.post<Post>(`/api/posts/${id}/reactions`, { reaction });
    return response.data;
  },
  async comment(id: string, payload: { authorName: string; content: string }) {
    const response = await api.post(`/api/posts/${id}/comments`, payload);
    return response.data;
  },
};
