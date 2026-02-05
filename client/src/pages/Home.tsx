
import { Swords, Users, Trophy, Settings, BarChart2, LayoutDashboard, Crown, Bot, Puzzle, BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export const Home = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { user } = useAuthStore();
  
  const winRate = user && user.gamesPlayed > 0 
    ? Math.round((user.wins / user.gamesPlayed) * 100) 
    : 0;

  return (
    <motion.div 
      className="flex-1 relative z-10 flex flex-col h-full"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <div className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-12">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-12 relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute -top-10 -left-10 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"
            />
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 relative z-10">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{user?.username || 'Player'}</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl relative z-10">
              Ready for your next challenge? Jump right back into a game or hone your skills with daily puzzles.
            </p>
          </div>

          {/* Main Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
          >
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
            
            {/* Play vs Bot Card */}
            <motion.div variants={itemVariants}>
              <Link to="/bot" className="group block h-full relative bg-[#0F172A]/60 backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-8 hover:-translate-y-2 hover:border-[#A855F7]/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(168,85,247,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#A855F7]/0 to-[#A855F7]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-[#A855F7]/10 border border-[#A855F7]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#A855F7] transition-all duration-300">
                  <Bot className="w-7 h-7 text-[#A855F7] group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Play vs Bot</h3>
                <p className="text-slate-400 leading-relaxed">Challenge our advanced AI with adjustable difficulty levels.</p>
              </Link>
            </motion.div>

            {/* Puzzles Card */}
            <motion.div variants={itemVariants}>
              <Link to="/puzzles" className="group block h-full relative bg-[#0F172A]/60 backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-8 hover:-translate-y-2 hover:border-[#F97316]/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(249,115,22,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#F97316]/0 to-[#F97316]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-[#F97316]/10 border border-[#F97316]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#F97316] transition-all duration-300">
                  <Puzzle className="w-7 h-7 text-[#F97316] group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Puzzles</h3>
                <p className="text-slate-400 leading-relaxed">Improve your tactical skills with daily chess puzzles.</p>
              </Link>
            </motion.div>

            {/* Learn Card */}
            <motion.div variants={itemVariants}>
              <Link to="/learn" className="group block h-full relative bg-[#0F172A]/60 backdrop-blur-xl border border-white/[0.08] rounded-[24px] p-8 hover:-translate-y-2 hover:border-[#EC4899]/50 transition-all duration-300 overflow-hidden shadow-lg hover:shadow-[0_8px_30px_rgba(236,72,153,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-br from-[#EC4899]/0 to-[#EC4899]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="w-14 h-14 rounded-2xl bg-[#EC4899]/10 border border-[#EC4899]/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-[#EC4899] transition-all duration-300">
                  <BookOpen className="w-7 h-7 text-[#EC4899] group-hover:text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Learn</h3>
                <p className="text-slate-400 leading-relaxed">Study openings, endgames, and master chess fundamentals.</p>
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
                    <span className="text-2xl font-bold text-white">{user?.rating || 1200}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Win Rate</span>
                    <span className="text-2xl font-bold text-green-400">{winRate}%</span>
                  </div>
                </div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};
