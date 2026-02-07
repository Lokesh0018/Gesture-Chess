import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './components/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { Home } from './pages/Home';
import { LocalGame } from './pages/LocalGame';
import { LocalGameSetup } from './pages/LocalGameSetup';
import { CustomGameSetup } from './pages/CustomGameSetup';
import { CustomGame } from './pages/CustomGame';
import { Profile } from './pages/Profile';
import { SettingsPage } from './pages/SettingsPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Leaderboard } from './pages/Leaderboard';
import { NotFound } from './pages/NotFound';
import { OnlineGameSetup } from './pages/OnlineGameSetup';
import { OnlineGame } from './pages/OnlineGame';
import { TournamentSetup } from './pages/TournamentSetup';
import { TournamentLobby } from './pages/TournamentLobby';
import { PlayBot } from './pages/PlayBot';
import { Puzzles } from './pages/Puzzles';
import { Analysis } from './pages/Analysis';
import { Learn } from './pages/Learn';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageTransition } from './components/PageTransition';

function App() {
  const location = useLocation();
  return (
    <ErrorBoundary>
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            color: '#fff',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px'
          },
          success: {
            iconTheme: {
              primary: '#22C55E',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
      <>
        <Routes location={location}>
          {/* Landing Page without MainLayout */}
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          
          {/* Pages wrapped in MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="local" element={<PageTransition><LocalGame /></PageTransition>} />
            <Route path="custom-game" element={<PageTransition><CustomGame /></PageTransition>} />
            <Route path="online-game" element={<PageTransition><OnlineGame /></PageTransition>} />
            <Route path="room" element={<PageTransition><TournamentLobby /></PageTransition>} />
            
            <Route element={<DashboardLayout />}>
              <Route path="local-setup" element={<PageTransition><LocalGameSetup /></PageTransition>} />
              <Route path="custom-setup" element={<PageTransition><CustomGameSetup /></PageTransition>} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="dashboard" element={<PageTransition><Home /></PageTransition>} />
                <Route path="online-setup" element={<PageTransition><OnlineGameSetup /></PageTransition>} />
                <Route path="room-setup" element={<PageTransition><TournamentSetup /></PageTransition>} />
                <Route path="settings" element={<PageTransition><SettingsPage /></PageTransition>} />
                <Route path="profile" element={<PageTransition><Profile /></PageTransition>} />
                <Route path="bot" element={<PageTransition><PlayBot /></PageTransition>} />
                <Route path="puzzles" element={<PageTransition><Puzzles /></PageTransition>} />
                <Route path="analysis" element={<PageTransition><Analysis /></PageTransition>} />
                <Route path="learn" element={<PageTransition><Learn /></PageTransition>} />
                <Route path="leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
              </Route>
            </Route>
            
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Route>
        </Routes>
      </>
    </ErrorBoundary>
  );
}

export default App;
