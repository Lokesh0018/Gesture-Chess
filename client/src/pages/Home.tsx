import React from 'react';
import { Swords, Users, Trophy, Hand } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="home-container">
      <div className="home-header">
        <div>
          <h1 className="home-title">Welcome back, Grandmaster</h1>
          <p className="home-subtitle">Ready to play some gesture-controlled chess?</p>
        </div>
      </div>

      <div className="home-grid">
        <Link to="/local" className="home-card primary">
          <div className="home-card-icon primary">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="home-card-title">Local Play</h3>
          <p className="home-card-desc">Play against a friend on the same device using gestures or mouse.</p>
        </Link>
        
        <Link to="/online" className="home-card success">
          <div className="home-card-icon success">
            <Swords className="w-6 h-6" />
          </div>
          <h3 className="home-card-title">Online Match</h3>
          <p className="home-card-desc">Find an opponent online and climb the global leaderboard.</p>
        </Link>
        
        <div className="home-card">
          <div className="home-card-icon warning">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="home-card-title">Your Stats</h3>
          <div className="home-stats">
            <div className="home-stat-row">
              <span className="home-stat-label">Rating</span>
              <span className="home-stat-value">1200</span>
            </div>
            <div className="home-stat-row">
              <span className="home-stat-label">Win Rate</span>
              <span className="home-stat-value">52%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
