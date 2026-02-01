import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { useNavigate } from 'react-router-dom';
import { audio } from './audio-manager';
import { vfx } from './vfx-manager';
import CheckIndicator from './CheckIndicator';
import GameLayout from './GameLayout';
import type { MoveHistory } from './GameLayout';
import PromotionCinematic from './PromotionCinematic';
import CaptureAnimation from './CaptureAnimation';
import PostGameModal from './PostGameModal';
import GameStartSequence from './GameStartSequence';
import FlyingPiece from './FlyingPiece';

import Piece from './Piece';

const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
const customPieces = pieces.reduce((res: any, p) => {
  const color = p[0] as 'w' | 'b';
  const type = p[1] as 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
  res[p] = ({ squareWidth, isDragging, square }: any) => (
    <Piece type={type} color={color} squareWidth={squareWidth} isDragging={isDragging} square={square} />
  );
  return res;
}, {});

const actionBtnStyle = {
  padding: '12px 24px',
  backgroundColor: 'var(--bg-glass)',
  color: 'var(--text-main)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer',
  backdropFilter: 'blur(10px)',
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
};

export default function LocalGame() {
  const [game, setGame] = useState(new Chess());
  const [boardWidth, setBoardWidth] = useState(window.innerWidth > 850 ? 500 : window.innerWidth - 60);
  const [cinematic, setCinematic] = useState<{ square: string, color: 'w' | 'b', type: 'q' | 'r' | 'b' | 'n' } | null>(null);
  const [captureAnim, setCaptureAnim] = useState<{ square: string, pieceType: 'P' | 'N' | 'B' | 'R' | 'Q' | 'K', pieceColor: 'w' | 'b', capturedBy: 'white' | 'black' } | null>(null);
  const [checkState, setCheckState] = useState<{ king: string, attacker: string | null } | null>(null);
  const [checkmateState, setCheckmateState] = useState<{ color: 'w' | 'b', text: string } | null>(null);
  const [undoAnim, setUndoAnim] = useState<{ from: string, to: string, pieceType: string, pieceColor: string } | null>(null);
  const [gameOverMsg, setGameOverMsg] = useState<string | null>(null);
  const [showActions, setShowActions] = useState(false);
  const navigate = useNavigate();

  const timingSetting = localStorage.getItem('match_timing') || '10';
  const orientationSetting = localStorage.getItem('match_orientation') || 'auto';
  const boardOrientation = orientationSetting === 'auto' ? 'white' : orientationSetting as 'white' | 'black';

  const [timeWhite, setTimeWhite] = useState(parseInt(timingSetting) * 60);
  const [timeBlack, setTimeBlack] = useState(parseInt(timingSetting) * 60);

  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [previewFen, setPreviewFen] = useState<string | null>(null);
  const [promotionSquare, setPromotionSquare] = useState<string | null>(null);
  const moveFromRef = useRef<string | null>(null);
  const promoteToRef = useRef<string | null>(null);

  const isGameOver = !!(gameOverMsg || checkmateState || game.isDraw());

  useEffect(() => {
    const handleResize = () => setBoardWidth(window.innerWidth > 850 ? 500 : window.innerWidth - 60);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (checkmateState) {
      document.body.setAttribute('data-def-color', checkmateState.color);
      document.body.setAttribute('data-win-color', checkmateState.color === 'w' ? 'b' : 'w');
    } else {
      document.body.removeAttribute('data-def-color');
      document.body.removeAttribute('data-win-color');
    }
  }, [checkmateState]);

  useEffect(() => {

    // cleanup in-check classes
    document.querySelectorAll('.in-check').forEach(el => el.classList.remove('in-check'));

    if (game.isCheckmate()) {
      audio.playBassDrop();
      setCheckmateState({ color: game.turn(), text: 'CHECKMATE' });
      setCheckState(null);
    } else if ((typeof game.inCheck === 'function' ? game.inCheck() : (game as any).isCheck?.())) {
      let kSq = '';
      const board = game.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r][c]?.type === 'k' && board[r][c]?.color === game.turn()) {
            kSq = String.fromCharCode(97 + c) + (8 - r);
          }
        }
      }
      const history = game.history({ verbose: true }) as any[];
      const lastMove = history[history.length - 1];
      setCheckState({ king: kSq, attacker: lastMove ? lastMove.to : null });
      setCheckmateState(null);
      // apply in-check to square
      const sqEl = document.querySelector(`[data-square="${kSq}"]`);
      if (sqEl) sqEl.classList.add('in-check');

      // Play check audio
      audio.check();
    } else {
      setCheckState(null);
      setCheckmateState(null);
    }
  }, [game.fen()]);

  useEffect(() => {
    if (isGameOver || game.history().length === 0) return;
    const interval = setInterval(() => {
      if (game.turn() === 'w') {
        setTimeWhite(t => {
          if (t <= 1) setGameOverMsg('Black Wins on Time!');
          return Math.max(0, t - 1);
        });
      } else {
        setTimeBlack(t => {
          if (t <= 1) setGameOverMsg('White Wins on Time!');
          return Math.max(0, t - 1);
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [game.fen(), isGameOver]);

  useEffect(() => {
    if (timeWhite < 10 || timeBlack < 10) {
      document.body.classList.add('critical-time');
      audio.playThud(); // could be heartbeat
    } else {
      document.body.classList.remove('critical-time');
    }
    return () => document.body.classList.remove('critical-time');
  }, [timeWhite, timeBlack]);

  function makeAMove(move: any) {
    if (gameOverMsg) return null;
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    try {
      const result = gameCopy.move(move);
      setGame(gameCopy);
      setRedoStack([]);

      const boardElement = document.querySelector('.react-board-wrapper') as HTMLElement;

      const movedPiece = result.piece.toLowerCase();
      if (result.captured || ['r', 'q', 'k'].includes(movedPiece)) {
        boardElement.classList.remove('board-ripple');
        boardElement.classList.remove('camera-shake');
        void boardElement.offsetWidth; // trigger reflow
        boardElement.classList.add('board-ripple');
        if (result.captured) boardElement.classList.add('camera-shake');
      }

      if (result.captured) {
        audio.capture();
        const capturedColor = result.color === 'w' ? 'b' : 'w';
        const capturedType = result.captured.toUpperCase() as 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
        vfx.triggerFromSquare('capture', result.to, 'white', boardElement, undefined, capturedType);
        setCaptureAnim({ square: result.to, pieceType: capturedType, pieceColor: capturedColor, capturedBy: result.color === 'w' ? 'white' : 'black' });
      } else if (!result.promotion) {
        audio.playThud();
      }

      if (result.promotion) { 
        audio.promote();
        setCinematic({ square: result.to, color: result.color as 'w' | 'b', type: result.promotion as 'q' | 'r' | 'b' | 'n' });
      }

      return result;
    } catch (e) {
      return null;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string, piece: string) {
    const moves = game.moves({ square: sourceSquare as import('chess.js').Square, verbose: true }) as any[];
    const validMove = moves.find((m) => m.to === targetSquare);

    if (!validMove) return false;

    if (validMove.promotion) {
      moveFromRef.current = sourceSquare;
      promoteToRef.current = targetSquare;
      setPromotionSquare(targetSquare);
      return true;
    }

    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: validMove.promotion ? 'q' : undefined,
    });

    if (move !== null) {
      setMoveFrom('');
      setOptionSquares({});
    }
    return move !== null;
  }

  function onPromotionPieceSelect(piece: string | undefined) {
    if (piece && moveFromRef.current && promoteToRef.current) {
      const type = piece[1].toLowerCase();
      makeAMove({
        from: moveFromRef.current,
        to: promoteToRef.current,
        promotion: type,
      });
    }
    setPromotionSquare(null);
    moveFromRef.current = null;
    promoteToRef.current = null;
    setMoveFrom('');
    setOptionSquares({});
    return true;
  }

  function getMoveOptions(square: string) {
    const moves = game.moves({
      square: square as import('chess.js').Square,
      verbose: true,
    }) as any[];
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: any = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background: game.get(move.to as any) && game.get(move.to as any)?.color !== game.get(square as any)?.color
          ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
          : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
        borderRadius: '50%',
      };
      return move;
    });
    newSquares[square] = {
      background: 'rgba(255, 255, 0, 0.4)',
    };
    setOptionSquares(newSquares);
    return true;
  }

  function onSquareClick(square: string) {
    function resetFirstMove(sq: string) {
      const hasOptions = getMoveOptions(sq);
      if (hasOptions) setMoveFrom(sq);
    }

    if (!moveFrom) {
      resetFirstMove(square);
      return;
    }

    const moves = game.moves({ square: moveFrom as import('chess.js').Square, verbose: true }) as any[];
    const validMove = moves.find((m) => m.to === square);

    if (!validMove) {
      resetFirstMove(square);
      return;
    }

    if (validMove.promotion) {
      moveFromRef.current = moveFrom;
      promoteToRef.current = square;
      setPromotionSquare(moveFrom);
      setMoveFrom('');
      setOptionSquares({});
      return;
    }

    const move = makeAMove({
      from: moveFrom,
      to: square,
      promotion: validMove.promotion ? 'q' : undefined,
    });

    if (move === null) {
      resetFirstMove(square);
    } else {
      setMoveFrom('');
      setOptionSquares({});
    }
  }

  const handleUndo = () => {
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    const undone = gameCopy.undo();
    if (undone) {
      setUndoAnim({
        from: undone.to,
        to: undone.from,
        pieceType: undone.piece.toUpperCase(),
        pieceColor: undone.color
      });
      setGame(gameCopy);
      setRedoStack(prev => [...prev, undone]);
      setMoveFrom('');
      setOptionSquares({});
    }
  };

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const gameCopy = new Chess();
      gameCopy.loadPgn(game.pgn());
      const moveToRedo = redoStack[redoStack.length - 1];
      gameCopy.move(moveToRedo);
      setGame(gameCopy);
      setRedoStack(prev => prev.slice(0, -1));
      setMoveFrom('');
      setOptionSquares({});
    }
  };

  const handleMoveClick = (index: number) => {
    if (gameOverMsg) return;
    const historyLength = game.history().length;
    if (index < historyLength - 1) {
      const gameCopy = new Chess();
      gameCopy.loadPgn(game.pgn());
      const newRedos: any[] = [];
      while (gameCopy.history().length > index + 1) {
        const undone = gameCopy.undo();
        if (undone) newRedos.push(undone);
      }
      setGame(gameCopy);
      setRedoStack(prev => [...prev, ...newRedos]);
    } else if (index >= historyLength) {
      let times = index - historyLength + 1;
      const gameCopy = new Chess();
      gameCopy.loadPgn(game.pgn());
      const newRedoStack: any[] = [...redoStack];
      while (times > 0 && newRedoStack.length > 0) {
        const moveToRedo = newRedoStack.pop();
        if (moveToRedo) gameCopy.move(moveToRedo);
        times--;
      }
      setGame(gameCopy);
      setRedoStack(newRedoStack);
    }
  };

  const handleResign = () => {
    if (gameOverMsg) return;
    const defeatedColor = game.turn() === 'w' ? 'w' : 'b';
    setCheckmateState({ color: defeatedColor, text: `${defeatedColor === 'w' ? 'WHITE' : 'BLACK'} RESIGNED` });
    setGameOverMsg(`${defeatedColor === 'w' ? 'White' : 'Black'} Resigned. ${defeatedColor === 'w' ? 'Black' : 'White'} Wins!`);
  };
  const handleDraw = () => setGameOverMsg('Draw agreed.');

  const fullHistory = [...game.history(), ...[...redoStack].reverse().map(m => typeof m === 'string' ? m : m.san)];
  const moveHistory = [];
  for (let i = 0; i < fullHistory.length; i += 2) {
    moveHistory.push({ white: fullHistory[i], black: fullHistory[i + 1] || '' });
  }

  const whiteC: string[] = [];
  const blackC: string[] = [];

  (game.history({ verbose: true }) as any[]).forEach((m) => {
    if (m.captured) {
      if (m.color === 'w') whiteC.push(`b${m.captured}`);
      else blackC.push(`w${m.captured}`);
    }
  });

  const pieceValues: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
  let whiteMaterial = 0;
  let blackMaterial = 0;
  const boardData = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = boardData[r][c];
      if (p) {
        if (p.color === 'w') whiteMaterial += pieceValues[p.type] || 0;
        else blackMaterial += pieceValues[p.type] || 0;
      }
    }
  }
  const advantage = whiteMaterial - blackMaterial;
  const rawPercentage = 50 + (advantage / 15) * 50;
  const evalPercentage = Math.max(5, Math.min(95, rawPercentage));

  const activeTurn = isGameOver ? null : game.turn() === 'w' ? 'top' : 'bottom';
  const turnIndicator = gameOverMsg ? gameOverMsg : checkmateState ? `🏆 CHECKMATE • ${checkmateState.color === 'w' ? 'BLACK' : 'WHITE'} WINS` : game.isDraw() ? "🏆 DRAW" : `${game.turn() === 'w' ? 'White' : 'Black'}'s Turn`;

  const h = game.history({ verbose: true }) as any[];
  const lastMove = h[h.length - 1];
  const moveHighlightStyles = lastMove ? {
    [lastMove.from]: { boxShadow: 'inset 0 0 15px rgba(46, 204, 113, 0.5), inset 0 0 2px 2px rgba(46, 204, 113, 0.6)' },
    [lastMove.to]: { boxShadow: 'inset 0 0 15px rgba(46, 204, 113, 0.5), inset 0 0 2px 2px rgba(46, 204, 113, 0.6)' }
  } : {};

  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (isGameOver) {
      if (checkmateState) {
        const timer = setTimeout(() => setShowModal(true), 2000);
        return () => clearTimeout(timer);
      } else {
        setShowModal(true);
      }
    } else {
      setShowModal(false);
    }
  }, [isGameOver, checkmateState]);

  useEffect(() => {
    if (isGameOver) {
      const timer = setTimeout(() => setShowActions(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setShowActions(false);
    }
  }, [isGameOver]);

  const currentMoveIndex = game.history().length - 1;
  const totalMoves = currentMoveIndex + redoStack.length;

  const moveScrubber = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
        <span>Start</span>
        <span>Move {currentMoveIndex + 1} / {totalMoves + 1}</span>
      </div>
      <input
        type="range"
        min="-1"
        max={totalMoves}
        value={currentMoveIndex}
        onChange={(e) => handleMoveClick(parseInt(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
      />
    </div>
  );

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <GameLayout
        topPlayerName={boardOrientation === 'white' ? "Black" : "White"}
        topPlayerClock={boardOrientation === 'white' ? formatTime(timeBlack) : formatTime(timeWhite)}
        bottomPlayerName={boardOrientation === 'white' ? "White" : "Black"}
        bottomPlayerClock={boardOrientation === 'white' ? formatTime(timeWhite) : formatTime(timeBlack)}
        turnIndicator={turnIndicator}
        evalPercentage={evalPercentage}
        topCaptures={blackC}
        bottomCaptures={whiteC}
        moveHistory={moveHistory}
        onMoveClick={handleMoveClick}
        onPrev={handleUndo}
        onNext={handleRedo}
        onDraw={handleDraw}
        onResign={handleResign}
        moveScrubber={moveScrubber}
        prevLabel="⎌ Undo"
        nextLabel="Redo ⎎"
        hideChat={true}
        activeTurn={activeTurn}
        isGameOver={isGameOver}
        onBack={() => navigate('/lobby')}
        previewFen={previewFen}
        onMoveHover={(index) => {
          if (index === null) {
            setPreviewFen(null);
          } else {
            const h = game.history({ verbose: true }) as any[];
            if (h[index]) setPreviewFen(h[index].after);
          }
        }}
      >
        {cinematic && (
          <style>{`
            div[data-square="${cinematic.square}"] > div {
              opacity: 0 !important;
            }
            div[data-square="${cinematic.square}"] img {
              opacity: 0 !important;
            }
          `}</style>
        )}
        {cinematic && (
          <PromotionCinematic
            targetSquare={cinematic.square}
            color={cinematic.color}
            promotionType={cinematic.type}
            orientation="white"
            boardElement={document.querySelector('.react-board-wrapper') as HTMLElement}
            onComplete={() => setCinematic(null)}
          />
        )}
        {captureAnim && (
          <>
            <CaptureAnimation
              targetSquare={captureAnim.square}
              pieceType={captureAnim.pieceType}
              pieceColor={captureAnim.pieceColor}
              orientation={boardOrientation}
              boardElement={document.querySelector('.react-board-wrapper') as HTMLElement}
              onComplete={() => { }}
            />
            <FlyingPiece
              startSquare={captureAnim.square}
              pieceType={captureAnim.pieceType}
              pieceColor={captureAnim.pieceColor}
              orientation={boardOrientation}
              capturedBy={captureAnim.capturedBy}
              onComplete={() => setCaptureAnim(null)}
            />
          </>
        )}
        {undoAnim && (
          <FlyingPiece
            startSquare={undoAnim.from}
            targetSquare={undoAnim.to}
            pieceType={undoAnim.pieceType}
            pieceColor={undoAnim.pieceColor}
            orientation={boardOrientation}
            isUndo={true}
            onComplete={() => setUndoAnim(null)}
          />
        )}
        {checkState && !checkmateState && (
          <CheckIndicator
            kingSquare={checkState.king}
            attackerSquare={checkState.attacker}
            orientation={boardOrientation}
            boardElement={document.querySelector('.react-board-wrapper') as HTMLElement}
          />
        )}
        {/* @ts-ignore */}
        <Chessboard
          id="LocalBoard"
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          customSquareStyles={{ ...moveHighlightStyles, ...optionSquares }}
          customPieces={customPieces}
          promotionToSquare={promotionSquare as import('chess.js').Square | null}
          showPromotionDialog={!!promotionSquare}
          onPromotionPieceSelect={onPromotionPieceSelect}
          boardWidth={boardWidth}
          boardOrientation={boardOrientation}
          customDarkSquareStyle={{ backgroundColor: 'var(--board-dark)' }}
          customLightSquareStyle={{ backgroundColor: 'var(--board-light)' }}
          arePremovesAllowed={true}
          clearPremovesOnRightClick={true}
          areArrowsAllowed={true}
        />
      </GameLayout>
      <PostGameModal
        isOpen={showModal}
        winnerTitle={checkmateState ? `${checkmateState.color === 'w' ? 'BLACK' : 'WHITE'} WINS` : game.isDraw() ? "DRAW" : "GAME OVER"}
        totalMoves={game.history().length}
        materialAdvantage={advantage}
        onRematch={() => window.location.reload()}
      />
      <GameStartSequence />
    </div>
  );
}
