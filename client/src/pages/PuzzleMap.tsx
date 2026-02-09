import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PUZZLES } from '../data/puzzles';
import { Lock, Star, Play, CheckCircle2, Target } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import './PuzzleMap.css';

export const PuzzleMap = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    container: containerRef,
    offset: ["start start", "end end"]
  });

  const pathHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Fake Progress Calculation
  const currentLevelIndex = 1; // Level 2 is "Current"
  const totalLevels = PUZZLES.length;
  const starsEarned = currentLevelIndex * 3;
  const totalStars = totalLevels * 3;
  const progressPercent = Math.round((currentLevelIndex / totalLevels) * 100);

  return (
    <div className="puzzle-scroll-container" ref={containerRef}>
      <div className="puzzle-container">
        
        {/* Header Section */}
        <div className="puzzle-header">
          <h1 className="puzzle-title">
            Puzzle Journey
          </h1>
          <p className="puzzle-subtitle">
            Master your tactics, one level at a time.
          </p>

          {/* Progress Banner */}
          <div className="progress-banner">
            <div className="progress-banner-glow"></div>
            
            <div className="progress-stats-row">
              <div>
                <div className="progress-label">Overall Progress</div>
                <div className="progress-value">{currentLevelIndex} of {totalLevels} levels completed</div>
              </div>
              <div>
                <div className="progress-label progress-label-right">
                  <Star size={14} className="progress-value-yellow" fill="currentColor"/> Stars Earned
                </div>
                <div className="progress-value progress-value-yellow">{starsEarned} / {totalStars}</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="progress-bar-container">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="progress-bar-fill"
              />
            </div>
          </div>
        </div>

        {/* Vertical Roadmap Timeline */}
        <div className="timeline-container">
          {/* Background Track Line */}
          <div className="timeline-track"></div>
          
          {/* Active Glowing Path */}
          <motion.div 
            style={{ height: pathHeight }}
            className="timeline-active-path"
          />

          <div className="timeline-list">
            {PUZZLES.map((puzzle, index) => {
              const status = index < currentLevelIndex ? 'completed' : index === currentLevelIndex ? 'current' : 'locked';

              return (
                <div key={puzzle.id} className="level-item">
                  {/* Timeline Dot */}
                  <div className={`level-dot ${status}`}></div>

                  {/* Level Card */}
                  {status === 'completed' && (
                    <button 
                      onClick={() => navigate(`/puzzles/${puzzle.id}`)}
                      className="card-completed"
                      aria-label={`Replay Level ${index + 1}: ${puzzle.theme}`}
                    >
                      <div className="card-completed-left">
                        <div className="card-completed-icon">
                          <CheckCircle2 size={24} />
                        </div>
                        <div>
                          <div className="card-completed-label">Level {index + 1} • Completed</div>
                          <h3 className="card-completed-title">{puzzle.theme}</h3>
                        </div>
                      </div>
                      <div className="card-completed-stars">
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                        <Star size={16} fill="currentColor" />
                      </div>
                    </button>
                  )}

                  {status === 'current' && (
                    <div className="card-current">
                      <div className="card-current-glow"></div>
                      
                      <div className="card-current-label">
                        <div className="pulse-dot"></div>
                        Current Level
                      </div>
                      
                      <h2 className="card-current-title">Level {index + 1} — {puzzle.theme}</h2>
                      
                      <div className="card-current-tags">
                        <span className="card-tag"><Target size={14}/> {puzzle.rating} ELO</span>
                        <span className="card-tag">1 Puzzle</span>
                      </div>

                      <button 
                        onClick={() => navigate(`/puzzles/${puzzle.id}`)}
                        className="btn-play"
                        aria-label={`Play Level ${index + 1}: ${puzzle.theme}`}
                      >
                        Play Now <Play size={18} fill="currentColor" />
                      </button>
                    </div>
                  )}

                  {status === 'locked' && (
                    <div 
                      className="card-locked"
                      aria-hidden="true"
                    >
                      <div className="card-locked-icon">
                        <Lock size={20} />
                      </div>
                      <div>
                        <div className="card-locked-label">Level {index + 1} • Locked</div>
                        <h3 className="card-locked-title">{puzzle.theme}</h3>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
