import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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

function App() {
  return (
    <>
      <Toaster position="top-right" />
      <Routes>
        {/* Landing Page without MainLayout */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Pages wrapped in MainLayout */}
        <Route element={<MainLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="local" element={<LocalGame />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          
          <Route element={<ProtectedRoute />}>
            <Route path="dashboard" element={<Home />} />
            <Route path="online" element={<OnlineGame />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<Profile />} />
          </Route>
          
          <Route path="*" element={<div className="p-8 text-center text-gray-400">Page under construction</div>} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
