import { 
  User, LoginRequest, RegisterRequest, Post, CreatePostRequest, 
  ApiResponse, PaginatedResponse, Comment, CreateCommentRequest,
  MetricsMap, MetricsSummary, MethodMetricDetail
} from '../types';

// --- MOCK DATA STORE ---
const DELAY_MS = 600;

// Initial Mock Data
let users: User[] = [
  { id: "550e8400-e29b-41d4-a716-446655440000", username: "johndoe", email: "john@example.com" },
  { id: "660e8400-e29b-41d4-a716-446655440001", username: "janedoe", email: "jane@example.com" }
];

let posts: Post[] = [
  {
    id: 1,
    title: "Understanding React 18 Concurrency",
    body: "React 18 introduces a new concurrency model that allows React to interrupt rendering...",
    author: "johndoe",
    authorId: "550e8400-e29b-41d4-a716-446655440000",
    tags: ["react", "frontend", "javascript"],
    postedAt: "2026-01-20T10:30:00",
    lastUpdated: "2026-01-20T10:30:00",
    totalComments: 2
  },
  {
    id: 2,
    title: "Spring Boot Performance Tuning",
    body: "Optimizing JVM settings and connection pools is critical for high-throughput applications...",
    author: "janedoe",
    authorId: "660e8400-e29b-41d4-a716-446655440001",
    tags: ["java", "spring", "backend"],
    postedAt: "2026-01-25T14:15:00",
    lastUpdated: "2026-01-26T09:00:00",
    totalComments: 0
  }
];

let comments: Comment[] = [
  {
    id: "507f1f77bcf86cd799439011",
    postId: 1,
    author: "janedoe",
    content: "Great explanation of the new suspense features!",
    createdAt: "2026-01-21T09:30:00"
  },
  {
    id: "507f1f77bcf86cd799439012",
    postId: 1,
    author: "johndoe",
    content: "Thanks Jane!",
    createdAt: "2026-01-21T10:00:00"
  }
];

// Metrics Mock
const mockMetrics: MetricsMap = {
  "SERVICE::createPost": { callCount: 150, averageExecutionTimeMs: 45.5, maxExecutionTimeMs: 120, minExecutionTimeMs: 10, failureCount: 2, failureRate: 1.33 },
  "REPOSITORY::findById": { callCount: 500, averageExecutionTimeMs: 5.2, maxExecutionTimeMs: 25, minExecutionTimeMs: 1, failureCount: 0, failureRate: 0.0 },
  "SERVICE::processImage": { callCount: 45, averageExecutionTimeMs: 210.5, maxExecutionTimeMs: 800, minExecutionTimeMs: 150, failureCount: 5, failureRate: 11.1 },
  "CONTROLLER::getAllPosts": { callCount: 1200, averageExecutionTimeMs: 15.0, maxExecutionTimeMs: 60, minExecutionTimeMs: 5, failureCount: 1, failureRate: 0.08 }
};

// --- HELPER FUNCTIONS ---

const delay = <T>(data: T, ms = DELAY_MS): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), ms));
};

const success = <T>(data: T, message = "Operation successful"): ApiResponse<T> => ({
  status: "success",
  message,
  data
});

const error = (message: string, code = 400): Promise<any> => {
  return Promise.reject({
    errorStatus: "error",
    errorMessage: message,
    errorCode: code,
    timestamp: new Date().toISOString()
  });
};

// --- API IMPLEMENTATION ---

export const api = {
  auth: {
    login: async (req: LoginRequest): Promise<ApiResponse<User>> => {
      await delay(null);
      const user = users.find(u => u.email === req.email);
      if (user) return success(user, "User sign in successful");
      throw await error("Invalid credentials", 401);
    },
    register: async (req: RegisterRequest): Promise<ApiResponse<User>> => {
      await delay(null);
      if (users.find(u => u.email === req.email)) throw await error("User already exists");
      
      const newUser: User = {
        id: crypto.randomUUID(),
        username: req.username,
        email: req.email
      };
      users.push(newUser);
      return success(newUser, "User registration successful");
    }
  },
  posts: {
    getAll: async (page = 0, size = 10, tag?: string): Promise<ApiResponse<PaginatedResponse<Post>>> => {
      await delay(null);
      let filtered = [...posts].sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
      
      if (tag) {
        filtered = filtered.filter(p => p.tags.includes(tag));
      }

      const start = page * size;
      const paginated = filtered.slice(start, start + size);
      
      return success({
        content: paginated,
        page,
        size,
        sort: "lastUpdated",
        totalElements: filtered.length
      }, "Posts retrieved successfully");
    },
    getById: async (id: number): Promise<ApiResponse<Post>> => {
      await delay(null);
      const post = posts.find(p => p.id === id);
      if (post) return success(post, "Post retrieved successfully");
      throw await error("Post not found", 404);
    },
    create: async (req: CreatePostRequest): Promise<ApiResponse<Post>> => {
      await delay(null);
      const user = users.find(u => u.id === req.authorId);
      if (!user) throw await error("Author not found", 404);

      const newPost: Post = {
        id: Math.max(...posts.map(p => p.id), 0) + 1,
        title: req.title,
        body: req.body,
        author: user.username,
        authorId: user.id,
        tags: req.tags,
        postedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        totalComments: 0
      };
      posts.push(newPost);
      return success(newPost, "Post created successfully");
    }
  },
  comments: {
    getByPostId: async (postId: number): Promise<ApiResponse<Comment[]>> => {
      await delay(null);
      const postComments = comments.filter(c => c.postId === postId);
      return success(postComments, "Comments for post retrieved successfully");
    },
    create: async (req: CreateCommentRequest): Promise<ApiResponse<Comment>> => {
      await delay(null);
      const user = users.find(u => u.id === req.authorId);
      const postIndex = posts.findIndex(p => p.id === req.postId);
      
      if (!user || postIndex === -1) throw await error("Resource not found", 404);

      const newComment: Comment = {
        id: crypto.randomUUID(),
        postId: req.postId,
        author: user.username,
        content: req.commentContent,
        createdAt: new Date().toISOString()
      };
      
      comments.push(newComment);
      posts[postIndex].totalComments += 1; // Update denormalized count

      return success(newComment, "Comment added to post successfully");
    }
  },
  metrics: {
    getAll: async (): Promise<ApiResponse<MetricsMap>> => {
      await delay(null);
      return success(mockMetrics);
    },
    getSummary: async (): Promise<ApiResponse<MetricsSummary>> => {
      await delay(null);
      const values = Object.values(mockMetrics);
      const totalCalls = values.reduce((sum, m) => sum + m.callCount, 0);
      const totalFailures = values.reduce((sum, m) => sum + m.failureCount, 0);
      
      return success({
        totalMethodsMonitored: values.length,
        totalCalls,
        averageExecutionTimeMs: values.reduce((sum, m) => sum + m.averageExecutionTimeMs, 0) / values.length,
        overallFailureRate: (totalFailures / totalCalls) * 100
      });
    },
    getSlow: async (thresholdMs = 100): Promise<ApiResponse<{threshold: number, slowMethods: MethodMetricDetail[]}>> => {
      await delay(null);
      const slow = Object.entries(mockMetrics)
        .filter(([_, m]) => m.averageExecutionTimeMs > thresholdMs)
        .map(([name, m]) => ({ methodName: name, ...m }));
      
      return success({
        threshold: thresholdMs,
        slowMethods: slow
      });
    }
  }
};