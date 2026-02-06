import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Flag, Info } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { getCustomPieces } from '../utils/pieces';

// Helper: convert a position dictionary to a FEN string
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

export function CustomGame() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const { 
    whiteTime: initialWhiteTime, 
    blackTime: initialBlackTime, 
    increment,
    whiteName,
    blackName,
    customPosition: initialPosition,
    winCondition
  } = location.state || {
    whiteTime: 600, blackTime: 600, increment: 5,
    whiteName: 'White', blackName: 'Black',
    customPosition: { a1: 'wR', e1: 'wK', a8: 'bR', e8: 'bK' },
    winCondition: 'sandbox'
  };

  const [position, setPosition] = useState<Record<string, string>>(initialPosition || {});
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  
  const [whiteTime, setWhiteTime] = useState(initialWhiteTime);
  const [blackTime, setBlackTime] = useState(initialBlackTime);
  const [isGameOver, setIsGameOver] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Time management
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prev: number) => {
          if (prev <= 1) {
            setIsGameOver(true);
            setResult('BLACK WINS (TIMEOUT)');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev: number) => {
          if (prev <= 1) {
            setIsGameOver(true);
            setResult('WHITE WINS (TIMEOUT)');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, isGameOver]);

  const onPieceDrop = (args: any) => {
    const { sourceSquare, targetSquare, piece } = args;
    if (isGameOver || !targetSquare) return false;
    
    const newPos = { ...position };
    delete newPos[sourceSquare];
    newPos[targetSquare] = piece;
    
    setPosition(newPos);
    
    // Apply increment and switch turn
    if (turn === 'w') {
      setWhiteTime((prev: number) => prev + increment);
      setTurn('b');
    } else {
      setBlackTime((prev: number) => prev + increment);
      setTurn('w');
    }

    // Check Elimination Rule
    if (winCondition === 'elimination') {
      let whiteCount = 0;
      let blackCount = 0;
      Object.values(newPos).forEach(p => {
        if (p.startsWith('w')) whiteCount++;
        if (p.startsWith('b')) blackCount++;
      });
      if (whiteCount === 0) {
        setIsGameOver(true);
        setResult('BLACK WINS (ELIMINATION)');
      } else if (blackCount === 0) {
        setIsGameOver(true);
        setResult('WHITE WINS (ELIMINATION)');
      }
    }

    return true;
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="game-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px', background: 'var(--bg-primary)' }}>
      <Toaster position="top-center" />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/custom-setup')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
          <ChevronLeft size={24} />
          Back to Setup
        </button>
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#FCD34D' }}>
          {winCondition === 'elimination' ? 'Elimination Mode' : 'Sandbox Mode'}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '40px', flex: 1, justifyContent: 'center' }}>
        {/* Board Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '70vh', width: '100%' }}>
          {/* Black Player */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <span style={{ fontWeight: 'bold', color: 'white' }}>{blackName}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '20px', color: turn === 'b' ? '#FCD34D' : '#94A3B8' }}>{formatTime(blackTime)}</span>
          </div>

          {/* Board */}
          <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden' }}>
            <Chessboard
              options={{
                position: positionToFen(position),
                onPieceDrop: onPieceDrop,
                boardOrientation: "white",
                darkSquareStyle: { backgroundColor: '#475569' },
                lightSquareStyle: { backgroundColor: '#cbd5e1' },
                animationDurationInMs: 200,
                pieces: getCustomPieces()
              }}
            />
          </div>

          {/* White Player */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px' }}>
            <span style={{ fontWeight: 'bold', color: 'white' }}>{whiteName}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '20px', color: turn === 'w' ? '#FCD34D' : '#94A3B8' }}>{formatTime(whiteTime)}</span>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: '300px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <div style={{ padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px' }}>
             <h3 style={{ color: '#FCD34D', marginBottom: '12px' }}><Info size={18} style={{ display: 'inline', marginRight: '8px' }}/> Sandbox Rules</h3>
             <ul style={{ fontSize: '14px', color: '#cbd5e1', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <li>Pieces can be moved anywhere on the board freely.</li>
                <li>Move validation and checks are disabled.</li>
                {winCondition === 'elimination' && <li><strong>Victory:</strong> Capture all opponent pieces.</li>}
             </ul>
           </div>

           <button 
             onClick={() => setIsGameOver(true)}
             style={{ marginTop: 'auto', padding: '16px', background: 'rgba(239,68,68,0.2)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}
           >
             <Flag size={20} /> End Game
           </button>
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: '#1E293B', padding: '40px', borderRadius: '24px', textAlign: 'center', minWidth: '400px' }}
            >
              <h2 style={{ fontSize: '32px', color: '#FCD34D', marginBottom: '16px' }}>{result || 'GAME OVER'}</h2>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '32px' }}>
                <button onClick={() => navigate('/custom-setup')} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>New Setup</button>
                <button onClick={() => navigate('/')} style={{ padding: '12px 24px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer' }}>Home</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
