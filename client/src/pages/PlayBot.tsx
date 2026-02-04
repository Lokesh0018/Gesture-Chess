import React, { useState, useEffect, useMemo } from 'react';
import { Chess, type Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'framer-motion';
import { stockfishService } from '../services/StockfishService';
import { useSettingsStore } from '../store/useSettingsStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import './Game.css';
import { CheckCircle2, RotateCcw } from 'lucide-react';

const SOUND_URLS = {
  move: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3',
  capture: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3',
  check: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3',
  invalid: 'https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/illegal.mp3'
};

const audioCache: Record<string, HTMLAudioElement> = {};

function playMoveSound(type: 'move' | 'capture' | 'check' | 'invalid'): void {
  try {
    const url = SOUND_URLS[type];
    if (!url) return;
    if (!audioCache[url]) audioCache[url] = new Audio(url);
    const audio = audioCache[url];
    audio.currentTime = 0;
    audio.play().catch(() => { });
  } catch {
    // Ignore audio errors
  }
}

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
  const [game, setGame] = useState(new Chess());
  const [selectedLevel, setSelectedLevel] = useState(BOT_LEVELS[2]);
  const [isBotThinking, setIsBotThinking] = useState(false);
  const [showSetup, setShowSetup] = useState(true);
  const [playerColor, setPlayerColor] = useState<'w' | 'b'>('w');
  const [gameResult, setGameResult] = useState<string | null>(null);

  const [selectedSquare, setSelectedSquare] = useState<string>('');

  const { pieceTheme, boardTheme, soundVolume } = useSettingsStore();
  const isMuted = soundVolume === 0;
  const navigate = useNavigate();
  
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
          const winner = game.turn() === 'w' ? 'black' : 'white';
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
    if (!showSetup && game.turn() !== playerColor && !game.isGameOver()) {
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
  }, [game.fen(), showSetup, playerColor]);

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
        
        if (!isMuted) {
          if (gameCopy.isCheck()) playMoveSound('check');
          else if (move.captured) playMoveSound('capture');
          else playMoveSound('move');
        }
        
        return true;
      }
    } catch {
      if (!isMuted) playMoveSound('invalid');
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
        
        if (!isMuted) {
          if (game.isCheck()) playMoveSound('check');
          else if (move.captured) playMoveSound('capture');
          else playMoveSound('move');
        }
      } else {
        const p = game.get(square);
        if (p && p.color === playerColor) setSelectedSquare(square);
        else setSelectedSquare('');
      }
    } catch {
      const p = game.get(square);
      if (p && p.color === playerColor) setSelectedSquare(square);
      else setSelectedSquare('');
    }
  }

  const startGame = () => {
    setGame(new Chess());
    setGameResult(null);
    setShowSetup(false);
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
        <div className="w-full max-w-[600px] aspect-square relative shadow-2xl rounded-sm overflow-hidden">
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
          />
        </div>

        {/* Player Card */}
        <div className={`player-card w-full max-w-[600px] mt-4 bg-white/5 backdrop-blur-md border ${game.turn() === playerColor && !gameResult ? 'border-[var(--color-primary)] shadow-[0_0_15px_var(--color-primary)]' : 'border-white/10'} rounded-2xl p-4 flex items-center gap-4 transition-all duration-300`}>
          <div className="w-12 h-12 rounded-xl bg-[var(--color-primary)] flex items-center justify-center text-2xl shadow-lg">
            👤
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold text-lg">You</span>
            <span className="text-[var(--text-secondary)] text-sm">Human</span>
          </div>
        </div>
      </div>

      {/* Setup Modal Overlay */}
      <AnimatePresence>
        {showSetup && (
          <motion.div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="bg-[#1E293B] border border-white/10 p-6 md:p-10 rounded-[2rem] shadow-2xl w-[95%] max-w-4xl mx-auto" initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-2 text-center tracking-tight">Play vs Computer</h2>
              <p className="text-[var(--text-secondary)] text-center mb-10 text-lg">Select your opponent's difficulty level.</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-10">
                {BOT_LEVELS.map(bot => (
                  <button
                    key={bot.level}
                    onClick={() => setSelectedLevel(bot)}
                    className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-2xl transition-all duration-200 border-2 ${
                      selectedLevel.level === bot.level 
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10 shadow-[0_0_20px_rgba(59,130,246,0.2)] scale-105' 
                      : 'border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <span className="text-4xl md:text-5xl mb-3">{bot.avatar}</span>
                    <span className="text-white font-bold text-sm md:text-base text-center leading-tight mb-1">{bot.name}</span>
                    <span className="text-xs md:text-sm font-semibold text-[var(--color-primary)]">{bot.elo} ELO</span>
                  </button>
                ))}
              </div>

              <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-10">
                <span className="text-[var(--text-secondary)] font-medium mr-2">I want to play as:</span>
                <div className="flex gap-4 bg-white/5 p-2 rounded-2xl border border-white/10">
                  <button onClick={() => setPlayerColor('w')} className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${playerColor === 'w' ? 'bg-white text-black shadow-lg scale-105' : 'text-[var(--text-secondary)] hover:text-white'}`}>
                    <div className="w-4 h-4 rounded-full bg-white border border-gray-300"></div>
                    White
                  </button>
                  <button onClick={() => setPlayerColor('b')} className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${playerColor === 'b' ? 'bg-[#0F172A] text-white shadow-lg scale-105 border border-white/20' : 'text-[var(--text-secondary)] hover:text-white'}`}>
                    <div className="w-4 h-4 rounded-full bg-black border border-gray-600"></div>
                    Black
                  </button>
                </div>
              </div>

              <button onClick={startGame} className="w-full py-5 bg-[var(--color-primary)] hover:bg-blue-600 active:scale-[0.98] text-white rounded-2xl font-bold text-xl shadow-[0_10px_25px_rgba(59,130,246,0.5)] transition-all">
                Start Game
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <button onClick={() => setShowSetup(true)} className="w-full py-4 bg-[var(--color-primary)] hover:bg-blue-600 text-white rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(59,130,246,0.4)] flex justify-center items-center gap-2 transition-all">
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
