import { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import toast from 'react-hot-toast';

type Lesson = {
  id: string;
  title: string;
  description: string;
  fen: string;
  targetMove: string; // e.g. "e4" or "Nf3" or "bxc6"
  successMessage: string;
};

const LESSONS: Lesson[] = [
  {
    id: "pin",
    title: "The Absolute Pin",
    description: "A pin occurs when an attacked piece cannot move without exposing a more valuable piece behind it. Here, the Black Knight is pinned to the King. Find the move that exploits this pin to win material!",
    fen: "4k3/8/4n3/8/4R3/8/8/4K3 w - - 0 1", // White rook on e4, Black knight on e6, Black king on e8
    targetMove: "Rxe6+",
    successMessage: "Excellent! You captured the Knight because it couldn't move away (it was pinned to the King)."
  },
  {
    id: "fork",
    title: "The Knight Fork",
    description: "A fork is a tactic where a single piece attacks two or more of the opponent's pieces simultaneously. Jump your Knight to a square where it attacks both the King and the Queen!",
    fen: "2k1q3/8/8/8/2N5/8/8/K7 w - - 0 1",
    targetMove: "Nd6+",
    successMessage: "Beautiful Knight fork! You attack the King, forcing it to move, and will win the Queen next."
  },
  {
    id: "en_passant",
    title: "En Passant",
    description: "When a pawn moves two squares from its starting square, an enemy pawn on an adjacent file can capture it as if it had only moved one square. Black just played c5. Capture it en passant!",
    fen: "k7/8/8/2pP4/8/8/8/K7 w - c6 0 1", // White pawn on d5, Black pawn on c5, En passant target c6
    targetMove: "dxc6",
    successMessage: "Voila! En passant is a special pawn capture rule."
  }
];

export function Learn() {
  const { pieceTheme, boardTheme } = useSettingsStore();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [game, setGame] = useState(new Chess(LESSONS[0].fen));
  const [isCompleted, setIsCompleted] = useState(false);

  const currentLesson = LESSONS[currentLessonIndex];

  useEffect(() => {
    setGame(new Chess(currentLesson.fen));
    setIsCompleted(false);
  }, [currentLessonIndex]);

  const onPieceDrop = ({ sourceSquare, targetSquare }: { sourceSquare: string; targetSquare: string | null }) => {
    if (isCompleted || !targetSquare) return false;

    try {
      const move = game.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move === null) return false;

      // Check if they played the correct target move
      if (move.san === currentLesson.targetMove) {
        setIsCompleted(true);
        toast.success("Correct!", { icon: "✅" });
        return true;
      } else {
        toast.error("Not quite. Try finding a better move.", { icon: "❌" });
        // Undo the wrong move
        setTimeout(() => {
          const undoGame = new Chess(game.fen());
          undoGame.undo();
          setGame(undoGame);
        }, 300);
        return true; // Return true to allow the animation, but we undo it right away
      }
    } catch (e) {
      return false;
    }
  };

  const nextLesson = () => {
    if (currentLessonIndex < LESSONS.length - 1) {
      setCurrentLessonIndex(i => i + 1);
    }
  };

  const resetLesson = () => {
    setGame(new Chess(currentLesson.fen));
    setIsCompleted(false);
  };

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

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 max-w-6xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row gap-8 w-full items-center justify-center">
        
        {/* Left: Lesson Details */}
        <div className="w-full lg:w-96 bg-white/5 p-8 rounded-3xl border border-white/10 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
            <BookOpen className="w-32 h-32 text-white" />
          </div>
          
          <div className="text-[var(--color-primary)] font-bold tracking-widest text-sm uppercase mb-2">
            Lesson {currentLessonIndex + 1} of {LESSONS.length}
          </div>
          <h2 className="text-3xl font-extrabold text-white mb-6 relative z-10">{currentLesson.title}</h2>
          <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 relative z-10">
            {currentLesson.description}
          </p>

          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl mb-6"
              >
                <div className="flex gap-3 items-start">
                  <CheckCircle className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-green-300 font-medium">{currentLesson.successMessage}</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="instruction"
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 p-4 rounded-xl mb-6"
              >
                <p className="text-blue-300 font-medium">Find the best move for White.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-auto flex gap-4">
            <button 
              onClick={resetLesson}
              className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-bold transition-all flex justify-center items-center gap-2"
            >
              <RotateCcw className="w-5 h-5" /> Retry
            </button>
            <button 
              onClick={nextLesson}
              disabled={!isCompleted || currentLessonIndex === LESSONS.length - 1}
              className="flex-1 py-4 bg-[var(--color-primary)] hover:bg-blue-600 disabled:opacity-50 disabled:bg-gray-700 disabled:text-gray-400 text-white rounded-xl font-bold transition-all shadow-[0_0_15px_rgba(59,130,246,0.3)] flex justify-center items-center gap-2"
            >
              Next <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right: Board */}
        <div className="w-full max-w-[500px] lg:max-w-[600px] aspect-square relative shadow-[0_0_40px_rgba(0,0,0,0.5)] rounded-md overflow-hidden ring-4 ring-white/5">
          <Chessboard
            options={{
              position: game.fen(),
              onPieceDrop: onPieceDrop,
              boardOrientation: "white",
              animationDurationInMs: 300,
              showNotation: true,
              darkSquareStyle: { backgroundColor: boardTheme === 'classic' ? '#779556' : '#2C3E50' },
              lightSquareStyle: { backgroundColor: boardTheme === 'classic' ? '#EBECD0' : '#ECF0F1' },
              pieces: customPieces,
              allowDragging: !isCompleted
            }}
          />
        </div>

      </div>
    </div>
  );
}
