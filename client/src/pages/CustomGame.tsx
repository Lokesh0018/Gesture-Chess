import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CustomBoard } from '../components/CustomBoard';
import { ChevronLeft, Flag, Handshake, Info } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { FlexibleChessEngine } from '../utils/FlexibleChessEngine';

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
    startingSide,
  } = location.state || {
    whiteTime: 600, blackTime: 600, increment: 5,
    whiteName: 'White', blackName: 'Black',
    customPosition: { a1: 'wR', a8: 'bR' },
    startingSide: 'w',
  };

  const [position, setPosition] = useState<Record<string, string>>(initialPosition || {});
  const [turn, setTurn] = useState<'w' | 'b'>(startingSide || 'w');
  
  const [whiteTime, setWhiteTime] = useState(initialWhiteTime);
  const [blackTime, setBlackTime] = useState(initialBlackTime);
  const [isGameOver, setIsGameOver] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [resultReason, setResultReason] = useState<string | null>(null);
  
  const [enPassantTarget, setEnPassantTarget] = useState<string | null>(null);
  const [legalMoves, setLegalMoves] = useState<string[]>([]);
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ type: 'resign' | 'draw' | null, title: string, message: string } | null>(null);

  // Time management
  useEffect(() => {
    if (isGameOver) return;

    const timer = setInterval(() => {
      if (turn === 'w') {
        setWhiteTime((prev: number) => {
          if (prev <= 1) {
            setIsGameOver(true);
            setResult('Black wins');
            setResultReason('White lost on time.');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime((prev: number) => {
          if (prev <= 1) {
            setIsGameOver(true);
            setResult('White wins');
            setResultReason('Black lost on time.');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [turn, isGameOver]);

  const onPieceDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
    if (isGameOver || !targetSquare) return false;
    
    const engine = new FlexibleChessEngine(position, enPassantTarget);
    const pieceColor = piece[0];
    
    // Validate turn
    if (pieceColor !== turn) return false;
    
    const validMoves = engine.getLegalMoves(sourceSquare);
    if (!validMoves.includes(targetSquare)) {
      return false; // Illegal move
    }
    
    const newPos = { ...position };
    delete newPos[sourceSquare];
    
    // Handle En Passant Capture
    if (piece[1] === 'P' && targetSquare === enPassantTarget) {
       const captureRank = turn === 'w' ? parseInt(targetSquare[1]) - 1 : parseInt(targetSquare[1]) + 1;
       delete newPos[`${targetSquare[0]}${captureRank}`];
    }
    
    // Handle Auto-Promotion to Queen for now (MVP)
    let finalPiece = piece;
    if (piece[1] === 'P' && (targetSquare[1] === '8' || targetSquare[1] === '1')) {
      finalPiece = `${turn}Q`;
    }
    
    newPos[targetSquare] = finalPiece;
    
    // Handle En Passant Target setting
    if (piece[1] === 'P' && Math.abs(parseInt(sourceSquare[1]) - parseInt(targetSquare[1])) === 2) {
      const epRank = turn === 'w' ? parseInt(sourceSquare[1]) + 1 : parseInt(sourceSquare[1]) - 1;
      setEnPassantTarget(`${sourceSquare[0]}${epRank}`);
    } else {
      setEnPassantTarget(null);
    }
    
    setPosition(newPos);
    setLegalMoves([]);
    setSelectedSquare(null);
    
    // Check game state AFTER move
    const nextTurn = turn === 'w' ? 'b' : 'w';
    const nextEngine = new FlexibleChessEngine(newPos, enPassantTarget);
    const state = nextEngine.getGameState(nextTurn);
    
    if (state.status !== 'active') {
       setIsGameOver(true);
       if (state.status === 'elimination') {
         setResult(state.winner === 'w' ? 'White wins' : 'Black wins');
         setResultReason(`All ${state.winner === 'w' ? 'Black' : 'White'} pieces were captured.`);
       } else if (state.status === 'checkmate') {
         setResult(state.winner === 'w' ? 'White wins' : 'Black wins');
         setResultReason('By Checkmate.');
       } else if (state.status === 'stalemate') {
         setResult('Draw');
         setResultReason('Stalemate.');
       } else if (state.status === 'no_legal_moves') {
         setResult('Draw');
         setResultReason('No legal moves available.');
       }
       return true;
    }
    
    // Apply increment and switch turn
    if (turn === 'w') {
      setWhiteTime((prev: number) => prev + increment);
      setTurn('b');
    } else {
      setBlackTime((prev: number) => prev + increment);
      setTurn('w');
    }

    return true;
  };

  const onSquareClick = (square: string) => {
    if (isGameOver) return;
    const piece = position[square];
    
    // If we click a valid target square for an already selected piece, attempt to move
    if (selectedSquare && legalMoves.includes(square)) {
       const pieceToMove = position[selectedSquare];
       if (onPieceDrop(selectedSquare, square, pieceToMove)) {
         return;
       }
    }

    // Select a piece to see its legal moves
    if (piece && piece[0] === turn) {
      const engine = new FlexibleChessEngine(position, enPassantTarget);
      setLegalMoves(engine.getLegalMoves(square));
      setSelectedSquare(square);
    } else {
      setLegalMoves([]);
      setSelectedSquare(null);
    }
  };

  const handleResign = () => {
    setConfirmModal({ type: 'resign', title: 'Confirm Resignation', message: `Are you sure you want to resign the game?` });
  };

  const handleDraw = () => {
    setConfirmModal({ type: 'draw', title: 'Draw Offer', message: `Opponent, do you accept the draw offer?` });
  };

  const processConfirm = (accepted: boolean) => {
    if (!confirmModal) return;
    if (accepted) {
      if (confirmModal.type === 'resign') {
        setIsGameOver(true);
        setResult(turn === 'w' ? 'Black wins' : 'White wins');
        setResultReason('By Resignation.');
      } else if (confirmModal.type === 'draw') {
        setIsGameOver(true);
        setResult('Draw');
        setResultReason('By Agreement.');
      }
    }
    setConfirmModal(null);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const customSquareStyles: Record<string, any> = {};
  legalMoves.forEach(sq => {
    customSquareStyles[sq] = {
      background: 'radial-gradient(circle, rgba(59, 130, 246, 0.4) 25%, transparent 30%)',
      borderRadius: '50%'
    };
  });
  if (selectedSquare) {
    customSquareStyles[selectedSquare] = { backgroundColor: 'rgba(59, 130, 246, 0.5)' };
  }

  return (
    <div className="game-container" style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '20px', background: 'radial-gradient(circle at 50% 0%, #1e293b 0%, #0f172a 60%, #020617 100%)' }}>
      <Toaster position="top-center" />
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button onClick={() => navigate('/custom-setup')} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '14px' }}>
          <ChevronLeft size={20} />
          Back to Setup
        </button>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#60A5FA', textTransform: 'uppercase', letterSpacing: '1px' }}>
          Flexible Battle
        </div>
      </div>

      <div style={{ display: 'flex', gap: '40px', flex: 1, justifyContent: 'center' }}>
        {/* Board Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '65vh', width: '100%' }}>
          {/* Black Player */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: turn === 'b' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0,0,0,0.3)', borderRadius: '12px', border: turn === 'b' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent', transition: 'all 0.3s' }}>
            <span style={{ fontWeight: 'bold', color: 'white' }}>{blackName}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '20px', color: turn === 'b' ? '#FCD34D' : '#94A3B8' }}>{formatTime(blackTime)}</span>
          </div>

          {/* Board */}
          <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
            <CustomBoard
              position={position}
              onPieceDrop={onPieceDrop as any}
              onSquareClick={onSquareClick}
              orientation="white"
              customDarkSquareStyle={{ backgroundColor: '#475569' }}
              customLightSquareStyle={{ backgroundColor: '#cbd5e1' }}
              customSquareStyles={customSquareStyles}
            />
          </div>

          {/* White Player */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 16px', background: turn === 'w' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0,0,0,0.3)', borderRadius: '12px', border: turn === 'w' ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid transparent', transition: 'all 0.3s' }}>
            <span style={{ fontWeight: 'bold', color: 'white' }}>{whiteName}</span>
            <span style={{ fontFamily: 'monospace', fontSize: '20px', color: turn === 'w' ? '#FCD34D' : '#94A3B8' }}>{formatTime(whiteTime)}</span>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
           <div style={{ padding: '20px', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(10px)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
             <h3 style={{ color: '#60A5FA', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase' }}><Info size={16} style={{ display: 'inline', marginRight: '8px', verticalAlign: 'text-bottom' }}/> Sandbox Rules</h3>
             <ul style={{ fontSize: '13px', color: '#cbd5e1', paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '10px', margin: 0 }}>
                <li>Standard piece movement enforced.</li>
                <li><strong>No King?</strong> Check & Checkmate disabled.</li>
                <li><strong>One King?</strong> Standard Check & Checkmate applied.</li>
                <li><strong>Capture All:</strong> Eliminate all enemy pieces to win instantly.</li>
             </ul>
           </div>

           <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
             <button 
               onClick={handleDraw}
               style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.05)', color: '#fff', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
             >
               <Handshake size={18} /> Offer Draw
             </button>
             <button 
               onClick={handleResign}
               style={{ padding: '14px', background: 'rgba(239,68,68,0.15)', color: '#FCA5A5', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', cursor: 'pointer', transition: 'all 0.2s' }}
             >
               <Flag size={18} /> Resign
             </button>
           </div>
        </div>
      </div>

      {/* Game Over Modal */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: '#1E293B', padding: '40px', borderRadius: '24px', textAlign: 'center', minWidth: '400px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              <h2 style={{ fontSize: '32px', color: '#fff', marginBottom: '8px' }}>{result || 'GAME OVER'}</h2>
              <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '32px' }}>{resultReason}</p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button onClick={() => window.location.reload()} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Rematch</button>
                <button onClick={() => navigate('/custom-setup')} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Edit Position</button>
                <button onClick={() => navigate('/')} style={{ padding: '12px 24px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Home</button>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        {confirmModal && !isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: '#1E293B', padding: '40px', borderRadius: '24px', textAlign: 'center', minWidth: '400px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px' }}>{confirmModal.title}</h2>
              <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '32px' }}>{confirmModal.message}</p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                <button onClick={() => processConfirm(false)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button onClick={() => processConfirm(true)} style={{ padding: '12px 24px', background: confirmModal.type === 'resign' ? '#EF4444' : '#3B82F6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Confirm</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
