import { useState, useEffect, useMemo } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, CheckCircle, ArrowRight, RotateCcw, GraduationCap, Sparkles } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import toast from 'react-hot-toast';
import './Learn.css';

type Lesson = {
  id: string;
  title: string;
  description: string;
  fen: string;
  targetMove: string;
  successMessage: string;
};

const LESSONS: Lesson[] = [
  {
    id: "pin",
    title: "The Absolute Pin",
    description: "A pin occurs when an attacked piece cannot move without exposing a more valuable piece behind it. Here, the Black Knight is pinned to the King. Find the move that exploits this pin to win material!",
    fen: "4k3/8/4n3/8/4R3/8/8/4K3 w - - 0 1",
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
    fen: "k7/8/8/2pP4/8/8/8/K7 w - c6 0 1",
    targetMove: "dxc6",
    successMessage: "Voila! En passant is a special pawn capture rule."
  }
];

export function Learn() {
  const { pieceTheme, boardTheme } = useSettingsStore();
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [game, setGame] = useState(new Chess(LESSONS[0].fen));
  const [isCompleted, setIsCompleted] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<number>>(new Set());

  const [selectedSquare, setSelectedSquare] = useState<string>('');

  const currentLesson = LESSONS[currentLessonIndex];

  useEffect(() => {
    setGame(new Chess(currentLesson.fen));
    setIsCompleted(false);
    setSelectedSquare('');
  }, [currentLessonIndex]);

  const onPieceDrop = (args: any) => {
    const { sourceSquare, targetSquare } = args;
    if (isCompleted || !targetSquare) return false;

    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q'
      });

      if (move === null) return false;
      setSelectedSquare('');

      if (move.san === currentLesson.targetMove) {
        setGame(gameCopy);
        setIsCompleted(true);
        setCompletedLessons(prev => new Set(prev).add(currentLessonIndex));
        toast.success("Correct!", { icon: "✅" });
        return true;
      } else {
        toast.error("Not quite. Try finding a better move.", { icon: "❌" });
        setGame(gameCopy);
        setTimeout(() => {
          setGame(new Chess(game.fen()));
        }, 400);
        return true;
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
    setSelectedSquare('');
  };

  const handleSquareClick = (square: any) => {
    if (isCompleted) return;
    const sq = typeof square === 'string' ? square : square?.square;
    if (!sq) return;

    if (!selectedSquare) {
      const piece = game.get(sq as any);
      if (piece && piece.color === game.turn()) setSelectedSquare(sq);
      return;
    }

    if (sq === selectedSquare) {
      setSelectedSquare('');
      return;
    }

    const success = onPieceDrop({ sourceSquare: selectedSquare, targetSquare: sq });
    if (!success) {
      const piece = game.get(sq as any);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(sq);
      } else {
        setSelectedSquare('');
      }
    }
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

  const progressPercent = ((completedLessons.size) / LESSONS.length) * 100;

  return (
    <div className="learn-page">
      {/* Header */}
      <div className="learn-header">
        <div className="learn-header-top">
          <div className="learn-header-icon">
            <GraduationCap size={22} />
          </div>
          <h1>Chess <span>Academy</span></h1>
        </div>
        <p className="learn-header-sub">Master tactical patterns through interactive lessons</p>
      </div>

      {/* Progress bar */}
      <div className="learn-progress-bar">
        <div className="learn-progress-track">
          <motion.div
            className="learn-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className="learn-progress-labels">
          <span>{completedLessons.size} of {LESSONS.length} completed</span>
          <span>{Math.round(progressPercent)}%</span>
        </div>
      </div>

      {/* Main content */}
      <div className="learn-content">
        {/* Left: Lesson details */}
        <motion.div
          className="learn-sidebar"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="learn-lesson-card">
            <div className="learn-lesson-badge">
              <Sparkles size={12} />
              Lesson {currentLessonIndex + 1} of {LESSONS.length}
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentLesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                <h2 className="learn-lesson-title">{currentLesson.title}</h2>
                <p className="learn-lesson-desc">{currentLesson.description}</p>

                {isCompleted ? (
                  <div className="learn-feedback success">
                    <CheckCircle size={18} className="learn-feedback-icon" />
                    <p>{currentLesson.successMessage}</p>
                  </div>
                ) : (
                  <div className="learn-feedback instruction">
                    <BookOpen size={18} className="learn-feedback-icon" style={{ color: '#60A5FA' }} />
                    <p>Find the best move for White.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Lesson dots */}
            <div className="learn-dots">
              {LESSONS.map((_, i) => (
                <div
                  key={i}
                  className={`learn-dot ${i === currentLessonIndex ? 'active' : ''} ${completedLessons.has(i) ? 'completed' : ''}`}
                  onClick={() => setCurrentLessonIndex(i)}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="learn-actions">
              <button className="learn-btn learn-btn-secondary" onClick={resetLesson}>
                <RotateCcw size={16} /> Retry
              </button>
              <button
                className="learn-btn learn-btn-primary"
                onClick={nextLesson}
                disabled={!isCompleted || currentLessonIndex === LESSONS.length - 1}
              >
                Next <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Right: Board */}
        <motion.div
          className="learn-board-area"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
        >
          <div className="learn-board-wrapper">
            <Chessboard
              options={{
                position: game.fen(),
                onPieceDrop: onPieceDrop,
                boardOrientation: "white",
                animationDurationInMs: 300,
                showNotation: true,
                darkSquareStyle: { backgroundColor: boardTheme === 'classic' ? '#475569' : '#779556'},
                lightSquareStyle: { backgroundColor: boardTheme === 'classic' ? '#cbd5e1' : '#EBECD0' },
                pieces: customPieces,
                allowDragging: !isCompleted,
                onSquareClick: handleSquareClick,
                onPieceClick: handleSquareClick,
                squareStyles: selectedSquare ? { [selectedSquare]: { backgroundColor: 'rgba(59, 130, 246, 0.5)' } } : {}
              }}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
