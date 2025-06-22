export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  avatar?: string;
  role: "user" | "admin";
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  authorId: string;
  author?: User;
  status: "draft" | "published" | "archived";
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  views: number;
  readTime: number;
}

export interface Comment {
  id: string;
  content: string;
  blogId: string;
  authorId: string;
  author?: User;
  parentId?: string;
  replies?: Comment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Like {
  id: string;
  userId: string;
  blogId: string;
  createdAt: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  postCount: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  username: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export interface BlogFilters {
  search?: string;
  categories?: string[];
  tags?: string[];
  author?: string;
  status?: Blog["status"];
  sortBy?: "createdAt" | "publishedAt" | "title" | "likes" | "views";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
