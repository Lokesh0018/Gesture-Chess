import { useEffect, useState } from 'react';
import { Swords, Users, Trophy, Settings, BarChart2, LayoutDashboard, Bot, Puzzle, BookOpen, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import './DashboardLayout.css';

export const DashboardLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const toggle = () => setIsCollapsed(prev => !prev);
    window.addEventListener('toggle-sidebar', toggle);
    return () => window.removeEventListener('toggle-sidebar', toggle);
  }, []);

  const sidebarLinks = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/local', icon: Users, label: 'Local Play' },
    { path: '/online', icon: Swords, label: 'Online Match' },
    { path: '/bot', icon: Bot, label: 'Play vs Bot' },
    { path: '/puzzles', icon: Puzzle, label: 'Puzzles' },
    { path: '/learn', icon: BookOpen, label: 'Learn' },
    { path: '/leaderboard', icon: BarChart2, label: 'Leaderboard' },
  ];

  return (
    <div className="dashboard-container">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ width: 240 }}
        animate={{ width: isCollapsed ? 80 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="dashboard-sidebar"
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="dashboard-collapse-btn"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <nav className="dashboard-nav custom-scrollbar">
          {sidebarLinks.map((link) => {
            const isActive = currentPath === link.path || (currentPath === '/' && link.path === '/dashboard');
            return (
              <Link 
                key={link.path}
                to={link.path} 
                className={`dashboard-link ${isActive ? 'active' : ''}`}
              >
                {isActive && (
                  <motion.div layoutId="active-nav-indicator" className="dashboard-active-indicator" />
                )}
                <link.icon className="dashboard-link-icon" />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="dashboard-link-label"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isCollapsed && (
                  <div className="dashboard-tooltip">
                    {link.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="dashboard-footer">
          <Link 
            to="/settings" 
            className="dashboard-link"
          >
            <Settings className="dashboard-link-icon group-hover:rotate-45 transition-transform" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="dashboard-link-label"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
            {isCollapsed && (
              <div className="dashboard-tooltip">
                Settings
              </div>
            )}
          </Link>
          
          <button 
            onClick={logout}
            className="dashboard-logout"
          >
            <LogOut className="dashboard-link-icon" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="dashboard-link-label"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
            {isCollapsed && (
              <div className="dashboard-tooltip">
                Logout
              </div>
            )}
          </button>
          
          <div className="dashboard-user-profile">
            <div className="dashboard-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
              {/* Online indicator */}
              <div className="dashboard-online-indicator" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="dashboard-user-info"
                >
                  <p className="dashboard-username">{user?.username || 'Player'}</p>
                  <div className="dashboard-rating-container">
                    <Trophy size={10} className="text-amber-400" color="#fbbf24" />
                    <span className="dashboard-rating-text">{user?.rating || 1200} ELO</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="dashboard-main-area">
        <div className="dashboard-content-scroll">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
