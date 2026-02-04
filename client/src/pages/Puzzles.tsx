import React, { useState, useEffect, useMemo } from 'react';
import { Chess, type Square, type Move } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useSettingsStore } from '../store/useSettingsStore';
import { CheckCircle2, XCircle } from 'lucide-react';
import './Game.css';

interface Puzzle {
  id: string;
  fen: string;
  moves: string[]; // sequence of moves e.g., ["g4h5", "g6g5", "h5h6"]
  rating: number;
  theme: string;
}

// A few hardcoded high-quality puzzles for Phase 1
const PUZZLES: Puzzle[] = [
  {
    id: "1",
    fen: "r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQR1K1 w - - 0 8",
    moves: ["c1g5", "h7h6", "g5h4"], // Just an opening sequence example
    rating: 800,
    theme: "Opening"
  },
  {
    id: "2", // Mate in 2
    fen: "r1b1k2r/pp3ppp/2p5/2bpq3/B3n3/5P2/PPP3PP/RNBQ1R1K b kq - 0 11",
    moves: ["e4g3", "h2g3", "e5h5"],
    rating: 1200,
    theme: "Mate in 2"
  },
  {
    id: "3", // Scholar's mate
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 3",
    moves: ["f3f7"],
    rating: 600,
    theme: "Mate in 1"
  }
];

export const Puzzles = () => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [game, setGame] = useState(new Chess());
  const [moveIndex, setMoveIndex] = useState(0);
  const [status, setStatus] = useState<'playing' | 'correct' | 'incorrect' | 'solved'>('playing');
  
  const [selectedSquare, setSelectedSquare] = useState<string>('');
  
  const currentPuzzle = PUZZLES[currentPuzzleIndex];
  const { pieceTheme, boardTheme } = useSettingsStore();
  
  const playerColor = currentPuzzle.fen.split(' ')[1] === 'w' ? 'w' : 'b';

  // Initialize Puzzle
  useEffect(() => {
    const newGame = new Chess(currentPuzzle.fen);
    setGame(newGame);
    setMoveIndex(0);
    setStatus('playing');
    setSelectedSquare('');
  }, [currentPuzzleIndex]);

  const customPieces = useMemo(() => {
    if (pieceTheme === 'classic') return undefined;
    
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
      styles[last.to] = { backgroundColor: 'rgba(234, 179, 8, 0.6)' };
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
      
      const nextIndex = moveIndex + 1;
      setMoveIndex(nextIndex);

      if (nextIndex >= currentPuzzle.moves.length) {
        setStatus('solved');
      } else {
        setStatus('correct');
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
        }, 600); // slight delay for realism
      }
      return true;
    } else {
      // Incorrect move!
      setStatus('incorrect');
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
    setCurrentPuzzleIndex((i) => (i + 1) % PUZZLES.length);
  };

  return (
    <div className="game-container flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-[var(--bg-color)]">
      
      <div className="w-full max-w-[600px] flex flex-col gap-4">
        
        {/* Puzzle Header */}
        <div className="player-card w-full bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg transition-all">
          <h1 className="text-3xl font-bold text-white mb-2">Daily Puzzle #{currentPuzzleIndex + 1}</h1>
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

        {/* Board */}
        <div className={`w-full aspect-square relative shadow-2xl rounded-sm overflow-hidden transition-all ${status === 'incorrect' ? 'ring-4 ring-red-500 animate-shake' : ''} ${status === 'solved' ? 'ring-4 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.5)]' : ''}`}>
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
