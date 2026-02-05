import { Swords, Users, Trophy, LayoutDashboard, Crown, Bot, Puzzle, BookOpen, Clock, Target, Flame, Play, ChevronRight, TrendingUp, Medal, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, type Variants } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import './Home.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
      className="home-container"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Hero Section */}
      <motion.div variants={itemVariants} className="home-hero">
        <div className="home-hero-bg-texture"></div>
        <div className="home-hero-glow"></div>
        <div className="home-hero-icon">
          <Crown className="rotate-12" size={300} />
        </div>

        <div className="home-hero-content">
          <motion.h1 
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
            className="home-hero-title"
          >
            Welcome Back, <span className="home-hero-title-highlight">{user?.username || 'Player'}</span> 👋
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="home-hero-subtitle"
          >
            Ready for your next challenge? Play online, improve your rating, solve today's puzzle, and climb the leaderboard.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="home-hero-actions"
          >
            <Link to="/online" className="home-btn-primary">
              <Play size={20} fill="currentColor" />
              Play Now
            </Link>
            <Link to="/puzzles" className="home-btn-secondary">
              <Puzzle size={20} />
              Daily Puzzle
            </Link>
          </motion.div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="home-quick-actions">
        <div className="home-quick-actions-grid">
          <Link to="/local" className="home-action-card group">
            <div className="home-action-icon-wrapper home-action-icon-clock">
              <Clock size={24} />
            </div>
            <div className="home-action-text">
              <span className="home-action-title">Continue Game</span>
              <span className="home-action-subtitle">Local Match</span>
            </div>
            <ChevronRight className="home-action-arrow" size={18} />
          </Link>
          
          <Link to="/puzzles" className="home-action-card group">
            <div className="home-action-icon-wrapper home-action-icon-target">
              <Target size={24} />
            </div>
            <div className="home-action-text">
              <span className="home-action-title">Daily Puzzle</span>
              <span className="home-action-subtitle">Rating 1450</span>
            </div>
            <ChevronRight className="home-action-arrow" size={18} />
          </Link>

          <Link to="/bot" className="home-action-card group">
            <div className="home-action-icon-wrapper home-action-icon-bot">
              <Bot size={24} />
            </div>
            <div className="home-action-text">
              <span className="home-action-title">Play Bot</span>
              <span className="home-action-subtitle">Practice offline</span>
            </div>
            <ChevronRight className="home-action-arrow" size={18} />
          </Link>

          <Link to="/online" className="home-action-card group">
            <div className="home-action-icon-wrapper home-action-icon-swords">
              <Swords size={24} />
            </div>
            <div className="home-action-text">
              <span className="home-action-title">Online Match</span>
              <span className="home-action-subtitle">Find opponent</span>
            </div>
            <ChevronRight className="home-action-arrow" size={18} />
          </Link>
        </div>
      </div>

      <div className="home-split-layout">
        
        {/* Left Column (70%) */}
        <div className="home-left-col">
          
          {/* Game Modes (2x2 Grid) */}
          <section>
            <h2 className="home-section-title">
              <LayoutDashboard style={{ color: '#818CF8' }} size={28} />
              Game Modes
            </h2>
            <div className="home-modes-grid">
              
              <motion.div variants={itemVariants}>
                <Link to="/local" className="home-mode-card">
                  <div className="home-mode-bg-icon">
                    <Users size={120} />
                  </div>
                  <div className="home-mode-icon-container home-mode-blue">
                    <Users size={32} />
                  </div>
                  <h3 className="home-mode-title">Local Play</h3>
                  <p className="home-mode-desc">Play against a friend on the same device using hand gestures or mouse.</p>
                  <div className="home-mode-action" style={{ color: '#60A5FA' }}>
                    Start Game <ChevronRight size={16} />
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link to="/online" className="home-mode-card">
                  <div className="home-mode-bg-icon">
                    <Swords size={120} />
                  </div>
                  <div className="home-mode-icon-container home-mode-green">
                    <Swords size={32} />
                  </div>
                  <h3 className="home-mode-title">Online Match</h3>
                  <p className="home-mode-desc">Find an opponent online and climb the global leaderboard ranking.</p>
                  <div className="home-mode-action" style={{ color: '#4ADE80' }}>
                    Find Match <ChevronRight size={16} />
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link to="/learn" className="home-mode-card">
                  <div className="home-mode-bg-icon">
                    <BookOpen size={120} />
                  </div>
                  <div className="home-mode-icon-container home-mode-pink">
                    <BookOpen size={32} />
                  </div>
                  <h3 className="home-mode-title">Learn</h3>
                  <p className="home-mode-desc">Study openings, endgames, and master chess fundamentals with interactive lessons.</p>
                  <div className="home-mode-action" style={{ color: '#F472B6' }}>
                    Start Learning <ChevronRight size={16} />
                  </div>
                </Link>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Link to="/bot" className="home-mode-card">
                  <div className="home-mode-bg-icon">
                    <Bot size={120} />
                  </div>
                  <div className="home-mode-icon-container home-mode-purple">
                    <Bot size={32} />
                  </div>
                  <h3 className="home-mode-title">Play vs Bot</h3>
                  <p className="home-mode-desc">Challenge our advanced Stockfish AI with 8 adjustable difficulty levels.</p>
                  <div className="home-mode-action" style={{ color: '#C084FC' }}>
                    Challenge AI <ChevronRight size={16} />
                  </div>
                </Link>
              </motion.div>

            </div>
          </section>

          {/* Recent Activity Timeline */}
          <section>
            <h2 className="home-section-title">
              <ActivityIcon style={{ color: '#94A3B8' }} />
              Recent Activity
            </h2>
            <motion.div variants={itemVariants} className="home-panel">
              <div className="home-activity-timeline">
                
                {/* Activity Item 1 */}
                <div className="home-activity-item">
                  <div className="home-activity-dot-wrapper">
                    <div className="home-activity-dot home-activity-dot-green"></div>
                  </div>
                  <div className="home-activity-content">
                    <div>
                      <p className="home-activity-title">Won vs MasterBot (Lvl 5)</p>
                      <p className="home-activity-time">2 hours ago</p>
                    </div>
                    <span className="home-activity-badge home-activity-badge-green">+15 Rating</span>
                  </div>
                </div>

                {/* Activity Item 2 */}
                <div className="home-activity-item">
                  <div className="home-activity-dot-wrapper">
                    <div className="home-activity-dot home-activity-dot-blue"></div>
                  </div>
                  <div className="home-activity-content">
                    <div>
                      <p className="home-activity-title">Solved Puzzle #4892</p>
                      <p className="home-activity-time">Yesterday</p>
                    </div>
                    <span className="home-activity-badge home-activity-badge-blue">+5 EXP</span>
                  </div>
                </div>

                {/* Activity Item 3 */}
                <div className="home-activity-item">
                  <div className="home-activity-dot-wrapper">
                    <div className="home-activity-dot home-activity-dot-purple"></div>
                  </div>
                  <div className="home-activity-content">
                    <div>
                      <p className="home-activity-title">Achievement Unlocked: First Victory</p>
                      <p className="home-activity-time">2 days ago</p>
                    </div>
                    <span className="home-activity-badge home-activity-badge-purple">+50 EXP</span>
                  </div>
                </div>

              </div>
            </motion.div>
          </section>

        </div>

        {/* Right Column (30%) */}
        <div className="home-right-col">
          
          {/* Analytics Panel */}
          <motion.div variants={itemVariants} className="home-panel">
            <h3 className="home-panel-title">
              <TrendingUp style={{ color: '#60A5FA' }} />
              Analytics
            </h3>
            
            <div className="home-rating-box">
              <p className="home-rating-label">Global Rating</p>
              <p className="home-rating-value">{user?.rating || 1200}</p>
              <div className="home-rating-trend">
                <TrendingUp size={16} /> +15 this week
              </div>
            </div>

            <div>
              <div>
                <div className="home-stats-row">
                  <span className="home-stats-label">Win Rate</span>
                  <span className="home-stats-value">{winRate}%</span>
                </div>
                <div className="home-progress-bar-bg">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${winRate}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="home-progress-bar-fill"
                  />
                </div>
              </div>

              <div className="home-stats-grid">
                <div className="home-stat-box">
                  <p className="home-stat-box-label">Wins</p>
                  <p className="home-stat-box-win">{wins}</p>
                </div>
                <div className="home-stat-box">
                  <p className="home-stat-box-label">Draws</p>
                  <p className="home-stat-box-draw">{draws}</p>
                </div>
                <div className="home-stat-box">
                  <p className="home-stat-box-label">Losses</p>
                  <p className="home-stat-box-loss">{losses}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Daily Challenge Widget */}
          <motion.div variants={itemVariants} className="home-challenge-panel">
            <div className="home-challenge-bg-icon">
              <Star size={120} fill="currentColor" />
            </div>
            <div className="home-challenge-content">
              <h3 className="home-challenge-title">Daily Challenge</h3>
              <p className="home-challenge-desc">Solve today's Grandmaster puzzle to earn double EXP.</p>
              
              <div className="home-challenge-info">
                <span className="home-challenge-badge">Hard</span>
                <span className="home-challenge-exp">
                  <Trophy size={16} style={{ color: '#FBBF24' }}/> +50 EXP
                </span>
              </div>

              <Link to="/puzzles" className="home-btn-challenge">
                Play Challenge
              </Link>
            </div>
          </motion.div>

          {/* Achievements Widget */}
          <motion.div variants={itemVariants} className="home-panel">
            <div className="home-achievements-header">
              <h3 className="home-panel-title" style={{ marginBottom: 0 }}>
                <Medal style={{ color: '#FBBF24' }} />
                Achievements
              </h3>
              <span className="home-achievements-view-all">View All</span>
            </div>
            
            <div className="home-achievements-list">
              <div className="home-achievement-item">
                <div className="home-achievement-icon-wrapper home-achievement-icon-flame">
                  <Flame size={24} />
                </div>
                <div className="home-achievement-details">
                  <p className="home-achievement-title">3 Day Streak</p>
                  <p className="home-achievement-desc">Log in tomorrow to keep it going!</p>
                </div>
              </div>
              
              <div className="home-achievement-item">
                <div className="home-achievement-icon-wrapper home-achievement-icon-crown">
                  <Crown size={24} />
                </div>
                <div className="home-achievement-details">
                  <p className="home-achievement-title">First Victory</p>
                  <p className="home-achievement-desc">Won a game against AI</p>
                </div>
              </div>
              
              <div className="home-achievement-item locked">
                <div className="home-achievement-icon-wrapper home-achievement-icon-locked">
                  <Target size={24} />
                </div>
                <div className="home-achievement-details">
                  <div className="home-achievement-progress-info">
                    <p className="home-achievement-title">Sharpshooter</p>
                    <span className="home-achievement-progress-text">12/50</span>
                  </div>
                  <div className="home-achievement-progress-bar">
                    <div className="home-achievement-progress-fill" style={{ width: '24%' }} />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Leaderboard Preview */}
          <motion.div variants={itemVariants} className="home-panel">
            <h3 className="home-panel-title">
              <Trophy style={{ color: '#FACC15' }} />
              Top Players
            </h3>
            
            <div className="home-leaderboard-list">
              {[
                { name: 'Magnus C.', rating: 3102, rank: 1 },
                { name: 'Hikaru N.', rating: 3085, rank: 2 },
                { name: 'Fabiano C.', rating: 2950, rank: 3 },
              ].map((p, i) => (
                <div key={i} className="home-leaderboard-item">
                  <div className="home-leaderboard-player">
                    <span className={`home-leaderboard-rank home-leaderboard-rank-${p.rank}`}>#{p.rank}</span>
                    <span className="home-leaderboard-name">{p.name}</span>
                  </div>
                  <span className="home-leaderboard-rating">{p.rating}</span>
                </div>
              ))}
            </div>

            <Link to="/leaderboard" className="home-btn-leaderboard">
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
