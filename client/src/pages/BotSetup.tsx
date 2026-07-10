import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Dices } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import './BotSetup.css';

export const BOT_LEVELS = [
  { level: 1, name: 'Novice Nick', elo: 600, depth: 1, skill: 0, avatar: '👶', description: 'Just learned the rules. Makes frequent blunders and rarely spots simple tactics.' },
  { level: 2, name: 'Beginner Bob', elo: 800, depth: 2, skill: 3, avatar: '🤓', description: 'Understands basic concepts but struggles with long-term strategy and piece coordination.' },
  { level: 3, name: 'Intermediate Iris', elo: 1200, depth: 4, skill: 6, avatar: '🤔', description: 'Plays solid openings and spots 1-2 move tactics. A fair challenge for casual players.' },
  { level: 4, name: 'Advanced Alex', elo: 1600, depth: 6, skill: 10, avatar: '😎', description: 'Strong tactical vision and solid positional understanding. Rarely drops pieces.' },
  { level: 5, name: 'Expert Emma', elo: 2000, depth: 10, skill: 14, avatar: '🧠', description: 'Excellent positional play and deep calculation. Punishes even small inaccuracies.' },
  { level: 6, name: 'Master Max', elo: 2400, depth: 15, skill: 17, avatar: '👑', description: 'Near-flawless execution. Plays main-line theory and executes complex multi-move tactics.' },
  { level: 7, name: 'Grandmaster Garry', elo: 2800, depth: 18, skill: 20, avatar: '🧙‍♂️', description: 'World-class standard. Understands deep positional nuances and calculates perfectly.' },
  { level: 8, name: 'Stockfish Max', elo: 3200, depth: 22, skill: 20, avatar: '🤖', description: 'Maximum engine strength. Unbeatable by human standards. Good luck.' }
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

export const BotSetup = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const [selectedLevel, setSelectedLevel] = useState(BOT_LEVELS[2]);
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | 'random'>('random');

  // Find recommended bot based on user rating
  const recommendedBotId = useMemo(() => {
    if (!user || !user.rating) return BOT_LEVELS[2].level; // Default to Intermediate
    
    // Find the bot whose ELO is closest to user's rating, but ideally slightly higher (+50 to +200) for a good challenge.
    // For simplicity, just find the absolute closest.
    let closest = BOT_LEVELS[0];
    let minDiff = Math.abs(BOT_LEVELS[0].elo - user.rating);
    
    for (const bot of BOT_LEVELS) {
      const diff = Math.abs(bot.elo - user.rating);
      if (diff < minDiff) {
        minDiff = diff;
        closest = bot;
      }
    }
    return closest.level;
  }, [user]);

  const startGame = () => {
    let finalColor: 'w' | 'b' = 'w';
    if (playerColor === 'random') {
      finalColor = Math.random() > 0.5 ? 'w' : 'b';
    } else {
      finalColor = playerColor;
    }
    
    navigate('/bot-game', { state: { selectedLevel, playerColor: finalColor } });
  };

  return (
    <div className="bot-setup-page">
      <div className="bot-setup-container">
        
        {/* Header */}
        <div className="bot-setup-header">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bot-setup-title"
          >
            Play vs Computer
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bot-setup-subtitle"
          >
            Challenge our AI engines ranging from beginner to world champion strength.
          </motion.p>
        </div>

        {/* Content */}
        <div className="bot-setup-content">
          
          {/* Left Column: Bot Grid */}
          <motion.div 
            className="bot-setup-grid-container"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <motion.div 
              className="bot-setup-grid" 
              variants={containerVariants} 
              initial="hidden" 
              animate="show"
            >
              {BOT_LEVELS.map(bot => {
                const isSelected = selectedLevel.level === bot.level;
                const isRecommended = recommendedBotId === bot.level;
                
                return (
                  <motion.div
                    key={bot.level}
                    variants={itemVariants}
                    className={`bot-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedLevel(bot)}
                  >
                    {isRecommended && (
                      <div className="bot-card-badge">⭐ Recommended</div>
                    )}
                    
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div 
                          initial={{ scale: 0, opacity: 0 }} 
                          animate={{ scale: 1, opacity: 1 }} 
                          exit={{ scale: 0, opacity: 0 }}
                          className="bot-card-check"
                        >
                          <CheckCircle2 size={24} fill="#fff" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="bot-card-avatar">{bot.avatar}</div>
                    <div className="bot-card-name">{bot.name}</div>
                    <div className="bot-card-elo">{bot.elo} ELO</div>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>

          {/* Right Column: Summary & Actions */}
          <motion.div 
            className="bot-setup-summary"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="summary-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedLevel.level}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center"
                >
                  <div className="summary-avatar">{selectedLevel.avatar}</div>
                  <h2 className="summary-name">{selectedLevel.name}</h2>
                  <div className="summary-elo">{selectedLevel.elo} ELO Rating</div>
                  <p className="summary-desc">{selectedLevel.description}</p>
                </motion.div>
              </AnimatePresence>

              {/* Color Selector */}
              <div className="color-selector">
                <button 
                  className={`color-btn ${playerColor === 'w' ? 'active' : ''}`}
                  onClick={() => setPlayerColor('w')}
                >
                  <div className="color-circle white"></div> White
                </button>
                <button 
                  className={`color-btn ${playerColor === 'random' ? 'active' : ''}`}
                  onClick={() => setPlayerColor('random')}
                >
                  <Dices size={16} /> Random
                </button>
                <button 
                  className={`color-btn ${playerColor === 'b' ? 'active' : ''}`}
                  onClick={() => setPlayerColor('b')}
                >
                  <div className="color-circle black"></div> Black
                </button>
              </div>

              <motion.button
                className="start-btn"
                onClick={startGame}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Play vs {selectedLevel.name.split(' ')[0]}
              </motion.button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
