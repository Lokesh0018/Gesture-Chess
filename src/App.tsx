import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LocalGame from './LocalGame';
import OnlineGame from './OnlineGame';
import Landing from './Landing';

function Lobby() {
  return (
    <>
      <Link to="/" className="back-btn">◀ Back</Link>
      <div className="menu-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px', margin: '0 auto', width: '100%' }}>
        <h1 style={{ fontSize: '4rem', marginBottom: '10px', textShadow: '0 4px 10px rgba(0,0,0,0.5)' }}>LoChess</h1>
        <p style={{ marginBottom: '20px' }}>Select a game mode to begin</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '300px' }}>
          <Link to="/online" className="menu-btn" style={{ backgroundColor: '#f04e30' }}>Play Online Multiplayer</Link>
          <Link to="/local" className="menu-btn secondary">Play Local Multiplayer</Link>
          <button className="menu-btn secondary" onClick={() => alert('Puzzle Mode coming soon!')}>Daily Puzzle</button>
          <button className="menu-btn secondary" onClick={() => alert('AI Mode coming soon!')}>Play vs AI</button>
          <button className="menu-btn secondary" onClick={() => alert('Settings coming soon!')}>Settings</button>
        </div>
      </div>
    </>
  );
}

import VFXLayer from './VFXLayer';

function App() {
  return (
    <>
      <VFXLayer />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/lobby" element={<Lobby />} />
          <Route path="/local" element={<LocalGame />} />
          <Route path="/online" element={<OnlineGame />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
