import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Users, Play, Settings, RefreshCw, LayoutTemplate, X } from 'lucide-react';
import { Chessboard } from 'react-chessboard';

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

// Helper: convert a position dictionary to a FEN string (for react-chessboard options.position)
function positionToFen(pos: Record<string, string>): string {
  const pieceMap: Record<string, string> = {
    wK: 'K', wQ: 'Q', wR: 'R', wB: 'B', wN: 'N', wP: 'P',
    bK: 'k', bQ: 'q', bR: 'r', bB: 'b', bN: 'n', bP: 'p',
  };
  const files = 'abcdefgh';
  let fen = '';
  for (let rank = 8; rank >= 1; rank--) {
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const sq = files[f] + rank;
      const piece = pos[sq];
      if (piece && pieceMap[piece]) {
        if (empty > 0) { fen += empty; empty = 0; }
        fen += pieceMap[piece];
      } else {
        empty++;
      }
    }
    if (empty > 0) fen += empty;
    if (rank > 1) fen += '/';
  }
  return fen + ' w - - 0 1';
}

export const CustomGameSetup = () => {
  const navigate = useNavigate();
  const [selectedTimeId, setSelectedTimeId] = useState('rapid');
  const [isCustom, setIsCustom] = useState(false);
  const [whiteTime, setWhiteTime] = useState(600);
  const [blackTime, setBlackTime] = useState(600);
  const [increment, setIncrement] = useState(5);
  
  const [whiteName, setWhiteName] = useState('White');
  const [blackName, setBlackName] = useState('Black');

  // Custom Board Dictionary State (Sandbox)
  const [customPosition, setCustomPosition] = useState<Record<string, string> | null>(null);
  const [winCondition, setWinCondition] = useState<'elimination' | 'sandbox'>('elimination');

  const [showDesigner, setShowDesigner] = useState(false);
  const [designerPosition, setDesignerPosition] = useState<Record<string, string>>({});
  const [selectedPalettePiece, setSelectedPalettePiece] = useState<string | null>(null);

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
    navigate('/custom-game', { 
      state: { 
        whiteTime, 
        blackTime,
        increment,
        whiteName,
        blackName,
        customPosition: customPosition || {},
        winCondition
      } 
    });
  };

  const onDesignerPieceDrop = (args: any) => {
    const { sourceSquare, targetSquare, piece } = args;
    const newPos = { ...designerPosition };

    if (!targetSquare) {
      // Dropped off board - remove piece
      delete newPos[sourceSquare];
    } else {
      delete newPos[sourceSquare];
      newPos[targetSquare] = piece;
    }
    
    setDesignerPosition(newPos);
    return true;
  };

  const onSquareClick = (args: any) => {
    const square = typeof args === 'string' ? args : args?.square;
    if (selectedPalettePiece && square) {
      const newPos = { ...designerPosition };
      if (selectedPalettePiece === 'trash') {
        delete newPos[square];
      } else {
        newPos[square] = selectedPalettePiece;
      }
      setDesignerPosition(newPos);
    }
  };

  const handleSaveDesign = () => {
    setCustomPosition(designerPosition);
    setShowDesigner(false);
  };

  const isBoardEmpty = Object.keys(designerPosition).length === 0;
  const designerFen = isBoardEmpty ? '8/8/8/8/8/8/8/8 w - - 0 1' : positionToFen(designerPosition);

  const customPieces = useMemo(() => {
    const piecesList = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
    const custom: Record<string, any> = {};
    piecesList.forEach(p => {
      custom[p] = ({ squareWidth }: { squareWidth: number }) => (
        <div style={{ width: squareWidth, height: squareWidth, backgroundImage: `url(/assets/pieces/classic/${p}.svg)`, backgroundSize: '100%', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }} />
      );
    });
    return custom;
  }, []);

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
            <h1 className="setup-title">Custom Game</h1>
            <p className="setup-subtitle">Design your board and set your sandbox rules.</p>

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
              <span className="setup-time-label">{customPosition ? 'Edit Custom Board' : 'Custom Design Board'}</span>
            </button>
            {customPosition && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '12px', fontSize: '14px', color: '#34D399' }}>
                ✓ Custom Board Set 
                <button onClick={() => setCustomPosition(null)} style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', display: 'flex', padding: '4px' }} title="Remove Custom Board">
                  <X size={14} />
                </button>
              </div>
            )}
            
            {/* Rule Selector */}
            <div className="setup-input-group" style={{ marginTop: '16px' }}>
              <label className="setup-input-label">Win Condition</label>
              <select 
                className="setup-input" 
                value={winCondition} 
                onChange={(e) => setWinCondition(e.target.value as any)}
                style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="elimination">Elimination (Capture All)</option>
                <option value="sandbox">Sandbox (No Auto-Win)</option>
              </select>
            </div>
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
        disabled={!customPosition}
        style={{ opacity: !customPosition ? 0.5 : 1, cursor: !customPosition ? 'not-allowed' : 'pointer' }}
      >
        <Play fill="currentColor" size={24} />
        {!customPosition ? 'Design Board to Start' : 'Start Sandbox Game'}
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
            <div style={{ maxWidth: '650px', width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Sandbox Designer</h2>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button 
                    onClick={() => setDesignerPosition({})}
                    style={{ padding: '6px 12px', background: 'rgba(248,113,113,0.1)', color: '#F87171', borderRadius: '6px', border: '1px solid rgba(248,113,113,0.2)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                  >
                    Clear Board
                  </button>
                  <button 
                    onClick={() => setDesignerPosition({
                      a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR',
                      a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
                      a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR',
                      a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
                    })}
                    style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', fontWeight: 600, fontSize: '13px' }}
                  >
                    Standard Setup
                  </button>
                  <button onClick={() => setShowDesigner(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', marginLeft: '4px' }}><X size={24} /></button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', width: '100%' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '16px' }}>
                  <Chessboard
                    options={{
                      position: designerFen,
                      onPieceDrop: onDesignerPieceDrop,
                      onSquareClick: onSquareClick,
                      allowDragOffBoard: true,
                      boardOrientation: "white",
                      darkSquareStyle: { backgroundColor: '#475569' },
                      lightSquareStyle: { backgroundColor: '#cbd5e1' },
                      pieces: customPieces
                    }}
                  />
                </div>

                {/* Palette Sidebar */}
                <div style={{ width: '80px', display: 'flex', flexDirection: 'column', gap: '4px', background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                  <div style={{ fontSize: '11px', textAlign: 'center', color: '#94A3B8', fontWeight: 'bold', marginBottom: '8px' }}>PALETTE</div>
                  {['wK', 'wQ', 'wR', 'wB', 'wN', 'wP', 'bK', 'bQ', 'bR', 'bB', 'bN', 'bP'].map(p => (
                    <button
                      key={p}
                      onClick={() => setSelectedPalettePiece(selectedPalettePiece === p ? null : p)}
                      style={{
                        width: '100%',
                        aspectRatio: '1/1',
                        background: selectedPalettePiece === p ? 'rgba(59,130,246,0.3)' : 'transparent',
                        border: selectedPalettePiece === p ? '2px solid #3B82F6' : '2px solid transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '4px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <img src={`/assets/pieces/classic/${p}.svg`} style={{ width: '100%', height: '100%' }} alt={p} />
                    </button>
                  ))}
                  <button
                      onClick={() => setSelectedPalettePiece(selectedPalettePiece === 'trash' ? null : 'trash')}
                      style={{
                        marginTop: '8px',
                        width: '100%',
                        aspectRatio: '1/1',
                        background: selectedPalettePiece === 'trash' ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.1)',
                        border: selectedPalettePiece === 'trash' ? '2px solid #EF4444' : '2px solid transparent',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#EF4444',
                        transition: 'all 0.2s'
                      }}
                      title="Erase Mode"
                    >
                      <X size={24} />
                    </button>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '16px', textAlign: 'center' }}>
                Select a piece from the palette and click a square to place it. Drag pieces to rearrange or off the board to remove.
              </p>

              <button 
                onClick={handleSaveDesign}
                disabled={isBoardEmpty}
                style={{ 
                  width: '100%', 
                  padding: '16px', 
                  background: isBoardEmpty ? 'rgba(255,255,255,0.1)' : '#3B82F6', 
                  color: isBoardEmpty ? 'rgba(255,255,255,0.3)' : 'white', 
                  borderRadius: '12px', 
                  border: 'none', 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  cursor: isBoardEmpty ? 'not-allowed' : 'pointer' 
                }}
              >
                {isBoardEmpty ? 'Add pieces to save' : 'Save & Use Custom Board'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
