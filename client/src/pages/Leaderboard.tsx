import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Trophy, Crown, Medal, Swords, Users } from 'lucide-react';
import './Leaderboard.css';

interface LeaderboardUser {
  id: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
};

export const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setUsers(data.leaderboard || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const top3 = users.slice(0, 3);
  const rest = users.slice(3);

  const medalStyles = ['gold', 'silver', 'bronze'] as const;
  const medalClasses = ['gold-medal', 'silver-medal', 'bronze-medal'] as const;
  // Show podium in visual order: silver(2nd), gold(1st), bronze(3rd)
  const podiumOrder = top3.length === 3 ? [top3[1], top3[0], top3[2]] : top3;

  return (
    <div className="leaderboard-page">
      {/* Header */}
      <div className="lb-header">
        <div className="lb-header-row">
          <div className="lb-header-icon">
            <Trophy size={24} />
          </div>
          <h1>Global <span>Leaderboard</span></h1>
        </div>
        <p className="lb-header-sub">Compete with the best players around the world</p>
      </div>

      {/* Podium */}
      {!isLoading && top3.length >= 3 && (
        <motion.div
          className="lb-podium"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {podiumOrder.map((user, visualIdx) => {
            // Map visual index back to actual rank
            const actualRank = visualIdx === 0 ? 1 : visualIdx === 1 ? 0 : 2;
            const style = medalStyles[actualRank];
            const medal = medalClasses[actualRank];
            const winRate = user.gamesPlayed > 0
              ? Math.round((user.wins / user.gamesPlayed) * 100)
              : 0;

            return (
              <motion.div
                key={user.id}
                className={`lb-podium-card ${style}`}
                variants={itemVariants}
              >
                <div className={`lb-podium-medal ${medal}`}>
                  {actualRank + 1}
                </div>
                <div className="lb-podium-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="lb-podium-name">{user.username}</div>
                <div className="lb-podium-rating">{user.rating} ELO</div>
                <div className="lb-podium-stats">
                  <span className="lb-podium-stat">
                    <Swords size={10} /> {user.wins}W
                  </span>
                  <span className="lb-podium-stat">
                    {winRate}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Table */}
      <div className="lb-table-container">
        <div className="lb-table-header">
          <span>Rank</span>
          <span>Player</span>
          <span>Rating</span>
          <span>Games</span>
          <span>Win Rate</span>
        </div>

        <div className="lb-table-body">
          {isLoading ? (
            // Shimmer skeleton
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="lb-skeleton-row">
                <div className="lb-skeleton-cell" style={{ width: '30px' }} />
                <div className="lb-skeleton-cell" />
                <div className="lb-skeleton-cell" style={{ width: '60px' }} />
                <div className="lb-skeleton-cell" style={{ width: '40px' }} />
                <div className="lb-skeleton-cell" />
              </div>
            ))
          ) : users.length === 0 ? (
            <div className="lb-empty">
              <Users size={48} className="lb-empty-icon" />
              <p>No players found. Be the first to join!</p>
            </div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              {rest.map((user, index) => {
                const rank = index + 4;
                const winRate = user.gamesPlayed > 0
                  ? Math.round((user.wins / user.gamesPlayed) * 100)
                  : 0;

                return (
                  <motion.div
                    key={user.id}
                    className="lb-table-row"
                    variants={itemVariants}
                  >
                    <span className="lb-rank">#{rank}</span>
                    <div className="lb-player">
                      <div className="lb-player-avatar">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <span className="lb-player-name">{user.username}</span>
                    </div>
                    <span className="lb-rating-cell">{user.rating}</span>
                    <span className="lb-games-cell">{user.gamesPlayed}</span>
                    <div className="lb-winrate-cell">
                      <span className="lb-winrate-text">{winRate}%</span>
                      <div className="lb-winrate-bar">
                        <div className="lb-winrate-fill" style={{ width: `${winRate}%` }} />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};
