import React from 'react';
import { Swords, Users, Trophy, Settings, BarChart2, LayoutDashboard, Crown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const Home = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="home-layout relative overflow-hidden bg-[#060A14]">
      {/* Background Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[150px] opacity-10 bg-[#3B82F6] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] rounded-full mix-blend-screen filter blur-[150px] opacity-10 bg-[#818CF8] pointer-events-none" />

      {/* Sidebar Navigation */}
      <motion.aside 
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="home-sidebar relative z-10 border-r border-white/[0.05] bg-[#0F172A]/40 backdrop-blur-xl"
      >
        <nav className="sidebar-nav pt-8">
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
          <Link to="/leaderboard" className={`sidebar-link ${currentPath === '/leaderboard' ? 'active' : ''} hover:bg-white/[0.05] transition-colors rounded-xl mx-2 mb-2`}>
            <BarChart2 className="sidebar-icon" />
            <span>Leaderboard</span>
          </Link>
          <Link to="/settings" className={`sidebar-link ${currentPath === '/settings' ? 'active' : ''} hover:bg-white/[0.05] transition-colors rounded-xl mx-2 mb-2`}>
            <Settings className="sidebar-icon" />
            <span>Settings</span>
          </Link>
        </nav>
      </motion.aside>

      {/* Main Content */}
      <div className="home-content-area relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="home-container"
        >
          <motion.div variants={itemVariants} className="home-header mb-12">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">
                <span className="text-white">Welcome back, </span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] via-[#3B82F6] to-[#2563EB]">Grandmaster</span>
              </h1>
              <p className="text-slate-400 text-lg">Ready to play some gesture-controlled chess?</p>
            </div>
          </motion.div>

          <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Local Play Card */}
            <motion.div variants={itemVariants}>
              <Link to="/local" className="group block h-full relative bg-[#0F172A]/60 backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-8 hover:-translate-y-2 hover:border-[#3B82F6]/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(59,130,246,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#3B82F6]/0 to-[#3B82F6]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#3B82F6] transition-all duration-300">
                  <Users className="w-7 h-7 text-[#3B82F6] group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Local Play</h3>
                <p className="text-slate-400 leading-relaxed">Play against a friend on the same device using gestures or mouse.</p>
              </Link>
            </motion.div>
            
            {/* Online Match Card */}
            <motion.div variants={itemVariants}>
              <Link to="/online" className="group block h-full relative bg-[#0F172A]/60 backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-8 hover:-translate-y-2 hover:border-[#22C55E]/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(34,197,94,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/0 to-[#22C55E]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-[#22C55E]/10 border border-[#22C55E]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#22C55E] transition-all duration-300">
                  <Swords className="w-7 h-7 text-[#22C55E] group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Online Match</h3>
                <p className="text-slate-400 leading-relaxed">Find an opponent online and climb the global leaderboard.</p>
              </Link>
            </motion.div>
            
            {/* Stats Card */}
            <motion.div variants={itemVariants} className="relative bg-[#0F172A]/60 backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-8 overflow-hidden shadow-lg hover:border-amber-500/30 transition-colors duration-300">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                <Crown className="w-32 h-32 text-amber-500 rotate-12" />
              </div>
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-6">
                  <Trophy className="w-7 h-7 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-6">Your Stats</h3>
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-4 border-b border-white/[0.05]">
                    <span className="text-slate-400">Rating</span>
                    <span className="text-2xl font-bold text-white">1200</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Win Rate</span>
                    <span className="text-2xl font-bold text-green-400">52%</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
