import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';
import { RotateCcw, RefreshCw, Flag, Trophy, Download, Handshake, Volume2, VolumeX, Palette, Target, Zap, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraPanel } from '../components/CameraPanel';
import './Game.css';

type PromotionMove = { from: Square; to: Square };

const PROMOTION_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n'];
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const INITIAL_TIME = 600;

type PieceStyleId = 'classic' | 'neo' | 'alpha' | 'symbols';

// Metadata used in the UI (dropdown preview, player card avatar, captured pieces sidebar)
const PIECE_STYLES: {
  id: PieceStyleId;
  label: string;
  whiteKing: string;
  blackKing: string;
  map: Record<string, Record<PieceSymbol, string>>;
}[] = [
  {
    id: 'classic',
    label: 'Classic',
    whiteKing: '\u2654',
    blackKing: '\u265a',
    map: {
      w: { p: '\u2659', n: '\u2658', b: '\u2657', r: '\u2656', q: '\u2655', k: '\u2654' },
      b: { p: '\u265f', n: '\u265e', b: '\u265d', r: '\u265c', q: '\u265b', k: '\u265a' },
    },
  },
  {
    id: 'neo',
    label: 'Neo',
    whiteKing: '\ud83e\udd34',
    blackKing: '\ud83d\udc51',
    map: {
      w: { p: '\ud83e\uddd1', n: '\ud83d\udc34', b: '\u26ea', r: '\ud83c\udff0', q: '\ud83d\udc78', k: '\ud83e\udd34' },
      b: { p: '\ud83e\udddf', n: '\ud83e\udd84', b: '\ud83d\udd2e', r: '\ud83d\uddfc', q: '\ud83e\uddd9', k: '\ud83d\udc51' },
    },
  },
  {
    id: 'alpha',
    label: 'Alpha',
    whiteKing: 'K',
    blackKing: 'k',
    map: {
      w: { p: 'P', n: 'N', b: 'B', r: 'R', q: 'Q', k: 'K' },
      b: { p: 'p', n: 'n', b: 'b', r: 'r', q: 'q', k: 'k' },
    },
  },
  {
    id: 'symbols',
    label: 'Symbols',
    whiteKing: '\u2726',
    blackKing: '\u2727',
    map: {
      w: { p: '\u25c6', n: '\u2605', b: '\u2726', r: '\u25a0', q: '\u2b1f', k: '\u2726' },
      b: { p: '\u25c7', n: '\u2606', b: '\u2727', r: '\u25a1', q: '\u2b21', k: '\u2727' },
    },
  },
];

// ─── Custom board-piece renderers for react-chessboard ────────────────────────
// The library key format is uppercase FEN: wP wN wB wR wQ wK / bP bN bB bR bQ bK
// Each renderer receives { fill?, square?, svgStyle? } and must return JSX.Element
type PieceRenderObject = Record<string, (props?: { fill?: string; square?: string; svgStyle?: React.CSSProperties }) => React.JSX.Element>;

const NEO_MAP: Record<string, string> = {
  wK: '\ud83e\udd34', wQ: '\ud83d\udc78', wR: '\ud83c\udff0', wB: '\u26ea', wN: '\ud83d\udc34', wP: '\ud83e\uddd1',
  bK: '\ud83d\udc51', bQ: '\ud83e\uddd9', bR: '\ud83d\uddfc', bB: '\ud83d\udd2e', bN: '\ud83e\udd84', bP: '\ud83e\udddf',
};

const ALPHA_MAP: Record<string, string> = {
  wK: 'K', wQ: 'Q', wR: 'R', wB: 'B', wN: 'N', wP: 'P',
  bK: 'K', bQ: 'Q', bR: 'R', bB: 'B', bN: 'N', bP: 'P',
};

// For symbols style we use the standard unicode chess set (same glyphs, different colour treatment)
const SYMBOLS_MAP: Record<string, string> = {
  wK: '\u2654', wQ: '\u2655', wR: '\u2656', wB: '\u2657', wN: '\u2658', wP: '\u2659',
  bK: '\u265a', bQ: '\u265b', bR: '\u265c', bB: '\u265d', bN: '\u265e', bP: '\u265f',
};

const ALL_PIECE_CODES = ['wK','wQ','wR','wB','wN','wP','bK','bQ','bR','bB','bN','bP'];

function buildCustomPieces(styleId: PieceStyleId): PieceRenderObject | undefined {
  if (styleId === 'classic') return undefined; // use default react-chessboard SVG

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: Record<string, any> = {};

  if (styleId === 'neo') {
    for (const code of ALL_PIECE_CODES) {
      const emoji = NEO_MAP[code];
      obj[code] = () => (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '68%', lineHeight: 1,
          userSelect: 'none',
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.55))',
        }}>
          {emoji}
        </div>
      );
    }
    return obj as PieceRenderObject;
  }

  if (styleId === 'alpha') {
    for (const code of ALL_PIECE_CODES) {
      const isWhite = code.startsWith('w');
      const letter = ALPHA_MAP[code];
      obj[code] = () => (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontWeight: 900,
          fontStyle: 'italic',
          fontSize: '60%',
          lineHeight: 1,
          color: isWhite ? '#F8FAFC' : '#0F172A',
          textShadow: isWhite
            ? '0 2px 6px rgba(0,0,0,0.7), 0 0 12px rgba(255,255,255,0.15)'
            : '0 2px 6px rgba(0,0,0,0.85)',
          WebkitTextStroke: isWhite ? '1px rgba(200,220,255,0.4)' : '1.5px rgba(200,210,220,0.55)',
          userSelect: 'none',
        }}>
          {letter}
        </div>
      );
    }
    return obj as PieceRenderObject;
  }

  if (styleId === 'symbols') {
    for (const code of ALL_PIECE_CODES) {
      const isWhite = code.startsWith('w');
      const sym = SYMBOLS_MAP[code];
      obj[code] = () => (
        <div style={{
          width: '100%', height: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '70%',
          lineHeight: 1,
          color: isWhite ? '#FDE68A' : '#A78BFA',
          textShadow: isWhite
            ? '0 0 14px rgba(251,191,36,0.65), 0 2px 4px rgba(0,0,0,0.55)'
            : '0 0 14px rgba(139,92,246,0.65), 0 2px 4px rgba(0,0,0,0.55)',
          WebkitTextStroke: isWhite ? '0.5px rgba(251,191,36,0.45)' : '0.5px rgba(167,139,250,0.45)',
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.4))',
          userSelect: 'none',
        }}>
          {sym}
        </div>
      );
    }
    return obj as PieceRenderObject;
  }

  return undefined;
}


function getKingSquare(game: Chess): string | null {
  const board = game.board();
  for (let rankIdx = 0; rankIdx < board.length; rankIdx += 1) {
    for (let fileIdx = 0; fileIdx < board[rankIdx].length; fileIdx += 1) {
      const piece = board[rankIdx][fileIdx];
      if (piece?.type === 'k' && piece.color === game.turn()) {
        return `${FILES[fileIdx]}${8 - rankIdx}`;
      }
    }
  }
  return null;
}

function isPromotionRank(square: string, color: Color): boolean {
  return color === 'w' ? square.endsWith('8') : square.endsWith('1');
}

function isPromotionCandidate(game: Chess, from: string, to: string): boolean {
  const piece = game.get(from as Square);
  if (!piece || piece.type !== 'p') return false;
  return isPromotionRank(to, piece.color);
}

function generateSquareStyles(game: Chess, selectedSquare: string, hoveredMove: { from: string, to: string } | null): Record<string, React.CSSProperties> {
  const styles: Record<string, React.CSSProperties> = {};

  const history = game.history({ verbose: true });
  if (history.length > 0) {
    const last = history[history.length - 1];
    styles[last.from] = { backgroundColor: 'rgba(234, 179, 8, 0.3)' };
    styles[last.to] = { backgroundColor: 'rgba(234, 179, 8, 0.3)' };
  }

  if (hoveredMove) {
    styles[hoveredMove.from] = { ...styles[hoveredMove.from], backgroundColor: 'rgba(59, 130, 246, 0.5)' };
    styles[hoveredMove.to] = { ...styles[hoveredMove.to], backgroundColor: 'rgba(59, 130, 246, 0.5)' };
  }

  if (game.isCheck()) {
    const kingSquare = getKingSquare(game);
    if (kingSquare) {
      styles[kingSquare] = {
        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.7) 35%, transparent 70%)',
      };
    }
  }

  if (!selectedSquare) return styles;
  const moves = game.moves({ square: selectedSquare as Square, verbose: true });
  if (!moves.length) return styles;

  styles[selectedSquare] = { ...styles[selectedSquare], background: 'var(--color-accent-bg)' };
  for (const move of moves) {
    const isCapture = Boolean(move.captured) || move.flags.includes('e');
    styles[move.to] = {
      ...styles[move.to],
      background: isCapture
        ? 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 65%, transparent 66%)'
        : 'radial-gradient(circle, rgba(0, 0, 0, 0.15) 25%, transparent 26%)',
      borderRadius: '50%',
    };
  }

  return styles;
}

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

    if (!audioCache[url]) {
      audioCache[url] = new Audio(url);
    }

    const audio = audioCache[url];
    audio.currentTime = 0;
    audio.play().catch(() => { });
  } catch {
    // No-op
  }
}

const PieceIcon = ({ type, color, styleId = 'classic' }: { type: PieceSymbol, color: 'w' | 'b', styleId?: PieceStyleId }) => {
  const style = PIECE_STYLES.find(s => s.id === styleId) || PIECE_STYLES[0];
  return (
    <span className={`piece-icon ${color === 'w' ? 'white' : 'black'} piece-style-${styleId}`} style={{ textShadow: '0 4px 8px rgba(0,0,0,0.5)', filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' }}>
      {style.map[color][type]}
    </span>
  );
};

export const LocalGame = () => {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [selectedSquare, setSelectedSquare] = useState('');
  const [redoStack, setRedoStack] = useState<Array<{ from: string; to: string; promotion?: PieceSymbol }>>([]);
  const [pendingPromotion, setPendingPromotion] = useState<PromotionMove | null>(null);

  const [capturedByWhite, setCapturedByWhite] = useState<PieceSymbol[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<PieceSymbol[]>([]);
  const [showEndModal, setShowEndModal] = useState(false);
  const [gameDuration, setGameDuration] = useState(0);
  const [manualResult, setManualResult] = useState<string | null>(null);
  const [boardShake, setBoardShake] = useState(false);
  const [whiteTime, setWhiteTime] = useState(INITIAL_TIME);
  const [blackTime, setBlackTime] = useState(INITIAL_TIME);
  const [boardTheme, setBoardTheme] = useState<'classic' | 'wood' | 'neon'>('classic');
  const [pieceStyle, setPieceStyle] = useState<PieceStyleId>('classic');
  const [isMuted, setIsMuted] = useState(false);
  const [hoveredMove, setHoveredMove] = useState<{ from: string, to: string } | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [pieceStyleDropdownOpen, setPieceStyleDropdownOpen] = useState(false);

  const turnRef = useRef(game.turn());
  const timeoutHandledRef = useRef(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const pieceStyleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!localStorage.getItem('tutorialSeen')) {
      setShowTutorial(true);
    }
  }, []);

  const closeTutorial = () => {
    localStorage.setItem('tutorialSeen', 'true');
    setShowTutorial(false);
  };

  // Keep turnRef in sync
  useEffect(() => {
    turnRef.current = game.turn();
    timeoutHandledRef.current = false;
  }, [game]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!game.isGameOver() && !manualResult) {
      interval = setInterval(() => {
        setGameDuration(d => d + 1);
        if (turnRef.current === 'w') {
          setWhiteTime(t => Math.max(0, t - 1));
        } else {
          setBlackTime(t => Math.max(0, t - 1));
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [game, manualResult]);

  // Timeout detection
  useEffect(() => {
    if (timeoutHandledRef.current || game.isGameOver() || manualResult) return;
    if (whiteTime === 0) {
      timeoutHandledRef.current = true;
      toast.error('White ran out of time!');
      setManualResult('WHITE TIMEOUT');
      setShowEndModal(true);
    } else if (blackTime === 0) {
      timeoutHandledRef.current = true;
      toast.error('Black ran out of time!');
      setManualResult('BLACK TIMEOUT');
      setShowEndModal(true);
    }
  }, [whiteTime, blackTime, game, manualResult]);

  // Escape key handler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (pendingPromotion) {
          setPendingPromotion(null);
        } else if (themeDropdownOpen) {
          setThemeDropdownOpen(false);
        } else if (pieceStyleDropdownOpen) {
          setPieceStyleDropdownOpen(false);
        } else if (selectedSquare) {
          setSelectedSquare('');
        }
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pendingPromotion, themeDropdownOpen, pieceStyleDropdownOpen, selectedSquare]);

  // Close dropdowns on outside click
  useEffect(() => {
    const onPointerDown = (e: PointerEvent) => {
      if (themeDropdownOpen && themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setThemeDropdownOpen(false);
      }
      if (pieceStyleDropdownOpen && pieceStyleDropdownRef.current && !pieceStyleDropdownRef.current.contains(e.target as Node)) {
        setPieceStyleDropdownOpen(false);
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, [themeDropdownOpen, pieceStyleDropdownOpen]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const renderMove = (move: string, color: 'w' | 'b') => {
    if (!move) return null;
    const match = move.match(/^[NBRQK]/);
    if (!match) return <span>{move}</span>;
    const map: Record<string, Record<string, string>> = {
      'w': { N: '♘', B: '♗', R: '♖', Q: '♕', K: '♔' },
      'b': { N: '♞', B: '♝', R: '♜', Q: '♛', K: '♚' }
    };
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
        <span style={{ fontSize: '18px', lineHeight: 1, color: color === 'w' ? '#fff' : '#0F172A', textShadow: color === 'b' ? '0 0 2px rgba(255,255,255,0.5)' : 'none' }}>
          {map[color][match[0]]}
        </span>
        {move.substring(1)}
      </span>
    );
  };

  const optionSquares = useMemo(
    () => generateSquareStyles(game, selectedSquare, hoveredMove),
    [game, selectedSquare, hoveredMove],
  );

  // Recompute custom board pieces whenever piece style changes
  // undefined = use default react-chessboard SVG (classic)
  const customPieces = useMemo<PieceRenderObject | undefined>(() => buildCustomPieces(pieceStyle), [pieceStyle]);


  const getThemeStyles = () => {
    switch (boardTheme) {
      case 'wood': return { dark: '#b58863', light: '#f0d9b5' };
      case 'neon': return { dark: '#0a0a0a', light: '#111827' };
      default: return { dark: 'var(--color-board-dark, #7C8CA4)', light: 'var(--color-board-light, #DCE3EE)' };
    }
  };

  const gameStatus = useMemo(() => {
    if (game.isCheckmate()) return 'CHECKMATE';
    if (game.isStalemate()) return 'STALEMATE';
    if (game.isInsufficientMaterial()) return 'DRAW (MATERIAL)';
    if (game.isThreefoldRepetition()) return 'DRAW (REPETITION)';
    if ('isDrawByFiftyMoves' in game && typeof game.isDrawByFiftyMoves === 'function' && game.isDrawByFiftyMoves()) {
      return 'DRAW (FIFTY-MOVE)';
    }
    if (game.isDraw()) return 'DRAW';
    if (game.isCheck()) return 'CHECK';
    return 'ACTIVE';
  }, [game]);

  const movePairs = useMemo(() => {
    return game.history().reduce((result: Array<{ w: string; b: string }>, move, index) => {
      if (index % 2 === 0) result.push({ w: move, b: '' });
      else result[result.length - 1].b = move;
      return result;
    }, []);
  }, [game]);

  const moveHistoryEndRef = useRef<HTMLDivElement>(null);
  const boardContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    moveHistoryEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [movePairs]);

  useEffect(() => {
    if (game.isGameOver()) {
      setShowEndModal(true);
    } else if (game.isCheck()) {
      toast('Check!', {
        icon: '⚠️',
        style: { borderRadius: '12px', background: 'var(--bg-card)', color: '#fff', border: '1px solid var(--border-color)' }
      });
    }
  }, [game]);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!boardContainerRef.current?.contains(event.target as Node)) {
        setSelectedSquare('');
      }
    };
    window.addEventListener('pointerdown', onPointerDown);
    return () => window.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const syncCapturedPieces = (currentGame: Chess) => {
    const initialInventory = { p: 8, n: 2, b: 2, r: 2, q: 1 };
    const currentInventory = {
      w: { p: 0, n: 0, b: 0, r: 0, q: 0 },
      b: { p: 0, n: 0, b: 0, r: 0, q: 0 }
    };

    currentGame.board().forEach(row => {
      row.forEach(piece => {
        if (piece && piece.type !== 'k') {
          currentInventory[piece.color][piece.type as keyof typeof initialInventory]++;
        }
      });
    });

    const missingWhite: PieceSymbol[] = [];
    const missingBlack: PieceSymbol[] = [];
    const pieceTypes: PieceSymbol[] = ['q', 'r', 'b', 'n', 'p'];

    pieceTypes.forEach(type => {
      const wCount = initialInventory[type as keyof typeof initialInventory] - currentInventory.w[type as keyof typeof initialInventory];
      for (let i = 0; i < wCount; i++) missingWhite.push(type);

      const bCount = initialInventory[type as keyof typeof initialInventory] - currentInventory.b[type as keyof typeof initialInventory];
      for (let i = 0; i < bCount; i++) missingBlack.push(type);
    });

    setCapturedByWhite(missingBlack);
    setCapturedByBlack(missingWhite);
  };

  function applyMove(moveDetails: { from: string; to: string; promotion?: PieceSymbol }) {
    try {
      const gameCopy = new Chess();
      gameCopy.loadPgn(game.pgn());
      const move = gameCopy.move(moveDetails);
      if (move) {
        setGame(gameCopy);
        setSelectedSquare('');
        syncCapturedPieces(gameCopy);
        if (navigator.vibrate) navigator.vibrate(50);
        if (!isMuted) {
          if (gameCopy.isCheck()) playMoveSound('check');
          else if (move.captured) playMoveSound('capture');
          else playMoveSound('move');
        }
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  function requestMove(from: string, to: string): boolean {
    if (isPromotionCandidate(game, from, to)) {
      setPendingPromotion({ from: from as Square, to: to as Square });
      return false;
    }
    const success = applyMove({ from, to, promotion: 'q' });
    if (success) setRedoStack([]);
    return success;
  }

  function commitPromotion(piece: PieceSymbol): void {
    if (!pendingPromotion) return;
    const success = applyMove({ from: pendingPromotion.from, to: pendingPromotion.to, promotion: piece });
    if (success) setRedoStack([]);
    setPendingPromotion(null);
  }

  function cancelPromotion(): void {
    setPendingPromotion(null);
  }

  function onPieceDrop(args: { sourceSquare: string; targetSquare: string | null }): boolean {
    const { sourceSquare, targetSquare } = args;
    if (!targetSquare) return false;
    const sourcePiece = game.get(sourceSquare as Square);
    if (!sourcePiece || sourcePiece.color !== game.turn()) return false;
    const success = requestMove(sourceSquare, targetSquare);
    if (!success) {
      if (!isMuted) playMoveSound('invalid');
      if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
      setBoardShake(true);
      setTimeout(() => setBoardShake(false), 300);
    }
    return success;
  }

  function onSquareClick(args: { square: string | null }): void {
    if (!args.square) {
      setSelectedSquare('');
      return;
    }
    const square = args.square;
    if (!selectedSquare) {
      const piece = game.get(square as Square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      }
      return;
    }

    if (square === selectedSquare) {
      setSelectedSquare('');
      return;
    }

    const success = requestMove(selectedSquare, square);

    if (!success) {
      const piece = game.get(square as Square);
      if (piece && piece.color === game.turn()) {
        setSelectedSquare(square);
      } else {
        setSelectedSquare('');
        if (!isMuted) playMoveSound('invalid');
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
        setBoardShake(true);
        setTimeout(() => setBoardShake(false), 300);
      }
    }
  }

  function onPieceClick(args: { square: string | null }): void {
    if (!args.square) return;
    const piece = game.get(args.square as Square);
    if (!piece || piece.color !== game.turn()) return;
    setSelectedSquare(args.square);
  }

  function onUndo(): void {
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    const undone = gameCopy.undo();
    if (!undone) return;
    setRedoStack((prev) => [...prev, { from: undone.from, to: undone.to, promotion: undone.promotion }]);
    setGame(gameCopy);
    setSelectedSquare('');
    syncCapturedPieces(gameCopy);
  }

  function onRedo(): void {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    const success = applyMove(next);
    if (success) {
      setRedoStack((prev) => prev.slice(0, -1));
    }
  }

  function onRestart(): void {
    const fresh = new Chess();
    setGame(fresh);
    setSelectedSquare('');
    setRedoStack([]);
    setPendingPromotion(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setShowEndModal(false);
    setGameDuration(0);
    setManualResult(null);
    setWhiteTime(INITIAL_TIME);
    setBlackTime(INITIAL_TIME);
    timeoutHandledRef.current = false;
  }

  function onFlip(): void {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  }

  function downloadPGN(): void {
    const element = document.createElement("a");
    const file = new Blob([game.pgn()], { type: 'text/plain' });
    const url = URL.createObjectURL(file);
    element.href = url;
    element.download = `chess_game_${new Date().toISOString().slice(0, 10)}.pgn`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    URL.revokeObjectURL(url);
  }

  const getMaterialAdvantage = () => {
    const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
    let wScore = 0;
    let bScore = 0;
    const board = game.board();
    board.forEach(row => row.forEach(piece => {
      if (piece) {
        if (piece.color === 'w') wScore += values[piece.type];
        else bScore += values[piece.type];
      }
    }));
    return { w: Math.max(0, wScore - bScore), b: Math.max(0, bScore - wScore) };
  };
  const material = getMaterialAdvantage();

  const currentStyle = PIECE_STYLES.find(s => s.id === pieceStyle) || PIECE_STYLES[0];

  const makePlayerCard = (color: 'w' | 'b') => {
    const isActive = game.turn() === color && !game.isGameOver() && !manualResult;
    const timeLeft = color === 'w' ? whiteTime : blackTime;
    const captured = color === 'w' ? capturedByWhite : capturedByBlack;
    const matAdv = color === 'w' ? material.w : material.b;
    const label = color === 'w' ? 'White' : 'Black';
    const kingSymbol = color === 'w' ? currentStyle.whiteKing : currentStyle.blackKing;
    const isLowTime = timeLeft <= 30 && isActive;

    return (
      <div className={`player-card ${isActive ? 'active-turn' : 'inactive-turn'}`}>
        {/* Active turn glow bar */}
        {isActive && <div className="player-card-active-bar" />}

        <div className="player-info">
          {/* King avatar */}
          <div className={`player-avatar player-avatar-${color}`}>
            <span className="player-king-icon">{kingSymbol}</span>
            <div className="player-status-dot" />
          </div>

          {/* Name + captured */}
          <div className="player-details">
            <div className="player-name-row">
              <span className="player-name">{label}</span>
              {isActive && <span className="player-turn-badge">Your Turn</span>}
            </div>
            <div className="player-captured-row">
              {captured.slice(0, 8).map((p, i) => (
                <span key={i} className={`player-cap-icon player-cap-${color === 'w' ? 'b' : 'w'}`}>
                  {currentStyle.map[color === 'w' ? 'b' : 'w'][p]}
                </span>
              ))}
              {captured.length > 8 && <span className="player-cap-more">+{captured.length - 8}</span>}
              {captured.length === 0 && <span className="player-cap-empty">—</span>}
              {matAdv > 0 && <span className="player-material">+{matAdv}</span>}
            </div>
          </div>
        </div>

        {/* Clock */}
        <div
          className={`player-clock ${isActive ? 'active' : ''} ${isLowTime ? 'danger' : ''}`}
        >
          {formatTime(timeLeft)}
        </div>
      </div>
    );
  };

  const blackPlayerCard = makePlayerCard('b');
  const whitePlayerCard = makePlayerCard('w');

  return (
    <div className="game-grid">

      {/* Left Column: Move History */}
      <div className="column-left">
        <div className="card history-card">
          <div className="card-header">
            <div className="card-header-title">Move History</div>
            <button onClick={downloadPGN} className="nav-btn-icon" title="Download PGN" style={{ padding: '0', width: '20px', height: '20px' }}>
              <Download style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
          <div className="history-table-header">
            <div>Move</div>
            <div>White</div>
            <div>Black</div>
          </div>
          <div className="history-list">
            {movePairs.map((pair, i) => {
              const isLastMove = i === movePairs.length - 1;
              const isWhiteLast = isLastMove && game.turn() === 'b';
              const isBlackLast = isLastMove && game.turn() === 'w';
              return (
                <motion.div
                  key={i}
                  className="history-row"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="history-move-num">
                    <div className={`history-dot ${isLastMove ? 'active' : ''}`}></div>
                    {i + 1}.
                  </div>
                  <div
                    className={`history-move ${isWhiteLast ? 'active' : ''}`}
                    onMouseEnter={() => { const m = game.history({ verbose: true })[i * 2]; if (m) setHoveredMove({ from: m.from, to: m.to }); }}
                    onMouseLeave={() => setHoveredMove(null)}
                  >
                    {renderMove(pair.w, 'w')}
                  </div>
                  <div
                    className={`history-move ${isBlackLast ? 'active' : ''}`}
                    onMouseEnter={() => { const m = game.history({ verbose: true })[i * 2 + 1]; if (m) setHoveredMove({ from: m.from, to: m.to }); }}
                    onMouseLeave={() => setHoveredMove(null)}
                  >
                    {renderMove(pair.b, 'b')}
                  </div>
                </motion.div>
              );
            })}
            <div ref={moveHistoryEndRef} />
            {game.history().length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '14px', marginTop: '24px' }}>
                Waiting for game to start...
              </div>
            )}
          </div>
        </div>
        <CameraPanel />
      </div>

      {/* Central Column: Chess Area */}
      <div className="column-center">

        {/* Top Player Card (Opponent based on orientation) */}
        {boardOrientation === 'white' ? blackPlayerCard : whitePlayerCard}

        {/* The Board Area */}
        <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', maxWidth: '800px', margin: '0 auto', gap: '16px', flex: 1, minHeight: 0 }}>
          
          {/* White pieces killed by black (Black's captures) */}
          <div className="captured-sidebar">
            <span className="captured-sidebar-label">White<br/>Captured</span>
            {material.b > 0 && <span className="captured-sidebar-advantage">+{material.b}</span>}
            <div className="captured-sidebar-grid">
              {capturedByBlack.map((p, i) => <div key={`w-${i}`} className="captured-sidebar-piece"><PieceIcon type={p} color="w" styleId={pieceStyle} /></div>)}
            </div>
          </div>

          <div
            ref={boardContainerRef}
            className={`board-wrapper ${boardShake ? 'shake-error' : ''} ${game.isCheck() ? 'check-alert' : game.turn() === 'w' ? 'turn-white' : 'turn-black'}`}
            style={{ height: '100%', maxHeight: '100%', flexShrink: 1, minWidth: 0, minHeight: 0, display: 'flex', justifyContent: 'center' }}
          >
            <Chessboard
              options={{
                id: 'LocalBoard',
                position: game.fen(),
                onPieceDrop,
                onPieceClick,
                onSquareClick,
                onSquareRightClick: () => setSelectedSquare(''),
                boardOrientation,
                allowDragging: true,
                allowDragOffBoard: true,
                animationDurationInMs: 180,
                darkSquareStyle: { backgroundColor: getThemeStyles().dark },
                lightSquareStyle: { backgroundColor: getThemeStyles().light },
                squareStyles: optionSquares,
                boardStyle: { cursor: 'pointer' },
                draggingPieceStyle: { zIndex: 9999, cursor: 'grabbing', transform: 'scale(1.1)', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.5))' },
                ...(customPieces ? { pieces: customPieces } : {}),
              }}
            />
          </div>

          {/* Black pieces killed by white (White's captures) */}
          <div className="captured-sidebar">
            <span className="captured-sidebar-label">Black<br/>Captured</span>
            {material.w > 0 && <span className="captured-sidebar-advantage">+{material.w}</span>}
            <div className="captured-sidebar-grid">
              {capturedByWhite.map((p, i) => <div key={`b-${i}`} className="captured-sidebar-piece"><PieceIcon type={p} color="b" styleId={pieceStyle} /></div>)}
            </div>
          </div>

        </div>

        {/* Bottom Player Card (You based on orientation) */}
        {boardOrientation === 'white' ? whitePlayerCard : blackPlayerCard}
      </div>

      {/* Right Column: Game Status & Captured Pieces */}
      <div className="column-right">

        {/* Game Status Card */}
        <div className="card status-card">
          <div className="card-header">
            <div className="card-header-title">
              <Trophy style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} /> Game Status
            </div>
          </div>
          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span className={`status-badge ${gameStatus.includes('CHECKMATE') ? 'mate' :
                gameStatus.includes('DRAW') ? 'draw' : 'active'
                }`}>
                {gameStatus}
              </span>
            </div>
            <div className="status-list">
              <div className="status-item">
                <span className="status-label">Turn</span>
                <span className="status-value">{game.turn() === 'w' ? 'White' : 'Black'}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Duration</span>
                <span className="status-value mono">{formatTime(gameDuration)}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Total Moves</span>
                <span className="status-value">{Math.floor(game.history().length / 2)}</span>
              </div>
            </div>
          </div>
        </div>



        {/* Game Actions Card */}
        <div className="card controls-card" style={{ marginTop: 'auto', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div className="card-header">
            <div className="card-header-title">
              <Zap style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} /> Actions
            </div>
          </div>
          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div className="controls-container" style={{ flex: 1, justifyContent: 'space-evenly' }}>
              <div className="controls-row">
                <button onClick={onUndo} disabled={!game.history().length} className="control-btn" aria-label="Undo Move" tabIndex={0}>
                  <RotateCcw style={{ width: '16px', height: '16px' }} /> <span className="control-text">Undo</span>
                </button>
                <button onClick={onRedo} disabled={!redoStack.length} className="control-btn" aria-label="Redo Move" tabIndex={0}>
                  <RefreshCw style={{ width: '16px', height: '16px', transform: 'scaleX(-1)' }} /> <span className="control-text">Redo</span>
                </button>
                <button onClick={onFlip} className="control-btn" aria-label="Flip Board" tabIndex={0}>
                  <RefreshCw style={{ width: '16px', height: '16px' }} /> <span className="control-text">Flip</span>
                </button>
              </div>
              <div className="controls-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <button onClick={() => { if (!game.isGameOver()) { toast.success('Draw agreed'); setManualResult('DRAW AGREED'); setShowEndModal(true); } }} className="control-btn" aria-label="Offer Draw" tabIndex={0}>
                  <Handshake style={{ width: '16px', height: '16px' }} /> <span className="control-text">Draw</span>
                </button>
                <button onClick={() => { if (!game.isGameOver()) { toast.error('You resigned'); setManualResult(game.turn() === 'w' ? 'WHITE RESIGNED' : 'BLACK RESIGNED'); setShowEndModal(true); } }} className="control-btn danger" aria-label="Resign" tabIndex={0}>
                  <Flag style={{ width: '16px', height: '16px' }} /> <span className="control-text">Resign</span>
                </button>
              </div>
              <div className="controls-row" style={{ gridTemplateColumns: '1fr' }}>
                <button onClick={onRestart} className="control-btn primary" aria-label="New Game" tabIndex={0}>
                  <RotateCcw style={{ width: '16px', height: '16px' }} /> <span className="control-text" style={{ display: 'inline' }}>New Game</span>
                </button>
              </div>
              <div className="controls-row" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                {/* Board Theme Dropdown */}
                <div ref={themeDropdownRef} style={{ position: 'relative' }}>
                  <button
                    className="control-btn"
                    style={{ width: '100%' }}
                    onClick={() => { setThemeDropdownOpen(v => !v); setPieceStyleDropdownOpen(false); }}
                  >
                    <Palette style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                    <span className="control-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {boardTheme.charAt(0).toUpperCase() + boardTheme.slice(1)}
                    </span>
                  </button>
                  <AnimatePresence>
                    {themeDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.13 }}
                        className="dropdown-menu"
                        style={{ bottom: 'calc(100% + 6px)', left: 0, right: 'auto', minWidth: '140px' }}
                      >
                        {[{ id: 'classic', label: 'Classic', icon: '⬜' }, { id: 'wood', label: 'Wood', icon: '🪵' }, { id: 'neon', label: 'Neon', icon: '💡' }].map(t => (
                          <button
                            key={t.id}
                            onClick={(e) => { e.stopPropagation(); setBoardTheme(t.id as 'classic' | 'wood' | 'neon'); setThemeDropdownOpen(false); }}
                            className={`dropdown-item ${boardTheme === t.id ? 'active' : ''}`}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span>{t.icon}</span>{t.label}
                            </span>
                            {boardTheme === t.id && <div className="dropdown-dot" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button onClick={() => setIsMuted(!isMuted)} className="control-btn" aria-label="Toggle Sound">
                  {isMuted ? <VolumeX style={{ width: '15px', height: '15px' }} /> : <Volume2 style={{ width: '15px', height: '15px' }} />}
                  <span className="control-text">{isMuted ? 'Muted' : 'Sound'}</span>
                </button>
              </div>

              {/* Piece Style Dropdown */}
              <div className="controls-row" style={{ gridTemplateColumns: '1fr' }}>
                <div ref={pieceStyleDropdownRef} style={{ position: 'relative' }}>
                  <button
                    className="control-btn"
                    style={{ width: '100%' }}
                    onClick={() => { setPieceStyleDropdownOpen(v => !v); setThemeDropdownOpen(false); }}
                  >
                    <Layers style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                    <span className="control-text">
                      Pieces: <span style={{ color: 'var(--color-accent)' }}>{currentStyle.label}</span>
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: '18px', lineHeight: 1 }}>{currentStyle.whiteKing}</span>
                  </button>
                  <AnimatePresence>
                    {pieceStyleDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.96 }}
                        transition={{ duration: 0.13 }}
                        className="dropdown-menu"
                        style={{ bottom: 'calc(100% + 6px)', left: 0, right: 0 }}
                      >
                        {PIECE_STYLES.map(s => (
                          <button
                            key={s.id}
                            onClick={(e) => { e.stopPropagation(); setPieceStyle(s.id); setPieceStyleDropdownOpen(false); }}
                            className={`dropdown-item ${pieceStyle === s.id ? 'active' : ''}`}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ fontSize: '20px', lineHeight: 1, minWidth: '24px', textAlign: 'center' }}>{s.whiteKing}</span>
                              <span style={{ fontSize: '20px', lineHeight: 1, minWidth: '24px', textAlign: 'center' }}>{s.blackKing}</span>
                              <span style={{ fontSize: '14px' }}>{s.label}</span>
                            </span>
                            {pieceStyle === s.id && <div className="dropdown-dot" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Promotion Dialog */}
      {pendingPromotion && (
        <div className="modal-overlay">
          <div className="modal-box center">
            <h3 className="modal-title">Promote Pawn</h3>
            <div className="modal-grid" style={{ width: '100%' }}>
              {PROMOTION_PIECES.map((piece) => (
                <button
                  key={piece}
                  onClick={() => commitPromotion(piece)}
                  className="modal-btn"
                >
                  <PieceIcon type={piece} color={game.turn()} styleId={pieceStyle} />
                </button>
              ))}
            </div>
            <button onClick={cancelPromotion} className="modal-btn-cancel">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* End Game Modal */}
      <AnimatePresence>
        {showEndModal && (
          <motion.div
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Cinematic Particles Backdrop */}
            <div className="local-game-particles-container">
              {Array.from({ length: 30 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="local-game-particle"
                  style={{
                    width: Math.random() * 8 + 4 + 'px',
                    height: Math.random() * 8 + 4 + 'px',
                    background: game.isCheckmate()
                      ? (game.turn() === 'w' ? '#EF4444' : '#3B82F6')
                      : '#F59E0B',
                    boxShadow: '0 0 10px currentColor',
                    left: Math.random() * 100 + '%',
                    top: Math.random() * 100 + '%',
                  }}
                  animate={{
                    y: [0, Math.random() * -200 - 100],
                    x: [0, Math.random() * 100 - 50],
                    opacity: [0, 0.8, 0],
                    scale: [0, 1.5, 0]
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    repeat: Infinity,
                    ease: "easeOut",
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>

            <motion.div
              className="modal-box center relative z-10"
              initial={{ scale: 0.8, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
              >
                <Trophy style={{
                  width: '80px', height: '80px', marginBottom: '16px',
                  color: game.isCheckmate() ? 'var(--color-accent)' : 'var(--color-success)',
                  filter: 'drop-shadow(0 0 20px currentColor)'
                }} />
              </motion.div>

              <h2 className="modal-title" style={{ fontSize: '32px', textTransform: 'uppercase', letterSpacing: '2px', textShadow: '0 0 20px rgba(255,255,255,0.3)' }}>
                {manualResult ? (manualResult.includes('RESIGNED') ? 'RESIGNATION' : manualResult.includes('TIMEOUT') ? 'TIME OUT' : 'DRAW') : (gameStatus.includes('CHECKMATE') ? 'CHECKMATE' : 'GAME OVER')}
              </h2>
              <p className="modal-subtitle" style={{ fontSize: '18px', color: '#94A3B8' }}>
                {game.isCheckmate()
                  ? (game.turn() === 'w' ? 'Black Wins' : 'White Wins')
                  : manualResult?.includes('TIMEOUT')
                    ? (manualResult.includes('WHITE') ? 'Black Wins on Time' : 'White Wins on Time')
                    : (manualResult || gameStatus)}
              </p>

              <div style={{ width: '100%', marginTop: '24px' }}>
                <button onClick={() => { onRestart(); setShowEndModal(false); }} className="modal-btn-primary" style={{ padding: '16px', fontSize: '16px' }}>
                  Play Again
                </button>
                <button onClick={() => setShowEndModal(false)} className="modal-btn-secondary" style={{ padding: '16px', fontSize: '16px' }}>
                  Review Game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Mini-Tutorial */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            style={{ zIndex: 200 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="tutorial-card"
            >
              <h3 className="tutorial-title">
                <Target style={{ width: '24px', height: '24px', color: 'var(--color-accent)' }} /> Welcome to GestureChess!
              </h3>
              <p className="tutorial-desc">
                To make a move without a mouse: <br /><br />
                1. Allow <b>Camera Access</b>.<br />
                2. Hover your hand over the piece.<br />
                3. Make a <b>Pinch gesture</b> (bring thumb and index finger together) to &ldquo;grab&rdquo; it.<br />
                4. Drag your hand and release the pinch to drop.
              </p>

              <div className="tutorial-demo">
                {/* CSS Animated Ghost Hand */}
                <div className="tutorial-hand"
                  style={{
                    animation: 'tutorialHandDrag 3s infinite cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 0.8, 0.8, 1], opacity: [0.5, 1, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, times: [0, 0.2, 0.8, 1] }}
                  >
                    <Target style={{ width: '40px', height: '40px', color: 'var(--color-accent)' }} />
                  </motion.div>
                </div>
                <div className="tutorial-target" />
              </div>

              <button
                onClick={closeTutorial}
                className="tutorial-btn"
              >
                Got it, let&rsquo;s play!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
