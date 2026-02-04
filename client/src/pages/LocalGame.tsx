import { useEffect, useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';
import { RotateCcw, RefreshCw, Flag, Trophy, User, Hourglass, Download, Handshake } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { CameraPanel } from '../components/CameraPanel';
import './Game.css';

type PromotionMove = { from: Square; to: Square };

const PROMOTION_PIECES: PieceSymbol[] = ['q', 'r', 'b', 'n'];
const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

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

function generateSquareStyles(game: Chess, selectedSquare: string): Record<string, React.CSSProperties> {
  const styles: Record<string, React.CSSProperties> = {};
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

  styles[selectedSquare] = { background: 'var(--color-accent-bg)' };
  for (const move of moves) {
    const isCapture = Boolean(move.captured) || move.flags.includes('e');
    styles[move.to] = {
      background: isCapture
        ? 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 65%, transparent 66%)'
        : 'radial-gradient(circle, rgba(0, 0, 0, 0.15) 25%, transparent 26%)',
      borderRadius: '50%',
    };
  }

  return styles;
}

function playMoveSound(isCapture: boolean): void {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = isCapture ? 'square' : 'triangle';
    osc.frequency.value = isCapture ? 240 : 430;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  } catch {
    // No-op
  }
}

const PieceIcon = ({ type, color }: { type: PieceSymbol, color: 'w' | 'b' }) => {
  const map: Record<string, Record<PieceSymbol, string>> = {
    'w': { p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔' },
    'b': { p: '♟', n: '♞', b: '♝', r: '♜', q: '♛', k: '♚' }
  };
  return (
    <span className={`piece-icon ${color === 'w' ? 'white' : 'black'}`}>
      {map[color][type]}
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

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (!game.isGameOver()) {
      interval = setInterval(() => setGameDuration(d => d + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [game]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const optionSquares = useMemo(
    () => generateSquareStyles(game, selectedSquare),
    [game, selectedSquare],
  );

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
        playMoveSound(Boolean(move.captured));
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
    return requestMove(sourceSquare, targetSquare);
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
  }

  function onFlip(): void {
    setBoardOrientation(prev => prev === 'white' ? 'black' : 'white');
  }

  function downloadPGN(): void {
    const element = document.createElement("a");
    const file = new Blob([game.pgn()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "chess_game.pgn";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

  const blackPlayerCard = (
    <div className={`player-card ${game.turn() === 'b' ? 'active-turn' : 'inactive-turn'}`}>
      <div className="player-info">
        <div className="player-avatar">
          <User style={{ width: '28px', height: '28px', color: '#94A3B8' }} />
          <div className="player-status-dot"></div>
        </div>
        <div className="player-details">
          <span className="player-name">Black</span>
          <div className="player-stats">
            <span>1180</span>
            {material.b > 0 && <span className="player-material">+{material.b}</span>}
          </div>
        </div>
      </div>
      <div className={`player-clock ${game.turn() === 'b' && !game.isGameOver() ? 'active' : ''}`}>
        09:30
      </div>
    </div>
  );

  const whitePlayerCard = (
    <div className={`player-card ${game.turn() === 'w' ? 'active-turn' : 'inactive-turn'}`}>
      <div className="player-info">
        <div className="player-avatar">
          <User style={{ width: '28px', height: '28px', color: '#94A3B8' }} />
          <div className="player-status-dot"></div>
        </div>
        <div className="player-details">
          <span className="player-name">White</span>
          <div className="player-stats">
            <span>1200</span>
            {material.w > 0 && <span className="player-material">+{material.w}</span>}
          </div>
        </div>
      </div>
      <div className={`player-clock ${game.turn() === 'w' && !game.isGameOver() ? 'active' : ''}`}>
        09:45
      </div>
    </div>
  );

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
                  <div className={`history-move ${isWhiteLast ? 'active' : ''}`}>{pair.w}</div>
                  <div className={`history-move ${isBlackLast ? 'active' : ''}`}>{pair.b}</div>
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

        {/* The Board */}
        <div
          ref={boardContainerRef}
          className={`board-wrapper ${game.isCheck() ? 'check-alert' : game.turn() === 'w' ? 'turn-white' : 'turn-black'}`}
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
              darkSquareStyle: { backgroundColor: 'var(--color-board-dark, #7C8CA4)' },
              lightSquareStyle: { backgroundColor: 'var(--color-board-light, #DCE3EE)' },
              squareStyles: optionSquares,
              boardStyle: { cursor: 'pointer' },
              draggingPieceStyle: { zIndex: 9999, cursor: 'grabbing', transform: 'scale(1.1)', filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.5))' }
            }}
          />
        </div>

        {/* Bottom Player Card (You based on orientation) */}
        {boardOrientation === 'white' ? whitePlayerCard : blackPlayerCard}

        {/* Bottom Controls */}
        <div className="controls-container">
          <div className="controls-row">
            <button onClick={onUndo} disabled={!game.history().length} className="control-btn">
              <RotateCcw style={{ width: '16px', height: '16px' }} /> <span className="control-text">Undo</span>
            </button>
            <button onClick={onRedo} disabled={!redoStack.length} className="control-btn">
              <RefreshCw style={{ width: '16px', height: '16px', transform: 'scaleX(-1)' }} /> <span className="control-text">Redo</span>
            </button>
            <button onClick={onFlip} className="control-btn">
              <RefreshCw style={{ width: '16px', height: '16px' }} /> <span className="control-text">Flip Board</span>
            </button>
          </div>
          <div className="controls-row">
            <button onClick={() => { if (!game.isGameOver()) { toast.success('Draw agreed'); setManualResult('DRAW AGREED'); setShowEndModal(true); } }} className="control-btn">
              <Handshake style={{ width: '16px', height: '16px' }} /> <span className="control-text">Offer Draw</span>
            </button>
            <button onClick={() => { if (!game.isGameOver()) { toast.error('You resigned'); setManualResult(game.turn() === 'w' ? 'WHITE RESIGNED' : 'BLACK RESIGNED'); setShowEndModal(true); } }} className="control-btn danger">
              <Flag style={{ width: '16px', height: '16px' }} /> <span className="control-text">Resign</span>
            </button>
            <button onClick={onRestart} className="control-btn primary">
              <RefreshCw style={{ width: '16px', height: '16px' }} /> <span className="control-text" style={{ display: 'inline' }}>New Game</span>
            </button>
          </div>
        </div>

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

        {/* Captured Pieces Card */}
        <div className="card captured-card">
          <div className="card-header">
            <div className="card-header-title">
              <Hourglass style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} /> Captured Pieces
            </div>
          </div>
          <div className="captured-body">

            {/* White Captured */}
            <div className="captured-section">
              <span className="captured-title">White Captured</span>
              <div className="captured-icons">
                {capturedByWhite.length === 0 && <span className="captured-empty">-</span>}
                {capturedByWhite.map((p, i) => <PieceIcon key={i} type={p} color="b" />)}
              </div>
              <div className="captured-score-wrap">
                {material.w > 0 && <span className="captured-score">+{material.w}</span>}
              </div>
            </div>

            <div className="captured-divider"></div>

            {/* Black Captured */}
            <div className="captured-section">
              <span className="captured-title">Black Captured</span>
              <div className="captured-icons">
                {capturedByBlack.length === 0 && <span className="captured-empty">-</span>}
                {capturedByBlack.map((p, i) => <PieceIcon key={i} type={p} color="w" />)}
              </div>
              <div className="captured-score-wrap">
                {material.b > 0 && <span className="captured-score">+{material.b}</span>}
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
                  <PieceIcon type={piece} color={game.turn() === 'w' ? 'b' : 'w'} />
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
                {manualResult ? (manualResult.includes('RESIGNED') ? 'RESIGNATION' : 'DRAW') : (gameStatus.includes('CHECKMATE') ? 'CHECKMATE' : 'GAME OVER')}
              </h2>
              <p className="modal-subtitle" style={{ fontSize: '18px', color: '#94A3B8' }}>
                {game.isCheckmate() ? (game.turn() === 'w' ? 'Black Wins' : 'White Wins') : (manualResult || gameStatus)}
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
    </div>
  );
};
