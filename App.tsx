import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { PostCard } from './components/PostCard';
import { MetricsCharts } from './components/MetricsCharts';
import { api } from './services/api';
import { User, Post, Comment, MetricsMap, MetricsSummary } from './types';

// --- CONTEXT / GLOBAL STATE SIMULATION ---
// In a real app, use Context API or Redux. Here we pass props for simplicity given the single-file constraint structure.

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Handle Login Mock
  const handleLogin = (u: User) => {
    setUser(u);
    navigate('/');
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        user={user} 
        onLogout={handleLogout} 
        onNavigate={navigate} 
        currentPath={location.pathname}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/login" element={<LoginView onLogin={handleLogin} />} />
          <Route path="/register" element={<RegisterView onLogin={handleLogin} />} />
          <Route path="/post/:id" element={<PostDetailView user={user} />} />
          <Route path="/create" element={<CreatePostView user={user} />} />
          <Route path="/dashboard" element={<MetricsDashboardView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

// --- VIEWS ---

const HomeView: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.posts.getAll().then(res => {
      if (res.data) setPosts(res.data.content);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Latest Writings</h1>
        <p className="text-gray-600 mt-2">Explore the latest thoughts on technology and development.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map(post => (
          <PostCard key={post.id} post={post} onClick={(id) => navigate(`/post/${id}`)} />
        ))}
      </div>
      {posts.length === 0 && <div className="text-center text-gray-500 py-10">No posts found.</div>}
    </div>
  );
};

const PostDetailView: React.FC<{ user: User | null }> = ({ user }) => {
  const { id } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.posts.getById(Number(id)),
        api.comments.getByPostId(Number(id))
      ]);
      if (postRes.data) setPost(postRes.data);
      if (commentsRes.data) setComments(commentsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !post) return;
    
    setSubmitting(true);
    try {
      await api.comments.create({
        postId: post.id,
        commentContent: newComment,
        authorId: user.id
      });
      setNewComment("");
      fetchData(); // Refresh comments
    } catch (e) {
      alert("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!post) return <div className="text-center py-10">Post not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-8">
          <div className="flex space-x-2 mb-4">
             {post.tags.map(t => <span key={t} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded uppercase tracking-wide">{t}</span>)}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{post.title}</h1>
          <div className="flex items-center space-x-3 mb-8 border-b border-gray-100 pb-8">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
              {post.author.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-gray-900">{post.author}</div>
              <div className="text-xs text-gray-500">Posted on {new Date(post.postedAt).toLocaleDateString()}</div>
            </div>
          </div>
          <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
            {post.body}
          </div>
        </div>
      </article>

      <section className="bg-slate-50 rounded-xl p-6 border border-slate-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Comments ({comments.length})</h3>
        
        <div className="space-y-6 mb-8">
          {comments.map(comment => (
            <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-sm text-gray-900">{comment.author}</span>
                <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-gray-600 text-sm">{comment.content}</p>
            </div>
          ))}
          {comments.length === 0 && <p className="text-gray-500 text-sm italic">Be the first to comment.</p>}
        </div>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-sm"
              rows={3}
              placeholder="Share your thoughts..."
              required
            />
            <div className="mt-2 flex justify-end">
              <button 
                type="submit" 
                disabled={submitting}
                className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
              >
                {submitting ? "Posting..." : "Post Comment"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-indigo-50 p-4 rounded text-center text-indigo-800 text-sm">
            Please sign in to leave a comment.
          </div>
        )}
      </section>
    </div>
  );
};

const CreatePostView: React.FC<{ user: User | null }> = ({ user }) => {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    try {
      await api.posts.create({
        title,
        body,
        authorId: user.id,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean)
      });
      navigate('/');
    } catch (e) {
      alert("Error creating post");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
          <input
            type="text"
            placeholder="tech, life, tutorial"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none"
            value={tags}
            onChange={e => setTags(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none h-48"
            value={body}
            onChange={e => setBody(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-primary text-white py-2 rounded-md hover:bg-indigo-700 transition"
        >
          {submitting ? "Publishing..." : "Publish Post"}
        </button>
      </form>
    </div>
  );
};

const MetricsDashboardView: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsMap | null>(null);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.metrics.getAll(),
      api.metrics.getSummary()
    ]).then(([mRes, sRes]) => {
      if (mRes.data) setMetrics(mRes.data);
      if (sRes.data) setSummary(sRes.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!metrics || !summary) return <div>Error loading metrics</div>;

  return (
    <div>
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Performance</h1>
          <p className="text-gray-500">Real-time metrics from API endpoints</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="text-sm text-primary hover:text-indigo-800"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Monitored Methods" value={summary.totalMethodsMonitored} />
        <SummaryCard label="Total Calls" value={summary.totalCalls} />
        <SummaryCard label="Avg Latency" value={`${summary.averageExecutionTimeMs.toFixed(1)}ms`} />
        <SummaryCard label="Failure Rate" value={`${summary.overallFailureRate.toFixed(2)}%`} isError={summary.overallFailureRate > 1} />
      </div>

      <MetricsCharts data={metrics} />
    </div>
  );
};

const SummaryCard: React.FC<{label: string, value: string | number, isError?: boolean}> = ({label, value, isError}) => (
  <div className={`p-4 rounded-xl border ${isError ? 'bg-red-50 border-red-100' : 'bg-white border-gray-200'} shadow-sm`}>
    <div className={`text-xs font-medium uppercase tracking-wider ${isError ? 'text-red-600' : 'text-gray-500'}`}>{label}</div>
    <div className={`text-2xl font-bold mt-1 ${isError ? 'text-red-700' : 'text-gray-900'}`}>{value}</div>
  </div>
);

const LoginView: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [email, setEmail] = useState("john@example.com"); // Pre-filled for demo
  const [password, setPassword] = useState("password");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.auth.login({ email, password });
      if (res.data) onLogin(res.data);
    } catch (err: any) {
      setError(err.errorMessage || "Login failed");
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome Back</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none" required />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded font-medium hover:bg-indigo-700 transition">Sign In</button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          Tip: Use <code className="bg-gray-100 px-1">john@example.com</code>
        </div>
      </div>
    </div>
  );
};

const RegisterView: React.FC<{ onLogin: (u: User) => void }> = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.auth.register({ username, email, password });
      if (res.data) onLogin(res.data);
    } catch (err: any) {
      setError(err.errorMessage || "Registration failed");
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
        {error && <div className="bg-red-50 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none" required />
          </div>
          <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded font-medium hover:bg-slate-700 transition">Register</button>
        </form>
      </div>
    </div>
  );
};

const LoadingSpinner = () => (
  <div className="flex justify-center items-center h-64">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export default function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}