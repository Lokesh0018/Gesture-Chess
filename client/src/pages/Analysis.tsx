import { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Upload, Play, Pause, Activity } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { stockfishService } from '../services/StockfishService';
import { useSettingsStore } from '../store/useSettingsStore';
import toast from 'react-hot-toast';

export function Analysis() {
  const { pieceTheme, boardTheme } = useSettingsStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [game, setGame] = useState(new Chess());
  const [pgnInput, setPgnInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(-1);
  const [evaluation, setEvaluation] = useState<{ score: number; isMate: boolean } | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Derive the current FEN from the history index
  const currentFen = useMemo(() => {
    if (currentMoveIndex === -1) return new Chess().fen();
    return history[currentMoveIndex];
  }, [history, currentMoveIndex]);

  // Load PGN
  const loadPgn = () => {
    try {
      const newGame = new Chess();
      newGame.loadPgn(pgnInput);
      setGame(newGame);
      
      const newHistory: string[] = [];
      const playGame = new Chess();
      newHistory.push(playGame.fen());
      
      const historyMoves = newGame.history();
      historyMoves.forEach(move => {
        playGame.move(move);
        newHistory.push(playGame.fen());
      });
      
      setHistory(newHistory);
      setCurrentMoveIndex(newHistory.length - 1);
      toast.success('PGN loaded successfully');
      
      // Clear location state so refresh doesn't reload it
      if (location.state?.pgn) {
        navigate('/analysis', { replace: true, state: {} });
      }
    } catch (e) {
      toast.error('Invalid PGN format');
    }
  };

  // Initial load from state
  useEffect(() => {
    if (location.state?.pgn) {
      setPgnInput(location.state.pgn);
      // We need to wait for state to update, or just load directly
      try {
        const newGame = new Chess();
        newGame.loadPgn(location.state.pgn);
        setGame(newGame);
        
        const newHistory: string[] = [];
        const playGame = new Chess();
        newHistory.push(playGame.fen());
        
        const historyMoves = newGame.history();
        historyMoves.forEach(move => {
          playGame.move(move);
          newHistory.push(playGame.fen());
        });
        
        setHistory(newHistory);
        setCurrentMoveIndex(newHistory.length - 1);
        
        // Clear state
        navigate('/analysis', { replace: true, state: {} });
      } catch (e) {
        // fail silently on initial load
      }
    }
  }, [location, navigate]);

  // Evaluation Effect
  useEffect(() => {
    if (!isEvaluating) {
      stockfishService.stopEvaluation();
      setEvaluation(null);
      return;
    }

    stockfishService.startEvaluation(currentFen, (evalData) => {
      setEvaluation(evalData);
    });

    return () => stockfishService.stopEvaluation();
  }, [currentFen, isEvaluating]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stockfishService.stopEvaluation();
    };
  }, []);

  const goToStart = () => setCurrentMoveIndex(-1);
  const goToEnd = () => setCurrentMoveIndex(history.length - 1);
  const goBack = () => setCurrentMoveIndex(Math.max(-1, currentMoveIndex - 1));
  const goForward = () => setCurrentMoveIndex(Math.min(history.length - 1, currentMoveIndex + 1));

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

  // Calculate eval bar height
  let evalHeight = 50;
  let evalText = '0.00';
  
  if (evaluation) {
    if (evaluation.isMate) {
      evalHeight = evaluation.score > 0 ? 100 : 0;
      evalText = `M${Math.abs(evaluation.score)}`;
    } else {
      // Score is in pawns (e.g. +1.5). Let's clamp between -5 and 5 for the bar.
      const clampedScore = Math.max(-5, Math.min(5, evaluation.score));
      // Map -5 -> 0%, 0 -> 50%, 5 -> 100%
      evalHeight = 50 + (clampedScore * 10);
      evalText = evaluation.score > 0 ? `+${evaluation.score.toFixed(2)}` : evaluation.score.toFixed(2);
    }
  } else {
    // If it's the start position and no eval yet, it's roughly 0.3 for white
    if (currentMoveIndex === -1 && !isEvaluating) {
      evalHeight = 53;
      evalText = '+0.30';
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 max-w-7xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row gap-8 w-full items-start justify-center">
        
        {/* Left Sidebar: Import & Settings */}
        <div className="w-full lg:w-80 bg-white/5 p-6 rounded-2xl border border-white/10 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Activity className="w-6 h-6 text-[var(--color-primary)]" />
            Analysis Board
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">Import a game to analyze it with Stockfish 16.</p>
          
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-white/70 uppercase tracking-wider">Paste PGN</label>
            <textarea 
              className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[var(--color-primary)] resize-none"
              placeholder="[Event &quot;Live Chess&quot;]..."
              value={pgnInput}
              onChange={(e) => setPgnInput(e.target.value)}
            />
            <button 
              onClick={loadPgn}
              className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <Upload className="w-4 h-4" /> Load Game
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">Engine Evaluation</span>
              <button 
                onClick={() => setIsEvaluating(!isEvaluating)}
                className={`p-2 rounded-lg transition-colors ${isEvaluating ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}
              >
                {isEvaluating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
            <div className="text-xs text-[var(--text-secondary)]">
              {isEvaluating ? 'Analyzing current position...' : 'Evaluation paused.'}
            </div>
          </div>
        </div>

        {/* Center: The Board & Eval Bar */}
        <div className="flex items-stretch gap-4">
          {/* Evaluation Bar */}
          <div className="w-8 md:w-12 bg-[#2C3E50] rounded-xl overflow-hidden relative shadow-inner border border-white/10 flex flex-col justify-end">
            {/* White Fill */}
            <motion.div 
              className="w-full bg-white transition-all duration-500 ease-out flex items-start justify-center overflow-hidden"
              style={{ height: `${evalHeight}%` }}
              animate={{ height: `${evalHeight}%` }}
            >
               {evalHeight > 10 && (
                 <span className={`text-[10px] md:text-xs font-bold mt-2 ${evaluation?.score && evaluation.score < 0 ? 'text-white' : 'text-black'}`}>
                   {evalText}
                 </span>
               )}
            </motion.div>
            {/* Display at bottom if black is winning */}
            {evalHeight <= 10 && (
              <span className="absolute bottom-2 w-full text-center text-[10px] md:text-xs font-bold text-white z-10">
                {evalText}
              </span>
            )}
          </div>

          {/* Board */}
          <div className="w-full max-w-[600px] aspect-square relative shadow-2xl rounded-sm overflow-hidden flex-1">
            <Chessboard
              options={{
                position: currentFen,
                boardOrientation: 'white',
                animationDurationInMs: 200,
                showNotation: true,
                darkSquareStyle: { backgroundColor: boardTheme === 'classic' ? '#779556' : '#2C3E50' },
                lightSquareStyle: { backgroundColor: boardTheme === 'classic' ? '#EBECD0' : '#ECF0F1' },
                pieces: customPieces,
                allowDragging: false
              }}
            />
          </div>
        </div>

        {/* Right Sidebar: Move History */}
        <div className="w-full lg:w-80 bg-white/5 p-4 md:p-6 rounded-2xl border border-white/10 flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4">Move History</h3>
          
          <div className="flex-1 bg-black/40 rounded-xl border border-white/5 p-4 overflow-y-auto mb-4 min-h-[200px] lg:min-h-[400px]">
            {history.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-[var(--text-secondary)]">
                <p className="text-sm">No game loaded.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                {game.history().map((move, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {i % 2 === 0 && <span className="text-white/40 w-6">{Math.floor(i / 2) + 1}.</span>}
                    <button 
                      onClick={() => setCurrentMoveIndex(i + 1)}
                      className={`px-2 py-1 rounded transition-colors ${currentMoveIndex === i + 1 ? 'bg-[var(--color-primary)] text-white font-bold' : 'text-white/80 hover:bg-white/10'}`}
                    >
                      {move}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-2">
            <button onClick={goToStart} disabled={currentMoveIndex === -1} className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors">
              <ChevronsLeft className="w-5 h-5" />
            </button>
            <button onClick={goBack} disabled={currentMoveIndex === -1} className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button onClick={goForward} disabled={currentMoveIndex === history.length - 1} className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button onClick={goToEnd} disabled={currentMoveIndex === history.length - 1} className="p-3 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-colors">
              <ChevronsRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
