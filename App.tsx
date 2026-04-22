import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { PostCard } from './components/PostCard';
import { MetricsCharts } from './components/MetricsCharts';
import { api, storage } from './services/api';
import { User, Post, Comment, MetricsResponse, MetricsSummary, UserProfile } from './types';

// --- CONTEXT / GLOBAL STATE SIMULATION ---
// In a real app, use Context API or Redux. Here we pass props for simplicity given the single-file constraint structure.

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = api.auth.getStoredUser();
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  // Handle Login
  const handleLogin = (u: User) => {
    setUser(u);
    navigate('/');
  };

  const handleLogout = () => {
    api.auth.logout(); // Clear localStorage
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
          <Route path="/profile" element={<ProfileView user={user} />} />
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
  const [search, setSearch] = useState("");
  const [author, setAuthor] = useState("");
  const [tags, setTags] = useState("");
  const [sortBy, setSortBy] = useState<'id' | 'createdAt' | 'lastUpdated' | 'title'>('lastUpdated');
  const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await api.posts.getAll(currentPage, 10, {
        sort: sortBy,
        order: sortOrder,
        author: author || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        search: search || undefined
      });

      if (res.data) {
        setPosts(res.data.content);
        setTotalPages(Math.ceil(res.data.totalElements / res.data.size));
      }
    } catch (e) {
      console.error('Failed to fetch posts', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(0); // Reset to first page on new search
    fetchPosts();
  };

  const handleClearFilters = () => {
    setSearch("");
    setAuthor("");
    setTags("");
    setSortBy('lastUpdated');
    setSortOrder('DESC');
    setCurrentPage(0);
  };

  if (loading && posts.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Latest Writings</h1>
        <p className="text-gray-600 mt-2">Explore the latest thoughts on technology and development.</p>
      </header>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          {/* Search and Sort Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search in title and content..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="lastUpdated">Last Updated</option>
                <option value="createdAt">Created Date</option>
                <option value="title">Title</option>
                <option value="id">ID</option>
              </select>
            </div>
          </div>

          {/* Author, Tags, and Order Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Filter by author..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Comma-separated tags..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Order</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
            >
              Apply Filters
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Clear All
            </button>
          </div>
        </form>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {loading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="text-center text-gray-500 py-10">
          No posts found. Try adjusting your filters.
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-gray-700">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

const PostDetailView: React.FC<{ user: User | null }> = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const deletedRef = React.useRef(false);

  const fetchData = async () => {
    if (!id || deletedRef.current) return;
    try {
      const [postRes, commentsRes] = await Promise.all([
        api.posts.getById(Number(id)),
        api.comments.getByPostId(Number(id))
      ]);
      // Check again after async operation
      if (deletedRef.current) return;
      if (postRes.data) setPost(postRes.data);
      if (commentsRes.data) setComments(commentsRes.data);
    } catch (e) {
      if (!deletedRef.current) {
        console.error(e);
      }
    } finally {
      if (!deletedRef.current) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editTags, setEditTags] = useState("");
  const [deleting, setDeleting] = useState(false);

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

  const handleDeletePost = async () => {
    if (!post || !user) return;
    if (!confirm("Are you sure you want to delete this post?")) return;

    setDeleting(true);
    deletedRef.current = true; // Mark as deleted immediately to prevent any fetches
    try {
      await api.posts.delete(post.id);
      navigate('/', { replace: true }); // Replace history so user can't go back
    } catch (e) {
      deletedRef.current = false; // Reset on failure
      alert("Failed to delete post");
      setDeleting(false);
    }
  };

  const handleEditPost = () => {
    if (!post) return;
    setEditTitle(post.title);
    setEditBody(post.body);
    setEditTags(post.tags.join(", "));
    setIsEditing(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setSubmitting(true);
    try {
      await api.posts.update(post.id, {
        title: editTitle,
        body: editBody,
        tags: editTags.split(',').map((t: string) => t.trim()).filter(Boolean)
      });
      setIsEditing(false);
      fetchData();
    } catch (e) {
      alert("Failed to update post");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    try {
      await api.comments.delete(commentId);
      fetchData();
    } catch (e) {
      alert("Failed to delete comment");
    }
  };

  const isPostAuthor = user && post && user.id === post.authorId;

  if (loading) return <LoadingSpinner />;
  if (!post) return <div className="text-center py-10">Post not found</div>;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-gray-600 hover:text-primary mb-6 group transition"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium">Back to Feed</span>
      </button>

      <article className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8">
        <div className="p-8">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((t: any) => (
              <span key={t} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-md">
                #{t}
              </span>
            ))}
          </div>

          {isEditing ? (
            /* Edit Form */
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e: { target: { value: any; }; }) => setEditTitle(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  value={editTags}
                  onChange={(e: { target: { value: any; }; }) => setEditTags(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  value={editBody}
                  onChange={(e: { target: { value: any; }; }) => setEditBody(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none h-64"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            /* View Mode */
            <>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6">{post.title}</h1>

              <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-8">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold">
                    {post.author.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-gray-900">{post.author}</div>
                    <div className="text-xs text-gray-500">Posted on {new Date(post.postedAt).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Edit/Delete buttons for author */}
                {isPostAuthor && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditPost}
                      className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-primary px-3 py-1.5 rounded-md hover:bg-indigo-50 transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={handleDeletePost}
                      disabled={deleting}
                      className="flex items-center gap-1.5 text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-md hover:bg-red-50 transition disabled:opacity-50"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      {deleting ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                )}
              </div>

              <div className="prose prose-indigo max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                {post.body}
              </div>
            </>
          )}
        </div>
      </article>

      <section className="bg-slate-50 rounded-xl p-6 border border-slate-100">
        <h3 className="text-xl font-bold text-gray-800 mb-6">Comments ({comments.length})</h3>

        <div className="space-y-4 mb-8">
          {comments.map((comment: { author: string; id: string; createdAt: string | number | Date; content: any; }) => {
            const isCommentAuthor = user && user.username === comment.author;
            return (
              <div key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white font-bold text-xs">
                      {comment.author.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-sm text-gray-900">{comment.author}</span>
                    <span className="text-xs text-gray-400">• {new Date(comment.createdAt).toLocaleDateString()}</span>
                  </div>
                  {isCommentAuthor && (
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-400 hover:text-red-600 p-1 rounded transition"
                      title="Delete comment"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-gray-600 text-sm pl-9">{comment.content}</p>
              </div>
            );
          })}
          {comments.length === 0 && <p className="text-gray-500 text-sm italic">Be the first to comment.</p>}
        </div>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="mt-4">
            <textarea
              value={newComment}
              onChange={(e: { target: { value: any; }; }) => setNewComment(e.target.value)}
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
        tags: tags.split(',').map((t: string) => t.trim()).filter(Boolean)
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
            onChange={(e: { target: { value: any; }; }) => setTitle(e.target.value)}
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
            onChange={(e: { target: { value: any; }; }) => setTags(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none h-48"
            value={body}
            onChange={(e: { target: { value: any; }; }) => setBody(e.target.value)}
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

const ProfileView: React.FC<{ user: User | null }> = ({ user }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    api.auth.getProfile(user.id)
      .then(res => {
        if (res.data) setProfile(res.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.errorMessage || 'Failed to load profile');
        setLoading(false);
      });
  }, [user, navigate]);

  if (loading) return <LoadingSpinner />;
  if (error) return <div className="text-center py-10 text-red-600">{error}</div>;
  if (!profile) return <div className="text-center py-10">Profile not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
        <div className="flex items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
            <p className="text-gray-500">{profile.email}</p>
            <div className="flex gap-4 mt-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{profile.totalPosts}</div>
                <div className="text-xs text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{profile.totalComments}</div>
                <div className="text-xs text-gray-500">Comments</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Posts</h2>
          {profile.recentPosts.length > 0 ? (
            <div className="space-y-4">
              {profile.recentPosts.map((post: { id: any; title: any; body: any; postedAt: string | number | Date; totalComments: any; tags: any[]; }) => (
                <div
                  key={post.id}
                  onClick={() => navigate(`/post/${post.id}`)}
                  className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                >
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{post.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">{post.body}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">{new Date(post.postedAt).toLocaleDateString()}</span>
                    <span className="text-xs text-emerald-600">{post.totalComments} comments</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.slice(0, 3).map((tag: any) => (
                      <span key={tag} className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">#{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No posts yet.</p>
          )}
        </div>

        {/* Recent Comments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Comments</h2>
          {profile.recentComments.length > 0 ? (
            <div className="space-y-4">
              {profile.recentComments.map((comment: { id: any; postId: any; content: any; createdAt: string | number | Date; }) => (
                <div
                  key={comment.id}
                  onClick={() => navigate(`/post/${comment.postId}`)}
                  className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                >
                  <p className="text-sm text-gray-700 line-clamp-2">{comment.content}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs text-indigo-600">on post #{comment.postId}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No comments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const MetricsDashboardView: React.FC = () => {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [summary, setSummary] = useState<MetricsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [resetting, setResetting] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const [mRes, sRes] = await Promise.all([
        api.metrics.getAll(),
        api.metrics.getSummary()
      ]);
      if (mRes.data) setMetrics(mRes.data);
      if (sRes.data) setSummary(sRes.data);
    } catch (err: any) {
      setError(err.errorMessage || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReset = async () => {
    if (!confirm("Are you sure you want to reset all metrics?")) return;
    setResetting(true);
    try {
      await api.metrics.reset();
      fetchData();
    } catch (err: any) {
      alert(err.errorMessage || 'Failed to reset metrics');
    } finally {
      setResetting(false);
    }
  };

  const handleExport = async () => {
    try {
      await api.metrics.exportToLog();
      alert("Metrics exported to application log");
    } catch (err: any) {
      alert(err.errorMessage || 'Failed to export metrics');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) {
    return (
      <div className="text-center py-10">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={fetchData}
          className="text-primary hover:text-indigo-800"
        >
          Try Again
        </button>
      </div>
    );
  }
  if (!metrics || !summary) {
    return (
      <div className="text-center py-10">
        <div className="text-gray-600 mb-4">No metrics data available</div>
        <button
          onClick={fetchData}
          className="text-primary hover:text-indigo-800"
        >
          Refresh
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Performance</h1>
          <p className="text-gray-500">Real-time metrics from API endpoints</p>
          {metrics.timestamp && (
            <p className="text-xs text-gray-400 mt-1">
              Last updated: {new Date(metrics.timestamp).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="text-sm text-gray-600 hover:text-gray-800 px-3 py-1.5 rounded border border-gray-200 hover:bg-gray-50"
          >
            Export Log
          </button>
          <button
            onClick={handleReset}
            disabled={resetting}
            className="text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded border border-red-200 hover:bg-red-50 disabled:opacity-50"
          >
            {resetting ? "Resetting..." : "Reset"}
          </button>
          <button
            onClick={fetchData}
            className="text-sm text-primary hover:text-indigo-800 px-3 py-1.5 rounded border border-indigo-200 hover:bg-indigo-50"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Monitored Methods" value={summary.totalMethodsMonitored ?? 0} />
        <SummaryCard label="Total Executions" value={summary.totalExecutions ?? 0} />
        <SummaryCard label="Avg Latency" value={summary.overallAverageExecutionTime || '0 ms'} />
        <SummaryCard
          label="Total Failures"
          value={summary.totalFailures ?? 0}
          isError={(summary.totalFailures ?? 0) > 0}
        />
      </div>

      <MetricsCharts metrics={metrics.metrics || {}} />
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
  const [email, setEmail] = useState(""); // Pre-filled for demo
  const [password, setPassword] = useState("");
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
            <input type="email" value={email} onChange={(e: { target: { value: any; }; }) => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e: { target: { value: any; }; }) => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none" required />
          </div>
          <button type="submit" className="w-full bg-primary text-white py-2 rounded font-medium hover:bg-indigo-700 transition">Sign In</button>
        </form>
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
            <input type="text" value={username} onChange={(e: { target: { value: any; }; }) => setUsername(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e: { target: { value: any; }; }) => setEmail(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={password} onChange={(e: { target: { value: any; }; }) => setPassword(e.target.value)} className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-primary outline-none" required />
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