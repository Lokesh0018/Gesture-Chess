import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hand, Moon, Sun } from 'lucide-react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';

export const LandingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  const navigate = useNavigate();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-white/10' 
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Hand className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white group-hover:text-primary-400 transition-colors">
            Gesture<span className="text-primary-500">Chess</span>
          </span>
        </Link>

        {/* Center: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {['Home', 'Features', 'How It Works', 'About', 'Contact'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
              className="text-slate-300 hover:text-white font-medium text-sm transition-colors relative after:content-[''] after:absolute after:w-full after:scale-x-0 after:h-0.5 after:bottom-[-4px] after:left-0 after:bg-primary-500 after:origin-bottom-right after:transition-transform hover:after:scale-x-100 hover:after:origin-bottom-left"
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-full transition-colors">
            <Sun className="w-5 h-5" />
          </button>
          
          <div className="hidden sm:flex items-center gap-3 ml-2">
            <Link 
              to="/login"
              className="px-5 py-2 text-sm font-medium text-white bg-transparent border border-white/20 hover:bg-white/10 hover:border-white/40 rounded-lg transition-all"
            >
              Login
            </Link>
            <Link 
              to="/register"
              className="px-5 py-2 text-sm font-bold text-white bg-primary-600 hover:bg-primary-500 rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.6)] transition-all hover:scale-105"
            >
              Sign Up
            </Link>
          </div>
        </div>

      </div>
    </motion.header>
  );
};
