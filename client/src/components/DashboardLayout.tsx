import { Swords, Users, Trophy, Settings, BarChart2, LayoutDashboard, Crown, Bot, Puzzle, BookOpen } from 'lucide-react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { VirtualCursor } from './VirtualCursor';

export const DashboardLayout = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="home-layout relative overflow-hidden bg-[#060A14] flex h-screen w-full">
      <VirtualCursor />
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[150px] opacity-10 bg-[#3B82F6] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[150px] opacity-10 bg-[#818CF8] pointer-events-none" />

      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="home-sidebar relative z-10 border-r border-white/[0.05] bg-[#0F172A]/40 backdrop-blur-xl h-full flex flex-col"
      >
        <nav className="sidebar-nav pt-8 flex-1">
          <Link to="/" className={`sidebar-link ${currentPath === '/' ? 'active' : ''} hover:bg-white/[0.05] transition-colors rounded-xl mx-2 mb-2`}>
            <LayoutDashboard className="sidebar-icon" />
            <span>Dashboard</span>
          </Link>
          <Link to="/local" className={`sidebar-link ${currentPath === '/local' ? 'active' : ''} hover:bg-white/[0.05] transition-colors rounded-xl mx-2 mb-2`}>
            <Users className="sidebar-icon" />
            <span>Local Play</span>
          </Link>
          <Link to="/online" className={`sidebar-link ${currentPath === '/online' ? 'active' : ''} hover:bg-white/[0.05] transition-colors rounded-xl mx-2 mb-2`}>
            <Swords className="sidebar-icon" />
            <span>Online Match</span>
          </Link>
          <Link to="/bot" className={`sidebar-link ${currentPath === '/bot' ? 'active' : ''} hover:bg-white/[0.05] transition-colors rounded-xl mx-2 mb-2`}>
            <Bot className="sidebar-icon" />
            <span>Play vs Bot</span>
          </Link>
          <Link to="/puzzles" className={`sidebar-link ${currentPath === '/puzzles' ? 'active' : ''} hover:bg-white/[0.05] transition-colors rounded-xl mx-2 mb-2`}>
            <Puzzle className="sidebar-icon" />
            <span>Puzzles</span>
          </Link>
          <Link to="/leaderboard" className={`sidebar-link ${currentPath === '/leaderboard' ? 'active' : ''} hover:bg-white/[0.05] transition-colors rounded-xl mx-2 mb-2`}>
            <BarChart2 className="sidebar-icon" />
            <span>Leaderboard</span>
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/[0.05]">
          <Link to="/settings" className="sidebar-link hover:bg-white/[0.05] transition-colors rounded-xl text-slate-400 hover:text-white">
            <Settings className="sidebar-icon" />
            <span>Settings</span>
          </Link>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 relative z-10 flex flex-col h-full overflow-hidden">
        <Navbar />
        <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
