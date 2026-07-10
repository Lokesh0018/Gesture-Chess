import React, { useState, useEffect, useMemo } from 'react';
import { Chess, type Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'framer-motion';
import { stockfishService } from '../services/StockfishService';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { CheckCircle2, RotateCcw } from 'lucide-react';

import { playMoveSound } from '../utils/audio';

const BOT_LEVELS = [
  { level: 1, name: 'Novice Nick', elo: 600, depth: 1, skill: 0, avatar: '👶' },
  { level: 2, name: 'Beginner Bob', elo: 800, depth: 2, skill: 3, avatar: '🤓' },
  { level: 3, name: 'Intermediate Iris', elo: 1200, depth: 4, skill: 6, avatar: '🤔' },
  { level: 4, name: 'Advanced Alex', elo: 1600, depth: 6, skill: 10, avatar: '😎' },
  { level: 5, name: 'Expert Emma', elo: 2000, depth: 10, skill: 14, avatar: '🧠' },
  { level: 6, name: 'Master Max', elo: 2400, depth: 15, skill: 17, avatar: '👑' },
  { level: 7, name: 'Grandmaster Garry', elo: 2800, depth: 18, skill: 20, avatar: '🧙‍♂️' },
  { level: 8, name: 'Stockfish Max', elo: 3200, depth: 22, skill: 20, avatar: '🤖' }
];

export const PlayBot = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const initialState = location.state as { selectedLevel: any, playerColor: 'w' | 'b' };

  const [game, setGame] = useState(new Chess());
  const [selectedLevel] = useState(initialState?.selectedLevel || BOT_LEVELS[2]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [hintMove, setHintMove] = useState<string | null>(null);
  const [isGettingHint, setIsGettingHint] = useState(false);
  const [playerColor] = useState<'w' | 'b'>(initialState?.playerColor || 'w');
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [boardShake, setBoardShake] = useState(false);

  const [selectedSquare, setSelectedSquare] = useState<string>('');

  useEffect(() => {
    if (!initialState) {
      navigate('/bot-setup');
    }
  }, [initialState, navigate]);

  const { pieceTheme, boardTheme, soundVolume } = useSettingsStore();
  const isMuted = soundVolume === 0;
  
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
    if (game.isCheck()) {
      const kingColor = game.turn();
      const board = game.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = board[r][c];
          if (p && p.type === 'k' && p.color === kingColor) {
            styles[p.square] = { background: 'radial-gradient(circle, rgba(239, 68, 68, 0.7) 35%, transparent 70%)' };
          }
        }
      }
    }
    return styles;
  }, [game, selectedSquare]);

  useEffect(() => {
    if (game.isGameOver()) {
      if (game.isCheckmate()) setGameResult(game.turn() === 'w' ? 'Black wins by Checkmate' : 'White wins by Checkmate');
      else if (game.isDraw()) setGameResult('Game drawn');
      else if (game.isStalemate()) setGameResult('Stalemate');
      else setGameResult('Game Over');

      // Save match
      const token = useAuthStore.getState().token;
      if (token && game.history().length > 0) {
        let resultStr = 'draw';
        if (game.isCheckmate()) {
          const winner = game.turn() === 'w' ? 'b' : 'w';
          resultStr = winner === playerColor ? 'win' : 'loss';
        }
        fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user/match`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            pgn: game.pgn(),
            fen: game.fen(),
            result: resultStr,
            opponentType: 'bot'
          })
        }).catch(err => console.error('Failed to save game:', err));
      }
    }
  }, [game.fen()]);

  // Bot move logic
  useEffect(() => {
    if (game.turn() !== playerColor && !game.isGameOver()) {
      setIsBotThinking(true);
      const makeBotMove = async () => {
        const fen = game.fen();
        const bestMove = await stockfishService.getBestMove(fen, selectedLevel.depth, selectedLevel.skill);
        
        // Artificial delay for lower levels so it feels human
        const delay = Math.max(0, 1000 - (selectedLevel.level * 100));
        await new Promise(r => setTimeout(r, delay));

        if (bestMove && game.fen() === fen) { // ensure state hasn't changed
          try {
            const gameCopy = new Chess(game.fen());
            const move = gameCopy.move({
              from: bestMove.substring(0, 2) as Square,
              to: bestMove.substring(2, 4) as Square,
              promotion: bestMove.length > 4 ? bestMove[4] : 'q'
            });
            setGame(gameCopy);
            
            if (!isMuted) {
              if (gameCopy.isCheck()) playMoveSound('check');
              else if (move.captured) playMoveSound('capture');
              else playMoveSound('move');
            }
          } catch (e) {
            console.error('Bot attempted invalid move:', bestMove);
          }
        }
        setIsBotThinking(false);
      };
      makeBotMove();
    }
  }, [game.fen(), playerColor, selectedLevel]);

  function onPieceDrop(args: any) {
    const { sourceSquare, targetSquare, piece } = args;
    if (game.turn() !== playerColor || isBotThinking) return false;
    
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? 'q'
      });
      
      if (move) {
        setGame(gameCopy);
        setSelectedSquare('');
        setHintMove(null);
        
        if (!isMuted) {
          if (gameCopy.isCheck()) playMoveSound('check');
          else if (move.captured) playMoveSound('capture');
          else playMoveSound('move');
        }
        
        return true;
      }
    } catch {
      if (!isMuted) playMoveSound('invalid');
      setBoardShake(true);
      setTimeout(() => setBoardShake(false), 300);
      return false;
    }
    return false;
  }

  function onSquareClick(args: any) {
    const { square } = args;
    if (game.turn() !== playerColor || isBotThinking) return;
    
    if (!selectedSquare) {
      const p = game.get(square);
      if (p && p.color === playerColor) setSelectedSquare(square);
      return;
    }

    try {
      const move = game.move({
        from: selectedSquare as Square,
        to: square,
        promotion: 'q'
      });
      
      if (move) {
        setGame(new Chess(game.fen()));
        setSelectedSquare('');
        setHintMove(null);
        
        if (!isMuted) {
          if (game.isCheck()) playMoveSound('check');
          else if (move.captured) playMoveSound('capture');
          else playMoveSound('move');
        }
      } else {
        const p = game.get(square);
        if (p && p.color === playerColor) setSelectedSquare(square);
        else {
          setSelectedSquare('');
          if (!isMuted) playMoveSound('invalid');
          setBoardShake(true);
          setTimeout(() => setBoardShake(false), 300);
        }
      }
    } catch {
      const p = game.get(square);
      if (p && p.color === playerColor) setSelectedSquare(square);
      else {
        setSelectedSquare('');
        if (!isMuted) playMoveSound('invalid');
        setBoardShake(true);
        setTimeout(() => setBoardShake(false), 300);
      }
    }
  }


  const getHint = async () => {
    if (isGettingHint || game.turn() !== playerColor || isBotThinking) return;
    setIsGettingHint(true);
    const bestMove = await stockfishService.getBestMove(game.fen(), 12, 20);
    setHintMove(bestMove);
    setIsGettingHint(false);
    // Auto-hide hint after 3 seconds
    setTimeout(() => setHintMove(null), 3000);
  };

  return (
    <div className="game-container flex flex-col md:flex-row h-[calc(100vh-4rem)] p-4 md:p-8 gap-8 overflow-hidden bg-[var(--bg-color)]">
      
      {/* Center Board Area */}
      <div className="flex-1 flex flex-col items-center justify-center min-w-[300px]">
        {/* Opponent Card (Bot) */}
        <div className={`player-card w-full max-w-[600px] mb-4 bg-white/5 backdrop-blur-md border ${game.turn() !== playerColor && !gameResult ? 'border-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)]' : 'border-white/10'} rounded-2xl p-4 flex items-center gap-4 transition-all duration-300`}>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-2xl shadow-inner">
            {selectedLevel.avatar}
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg">{selectedLevel.name}</span>
            <span className="text-[var(--text-secondary)] text-sm flex items-center gap-2">
              Bot • {selectedLevel.elo} ELO
              {isBotThinking && <span className="text-[var(--color-primary)] animate-pulse text-xs ml-2">Thinking...</span>}
            </span>
          </div>
        </div>

        {/* Board */}
        <div className={`w-full max-w-[600px] aspect-square relative shadow-2xl rounded-sm overflow-hidden ${boardShake ? 'shake-error' : ''} ${game.isCheck() ? 'check-alert' : ''}`}>
          <Chessboard
            options={{
              id: "BotBoard",
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
              allowDragging: game.turn() === playerColor && !isBotThinking && !gameResult
            }}
            {...{ customArrows: hintMove ? [
              [
                hintMove.substring(0, 2) as import('chess.js').Square,
                hintMove.substring(2, 4) as import('chess.js').Square,
                'rgba(59, 130, 246, 0.6)'
              ]
            ] : undefined } as any}
          />
        </div>

        {/* Player Card */}
        <div className={`player-card w-full max-w-[600px] mt-4 bg-white/5 backdrop-blur-md border ${game.turn() === playerColor && !gameResult ? 'border-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)]' : 'border-white/10'} rounded-2xl p-4 flex items-center gap-4 transition-all duration-300`}>
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-2xl shadow-lg">
            👤
          </div>
          <div className="flex flex-col flex-1">
            <span className="text-white font-bold text-lg">You</span>
            <span className="text-[var(--text-secondary)] text-sm">Human</span>
          </div>
          {!gameResult && game.turn() === playerColor && !isBotThinking && (
            <button 
              onClick={getHint}
              disabled={isGettingHint}
              className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-400 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
            >
              {isGettingHint ? 'Thinking...' : '💡 Hint'}
            </button>
          )}
        </div>
      </div>



      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameResult && (
          <motion.div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-[#1E293B] border border-white/10 p-10 rounded-3xl shadow-2xl text-center flex flex-col items-center" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}>
              <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">{gameResult}</h2>
              <p className="text-xl text-[var(--text-secondary)] mb-8">Against {selectedLevel.name}</p>
              
              <div className="flex flex-col gap-4 w-full px-8">
                <button onClick={() => navigate('/bot-setup')} className="w-full py-4 bg-[var(--color-primary)] hover:bg-blue-600 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] flex justify-center items-center gap-2 transition-all">
                  <RotateCcw size={20} /> Play Again
                </button>
                <div className="flex gap-4">
                  <button onClick={() => navigate('/analysis', { state: { pgn: game.pgn() } })} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all">
                    Analyze
                  </button>
                  <button onClick={() => { setGameResult(null); }} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all">
                    Board
                  </button>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => { navigator.clipboard.writeText(game.pgn()); toast.success('PGN copied!'); }} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm font-bold transition-all">
                    Copy PGN
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(game.fen()); toast.success('FEN copied!'); }} className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-white/70 rounded-xl text-sm font-bold transition-all">
                    Copy FEN
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
