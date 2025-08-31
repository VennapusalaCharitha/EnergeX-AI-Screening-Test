export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Post {
  id: number;
  title: string;
  content: string;
  user_id: number;
  user?: {
    id: number;
    name: string;
  };
  user_name?: string;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface PostsResponse {
  posts: Post[];
  cached?: boolean;
}