import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { ChessQueen, User, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left: Logo */}
        <div className="nav-section">
          <ChessQueen 
            style={{ width: '32px', height: '32px', color: 'var(--color-accent)', marginRight: '10px', cursor: 'pointer' }} 
            onClick={() => window.dispatchEvent(new Event('toggle-sidebar'))}
          />
          <Link to="/" className="nav-logo">Gesture<span>Chess</span></Link>
        </div>

      {/* Center: Navigation */}
      <div className="nav-section center">
        {user && (
          <Link to="/dashboard" className={`nav-link ${location.pathname.startsWith('/dashboard') ? 'active' : ''}`}>
            Dashboard
          </Link>
        )}
        <Link to="/local-setup" className={`nav-link ${location.pathname.startsWith('/local') ? 'active' : ''}`}>
          Local Game
        </Link>
        <Link to="/online" className={`nav-link ${location.pathname.startsWith('/online') ? 'active' : ''}`}>
          Online Game
        </Link>
        <Link to="/bot" className={`nav-link ${location.pathname.startsWith('/bot') ? 'active' : ''}`}>
          Play Bot
        </Link>
        <Link to="/custom-setup" className={`nav-link ${location.pathname.startsWith('/custom-setup') ? 'active' : ''}`}>
          Custom Design
        </Link>
        <Link to="/puzzle-setup" className={`nav-link ${location.pathname.startsWith('/puzzle') ? 'active' : ''}`}>
          Puzzles
        </Link>
        <Link to="/learn" className={`nav-link ${location.pathname.startsWith('/learn') ? 'active' : ''}`}>
          Learn
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
