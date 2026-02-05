import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ChessQueen, User, LogOut, Home } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left: Logo */}
        <div className="nav-section">
          <ChessQueen style={{ width: '32px', height: '32px', color: 'var(--color-accent)' }} />
          <Link to="/" className="nav-logo">Gesture<span>Chess</span></Link>
        </div>

      {/* Center: Navigation */}
      <div className="nav-section center">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
          <Home style={{ width: '16px', height: '16px' }} />
          <span>Home</span>
        </Link>
        <div className="nav-divider"></div>
        <Link to="/local" className={`nav-link ${location.pathname === '/local' ? 'active' : ''}`}>
          Local Game
        </Link>
        <Link to="/bot" className={`nav-link ${location.pathname === '/bot' ? 'active' : ''}`}>
          Play Bot
        </Link>
        <Link to="/puzzles" className={`nav-link ${location.pathname === '/puzzles' ? 'active' : ''}`}>
          Puzzles
        </Link>
        <Link to="/analysis" className={`nav-link ${location.pathname === '/analysis' ? 'active' : ''}`}>
          Analysis
        </Link>
        <Link to="/learn" className={`nav-link ${location.pathname === '/learn' ? 'active' : ''}`}>
          Learn
        </Link>
        <Link to="/online" className={`nav-link ${location.pathname === '/online' ? 'active' : ''}`}>
          Tournaments
        </Link>
      </div>

      {/* Right: Auth & Theme */}
      <div className="nav-section right">
        {user ? (
          <>
            <Link to="/profile" className="nav-link">
              <User style={{ width: '20px', height: '20px' }} />
              <span>{user.username}</span>
            </Link>
            <button onClick={logout} className="nav-btn-icon">
              <LogOut style={{ width: '20px', height: '20px' }} />
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-btn-login">Login</Link>
            <Link to="/register" className="nav-btn-signup">Sign Up</Link>
          </>
        )}
      </div>
      </div>
    </nav>
  );
};
