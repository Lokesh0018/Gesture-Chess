import { useState } from 'react';
import { Swords, Users, Trophy, Settings, BarChart2, LayoutDashboard, Bot, Puzzle, BookOpen, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

export const DashboardLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user, logout } = useAuthStore();
  const [isCollapsed, setIsCollapsed] = useState(false);

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
    <div className="flex w-full h-full bg-[#0B1120] text-white">
      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ width: 240 }}
        animate={{ width: isCollapsed ? 80 : 240 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 flex flex-col h-full bg-[#0B1120] border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.2)]"
      >
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-6 bg-[#182235] border border-white/10 text-white p-1 rounded-full shadow-lg hover:bg-[#202D45] transition-colors z-20"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        <nav className="flex-1 pt-6 overflow-y-auto custom-scrollbar px-3 space-y-1">
          {sidebarLinks.map((link) => {
            const isActive = currentPath === link.path || (currentPath === '/' && link.path === '/dashboard');
            return (
              <Link 
                key={link.path}
                to={link.path} 
                className={`flex items-center gap-3 px-3 py-3 rounded-[12px] transition-all duration-200 group relative ${isActive ? 'bg-[#3B82F6]/10 text-blue-400 font-semibold' : 'text-slate-400 hover:bg-[#182235] hover:text-white font-medium'}`}
              >
                {isActive && (
                  <motion.div layoutId="active-nav-indicator" className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full" />
                )}
                <link.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-blue-500' : 'group-hover:text-white transition-colors'}`} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span 
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap overflow-hidden text-sm"
                    >
                      {link.label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isCollapsed && (
                  <div className="absolute left-14 opacity-0 group-hover:opacity-100 transition-opacity bg-[#182235] text-white text-xs font-semibold py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                    {link.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-white/5 flex flex-col gap-1">
          <Link 
            to="/settings" 
            className="flex items-center gap-3 px-3 py-3 rounded-[12px] text-slate-400 hover:bg-[#182235] hover:text-white transition-all font-medium group relative"
          >
            <Settings className="w-5 h-5 flex-shrink-0 group-hover:rotate-45 transition-transform" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden text-sm"
                >
                  Settings
                </motion.span>
              )}
            </AnimatePresence>
            {isCollapsed && (
              <div className="absolute left-14 opacity-0 group-hover:opacity-100 transition-opacity bg-[#182235] text-white text-xs font-semibold py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                Settings
              </div>
            )}
          </Link>
          
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-3 rounded-[12px] text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all w-full text-left font-medium group relative"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {!isCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden text-sm"
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
            {isCollapsed && (
              <div className="absolute left-14 opacity-0 group-hover:opacity-100 transition-opacity bg-[#182235] text-white text-xs font-semibold py-1.5 px-3 rounded-lg pointer-events-none whitespace-nowrap z-50 shadow-lg border border-white/10">
                Logout
              </div>
            )}
          </button>
          
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border-2 border-[#182235] shadow-md relative overflow-hidden">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-[#0B1120]" />
            </div>
            <AnimatePresence>
              {!isCollapsed && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="overflow-hidden flex-1"
                >
                  <p className="text-sm font-semibold text-white truncate leading-tight">{user?.username || 'Player'}</p>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                    <Trophy size={10} className="text-amber-400" />
                    <span className="font-medium">{user?.rating || 1200} ELO</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 flex flex-col h-full overflow-hidden bg-[#0B1120]">
        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
