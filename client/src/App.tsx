import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { lazy, Suspense } from 'react';
import { HelmetProvider } from 'react-helmet-async';

import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './components/DashboardLayout';
const LandingPage = lazy(() => import('./pages/LandingPage').then(module => ({ default: module.LandingPage })));
const Home = lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const LocalGame = lazy(() => import('./pages/LocalGame').then(module => ({ default: module.LocalGame })));
const LocalGameSetup = lazy(() => import('./pages/LocalGameSetup').then(module => ({ default: module.LocalGameSetup })));
const CustomGameSetup = lazy(() => import('./pages/CustomGameSetup').then(module => ({ default: module.CustomGameSetup })));
const CustomGame = lazy(() => import('./pages/CustomGame').then(module => ({ default: module.CustomGame })));
const Profile = lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(module => ({ default: module.SettingsPage })));
const Login = lazy(() => import('./pages/Login').then(module => ({ default: module.Login })));
const Register = lazy(() => import('./pages/Register').then(module => ({ default: module.Register })));
const Leaderboard = lazy(() => import('./pages/Leaderboard').then(module => ({ default: module.Leaderboard })));
const NotFound = lazy(() => import('./pages/NotFound').then(module => ({ default: module.NotFound })));
const OnlineGameSetup = lazy(() => import('./pages/OnlineGameSetup').then(module => ({ default: module.OnlineGameSetup })));
const OnlineGame = lazy(() => import('./pages/OnlineGame').then(module => ({ default: module.OnlineGame })));
const TournamentSetup = lazy(() => import('./pages/TournamentSetup').then(module => ({ default: module.TournamentSetup })));
const TournamentLobby = lazy(() => import('./pages/TournamentLobby').then(module => ({ default: module.TournamentLobby })));
const PlayBot = lazy(() => import('./pages/PlayBot').then(module => ({ default: module.PlayBot })));
const BotSetup = lazy(() => import('./pages/BotSetup').then(module => ({ default: module.BotSetup })));
const PuzzleMap = lazy(() => import('./pages/PuzzleMap').then(module => ({ default: module.PuzzleMap })));
const Puzzles = lazy(() => import('./pages/Puzzles').then(module => ({ default: module.Puzzles })));
const Analysis = lazy(() => import('./pages/Analysis').then(module => ({ default: module.Analysis })));
const Learn = lazy(() => import('./pages/Learn').then(module => ({ default: module.Learn })));

import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageTransition } from './components/PageTransition';
import { Preloader } from './components/Preloader';
import { useSettingsStore } from './store/useSettingsStore';
import { useEffect } from 'react';

function App() {
  const location = useLocation();
  const highContrast = useSettingsStore(state => state.highContrast);

  useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <Suspense fallback={<Preloader />}>
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
              <Route path="bot-game" element={<PageTransition><PlayBot /></PageTransition>} />
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
                  <Route path="bot-setup" element={<PageTransition><BotSetup /></PageTransition>} />
                  <Route path="puzzle-setup" element={<PageTransition><PuzzleMap /></PageTransition>} />
                  <Route path="puzzles/:id" element={<PageTransition><Puzzles /></PageTransition>} />
                  <Route path="analysis" element={<PageTransition><Analysis /></PageTransition>} />
                  <Route path="learn" element={<PageTransition><Learn /></PageTransition>} />
                  <Route path="leaderboard" element={<PageTransition><Leaderboard /></PageTransition>} />
                </Route>
              </Route>

              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Route>
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </HelmetProvider>
  );
}

export default App;
