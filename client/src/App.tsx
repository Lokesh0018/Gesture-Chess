import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { MainLayout } from './layouts/MainLayout';
import { LandingPage } from './pages/LandingPage';
import { Home } from './pages/Home';
import { LocalGame } from './pages/LocalGame';
import { OnlineGame } from './pages/OnlineGame';
import { SettingsPage } from './pages/SettingsPage';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Profile } from './pages/Profile';
import { Leaderboard } from './pages/Leaderboard';
import { NotFound } from './pages/NotFound';
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
      <Toaster position="top-right" />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Landing Page without MainLayout */}
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          
          {/* Pages wrapped in MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="login" element={<PageTransition><Login /></PageTransition>} />
            <Route path="register" element={<PageTransition><Register /></PageTransition>} />
            <Route path="local" element={<PageTransition><LocalGame /></PageTransition>} />
            <Route path="bot" element={<PageTransition><PlayBot /></PageTransition>} />
            <Route path="puzzles" element={<PageTransition><Puzzles /></PageTransition>} />
            <Route path="analysis" element={<PageTransition><Analysis /></PageTransition>} />
            <Route path="learn" element={<PageTransition><Learn /></PageTransition>} />
            <Route path="leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<PageTransition><Home /></PageTransition>} />
              <Route path="online" element={<PageTransition><OnlineGame /></PageTransition>} />
              <Route path="settings" element={<PageTransition><SettingsPage /></PageTransition>} />
              <Route path="profile" element={<PageTransition><Profile /></PageTransition>} />
            </Route>
            
            <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
          </Route>
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

export default App;
