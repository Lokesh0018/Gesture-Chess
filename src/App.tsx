import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import LocalGame from './LocalGame';
import OnlineGame from './OnlineGame';
import Landing from './Landing';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { staggerChildren: 0.1, duration: 0.3, ease: 'easeOut' }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

function Lobby() {
  return (
    <>
      <Link to="/" className="back-btn">◀ Back</Link>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: '0 auto', width: '100%' }}>
        <motion.div className="menu-container glass-panel" style={{ padding: '40px', alignItems: 'center', borderRadius: '16px' }} variants={containerVariants} initial="hidden" animate="show">
          <motion.h1 variants={itemVariants} style={{ fontSize: '4rem', margin: '0 0 10px 0', textShadow: '0 4px 10px rgba(0,0,0,0.5)', color: 'var(--accent)' }}>LoChess</motion.h1>
          <motion.p variants={itemVariants} style={{ margin: '0 0 30px 0', color: 'var(--text-muted)' }}>Select a game mode to begin</motion.p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
            <motion.div variants={itemVariants}><Link to="/online" className="menu-btn" style={{ display: 'block', backgroundColor: '#f04e30' }}>Play Online Multiplayer</Link></motion.div>
            <motion.div variants={itemVariants}><Link to="/local" className="menu-btn secondary" style={{ display: 'block' }}>Play Local Multiplayer</Link></motion.div>
            <motion.div variants={itemVariants}><button className="menu-btn secondary" style={{ width: '100%' }} onClick={() => alert('Puzzle Mode coming soon!')}>Daily Puzzle</button></motion.div>
            <motion.div variants={itemVariants}><button className="menu-btn secondary" style={{ width: '100%' }} onClick={() => alert('AI Mode coming soon!')}>Play vs AI</button></motion.div>
            <motion.div variants={itemVariants}><button className="menu-btn secondary" style={{ width: '100%' }} onClick={() => alert('Settings coming soon!')}>Settings</button></motion.div>
          </div>
        </motion.div>
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
