import React from 'react';
import { Link } from 'react-router-dom';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  return (
    <Link
      to={`/post/${post.id}`}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-all duration-200 cursor-pointer group flex flex-col h-full block"
    >
      {/* Header with title and comment count */}
      <div className="flex justify-between items-start gap-3 mb-3">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-2 flex-1">
          {post.title}
        </h3>
        <span className="text-xs text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
          {post.totalComments} {post.totalComments === 1 ? 'comment' : 'comments'}
        </span>
      </div>

      {/* Body preview */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">{post.body}</p>

      {/* Footer with author and tags */}
      <div className="mt-auto pt-4 border-t border-gray-100">
        {/* Author info */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
            {post.author.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-gray-900 truncate">{post.author}</span>
            <span className="text-xs text-gray-500">{new Date(post.postedAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {post.tags.slice(0, 4).map(tag => (
            <span
              key={tag}
              className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md font-medium"
            >
              #{tag}
            </span>
          ))}
          {post.tags.length > 4 && (
            <span className="text-xs text-gray-500 px-2 py-1">+{post.tags.length - 4} more</span>
          )}
        </div>
      </div>
    </Link>
  );
};