import { Swords, Users, Trophy, LayoutDashboard, Crown, Bot, Puzzle, BookOpen, Clock, Target, Flame, Play, ChevronRight, TrendingUp, Medal, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';

// Animation Variants
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
  const { user } = useAuthStore();
  
  const gamesPlayed = user?.gamesPlayed || 0;
  const wins = user?.wins || 0;
  const losses = user?.losses || 0;
  const draws = user?.draws || 0;
  const winRate = gamesPlayed > 0 ? Math.round((wins / gamesPlayed) * 100) : 0;

  return (
    <motion.div 
      className="max-w-[1400px] mx-auto w-full pb-12 font-sans"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* 1. Hero Section (240px height) */}
      <motion.div variants={itemVariants} className="relative h-[240px] mb-10 bg-gradient-to-br from-blue-900/40 via-[#0B1120] to-purple-900/20 rounded-[24px] border border-white/10 overflow-hidden shadow-2xl flex items-center px-10">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute -right-10 -top-10 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute right-12 top-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none">
          <Crown className="w-[300px] h-[300px] rotate-12" />
        </div>

        <div className="relative z-10 max-w-2xl">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="text-5xl md:text-[64px] font-extrabold text-white mb-3 tracking-tight leading-tight"
          >
            Welcome Back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">{user?.username || 'Player'}</span> 👋
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="text-slate-400 text-lg mb-8 font-medium max-w-xl leading-relaxed"
          >
            Ready for your next challenge? Play online, improve your rating, solve today's puzzle, and climb the leaderboard.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="flex flex-wrap gap-4"
          >
            <Link to="/online" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-[16px] font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] flex items-center gap-2 hover:-translate-y-0.5">
              <Play size={20} fill="currentColor" />
              Play Now
            </Link>
            <Link to="/puzzles" className="bg-[#182235] hover:bg-[#202D45] border border-white/10 text-white px-8 py-3.5 rounded-[16px] font-bold transition-all flex items-center gap-2 hover:-translate-y-0.5 hover:border-white/20">
              <Puzzle size={20} />
              Daily Puzzle
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* 2. Quick Actions (4 compact cards) */}
      <div className="mb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/local" className="group bg-[#182235] border border-white/5 hover:border-white/10 rounded-[20px] p-5 flex items-center gap-4 transition-all duration-300 hover:bg-[#202D45] hover:-translate-y-1 shadow-lg h-[90px]">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">
              <Clock className="text-blue-400 group-hover:text-white transition-colors" size={24} />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-bold text-white text-sm">Continue Game</span>
              <span className="text-slate-400 text-xs">Local Match</span>
            </div>
            <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" size={18} />
          </Link>
          
          <Link to="/puzzles" className="group bg-[#182235] border border-white/5 hover:border-white/10 rounded-[20px] p-5 flex items-center gap-4 transition-all duration-300 hover:bg-[#202D45] hover:-translate-y-1 shadow-lg h-[90px]">
            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500 group-hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all">
              <Target className="text-orange-400 group-hover:text-white transition-colors" size={24} />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-bold text-white text-sm">Daily Puzzle</span>
              <span className="text-slate-400 text-xs">Rating 1450</span>
            </div>
            <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" size={18} />
          </Link>

          <Link to="/bot" className="group bg-[#182235] border border-white/5 hover:border-white/10 rounded-[20px] p-5 flex items-center gap-4 transition-all duration-300 hover:bg-[#202D45] hover:-translate-y-1 shadow-lg h-[90px]">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500 group-hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all">
              <Bot className="text-purple-400 group-hover:text-white transition-colors" size={24} />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-bold text-white text-sm">Play Bot</span>
              <span className="text-slate-400 text-xs">Practice offline</span>
            </div>
            <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" size={18} />
          </Link>

          <Link to="/online" className="group bg-[#182235] border border-white/5 hover:border-white/10 rounded-[20px] p-5 flex items-center gap-4 transition-all duration-300 hover:bg-[#202D45] hover:-translate-y-1 shadow-lg h-[90px]">
            <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500 group-hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all">
              <Swords className="text-green-400 group-hover:text-white transition-colors" size={24} />
            </div>
            <div className="flex flex-col flex-1">
              <span className="font-bold text-white text-sm">Online Match</span>
              <span className="text-slate-400 text-xs">Find opponent</span>
            </div>
            <ChevronRight className="text-slate-500 group-hover:text-white transition-colors" size={18} />
          </Link>
        </div>
      </div>

      {/* 70/30 Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Column (70%) */}
        <div className="xl:col-span-8 flex flex-col gap-10">
          
          {/* Game Modes (2x2 Grid) */}
          <section>
            <h2 className="text-[28px] font-semibold text-white mb-6 flex items-center gap-3">
              <LayoutDashboard className="text-indigo-400" size={28} />
              Game Modes
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <motion.div variants={itemVariants}>
                <Link to="/local" className="block bg-[#182235] border border-white/5 hover:border-white/10 p-8 rounded-[24px] flex flex-col h-full group transition-all duration-300 hover:-translate-y-1 hover:bg-[#202D45] shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 pointer-events-none">
                    <Users size={120} />
                  </div>
                  <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-blue-500/20 to-indigo-500/10 border border-blue-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Users className="w-8 h-8 text-blue-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Local Play</h3>
                  <p className="text-slate-400 mb-8 flex-1 text-[15px] leading-relaxed">Play against a friend on the same device using hand gestures or mouse.</p>
                  <div className="flex items-center text-blue-400 font-bold text-sm gap-2">
                    Start Game <ChevronRight size={16} />
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link to="/online" className="block bg-[#182235] border border-white/5 hover:border-white/10 p-8 rounded-[24px] flex flex-col h-full group transition-all duration-300 hover:-translate-y-1 hover:bg-[#202D45] shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 pointer-events-none">
                    <Swords size={120} />
                  </div>
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-green-500/20 to-emerald-500/10 border border-green-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Swords className="w-8 h-8 text-green-400" />
                    </div>
                    <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-wider">HOT</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Online Match</h3>
                  <p className="text-slate-400 mb-8 flex-1 text-[15px] leading-relaxed">Find an opponent online and climb the global leaderboard ranking.</p>
                  <div className="flex items-center text-green-400 font-bold text-sm gap-2">
                    Find Match <ChevronRight size={16} />
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link to="/learn" className="block bg-[#182235] border border-white/5 hover:border-white/10 p-8 rounded-[24px] flex flex-col h-full group transition-all duration-300 hover:-translate-y-1 hover:bg-[#202D45] shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 pointer-events-none">
                    <BookOpen size={120} />
                  </div>
                  <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-pink-500/20 to-rose-500/10 border border-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <BookOpen className="w-8 h-8 text-pink-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Learn</h3>
                  <p className="text-slate-400 mb-8 flex-1 text-[15px] leading-relaxed">Study openings, endgames, and master chess fundamentals with interactive lessons.</p>
                  <div className="flex items-center text-pink-400 font-bold text-sm gap-2">
                    Start Learning <ChevronRight size={16} />
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link to="/bot" className="block bg-[#182235] border border-white/5 hover:border-white/10 p-8 rounded-[24px] flex flex-col h-full group transition-all duration-300 hover:-translate-y-1 hover:bg-[#202D45] shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-110 group-hover:opacity-10 transition-all duration-500 pointer-events-none">
                    <Bot size={120} />
                  </div>
                  <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-purple-500/20 to-violet-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Bot className="w-8 h-8 text-purple-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Play vs Bot</h3>
                  <p className="text-slate-400 mb-8 flex-1 text-[15px] leading-relaxed">Challenge our advanced Stockfish AI with 8 adjustable difficulty levels.</p>
                  <div className="flex items-center text-purple-400 font-bold text-sm gap-2">
                    Challenge AI <ChevronRight size={16} />
                  </div>
                </Link>
              </motion.div>

            </div>
          </section>

          {/* Recent Activity Timeline */}
          <section>
            <h2 className="text-[28px] font-semibold text-white mb-6 flex items-center gap-3">
              <ActivityIcon className="text-slate-400 w-7 h-7" />
              Recent Activity
            </h2>
            <motion.div variants={itemVariants} className="bg-[#182235] border border-white/5 rounded-[24px] p-8 shadow-lg">
              <div className="relative border-l border-white/10 ml-4 space-y-8 pb-4">
                
                {/* Activity Item 1 */}
                <div className="relative pl-8">
                  <div className="absolute -left-4 top-0 w-8 h-8 bg-[#182235] border-4 border-[#0B1120] rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.6)]"></div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-white font-bold text-lg">Won vs MasterBot (Lvl 5)</p>
                      <p className="text-slate-500 text-sm">2 hours ago</p>
                    </div>
                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1 rounded-lg text-sm font-bold w-fit">+15 Rating</span>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="relative pl-8">
                  <div className="absolute -left-4 top-0 w-8 h-8 bg-[#182235] border-4 border-[#0B1120] rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-white font-bold text-lg">Solved Puzzle #4892</p>
                      <p className="text-slate-500 text-sm">Yesterday</p>
                    </div>
                    <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-lg text-sm font-bold w-fit">+5 EXP</span>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="relative pl-8">
                  <div className="absolute -left-4 top-0 w-8 h-8 bg-[#182235] border-4 border-[#0B1120] rounded-full flex items-center justify-center shadow-lg">
                    <div className="w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.6)]"></div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-white font-bold text-lg">Achievement Unlocked: First Victory</p>
                      <p className="text-slate-500 text-sm">2 days ago</p>
                    </div>
                    <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-lg text-sm font-bold w-fit">+50 EXP</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </section>

        </div>

        {/* Right Column (30%) */}
        <div className="xl:col-span-4 flex flex-col gap-8">
          
          {/* Analytics Panel */}
          <motion.div variants={itemVariants} className="bg-[#182235] border border-white/5 rounded-[24px] p-8 shadow-lg">
            <h3 className="text-[22px] font-bold text-white mb-6 flex items-center gap-3">
              <TrendingUp className="text-blue-400" />
              Analytics
            </h3>
            
            <div className="bg-[#0B1120] rounded-[16px] p-6 text-center mb-6 border border-white/5">
              <p className="text-slate-400 text-sm font-semibold tracking-wider uppercase mb-2">Global Rating</p>
              <p className="text-[48px] font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 leading-none mb-2">
                {user?.rating || 1200}
              </p>
              <div className="flex items-center justify-center gap-2 text-green-400 text-sm font-bold">
                <TrendingUp size={16} /> +15 this week
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-slate-400 text-sm font-medium">Win Rate</span>
                  <span className="text-white font-bold text-lg">{winRate}%</span>
                </div>
                <div className="w-full h-2.5 bg-[#0B1120] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${winRate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-white/5">
                <div className="text-center bg-[#0B1120] py-3 rounded-xl border border-white/5">
                  <p className="text-slate-400 text-xs mb-1">Wins</p>
                  <p className="text-green-400 font-bold text-lg">{wins}</p>
                </div>
                <div className="text-center bg-[#0B1120] py-3 rounded-xl border border-white/5">
                  <p className="text-slate-400 text-xs mb-1">Draws</p>
                  <p className="text-slate-300 font-bold text-lg">{draws}</p>
                </div>
                <div className="text-center bg-[#0B1120] py-3 rounded-xl border border-white/5">
                  <p className="text-slate-400 text-xs mb-1">Losses</p>
                  <p className="text-red-400 font-bold text-lg">{losses}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Daily Challenge Widget */}
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-purple-900/40 to-[#182235] border border-purple-500/20 rounded-[24px] p-8 shadow-[0_10px_30px_rgba(168,85,247,0.1)] relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-purple-500/20 pointer-events-none">
              <Star size={120} fill="currentColor" />
            </div>
            <h3 className="text-[22px] font-bold text-white mb-2 relative z-10">Daily Challenge</h3>
            <p className="text-purple-300/80 text-sm mb-6 relative z-10">Solve today's Grandmaster puzzle to earn double EXP.</p>
            
            <div className="flex justify-between items-center mb-6 relative z-10">
              <span className="bg-[#0B1120] text-purple-400 border border-purple-500/30 px-3 py-1 rounded-lg text-sm font-bold">Hard</span>
              <span className="text-white font-bold flex items-center gap-1"><Trophy size={16} className="text-amber-400"/> +50 EXP</span>
            </div>

            <Link to="/puzzles" className="block w-full bg-purple-600 hover:bg-purple-500 text-white text-center font-bold py-3.5 rounded-[16px] transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] relative z-10">
              Play Challenge
            </Link>
          </motion.div>

          {/* Achievements Widget */}
          <motion.div variants={itemVariants} className="bg-[#182235] border border-white/5 rounded-[24px] p-8 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[22px] font-bold text-white flex items-center gap-3">
                <Medal className="text-amber-400" />
                Achievements
              </h3>
              <span className="text-slate-400 text-sm hover:text-white cursor-pointer transition-colors">View All</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-[#0B1120] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 border border-orange-500/20">
                  <Flame className="text-orange-500" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-[15px] truncate">3 Day Streak</p>
                  <p className="text-slate-400 text-xs truncate">Log in tomorrow to keep it going!</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-[#0B1120] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                  <Crown className="text-purple-400" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-[15px] truncate">First Victory</p>
                  <p className="text-slate-400 text-xs truncate">Won a game against AI</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 bg-[#0B1120] p-4 rounded-xl border border-white/5 opacity-60">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Target className="text-slate-400" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end mb-1">
                    <p className="text-white font-bold text-[15px] truncate">Sharpshooter</p>
                    <span className="text-slate-400 text-xs">12/50</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500 rounded-full" style={{ width: '24%' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Leaderboard Preview */}
          <motion.div variants={itemVariants} className="bg-[#182235] border border-white/5 rounded-[24px] p-8 shadow-lg">
            <h3 className="text-[22px] font-bold text-white mb-6 flex items-center gap-3">
              <Trophy className="text-yellow-400" />
              Top Players
            </h3>
            
            <div className="space-y-3 mb-6">
              {[
                { name: 'Magnus C.', rating: 3102, rank: 1 },
                { name: 'Hikaru N.', rating: 3085, rank: 2 },
                { name: 'Fabiano C.', rating: 2950, rank: 3 },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl hover:bg-[#0B1120] transition-colors cursor-default">
                  <div className="flex items-center gap-3">
                    <span className={`font-black ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : 'text-amber-600'}`}>#{p.rank}</span>
                    <span className="text-white font-medium">{p.name}</span>
                  </div>
                  <span className="text-slate-400 font-bold">{p.rating}</span>
                </div>
              ))}
            </div>

            <Link to="/leaderboard" className="block w-full bg-[#0B1120] hover:bg-white/5 border border-white/10 text-white text-center font-bold py-3 rounded-xl transition-all">
              View Full Leaderboard
            </Link>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
