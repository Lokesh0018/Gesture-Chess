import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { useNavigate } from 'react-router-dom';
import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';
import { RotateCcw, RefreshCw, Flag, Trophy, Download, Handshake, Volume2, VolumeX, Palette, Target, Zap, Layers, Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CameraPanel } from '../components/CameraPanel';
import './Game.css';

type Piece = 'wP' | 'wN' | 'wB' | 'wR' | 'wQ' | 'wK' | 'bP' | 'bN' | 'bB' | 'bR' | 'bQ' | 'bK';

type PromotionMove = { from: Square; to: Square };

const PROMOTION_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n'];
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const INITIAL_TIME = 600;

type PieceStyleId = 'classic' | 'character';

// UI metadata for the dropdown (label, description, colour swatches)
const PIECE_STYLES: {
  id: PieceStyleId;
  label: string;
  description: string;
  previewColors: [string, string]; // [white swatch, black swatch]
  map: Record<string, Record<PieceSymbol, string>>;
}[] = [
    {
      id: 'classic',
      label: 'Classic',
      description: 'Default',
      previewColors: ['#F8FAFC', '#1E293B'],
      map: {
        w: { p: '\u2659', n: '\u2658', b: '\u2657', r: '\u2656', q: '\u2655', k: '\u2654' },
        b: { p: '\u265f', n: '\u265e', b: '\u265d', r: '\u265c', q: '\u265b', k: '\u265a' },
      },
    },
    {
      id: 'character',
      label: 'Character',
      description: 'Cartoon Faces',
      previewColors: ['#F8FAFC', '#1E293B'],
      map: {
        w: { p: '\u2659', n: '\u2658', b: '\u2657', r: '\u2656', q: '\u2655', k: '\u2654' },
        b: { p: '\u265f', n: '\u265e', b: '\u265d', r: '\u265c', q: '\u265b', k: '\u265a' },
      },
    },
  ];

// ─── Standard SVG Chess Piece Paths (viewBox 0 0 45 45) ────────────────────
// Standard chess silhouette shapes (public-domain "Cases" set)
const SVG_PATHS: Record<PieceSymbol, string> = {
  p: 'M 22.5,9 C 20.29,9 18.5,10.79 18.5,13 C 18.5,13.89 18.79,14.71 19.28,15.38 C 17.33,16.5 16,18.59 16,21 C 16,23.03 16.94,24.84 18.41,26.03 L 17,36 H 28 L 26.59,26.03 C 28.06,24.84 29,23.03 29,21 C 29,18.59 27.67,16.5 25.72,15.38 C 26.21,14.71 26.5,13.89 26.5,13 C 26.5,10.79 24.71,9 22.5,9 Z M 14,38 C 14,38.55 14.45,39 15,39 H 30 C 30.55,39 31,38.55 31,38 V 37 H 14 Z',
  r: 'M 9,39 H 36 V 36 H 9 Z M 12,36 V 32 H 33 V 36 Z M 12.5,32 V 14 H 32.5 V 32 Z M 10,14 H 14 V 10 H 10 Z M 31,14 H 35 V 10 H 31 Z M 19,14 H 26 V 10 H 19 Z M 10,14 H 35 V 12 H 10 Z',
  n: 'M 22,10 C 19.24,10 17,11.79 17,14 C 17,15.06 17.49,16.03 18.31,16.72 C 16.44,17.86 15,20.27 15,23 C 15,25.42 16.19,27.56 18.09,28.85 L 17,36 H 28 L 26.78,28.48 C 28.39,27.08 29.5,24.9 29.5,22.5 C 29.5,19.07 27.31,16.22 24.31,15.26 C 25.23,14.61 25.8,13.55 25.8,13 C 25.8,11 24.5,10 22,10 Z M 20,12.5 C 21.5,11.8 24.5,12.3 24.5,13.5 C 24.5,14.5 22.5,15 21,15 Z M 14.5,38 H 30.5 C 31.05,38 31.5,37.55 31.5,37 V 36 H 13.5 V 37 C 13.5,37.55 13.95,38 14.5,38 Z',
  b: 'M 22.5,8 C 20,8 18,9.79 18,12 C 18,13.27 18.63,14.39 19.59,15.09 L 15,30 H 30 L 25.41,15.09 C 26.37,14.39 27,13.27 27,12 C 27,9.79 25,8 22.5,8 Z M 22.5,10 C 23.88,10 25,11.12 25,12.5 C 25,13.88 23.88,15 22.5,15 C 21.12,15 20,13.88 20,12.5 C 20,11.12 21.12,10 22.5,10 Z M 9,36 C 12.39,35.03 19.11,35.55 22.5,34 C 25.89,35.55 32.61,35.03 36,36 V 37 C 32.61,36.03 25.89,36.55 22.5,38 C 19.11,36.55 12.39,36.03 9,37 Z M 15,32 C 17.5,34.5 27.5,34.5 30,32 V 30 C 27.5,32.5 17.5,32.5 15,30 Z',
  q: 'M 6.5,13.5 A 2,2 0 1 1 6.5,13.501 M 14,10.9 A 2,2 0 1 1 14,10.901 M 22.5,8 A 2,2 0 1 1 22.5,8.001 M 31,10.9 A 2,2 0 1 1 31,10.901 M 38.5,13.5 A 2,2 0 1 1 38.5,13.501 M 9,26 C 17.5,24.5 30,24.5 36,26 L 38.5,13.5 L 31,25 L 30.7,10.9 L 22.5,24 L 14.3,10.9 L 14,25 L 6.5,13.5 Z M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,31.5 12.5,31 12,33.5 C 10.5,34.5 11,36 11,36 H 34 C 34,36 34.5,34.5 33,33.5 C 32.5,31 32.5,31.5 33.5,30 C 34.5,28 36,28 36,26 C 27.5,24.5 17.5,24.5 9,26 Z',
  k: 'M 22.5,11.63 L 22.5,6 M 20,8 H 25 M 22.5,25 C 22.5,25 27,17.5 25.5,14.5 C 25.5,14.5 24.5,12 22.5,12 C 20.5,12 19.5,14.5 19.5,14.5 C 18,17.5 22.5,25 22.5,25 Z M 11.5,37 C 17,40.5 27,40.5 33.5,37 L 34,34 C 28,38 17,38 11,34 Z M 11,34 C 17,37.5 27,37.5 34,34 L 31,25 C 26,29 19,29 14,25 Z M 14,25 C 17,27 21,28 22.5,28 C 24,28 28,27 31,25 L 31.5,22.5 C 27.5,25.5 17.5,25.5 13.5,22.5 Z M 13.5,22.5 C 15,24 21,26 22.5,26 C 24,26 30,24 31.5,22.5 L 34,17.5 C 29,21.5 16,21.5 11,17.5 Z M 11,17.5 C 12.5,20 18.5,22.5 22.5,22.5 C 26.5,22.5 32.5,20 34,17.5 L 33.5,15 C 29,18.5 16,18.5 11.5,15 Z',
};

const CHARACTER_SVG_PATHS: Record<PieceSymbol, string> = {
  k: '<path d="M 8,18 L 10,8 L 17,14 L 22.5,6 L 28,14 L 35,8 L 37,18 Z" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/><path d="M 10,18 Q 5,28 12,35 Q 22.5,45 33,35 Q 40,28 35,18 Z" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/><path d="M 15,18 Q 12,24 15,28 Q 22.5,32 30,28 Q 33,24 30,18 Z" fill="FACE" stroke="none"/><circle cx="19" cy="23" r="1.5" fill="EYE" class="eye-blink" stroke="none"/><circle cx="26" cy="23" r="1.5" fill="EYE" class="eye-blink" stroke="none"/><path d="M 17,20.5 L 21,21" stroke="EYE" class="eye-blink" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M 28,20.5 L 24,21" stroke="EYE" class="eye-blink" stroke-width="1.5" stroke-linecap="round" fill="none"/><path d="M 18,29 Q 22.5,27 27,29 Q 22.5,31 18,29" fill="EYE" stroke="none"/>',
  q: '<path d="M 6,18 L 8,10 L 15,14 L 22.5,8 L 30,14 L 37,10 L 39,18 Z" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/><path d="M 8,18 Q 2,28 8,40 L 37,40 Q 43,28 37,18 Z" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/><path d="M 14,18 Q 10,26 14,32 Q 22.5,36 31,32 Q 35,26 31,18 Z" fill="FACE" stroke="none"/><circle cx="20" cy="23" r="1.5" fill="EYE" class="eye-blink" stroke="none"/><circle cx="25" cy="23" r="1.5" fill="EYE" class="eye-blink" stroke="none"/><path d="M 21.5,29 C 22,30 23,30 23.5,29" stroke="EYE" class="eye-blink" stroke-width="1.5" stroke-linecap="round" fill="none"/>',
  b: '<path d="M 12,20 L 22.5,4 L 33,20 Z" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/><path d="M 22.5,8 L 22.5,14 M 19.5,11 L 25.5,11" fill="FACE" stroke-width="1.5" stroke="none"/><path d="M 14,20 Q 9,28 14,35 Q 22.5,42 31,35 Q 36,28 31,20 Z" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/><path d="M 16,20 Q 13,26 16,30 Q 22.5,33 29,30 Q 32,26 29,20 Z" fill="FACE" stroke="none"/><circle cx="20" cy="24" r="1.5" fill="EYE" class="eye-blink" stroke="none"/><circle cx="25" cy="24" r="1.5" fill="EYE" class="eye-blink" stroke="none"/><path d="M 14,36 L 31,36 L 35,42 L 10,42 Z" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/>',
  n: '<path d="M 28,10 Q 35,15 32,28 Q 28,40 18,40 L 10,40 Q 12,30 15,25 L 10,20 Q 12,12 20,8 Z" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/><path d="M 24,12 Q 30,15 28,26 Q 24,35 18,36 L 14,36 Q 16,30 18,25 L 14,21 Q 16,14 22,12 Z" fill="FACE" stroke="none"/><circle cx="21" cy="18" r="1.5" fill="EYE" class="eye-blink" stroke="none"/><circle cx="16" cy="23" r="1" fill="EYE" class="eye-blink" stroke="none"/><path d="M 30,10 L 26,4 L 23,9 Z" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/>',
  r: '<path d="M 12,8 H 33 V 15 H 12 Z M 10,15 H 35 V 40 H 10 Z" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/><path d="M 10,8 H 15 V 4 H 10 Z M 20,8 H 25 V 4 H 20 Z M 30,8 H 35 V 4 H 30 Z" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/><path d="M 14,18 H 31 V 32 H 14 Z" fill="FACE" stroke="none"/><rect x="18" y="22" width="3" height="3" fill="EYE" class="eye-blink" stroke="none"/><rect x="24" y="22" width="3" height="3" fill="EYE" class="eye-blink" stroke="none"/><path d="M 19,29 H 26" stroke="EYE" class="eye-blink" stroke-width="2" fill="none"/>',
  p: '<circle cx="22.5" cy="14" r="8" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/><path d="M 14,20 Q 10,32 15,38 L 30,38 Q 35,32 31,20 Z" fill="OUTLINE" stroke="OUTLINE" stroke-width="1"/><path d="M 16,20 Q 14,28 17,32 Q 22.5,35 28,32 Q 31,28 29,20 Z" fill="FACE" stroke="none"/><circle cx="20" cy="24" r="1.5" fill="EYE" class="eye-blink" stroke="none"/><circle cx="25" cy="24" r="1.5" fill="EYE" class="eye-blink" stroke="none"/>',
};

type PieceRenderObject = Record<string, (props?: { fill?: string; square?: string; svgStyle?: React.CSSProperties }) => React.JSX.Element>;

const PIECE_CODE_META: Record<string, { type: PieceSymbol; isWhite: boolean }> = {
  wK: { type: 'k', isWhite: true }, wQ: { type: 'q', isWhite: true },
  wR: { type: 'r', isWhite: true }, wB: { type: 'b', isWhite: true },
  wN: { type: 'n', isWhite: true }, wP: { type: 'p', isWhite: true },
  bK: { type: 'k', isWhite: false }, bQ: { type: 'q', isWhite: false },
  bR: { type: 'r', isWhite: false }, bB: { type: 'b', isWhite: false },
  bN: { type: 'n', isWhite: false }, bP: { type: 'p', isWhite: false },
};

function ChessPieceSVG({ code, styleId }: { code: string; styleId: PieceStyleId }): React.JSX.Element {
  const { type, isWhite } = PIECE_CODE_META[code];
  const d = SVG_PATHS[type];

  if (styleId === 'classic') {
    return (
      <svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%', overflow: 'visible', filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.3))' }}>
        <path d={d} fill={isWhite ? '#ffffff' : '#000000'} stroke={isWhite ? '#000000' : '#ffffff'} strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    );
  }

  if (styleId === 'character') {
    const outlineColor = isWhite ? '#1E293B' : '#F8FAFC'; // White pieces have dark outline, black pieces have light outline
    const faceColor = isWhite ? '#F8FAFC' : '#1E293B';
    const eyeColor = outlineColor;
    const rawSvg = CHARACTER_SVG_PATHS[type]
      .replace(/FACE/g, faceColor)
      .replace(/EYE/g, eyeColor)
      .replace(/OUTLINE/g, outlineColor);

    return (
      <svg className="piece-breathe" viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg"
        style={{ width: '100%', height: '100%', overflow: 'visible', filter: 'drop-shadow(0 4px 4px rgba(0,0,0,0.4))' }}>
        <g dangerouslySetInnerHTML={{ __html: rawSvg }} />
      </svg>
    );
  }

  return <svg viewBox="0 0 45 45" />;
}

const ALL_PIECE_CODES = ['wK', 'wQ', 'wR', 'wB', 'wN', 'wP', 'bK', 'bQ', 'bR', 'bB', 'bN', 'bP'];

function buildCustomPieces(styleId: PieceStyleId, blindfold: boolean): PieceRenderObject | undefined {
  if (blindfold) {
    const obj: Record<string, any> = {};
    for (const code of ALL_PIECE_CODES) obj[code] = () => <svg viewBox="0 0 45 45" />;
    return obj as PieceRenderObject;
  }
  if (styleId === 'classic') return undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const obj: Record<string, any> = {};
  for (const code of ALL_PIECE_CODES) {
    const c = code;
    obj[c] = () => <ChessPieceSVG code={c} styleId={styleId} />;
  }
  return obj as PieceRenderObject;
}

const AdvantageGraph = ({ gameHistory }: { gameHistory: string[] }) => {
  const data = [0]; 
  const values = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  const tempGame = new Chess();
  
  gameHistory.forEach(move => {
    tempGame.move(move);
    let wScore = 0;
    let bScore = 0;
    tempGame.board().forEach(row => row.forEach(piece => {
      if (piece) {
        if (piece.color === 'w') wScore += values[piece.type as keyof typeof values];
        else bScore += values[piece.type as keyof typeof values];
      }
    }));
    data.push(wScore - bScore);
  });

  const max = Math.max(...data, 5);
  const min = Math.min(...data, -5);
  const range = max - min;
  const width = 300;
  const height = 100;
  
  const points = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' L ');
  
  const zeroY = height - ((0 - min) / range) * height;

  return (
    <div style={{ width: '100%', marginTop: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
      <div style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', textAlign: 'center' }}>Advantage Over Time</div>
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ overflow: 'visible' }}>
        <line x1="0" y1={zeroY} x2={width} y2={zeroY} stroke="#94A3B8" strokeWidth="1" strokeDasharray="4" />
        <path d={`M ${points}`} fill="none" stroke="var(--color-accent)" strokeWidth="2" />
        {data.length > 0 && (
          <circle cx={width} cy={height - ((data[data.length - 1] - min) / range) * height} r="4" fill="var(--color-accent)" />
        )}
      </svg>
    </div>
  );
};

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

function generateSquareStyles(game: Chess, selectedSquare: string, hoveredMove: { from: string, to: string } | null, premove: { from: Square, to: Square } | null): Record<string, React.CSSProperties> {
  const styles: Record<string, React.CSSProperties> = {};

  const history = game.history({ verbose: true });
  if (history.length > 0) {
    const last = history[history.length - 1];
    styles[last.from] = { backgroundColor: 'rgba(234, 179, 8, 0.4)', transition: 'background-color 0.4s ease-out' };
    styles[last.to] = { backgroundColor: 'rgba(234, 179, 8, 0.6)', transition: 'background-color 0.4s ease-out' };
  }

  if (hoveredMove) {
    styles[hoveredMove.from] = { ...styles[hoveredMove.from], backgroundColor: 'rgba(59, 130, 246, 0.5)' };
    styles[hoveredMove.to] = { ...styles[hoveredMove.to], backgroundColor: 'rgba(59, 130, 246, 0.5)' };
  }

  if (premove) {
    styles[premove.from] = { ...styles[premove.from], backgroundColor: 'rgba(235, 97, 80, 0.5)' };
    styles[premove.to] = { ...styles[premove.to], backgroundColor: 'rgba(235, 97, 80, 0.8)' };
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

export function LocalGame() {
  const navigate = useNavigate();
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [selectedSquare, setSelectedSquare] = useState('');
  const [redoStack, setRedoStack] = useState<Array<{ from: string; to: string; promotion?: PieceSymbol }>>([]);
  const [pendingPromotion, setPendingPromotion] = useState<PromotionMove | null>(null);

  const [capturedByWhite, setCapturedByWhite] = useState<PieceSymbol[]>([]);
  const [capturedByBlack, setCapturedByBlack] = useState<PieceSymbol[]>([]);
  const [showEndModal, setShowEndModal] = useState(false);
  const [showSetupModal, setShowSetupModal] = useState(true);
  const [setupModalPage, setSetupModalPage] = useState<'main' | 'custom'>('main');
  const [gameDuration, setGameDuration] = useState(0);
  const [premove, setPremove] = useState<{ from: Square, to: Square } | null>(null);
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

  // Advanced features state
  const [flipState, setFlipState] = useState<'normal' | 'flipping-out' | 'flipping-in'>('normal');
  const [confirmAction, setConfirmAction] = useState<'resign' | 'draw' | null>(null);
  const [blindfoldMode, setBlindfoldMode] = useState(false);
  const [setupMode, setSetupMode] = useState(false);
  const [emoteW, setEmoteW] = useState<string | null>(null);
  const [emoteB, setEmoteB] = useState<string | null>(null);
  
  // Batch 2 features
  const [whiteName, setWhiteName] = useState('White');
  const [blackName, setBlackName] = useState('Black');
  const [editingName, setEditingName] = useState<'w' | 'b' | null>(null);
  const [reviewFen, setReviewFen] = useState<string | null>(null);

  const turnRef = useRef(game.turn());
  const timeoutHandledRef = useRef(false);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const pieceStyleDropdownRef = useRef<HTMLDivElement>(null);

  // Execute Premove
  useEffect(() => {
    if (premove && !game.isGameOver()) {
      const pieceObj = game.get(premove.from);
      if (pieceObj && pieceObj.color === game.turn()) {
        const success = requestMove(premove.from, premove.to);
        if (!success) {
          setBoardShake(true);
          setTimeout(() => setBoardShake(false), 500);
        }
        setPremove(null);
      }
    }
  }, [game.fen()]);

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
    () => generateSquareStyles(game, selectedSquare, hoveredMove, premove),
    [game, selectedSquare, hoveredMove, premove],
  );

  // Recompute custom board pieces whenever piece style or blindfold changes
  // undefined = use default react-chessboard SVG (classic)
  const customPieces = useMemo<PieceRenderObject | undefined>(() => buildCustomPieces(pieceStyle, blindfoldMode), [pieceStyle, blindfoldMode]);


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
      if (game.isCheckmate()) {
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ef4444', '#3b82f6', '#f59e0b', '#10b981']
        });
      }
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onPieceDrop(sourceOrArgs: any, target?: string | null, pieceStr?: string): boolean {
    let sourceSquare: string;
    let targetSquare: string | null;
    let piece: string | undefined;
    if (typeof sourceOrArgs === 'object') {
      sourceSquare = sourceOrArgs.sourceSquare;
      targetSquare = sourceOrArgs.targetSquare;
      piece = sourceOrArgs.piece;
    } else {
      sourceSquare = sourceOrArgs;
      targetSquare = target || null;
      piece = pieceStr;
    }

    if (setupMode) {
      if (!targetSquare && sourceSquare !== 'spare') {
        game.remove(sourceSquare as Square);
        setGame(new Chess(game.fen()));
        return true;
      }
      if (targetSquare === 'spare') return true;
      if (sourceSquare !== 'spare') game.remove(sourceSquare as Square);
      if (piece) {
        const type = piece.charAt(1).toLowerCase() as PieceSymbol;
        const color = piece.charAt(0) as Color;
        try {
          game.put({ type, color }, targetSquare as Square);
          setGame(new Chess(game.fen()));
          return true;
        } catch { return false; }
      }
      return false;
    }

    if (!targetSquare) return false;
    const sourcePiece = game.get(sourceSquare as Square);
    
    // Premove logic
    if (sourcePiece && sourcePiece.color !== game.turn()) {
      setPremove({ from: sourceSquare as Square, to: targetSquare as Square });
      return false; // Snap back, it's a premove
    }
    
    if (!sourcePiece) return false;

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

  function startNewGame(withSetup: boolean, customGame: Chess | null = null): void {
    const fresh = customGame || new Chess();
    setGame(fresh);
    setSelectedSquare('');
    setRedoStack([]);
    setPendingPromotion(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setShowEndModal(false);
    setShowSetupModal(false);
    setSetupModalPage('main');
    setGameDuration(0);
    setManualResult(null);
    if (!withSetup) {
      setWhiteTime(INITIAL_TIME);
      setBlackTime(INITIAL_TIME);
    }
    setSetupMode(withSetup);
    setReviewFen(null);
    timeoutHandledRef.current = false;
  }

  function onFlip(): void {
    if (flipState !== 'normal') return;
    setFlipState('flipping-out');
    setTimeout(() => {
      setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
      setFlipState('flipping-in');
      setTimeout(() => setFlipState('normal'), 50);
    }, 400);
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

  function handleReviewMove(moveIndex: number, isWhite: boolean) {
    if (moveIndex === -1) {
      setReviewFen(null); // Return to live game
      return;
    }
    const tempGame = new Chess();
    const history = game.history();
    const limit = moveIndex * 2 + (isWhite ? 0 : 1);
    for (let i = 0; i <= limit && i < history.length; i++) {
      tempGame.move(history[i]);
    }
    setReviewFen(tempGame.fen());
  }

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case 'ArrowLeft':
          onUndo();
          break;
        case 'ArrowRight':
          onRedo();
          break;
        case 'f':
        case 'F':
          if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          } else {
            document.exitFullscreen().catch(() => {});
          }
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game, redoStack]);

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

  const handleEmote = (playerColor: 'w' | 'b') => {
    const emojis = ['😅', '🏆', '👏', '🤔', '🔥', '💀'];
    const random = emojis[Math.floor(Math.random() * emojis.length)];
    if (playerColor === 'w') {
      setEmoteW(random);
      setTimeout(() => setEmoteW(null), 2000);
    } else {
      setEmoteB(random);
      setTimeout(() => setEmoteB(null), 2000);
    }
  };

  const currentStyle = PIECE_STYLES.find(s => s.id === pieceStyle) || PIECE_STYLES[0];

  const makePlayerCard = (color: 'w' | 'b') => {
    const isActive = game.turn() === color && !game.isGameOver() && !manualResult;
    const timeLeft = color === 'w' ? whiteTime : blackTime;
    const label = color === 'w' ? whiteName : blackName;
    const kingSymbol = <div style={{ width: 28, height: 28 }}><ChessPieceSVG code={color === 'w' ? 'wK' : 'bK'} styleId={pieceStyle} /></div>;
    const isLowTime = timeLeft <= 30 && isActive;

    return (
      <div className={`player-card ${isActive ? 'active-turn' : 'inactive-turn'}`}>
        {/* Active turn glow bar */}
        {isActive && <div className="player-card-active-bar" />}

        <div className="player-info">
          {/* King avatar */}
          <div className={`player-avatar player-avatar-${color}`} onClick={() => handleEmote(color)} style={{ cursor: 'pointer' }} title="Click to emote!">
            <span className="player-king-icon">{kingSymbol}</span>
            <div className="player-status-dot" />
            {color === 'w' && emoteW && <div className="emote-popup">{emoteW}</div>}
            {color === 'b' && emoteB && <div className="emote-popup">{emoteB}</div>}
          </div>

          {/* Name + captured */}
          <div className="player-details">
            <div className="player-name-row">
              {editingName === color ? (
                <input
                  type="text"
                  autoFocus
                  value={color === 'w' ? whiteName : blackName}
                  onChange={(e) => color === 'w' ? setWhiteName(e.target.value) : setBlackName(e.target.value)}
                  onBlur={() => setEditingName(null)}
                  onKeyDown={(e) => e.key === 'Enter' && setEditingName(null)}
                  className="player-name-input"
                  style={{
                    background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-color)',
                    padding: '2px 4px', borderRadius: '4px', outline: 'none', width: '100px', fontSize: '15px'
                  }}
                />
              ) : (
                <span className="player-name" onClick={() => setEditingName(color)} style={{ cursor: 'pointer' }} title="Click to edit name">{label}</span>
              )}
              {isActive && <span className="player-turn-badge">Your Turn</span>}
            </div>
            <div className="player-captured-row">
              {color === 'w' ? (
                <>
                  {capturedByWhite.sort((a, b) => { const v: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1, k: 0 }; return v[b] - v[a]; }).map((p, i) => (
                    <span key={i} style={{ width: '16px', height: '16px', display: 'inline-block' }}><ChessPieceSVG code={`b${p.toUpperCase()}`} styleId={pieceStyle} /></span>
                  ))}
                  {material.w > 0 && <span className="player-material">+{material.w}</span>}
                </>
              ) : (
                <>
                  {capturedByBlack.sort((a, b) => { const v: Record<string, number> = { q: 9, r: 5, b: 3, n: 3, p: 1, k: 0 }; return v[b] - v[a]; }).map((p, i) => (
                    <span key={i} style={{ width: '16px', height: '16px', display: 'inline-block' }}><ChessPieceSVG code={`w${p.toUpperCase()}`} styleId={pieceStyle} /></span>
                  ))}
                  {material.b > 0 && <span className="player-material">+{material.b}</span>}
                </>
              )}
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
    <div className="game-page game-grid" data-theme={boardTheme}>

      {/* Left Column: Move History */}
      <div className="column-left">
        <div className="card history-card">
          <div className="card-header">
            <div className="card-header-title">Move History</div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => {
                navigator.clipboard.writeText(game.fen());
                toast.success('FEN copied to clipboard!');
              }} className="nav-btn-icon" title="Copy FEN" style={{ padding: '0', width: '20px', height: '20px' }}>
                <Copy style={{ width: '20px', height: '20px' }} />
              </button>
              <button onClick={downloadPGN} className="nav-btn-icon" title="Download PGN" style={{ padding: '0', width: '20px', height: '20px' }}>
                <Download style={{ width: '20px', height: '20px' }} />
              </button>
            </div>
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
                    onClick={() => handleReviewMove(i, true)}
                    onMouseEnter={() => { const m = game.history({ verbose: true })[i * 2]; if (m) setHoveredMove({ from: m.from, to: m.to }); }}
                    onMouseLeave={() => setHoveredMove(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    {renderMove(pair.w, 'w')}
                  </div>
                  <div
                    className={`history-move ${isBlackLast ? 'active' : ''}`}
                    onClick={() => pair.b && handleReviewMove(i, false)}
                    onMouseEnter={() => { const m = game.history({ verbose: true })[i * 2 + 1]; if (m) setHoveredMove({ from: m.from, to: m.to }); }}
                    onMouseLeave={() => setHoveredMove(null)}
                    style={{ cursor: pair.b ? 'pointer' : 'default' }}
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

          {/* Eval Bar */}
          <div className={`eval-bar-container ${boardOrientation === 'black' ? 'black-oriented' : ''}`}>
            <div className="eval-bar-fill" style={{ height: `${Math.max(5, Math.min(95, 50 + (material.w - material.b) * 4))}%` }} />
          </div>

          <div className="captured-sidebar">
            <span className="captured-sidebar-label">White<br />Captured</span>
            {material.b > 0 && <span className="captured-sidebar-advantage">+{material.b}</span>}
            <div className="captured-sidebar-grid">
              {capturedByBlack.map((p, i) => (
                <div key={`w-${i}`} className="captured-sidebar-piece" style={{ width: '24px', height: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
                  <ChessPieceSVG code={("w" + p.toUpperCase()) as Piece} styleId={pieceStyle} />
                </div>
              ))}
            </div>
          </div>

          <div
            ref={boardContainerRef}
            className={`board-wrapper board-flip-wrapper ${flipState === 'flipping-out' ? 'board-flip-out' : flipState === 'flipping-in' ? 'board-flip-in' : ''} ${boardShake ? 'shake-error' : ''} ${game.isCheck() ? 'check-alert' : game.turn() === 'w' ? 'turn-white' : 'turn-black'}`}
            style={{ height: '100%', maxHeight: '100%', flexShrink: 1, minWidth: 0, minHeight: 0, display: 'flex', justifyContent: 'center', position: 'relative' }}
          >
            <Chessboard
              options={{
                id: "LocalBoard",
                position: reviewFen || game.fen(),
                onPieceDrop: (args: any, arg2?: any, arg3?: any) => {
                  if (reviewFen) {
                    setReviewFen(null);
                    setTimeout(() => onPieceDrop(args, arg2, arg3), 0);
                    return false;
                  }
                  return onPieceDrop(args, arg2, arg3);
                },
                onPieceClick: (args: any) => {
                  if (reviewFen) setReviewFen(null);
                  else {
                    if (premove) setPremove(null);
                    onPieceClick(args);
                  }
                },
                onSquareClick: (sq: any) => {
                  if (reviewFen) setReviewFen(null);
                  else {
                    if (premove) setPremove(null);
                    onSquareClick(sq);
                  }
                },
                onSquareRightClick: () => {
                  if (reviewFen) setReviewFen(null);
                  else if (premove) setPremove(null);
                  else setSelectedSquare('');
                },
                allowDragging: true,
                boardOrientation: boardOrientation,
                allowDragOffBoard: true,
                // dropOffBoardAction: setupMode ? 'trash' : 'snapback',
                animationDurationInMs: 300,
                showNotation: true,
                darkSquareNotationStyle: { fontWeight: 'bold', fontSize: '14px', opacity: 0.8 },
                lightSquareNotationStyle: { fontWeight: 'bold', fontSize: '14px', opacity: 0.8 },
                darkSquareStyle: { backgroundColor: getThemeStyles().dark, transition: 'background-color 0.4s ease' },
                lightSquareStyle: { backgroundColor: getThemeStyles().light, transition: 'background-color 0.4s ease' },
                squareStyles: optionSquares,
                boardStyle: { cursor: 'pointer' },
                draggingPieceStyle: { zIndex: 9999, cursor: 'grabbing', transform: 'scale(1.1)', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.5))' },
                pieces: customPieces
              }}
            />
          </div>

          {/* Black pieces killed by white (White's captures) */}
          <div className="captured-sidebar">
            <span className="captured-sidebar-label">Black<br />Captured</span>
            {material.w > 0 && <span className="captured-sidebar-advantage">+{material.w}</span>}
            <div className="captured-sidebar-grid">
              {capturedByWhite.map((p, i) => (
                <div key={`b-${i}`} className="captured-sidebar-piece" style={{ width: '24px', height: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }}>
                  <ChessPieceSVG code={("b" + p.toUpperCase()) as Piece} styleId={pieceStyle} />
                </div>
              ))}
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
                <button onClick={() => { if (!game.isGameOver()) setConfirmAction('draw'); }} className="control-btn" aria-label="Offer Draw" tabIndex={0}>
                  <Handshake style={{ width: '16px', height: '16px' }} /> <span className="control-text">Draw</span>
                </button>
                <button onClick={() => { if (!game.isGameOver()) setConfirmAction('resign'); }} className="control-btn danger" aria-label="Resign" tabIndex={0}>
                  <Flag style={{ width: '16px', height: '16px' }} /> <span className="control-text">Resign</span>
                </button>
              </div>
              <div className="controls-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <button onClick={() => setBlindfoldMode(!blindfoldMode)} className={`control-btn ${blindfoldMode ? 'active' : ''}`} aria-label="Blindfold Mode">
                  <span className="control-text">{blindfoldMode ? 'Disable Blindfold' : 'Blindfold'}</span>
                </button>
                <button onClick={() => setSetupMode(!setupMode)} className={`control-btn ${setupMode ? 'active' : ''}`} aria-label="Setup Mode">
                  <span className="control-text">Setup Mode</span>
                </button>
                <button onClick={() => {
                  if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                  } else {
                    document.exitFullscreen().catch(() => {});
                  }
                }} className="control-btn" aria-label="Fullscreen">
                  <span className="control-text">Fullscreen</span>
                </button>
              </div>
              <div className="controls-row" style={{ gridTemplateColumns: '1fr' }}>
                <button onClick={() => setShowSetupModal(true)} className="control-btn primary" aria-label="New Game" tabIndex={0}>
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
                        {[{ id: 'classic', label: 'Classic', icon: '♟️' }, { id: 'wood', label: 'Wood', icon: '🪵' }, { id: 'neon', label: 'Neon', icon: '⚡' }].map(t => (
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
                    style={{ width: '100%', padding: '6px 12px' }}
                    onClick={() => { setPieceStyleDropdownOpen(v => !v); setThemeDropdownOpen(false); }}
                  >
                    <Layers style={{ width: '15px', height: '15px', flexShrink: 0 }} />
                    <span className="control-text">
                      Pieces: <span style={{ color: 'var(--color-accent)' }}>{currentStyle.label}</span>
                    </span>
                    <span style={{ marginLeft: 'auto', width: '20px', height: '20px' }}>
                      <ChessPieceSVG code="wK" styleId={pieceStyle} />
                    </span>
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
                              <span style={{ width: '24px', height: '24px' }}><ChessPieceSVG code="wK" styleId={s.id} /></span>
                              <span style={{ width: '24px', height: '24px' }}><ChessPieceSVG code="bK" styleId={s.id} /></span>
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', width: '100%', marginTop: '16px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Moves</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{Math.ceil(game.history().length / 2)}</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Captures</div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff' }}>{capturedByWhite.length + capturedByBlack.length}</div>
                </div>
              </div>
              
              <AdvantageGraph gameHistory={game.history()} />
              <div style={{ width: '100%', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => { setShowSetupModal(true); setShowEndModal(false); }} className="modal-btn-primary" style={{ padding: '16px', fontSize: '16px' }}>
                  Play Again
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => navigate('/analysis', { state: { pgn: game.pgn() } })} className="modal-btn-secondary flex-1" style={{ padding: '12px', fontSize: '14px', background: 'var(--color-primary)' }}>
                    Analyze Game
                  </button>
                  <button onClick={() => setShowEndModal(false)} className="modal-btn-secondary flex-1" style={{ padding: '12px', fontSize: '14px' }}>
                    Review Board
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => { navigator.clipboard.writeText(game.pgn()); toast.success('PGN copied to clipboard'); }} className="modal-btn-secondary flex-1" style={{ padding: '12px', fontSize: '14px', opacity: 0.8 }}>
                    Copy PGN
                  </button>
                  <button onClick={() => { navigator.clipboard.writeText(game.fen()); toast.success('FEN copied to clipboard'); }} className="modal-btn-secondary flex-1" style={{ padding: '12px', fontSize: '14px', opacity: 0.8 }}>
                    Copy FEN
                  </button>
                </div>
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

        {/* Confirm Action Modal */}
        {confirmAction && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="modal-box center relative z-10" initial={{ scale: 0.8, y: 50, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}>
              <h2 className="modal-title" style={{ fontSize: '32px' }}>Are you sure?</h2>
              <p className="modal-subtitle" style={{ fontSize: '18px', color: '#94A3B8' }}>
                Do you really want to {confirmAction}?
              </p>
              <div style={{ width: '100%', marginTop: '24px', display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    if (confirmAction === 'resign') setManualResult(`${game.turn() === 'w' ? 'WHITE' : 'BLACK'} RESIGNED`);
                    else if (confirmAction === 'draw') setManualResult('DRAW AGREED');
                    setShowEndModal(true);
                    setConfirmAction(null);
                  }}
                  className="modal-btn-primary"
                >
                  Yes, {confirmAction}
                </button>
                <button onClick={() => setConfirmAction(null)} className="modal-btn-secondary">Cancel</button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Pre-Game Setup Modal */}
        {showSetupModal && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ zIndex: 300 }}>
            <motion.div className="modal-box center relative z-10" initial={{ scale: 0.8, y: 50, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }}>
              {setupModalPage === 'main' ? (
                <>
                  <h2 className="modal-title" style={{ fontSize: '32px' }}>Start New Game</h2>
                  <p className="modal-subtitle" style={{ fontSize: '18px', color: '#94A3B8' }}>
                    How would you like to configure this game?
                  </p>
                  <div style={{ width: '100%', marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button onClick={() => startNewGame(false)} className="modal-btn-primary" style={{ padding: '16px', fontSize: '16px' }}>
                      Standard Game (10 min)
                    </button>
                    <button onClick={() => setSetupModalPage('custom')} className="modal-btn-secondary" style={{ padding: '16px', fontSize: '16px' }}>
                      Custom Setup (Time Odds & Material)
                    </button>
                    {(game.history().length > 0 && !game.isGameOver()) && (
                      <button onClick={() => { setShowSetupModal(false); setSetupModalPage('main'); }} className="modal-btn-secondary" style={{ padding: '16px', fontSize: '16px', opacity: 0.7 }}>
                        Cancel (Return to Game)
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <h2 className="modal-title" style={{ fontSize: '32px' }}>Custom Setup</h2>
                  <p className="modal-subtitle" style={{ fontSize: '18px', color: '#94A3B8', marginBottom: '8px' }}>
                    Configure time odds. Adjust material by dragging pieces off the board once the game starts.
                  </p>
                  <div style={{ width: '100%', marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>White Time (s)</label>
                        <input type="number" value={whiteTime} onChange={(e) => setWhiteTime(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '16px', outline: 'none' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Black Time (s)</label>
                        <input type="number" value={blackTime} onChange={(e) => setBlackTime(Math.max(0, parseInt(e.target.value) || 0))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.2)', color: '#fff', fontSize: '16px', outline: 'none' }} />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                      <button onClick={() => startNewGame(true)} className="modal-btn-primary" style={{ padding: '16px', fontSize: '16px', flex: 2 }}>
                        Start Custom Game
                      </button>
                      <button onClick={() => setSetupModalPage('main')} className="modal-btn-secondary" style={{ padding: '16px', fontSize: '16px', flex: 1 }}>
                        Back
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
