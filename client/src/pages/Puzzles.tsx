import React, { useState, useEffect, useMemo } from 'react';
import { Chess, type Square, type Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useSettingsStore } from '../store/useSettingsStore';
import { CheckCircle2, XCircle, ArrowLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { PUZZLES } from '../data/puzzles';
import confetti from 'canvas-confetti';
import { playMoveSound } from '../utils/audio';

export const Puzzles = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  // Find puzzle by id from URL, default to first puzzle if not found or no id
  const initialIndex = id ? PUZZLES.findIndex(p => p.id === id) : 0;
  const validInitialIndex = initialIndex >= 0 ? initialIndex : 0;

  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(validInitialIndex);
  const [game, setGame] = useState(new Chess());
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'incorrect' | 'solved'>('playing');
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedSquare, setSelectedSquare] = useState<string>('');
  
  const currentPuzzle = PUZZLES[currentPuzzleIndex];
  const { pieceTheme, boardTheme } = useSettingsStore();
  
  const playerColor = currentPuzzle.fen.split(' ')[1] === 'w' ? 'w' : 'b';

  // Initialize Puzzle
  useEffect(() => {
    // If URL id changes, update state
    if (id) {
      const idx = PUZZLES.findIndex(p => p.id === id);
      if (idx >= 0 && idx !== currentPuzzleIndex) {
        setCurrentPuzzleIndex(idx);
      }
    }
  }, [id]);

  useEffect(() => {
    setIsLoading(true);
    const newGame = new Chess(currentPuzzleIndex >= 0 ? PUZZLES[currentPuzzleIndex].fen : PUZZLES[0].fen);
    
    // Simulate network delay for skeleton loader
    const timer = setTimeout(() => {
      setGame(newGame);
      setMoveIndex(0);
      setStatus('playing');
      setSelectedSquare('');
      setIsLoading(false);
    }, 600);
    
    return () => clearTimeout(timer);
  }, [currentPuzzleIndex]);

  const customPieces = useMemo(() => {
    const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
    const custom: Record<string, any> = {};
    pieces.forEach(p => {
      custom[p] = ({ squareWidth }: { squareWidth: number }) => (
        <div style={{ width: squareWidth, height: squareWidth, backgroundImage: `url(/assets/pieces/${pieceTheme}/${p}.svg)`, backgroundSize: '100%', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }} />
      );
    });
    return custom;
  }, [pieceTheme]);

  const optionSquares = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    const history = game.history({ verbose: true });
    if (history.length > 0) {
      const last = history[history.length - 1];
      styles[last.from] = { backgroundColor: 'rgba(234, 179, 8, 0.4)' };
      styles[last.to] = { 
        backgroundColor: 'rgba(234, 179, 8, 0.6)',
        boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.5)' // Highlight trail
      };
    }
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: 'rgba(59, 130, 246, 0.5)' };
      const moves = game.moves({ square: selectedSquare as Square, verbose: true });
      moves.forEach(m => {
        styles[m.to] = {
          background: game.get(m.to as Square)
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
          borderRadius: '50%'
        };
      });
    }
    
    // Highlight check
    if (game.isCheck()) {
      const board = game.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type === 'k' && p.color === game.turn()) {
            styles[p.square] = { background: 'radial-gradient(circle, rgba(239, 68, 68, 0.7) 35%, transparent 70%)' };
          }
        }
      }
    }
    return styles;
  }, [game, selectedSquare]);

  const attemptMove = (sourceSquare: string, targetSquare: string, promotion: string = 'q'): boolean => {
    if (status === 'solved' || status === 'incorrect') return false;

    // Check if move is legal
    let moveObj: Move | null = null;
    try {
      // Must clone to avoid mutating state if incorrect
      const clone = new Chess(game.fen());
      moveObj = clone.move({ from: sourceSquare, to: targetSquare, promotion });
    } catch {
      return false; // Illegal move
    }

    if (!moveObj) return false;

    // Check if it's the CORRECT puzzle move
    const expectedMove = currentPuzzle.moves[moveIndex];
    const attemptedUci = moveObj.from + moveObj.to + (moveObj.promotion || '');

    if (attemptedUci === expectedMove) {
      // Correct!
      game.move(moveObj);
      setGame(new Chess(game.fen()));
      setSelectedSquare('');
      
      if (navigator.vibrate) navigator.vibrate([50]);
      
      const nextIndex = moveIndex + 1;
      setMoveIndex(nextIndex);

      if (nextIndex >= currentPuzzle.moves.length) {
        setStatus('solved');
        playMoveSound('success');
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#3B82F6', '#10B981', '#8A2BE2', '#FFFFFF']
        });
      } else {
        setStatus('correct');
        playMoveSound(moveObj.captured ? 'capture' : 'move');
        
        // Make opponent's automatic response
        setTimeout(() => {
          const opponentMoveUci = currentPuzzle.moves[nextIndex];
          game.move({
            from: opponentMoveUci.substring(0, 2),
            to: opponentMoveUci.substring(2, 4),
            promotion: opponentMoveUci.length > 4 ? opponentMoveUci[4] : 'q'
          });
          setGame(new Chess(game.fen()));
          setMoveIndex(nextIndex + 1);
          setStatus('playing');
          playMoveSound('move');
          if (navigator.vibrate) navigator.vibrate([30]);
        }, 600); // slight delay for realism
      }
      return true;
    } else {
      // Incorrect move!
      setStatus('incorrect');
      playMoveSound('invalid');
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      
      setTimeout(() => {
        setStatus('playing');
      }, 1500);
      return false; // Snap back
    }
  };

  function onPieceDrop(args: any) {
    const { sourceSquare, targetSquare, piece } = args;
    return attemptMove(sourceSquare, targetSquare, piece[1].toLowerCase());
  }

  function onSquareClick(args: any) {
    const { square } = args;
    if (status === 'solved' || status === 'incorrect') return;
    
    if (!selectedSquare) {
      const p = game.get(square);
      if (p && p.color === playerColor) setSelectedSquare(square);
      return;
    }

    const success = attemptMove(selectedSquare, square, 'q');
    if (success) {
      setSelectedSquare('');
    } else {
      const p = game.get(square);
      if (p && p.color === playerColor) setSelectedSquare(square);
      else setSelectedSquare('');
    }
  }

  const nextPuzzle = () => {
    const nextIdx = (currentPuzzleIndex + 1) % PUZZLES.length;
    navigate(`/puzzles/${PUZZLES[nextIdx].id}`);
  };

  return (
    <div className="game-container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-[var(--bg-color)]">
      
      <div className="w-full max-w-[600px] flex flex-col gap-4">
        
        {/* Puzzle Header */}
        <div className="player-card w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg transition-all relative">
          <button 
            onClick={() => navigate('/puzzle-setup')}
            className="absolute left-4 top-4 text-[var(--text-secondary)] hover:text-white transition-colors flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            <span className="hidden sm:inline">Back to Map</span>
          </button>
          
          <h1 className="text-3xl font-bold text-white mb-2 mt-4 sm:mt-0">Puzzle #{currentPuzzleIndex + 1}</h1>
          <div className="flex gap-4 text-[var(--text-secondary)] text-sm">
            <span className="bg-white/10 px-3 py-1 rounded-full">Rating: {currentPuzzle.rating}</span>
            <span className="bg-white/10 px-3 py-1 rounded-full">Theme: {currentPuzzle.theme}</span>
          </div>
          
          <div className="mt-4 flex items-center justify-center w-full min-h-[40px]">
            {status === 'playing' && (
              <span className="text-white font-bold animate-pulse">Find the best move for {playerColor === 'w' ? 'White' : 'Black'}!</span>
            )}
            {status === 'correct' && (
              <span className="text-green-400 font-bold flex items-center gap-2"><CheckCircle2 /> Correct! Opponent is moving...</span>
            )}
            {status === 'incorrect' && (
              <span className="text-red-400 font-bold flex items-center gap-2"><XCircle /> Incorrect! Try again.</span>
            )}
            {status === 'solved' && (
              <span className="text-blue-400 font-bold flex items-center gap-2 text-xl"><CheckCircle2 size={24} /> Puzzle Solved!</span>
            )}
          </div>
        </div>

        {/* Board or Skeleton */}
        <div className={`w-full aspect-square relative shadow-2xl rounded-sm overflow-hidden transition-all ${status === 'incorrect' ? 'ring-4 ring-red-500 animate-shake' : ''} ${status === 'solved' ? 'ring-4 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : ''}`}>
          {isLoading ? (
            <div className="w-full h-full bg-slate-800/50 animate-pulse grid grid-cols-8 grid-rows-8">
              {Array.from({ length: 64 }).map((_, i) => {
                const isDark = (Math.floor(i / 8) + (i % 8)) % 2 !== 0;
                return (
                  <div key={i} className={`${isDark ? 'bg-white/5' : 'bg-white/10'}`}></div>
                );
              })}
              <div className="absolute inset-0 flex items-center justify-center backdrop-blur-[2px]">
                <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
              </div>
            </div>
          ) : (
            <Chessboard
              options={{
                id: "PuzzleBoard",
                position: game.fen(),
                onPieceDrop: onPieceDrop,
                onSquareClick: onSquareClick,
                boardOrientation: playerColor === 'w' ? 'white' : 'black',
                animationDurationInMs: 300,
                showNotation: true,
                darkSquareStyle: { backgroundColor: boardTheme === 'classic' ? '#779556' : '#2C3E50' },
                lightSquareStyle: { backgroundColor: boardTheme === 'classic' ? '#EBECD0' : '#ECF0F1' },
                squareStyles: optionSquares,
                pieces: customPieces,
                allowDragging: status === 'playing'
              }}
            />
          )}
        </div>

        {/* Footer Actions */}
        {status === 'solved' && (
          <button 
            onClick={nextPuzzle}
            className="w-full mt-4 py-4 bg-[var(--color-primary)] hover:bg-blue-600 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all"
          >
            Next Puzzle
          </button>
        )}
      </div>
    </div>
  );
};
