// Generic Response Wrappers
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
  errorStatus?: string;
  errorMessage?: string;
  errorCode?: number;
  timestamp?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  page: number;
  size: number;
  sort: string;
  totalElements: number;
}

// User Models
export interface User {
  id: string;
  username: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password?: string;
}

// Post Models
export interface Post {
  id: number;
  title: string;
  body: string;
  author: string;
  authorId: string;
  tags: string[];
  postedAt: string;
  lastUpdated: string;
  totalComments: number;
}

export interface CreatePostRequest {
  title: string;
  body: string;
  authorId: string;
  tags: string[];
}

export interface UpdatePostRequest {
  title?: string;
  body?: string;
  authorId: string;
  tags?: string[];
}

// Comment Models
export interface Comment {
  id: string;
  postId: number;
  author: string;
  content: string;
  createdAt: string;
}

export interface CreateCommentRequest {
  postId: number;
  commentContent: string;
  authorId: string;
}

// Metrics Models
export interface MethodMetric {
  callCount: number;
  averageExecutionTimeMs: number;
  maxExecutionTimeMs: number;
  minExecutionTimeMs: number;
  failureCount: number;
  failureRate: number;
}

export interface MetricsSummary {
  totalMethodsMonitored: number;
  totalCalls: number;
  averageExecutionTimeMs: number;
  overallFailureRate: number;
}

export interface MethodMetricDetail extends MethodMetric {
  methodName: string;
}

export type MetricsMap = Record<string, MethodMetric>;

// Helper for UI State
export enum AuthStatus {
  IDLE,
  AUTHENTICATED,
  ANONYMOUS
}