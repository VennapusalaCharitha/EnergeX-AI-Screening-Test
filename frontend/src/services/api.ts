import axios from 'axios';
import { AuthResponse, Post, PostsResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  register: (name: string, email: string, password: string): Promise<AuthResponse> =>
    api.post('/register', { name, email, password }).then(res => res.data),
  
  login: (email: string, password: string): Promise<AuthResponse> =>
    api.post('/login', { email, password }).then(res => res.data),
  
  logout: () => api.post('/logout'),
  
  me: () => api.get('/me').then(res => res.data),
};

export const postsAPI = {
  getPosts: (): Promise<PostsResponse> =>
    api.get('/posts').then(res => res.data),
  
  getPost: (id: number): Promise<{ post: Post }> =>
    api.get(`/posts/${id}`).then(res => res.data),
  
  createPost: (title: string, content: string): Promise<Post> =>
    api.post('/posts', { title, content }).then(res => res.data),
  
  updatePost: (id: number, title: string, content: string): Promise<Post> =>
    api.put(`/posts/${id}`, { title, content }).then(res => res.data),
  
  deletePost: (id: number) => api.delete(`/posts/${id}`),
};

export default api;