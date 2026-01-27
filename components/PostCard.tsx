import React from 'react';
import { Post } from '../types';

interface PostCardProps {
  post: Post;
  onClick: (id: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick }) => {
  return (
    <div 
      onClick={() => onClick(post.id)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary transition-colors">{post.title}</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{post.totalComments} comments</span>
      </div>
      
      <p className="text-gray-600 mb-4 line-clamp-3">{post.body}</p>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-primary font-bold text-xs">
            {post.author.slice(0,2).toUpperCase()}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900">{post.author}</span>
            <span className="text-xs text-gray-500">{new Date(post.postedAt).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex space-x-2">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded">#{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};