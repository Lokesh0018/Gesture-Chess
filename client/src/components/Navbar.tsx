import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Hand, User, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <nav className="h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-50">
      <div className="flex items-center space-x-2">
        <Hand className="w-8 h-8 text-primary-500" />
        <Link to="/" className="text-xl font-bold tracking-tight text-white">Gesture<span className="text-primary-500">Chess</span></Link>
      </div>

      <div className="flex items-center space-x-4">
        {user ? (
          <div className="flex items-center space-x-4">
            <Link to="/profile" className="flex items-center space-x-2 hover:text-primary-400 transition">
              <User className="w-5 h-5" />
              <span>{user.username}</span>
            </Link>
            <button onClick={logout} className="p-2 hover:bg-gray-800 rounded-full transition">
              <LogOut className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
        ) : (
          <div className="space-x-4">
            <Link to="/login" className="text-gray-300 hover:text-white transition">Login</Link>
            <Link to="/register" className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition">Sign Up</Link>
          </div>
        )}
      </div>
    </nav>
  );
};
