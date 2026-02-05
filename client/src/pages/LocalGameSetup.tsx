import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Users, Play, Settings, RefreshCw, LayoutTemplate, X } from 'lucide-react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import './LocalGameSetup.css';

const TIME_CONTROLS = [
  { id: 'bullet', label: '1+0', time: 60, inc: 0, sub: 'Bullet' },
  { id: 'blitz-3', label: '3+2', time: 180, inc: 2, sub: 'Blitz' },
  { id: 'blitz-5', label: '5+3', time: 300, inc: 3, sub: 'Blitz' },
  { id: 'rapid', label: '10+5', time: 600, inc: 5, sub: 'Rapid' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

export const LocalGameSetup = () => {
  const navigate = useNavigate();
  const [selectedTimeId, setSelectedTimeId] = useState('rapid');
  const [isCustom, setIsCustom] = useState(false);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [increment, setIncrement] = useState(5);
  
  const [whiteName, setWhiteName] = useState('White');
  const [blackName, setBlackName] = useState('Black');

  const [customFen, setCustomFen] = useState<string | null>(null);
  const [showDesigner, setShowDesigner] = useState(false);
  const [designerGame, setDesignerGame] = useState(new Chess());
  const [designerTurn] = useState<'w' | 'b'>('w');

  const handleSwapColors = () => {
    const temp = whiteName;
    setWhiteName(blackName);
    setBlackName(temp);
  };

  const handleTimeSelect = (id: string, time: number, inc: number) => {
    setSelectedTimeId(id);
    setIsCustom(false);
    setWhiteTime(time);
    setBlackTime(time);
    setIncrement(inc);
  };

  const handleStart = () => {
    navigate('/local', { 
      state: { 
        whiteTime, 
        blackTime,
        increment,
        whiteName,
        blackName,
        customFen
      } 
    });
  };

  const onDesignerPieceDrop = (args: any) => {
    const sourceSquare = args.sourceSquare;
    const targetSquare = args.targetSquare;
    const piece = args.piece;

    if (sourceSquare === 'spare') {
      const type = piece.charAt(1).toLowerCase();
      const color = piece.charAt(0);
      try {
        designerGame.put({ type: type as any, color: color as any }, targetSquare as any);
        setDesignerGame(new Chess(designerGame.fen()));
        return true;
      } catch { return false; }
    } else {
      if (!targetSquare || targetSquare === 'trash') {
        designerGame.remove(sourceSquare as any);
        setDesignerGame(new Chess(designerGame.fen()));
        return true;
      }
      
      // Handle standard move or replace
      designerGame.remove(sourceSquare as any);
      const type = piece.charAt(1).toLowerCase();
      const color = piece.charAt(0);
      try {
        designerGame.put({ type: type as any, color: color as any }, targetSquare as any);
        setDesignerGame(new Chess(designerGame.fen()));
        return true;
      } catch { return false; }
    }
  };

  const handleSaveDesign = () => {
    // Inject the turn into the FEN before saving
    const fenParts = designerGame.fen().split(' ');
    fenParts[1] = designerTurn;
    setCustomFen(fenParts.join(' '));
    setShowDesigner(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="setup-container"
    >
      <AnimatePresence mode="wait">
        {!showDesigner ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={{ width: '100%' }}
          >
            <h1 className="setup-title">Local Game</h1>
            <p className="setup-subtitle">Configure your match and start playing offline.</p>

      <div className="setup-grid">
        {/* Players Card */}
        <div className="setup-card">
          <div className="setup-card-title">
            <Users size={20} color="#60A5FA" />
            Players
          </div>

          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="setup-input-group">
              <label className="setup-input-label">Player 1 (White)</label>
              <input
                type="text"
                className="setup-input"
                value={whiteName}
                onChange={e => setWhiteName(e.target.value)}
                placeholder="Enter name"
              />
            </div>

            <button className="setup-swap-btn" onClick={handleSwapColors} title="Swap Players">
              <RefreshCw size={18} />
            </button>

            <div className="setup-input-group">
              <label className="setup-input-label">Player 2 (Black)</label>
              <input 
                type="text" 
                className="setup-input"
                value={blackName}
                onChange={e => setBlackName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
          </div>

          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button 
              className="setup-time-btn" 
              onClick={() => setShowDesigner(true)}
              style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', gap: '8px' }}
            >
              <LayoutTemplate size={16} />
              <span className="setup-time-label">{customFen ? 'Edit Custom Board' : 'Custom Design Board'}</span>
            </button>
            {customFen && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '14px', color: '#34D399' }}>
                ✓ Custom Board Set 
                <button onClick={() => setCustomFen(null)} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', display: 'flex', padding: '4px' }} title="Remove Custom Board">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Time Control Card */}
        <div className="setup-card">
          <div className="setup-card-title">
            <Timer size={20} color="#FBBF24" />
            Time Control
          </div>

          <motion.div className="setup-time-grid" variants={containerVariants} initial="hidden" animate="show">
            {TIME_CONTROLS.map(tc => (
              <motion.button
                key={tc.id}
                variants={itemVariants}
                className={`setup-time-btn ${!isCustom && selectedTimeId === tc.id ? 'active' : ''}`}
                onClick={() => handleTimeSelect(tc.id, tc.time, tc.inc)}
              >
                <span className="setup-time-label">{tc.label}</span>
                <span className="setup-time-sub">{tc.sub}</span>
              </motion.button>
            ))}
          </motion.div>
          <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
            <button
              className={`setup-time-btn ${isCustom ? 'active' : ''}`}
              style={{ width: '100%', flexDirection: 'row', justifyContent: 'center', gap: '8px' }}
              onClick={() => setIsCustom(true)}
            >
              <Settings size={16} />
              <span className="setup-time-label">Custom Time Odds</span>
            </button>

            <AnimatePresence>
              {isCustom && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
                    <div className="setup-input-group">
                      <label className="setup-input-label" style={{ fontSize: '10px' }}>White (s)</label>
                      <input 
                        type="number" 
                        className="setup-input"
                        style={{ padding: '8px', fontSize: '14px' }}
                        value={whiteTime}
                        onChange={e => setWhiteTime(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                    <div className="setup-input-group">
                      <label className="setup-input-label" style={{ fontSize: '10px' }}>Black (s)</label>
                      <input 
                        type="number" 
                        className="setup-input"
                        style={{ padding: '8px', fontSize: '14px' }}
                        value={blackTime}
                        onChange={e => setBlackTime(Math.max(0, parseInt(e.target.value) || 0))}
                      />
                    </div>
                  </div>
                  <div className="setup-input-group" style={{ marginTop: '12px' }}>
                    <label className="setup-input-label" style={{ fontSize: '10px' }}>Inc (s)</label>
                    <input 
                      type="number" 
                      className="setup-input"
                      style={{ padding: '8px', fontSize: '14px' }}
                      value={increment}
                      onChange={e => setIncrement(Math.max(0, parseInt(e.target.value) || 0))}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <motion.button
        className="setup-start-btn"
        onClick={handleStart}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={{
          boxShadow: ['0 0 0px rgba(37,99,235,0)', '0 0 20px rgba(37,99,235,0.4)', '0 0 0px rgba(37,99,235,0)']
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Play fill="currentColor" size={24} />
        Start Game
      </motion.button>
      </motion.div>

        ) : (
          <motion.div 
            key="designer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <div style={{ maxWidth: '520px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Board Designer</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    onClick={() => { const g = new Chess(); g.clear(); setDesignerGame(g); }}
                    style={{ padding: '6px 12px', background: 'rgba(248,113,113,0.1)', color: '#F87171', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                  >
                    Clear
                  </button>
                  <button 
                    onClick={() => setDesignerGame(new Chess())}
                    style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                  >
                    Reset
                  </button>
                  <button onClick={() => setShowDesigner(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}><X size={24} /></button>
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px', marginBottom: '16px' }}>
                <Chessboard
                  options={{
                    position: designerGame.fen().startsWith('8/8/8/8/8/8/8/8') ? { a1: { pieceType: 'wX' } } : designerGame.fen(),
                    pieces: { wX: () => <div style={{ display: 'none' }} /> },
                    onPieceDrop: onDesignerPieceDrop,
                    allowDragOffBoard: true,
                    boardOrientation: "white",
                    darkSquareStyle: { backgroundColor: '#475569' },
                    lightSquareStyle: { backgroundColor: '#cbd5e1' }
                  }}
                />
              </div>

              <button 
                onClick={handleSaveDesign}
                disabled={designerGame.fen().startsWith('8/8/8/8/8/8/8/8')}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  background: designerGame.fen().startsWith('8/8/8/8/8/8/8/8') ? 'rgba(255,255,255,0.1)' : '#3B82F6', 
                  color: designerGame.fen().startsWith('8/8/8/8/8/8/8/8') ? 'rgba(255,255,255,0.3)' : 'white', 
                  borderRadius: '12px', 
                  border: 'none', 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  cursor: designerGame.fen().startsWith('8/8/8/8/8/8/8/8') ? 'not-allowed' : 'pointer' 
                }}
              >
                {designerGame.fen().startsWith('8/8/8/8/8/8/8/8') ? 'Add pieces to save' : 'Save & Use Custom Board'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
