import React from 'react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onNavigate, currentPath }) => {
  const isActive = (path: string) => currentPath === path ? "text-primary font-semibold" : "text-gray-600 hover:text-primary";

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer" onClick={() => onNavigate('/')}>
            <span className="text-2xl font-bold text-primary">DevBlog</span>
          </div>

          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            <button onClick={() => onNavigate('/')} className={isActive('/')}>Feed</button>
            <button onClick={() => onNavigate('/dashboard')} className={isActive('/dashboard')}>Metrics Dashboard</button>

            {user ? (
              <div className="flex items-center space-x-4 ml-4 border-l pl-4 border-gray-200">
                <button
                  onClick={() => onNavigate('/profile')}
                  className={`flex items-center gap-2 ${isActive('/profile')}`}
                >
                  <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{user.username}</span>
                </button>
                <button onClick={() => onNavigate('/create')} className="bg-primary text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700 transition">
                  New Post
                </button>
                <button onClick={onLogout} className="text-gray-500 hover:text-red-600 text-sm">
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4 ml-4">
                <button onClick={() => onNavigate('/login')} className={isActive('/login')}>Sign In</button>
                <button onClick={() => onNavigate('/register')} className="bg-slate-900 text-white px-4 py-2 rounded-md text-sm hover:bg-slate-700 transition">
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button could go here */}
        </div>
      </div>
    </nav>
  );
};