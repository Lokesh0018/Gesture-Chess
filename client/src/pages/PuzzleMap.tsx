import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { PUZZLES } from '../data/puzzles';
import { Lock, Star, Play, CheckCircle2, Target, Sword, Shield, Zap, Flame, Clock } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import confetti from 'canvas-confetti';
import './PuzzleMap.css';

const THEME_ICONS: Record<string, React.FC<any>> = {
  'Pin': Zap,
  'Fork': Sword,
  'Discovery': Flame,
  'Endgame': Shield,
  'Checkmate': Target,
};

export const PuzzleMap = () => {
  
  useEffect(() => {
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    const dashboardScroll = document.querySelector('.dashboard-content-scroll') as HTMLElement;

    if (mainContent) mainContent.style.overflow = 'hidden';
    if (dashboardScroll) dashboardScroll.style.overflow = 'hidden';

    return () => {
      if (mainContent) mainContent.style.overflow = '';
      if (dashboardScroll) dashboardScroll.style.overflow = '';
    };
  }, []);

  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    container: containerRef,
    offset: ["start start", "end end"]
  });

  const pathHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Parallax transforms
  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, 100]);

  // Fake Progress Calculation
  const currentLevelIndex = 1; // Level 2 is "Current"
  const totalLevels = PUZZLES.length;
  const starsEarned = currentLevelIndex * 3;
  const totalStars = totalLevels * 3;
  const progressPercent = Math.round((currentLevelIndex / totalLevels) * 100);

  const handleConfetti = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { x, y },
      colors: ['#22d3ee', '#3b82f6', '#facc15']
    });
  };

  const scrollToLevel = (index: number) => {
    const el = document.getElementById(`level-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="puzzle-map-page">
      <div className="puzzle-scroll-container" ref={containerRef}>

        {/* Parallax Background Orbs */}
        <motion.div style={{ y: y1 }} className="parallax-orb parallax-orb-1" />
        <motion.div style={{ y: y2 }} className="parallax-orb parallax-orb-2" />
        <motion.div style={{ y: y3 }} className="parallax-orb parallax-orb-3" />

        {/* Sticky Mini-Map */}
        <div className="mini-map-container">
          {PUZZLES.map((puzzle, index) => {
            const status = index < currentLevelIndex ? 'completed' : index === currentLevelIndex ? 'current' : 'locked';
            return (
              <div
                key={`mini-${puzzle.id}`}
                className={`mini-map-dot ${status}`}
                data-title={`Level ${index + 1}: ${puzzle.theme}`}
                onClick={() => scrollToLevel(index)}
              />
            );
          })}
        </div>

        <div className="puzzle-container">

          {/* Header Section */}
          <div className="puzzle-header">
            <h1 className="puzzle-title">
              Puzzle Journey
            </h1>
            <p className="puzzle-subtitle">
              Master your tactics, one level at a time.
            </p>

            {/* Daily Challenge Banner */}
            <div className="daily-challenge-banner">
              <div className="daily-challenge-bg"></div>
              <div className="daily-challenge-content">
                <h2 className="daily-challenge-title">
                  <Flame size={20} className="text-orange-400" /> Daily Grandmaster Challenge
                </h2>
                <div className="daily-challenge-time">
                  <Clock size={14} /> Ends in 14h 22m
                </div>
              </div>
              <button className="btn-challenge" onClick={() => navigate('/puzzles/daily')}>
                Play Challenge <Play size={16} fill="currentColor" />
              </button>
            </div>

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
                    <Star size={14} className="progress-value-yellow" fill="currentColor" /> Stars Earned
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

            {/* Active Glowing Path with pulse */}
            <motion.div
              style={{ height: pathHeight }}
              className="timeline-active-path"
            >
              <div className="timeline-pulse"></div>
            </motion.div>

            <div className="timeline-list">
              {PUZZLES.map((puzzle, index) => {
                const status = index < currentLevelIndex ? 'completed' : index === currentLevelIndex ? 'current' : 'locked';
                const ThemeIcon = THEME_ICONS[puzzle.theme] || Target;

                return (
                  <div key={puzzle.id} id={`level-${index}`} className="level-item">
                    {/* Timeline Dot */}
                    <div className={`level-dot ${status}`}></div>

                    {/* Level Card */}
                    {status === 'completed' && (
                      <div
                        className="card-completed"
                      >
                        <ThemeIcon className="card-theme-icon" size={120} />
                        <div className="card-completed-left">
                          <div className="card-completed-icon" onClick={handleConfetti} title="Celebrate!">
                            <CheckCircle2 size={24} />
                          </div>
                          <div onClick={() => navigate(`/puzzles/${puzzle.id}`)} style={{ cursor: 'pointer' }}>
                            <div className="card-completed-label">Level {index + 1} • Completed</div>
                            <h3 className="card-completed-title">{puzzle.theme}</h3>
                          </div>
                        </div>
                        <div className="card-completed-stars">
                          <Star size={16} fill="currentColor" />
                          <Star size={16} fill="currentColor" />
                          <Star size={16} fill="currentColor" />
                        </div>
                      </div>
                    )}

                    {status === 'current' && (
                      <div className="card-current">
                        <div className="card-current-glow"></div>
                        <ThemeIcon className="card-theme-icon" size={180} />

                        <div className="card-current-label">
                          <div className="pulse-dot"></div>
                          Current Level
                        </div>

                        <h2 className="card-current-title">Level {index + 1} — {puzzle.theme}</h2>

                        <div className="card-current-tags">
                          <span className="card-tag"><Target size={14} /> {puzzle.rating} ELO</span>
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
                        <div className="card-locked-main">
                          <div className="card-locked-icon">
                            <Lock size={20} />
                          </div>
                          <div>
                            <div className="card-locked-label">Level {index + 1} • Locked</div>
                            <h3 className="card-locked-title">{puzzle.theme}</h3>
                          </div>
                        </div>
                        <div className="card-locked-teaser">
                          Tactical Mastery Required
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
    </div>
  );
};
