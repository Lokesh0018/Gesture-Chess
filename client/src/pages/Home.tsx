import React from 'react';
import { Swords, Users, Trophy, Settings, BarChart2, LayoutDashboard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const Home = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="home-layout">
      {/* Sidebar Navigation */}
      <aside className="home-sidebar">
        <nav className="sidebar-nav">
          <Link to="/" className={`sidebar-link ${currentPath === '/' ? 'active' : ''}`}>
            <LayoutDashboard className="sidebar-icon" />
            <span>Dashboard</span>
          </Link>
          <Link to="/local" className={`sidebar-link ${currentPath === '/local' ? 'active' : ''}`}>
            <Users className="sidebar-icon" />
            <span>Local Play</span>
          </Link>
          <Link to="/online" className={`sidebar-link ${currentPath === '/online' ? 'active' : ''}`}>
            <Swords className="sidebar-icon" />
            <span>Online Match</span>
          </Link>
          <Link to="/leaderboard" className={`sidebar-link ${currentPath === '/leaderboard' ? 'active' : ''}`}>
            <BarChart2 className="sidebar-icon" />
            <span>Leaderboard</span>
          </Link>
          <Link to="/settings" className={`sidebar-link ${currentPath === '/settings' ? 'active' : ''}`}>
            <Settings className="sidebar-icon" />
            <span>Settings</span>
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="home-content-area">
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
      </div>
    </div>
  );
};
