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
import { ProtectedRoute } from './components/ProtectedRoute';
import { PageTransition } from './components/PageTransition';

function App() {
  const location = useLocation();
  return (
    <>
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
            <Route path="leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<PageTransition><Home /></PageTransition>} />
              <Route path="online" element={<PageTransition><OnlineGame /></PageTransition>} />
              <Route path="settings" element={<PageTransition><SettingsPage /></PageTransition>} />
              <Route path="profile" element={<PageTransition><Profile /></PageTransition>} />
            </Route>
            
            <Route path="*" element={<PageTransition><div className="p-8 text-center text-gray-400">Page under construction</div></PageTransition>} />
          </Route>
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default App;
