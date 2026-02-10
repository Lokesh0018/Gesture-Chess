import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import toast from 'react-hot-toast';
import { Target, Trophy, Clock, XCircle, MinusCircle, CheckCircle2, User } from 'lucide-react';
import './Profile.css';

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.08, type: 'spring', stiffness: 400, damping: 30 }
  })
};

export const Profile = () => {
  const { user: authUser, token } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setProfileData(data.user);
          setUsername(data.user.username);
          setRecentGames(data.recentGames || []);
        } else {
          toast.error(data.error || 'Failed to load profile');
        }
      } catch (err) {
        toast.error('Network error loading profile');
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  if (!authUser || isLoading) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          <div className="profile-loading-spinner" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="profile-page">
        <div className="profile-loading">
          Failed to load profile data.
        </div>
      </div>
    );
  }

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated successfully!');
        setProfileData(data.user);
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const stats = [
    { label: 'Rating', value: profileData.rating, iconClass: 'rating', icon: Target },
    { label: 'Wins', value: profileData.wins, iconClass: 'wins', icon: Trophy },
    { label: 'Losses', value: profileData.losses, iconClass: 'losses', icon: XCircle },
    { label: 'Draws', value: profileData.draws, iconClass: 'draws', icon: MinusCircle },
  ];

  return (
    <div className="profile-page">
      {/* Header */}
      <div className="profile-header">
        <div className="profile-header-row">
          <div className="profile-header-icon">
            <User size={22} />
          </div>
          <h1>Your <span>Profile</span></h1>
        </div>
        <p className="profile-header-sub">View and manage your account</p>
      </div>

      {/* Scrollable content */}
      <div className="profile-scroll">
        {/* Profile card */}
        <motion.div
          className="profile-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              {profileData.username.charAt(0).toUpperCase()}
            </div>
            <div className="profile-avatar-ring" />
            <div className="profile-online-dot" />
          </div>

          <div className="profile-info">
            <div className="profile-form-group">
              <label className="profile-form-label">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="profile-form-input"
              />
            </div>
            <div className="profile-form-group">
              <label className="profile-form-label">Email</label>
              <input
                type="text"
                disabled
                value={profileData.email}
                className="profile-form-input"
              />
            </div>
            <button
              onClick={handleUpdate}
              disabled={isSaving || username === profileData.username}
              className="profile-save-btn"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="profile-stats-grid">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="profile-stat-card"
              variants={itemVariants}
              initial="hidden"
              animate="show"
              custom={i}
            >
              <div className={`profile-stat-icon ${stat.iconClass}`}>
                <stat.icon size={20} />
              </div>
              <span className="profile-stat-label">{stat.label}</span>
              <span className="profile-stat-value">{stat.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Match history */}
        <motion.div
          className="profile-matches"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4, ease: 'easeOut' }}
        >
          <div className="profile-matches-header">
            <Clock size={18} className="profile-matches-header-icon" />
            <span className="profile-matches-title">Recent Matches</span>
          </div>

          {recentGames.length === 0 ? (
            <div className="profile-matches-empty">
              No matches played yet. Go play a game!
            </div>
          ) : (
            <>
              <div className="profile-matches-table-head">
                <span>Date</span>
                <span>Result</span>
                <span>Moves</span>
                <span>Analysis</span>
              </div>
              {recentGames.map((game, i) => (
                <div key={game.id || i} className="profile-match-row">
                  <span className="profile-match-date">
                    {formatDate(game.createdAt)}
                  </span>
                  <span>
                    {game.winnerId === profileData.id ? (
                      <span className="profile-match-result won">
                        <CheckCircle2 size={12} /> Won
                      </span>
                    ) : game.winnerId ? (
                      <span className="profile-match-result lost">
                        <XCircle size={12} /> Lost
                      </span>
                    ) : (
                      <span className="profile-match-result draw">
                        <MinusCircle size={12} /> Draw
                      </span>
                    )}
                  </span>
                  <span className="profile-match-moves">
                    {game.pgn ? Math.ceil(game.pgn.split(' ').length / 3) : '?'} moves
                  </span>
                  <span>
                    <button
                      className="profile-pgn-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(game.pgn);
                        toast.success('PGN copied to clipboard');
                      }}
                    >
                      Copy PGN
                    </button>
                  </span>
                </div>
              ))}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
