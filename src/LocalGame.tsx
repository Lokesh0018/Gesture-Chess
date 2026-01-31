import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Link } from 'react-router-dom';
import { vfx } from './vfx-manager';
import { audio } from './audio-manager';
import CheckIndicator from './CheckIndicator';
import CheckmateAnimation from './CheckmateAnimation';
import GameLayout from './GameLayout';
import type { MoveHistory } from './GameLayout';
import PromotionCinematic from './PromotionCinematic';
import CaptureAnimation from './CaptureAnimation';

import Piece from './Piece';

const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
const customPieces = pieces.reduce((res: any, p) => {
  const color = p[0] as 'w' | 'b';
  const type = p[1] as 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
  res[p] = ({ squareWidth, isDragging }: any) => (
    <Piece type={type} color={color} squareWidth={squareWidth} isDragging={isDragging} />
  );
  return res;
}, {});

export default function LocalGame() {
  const [game, setGame] = useState(new Chess());
  const [boardWidth, setBoardWidth] = useState(window.innerWidth > 850 ? 500 : window.innerWidth - 60);
  const [cinematic, setCinematic] = useState<{ square: string, color: 'w' | 'b', type: 'q' | 'r' | 'b' | 'n' } | null>(null);
  const [captureAnim, setCaptureAnim] = useState<{ square: string, pieceType: 'P' | 'N' | 'B' | 'R' | 'Q' | 'K', pieceColor: 'w' | 'b' } | null>(null);
  const [checkState, setCheckState] = useState<{ king: string, attacker: string | null } | null>(null);
  const [checkmateState, setCheckmateState] = useState<{ defKing: string, winKing: string, color: 'w' | 'b', text: string } | null>(null);
  const [gameOverMsg, setGameOverMsg] = useState<string | null>(null);

  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [promotionSquare, setPromotionSquare] = useState<string | null>(null);
  const moveFromRef = useRef<string | null>(null);
  const promoteToRef = useRef<string | null>(null);

  useEffect(() => {
    const handleResize = () => setBoardWidth(window.innerWidth > 850 ? 500 : window.innerWidth - 60);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (checkmateState) {
      const styleEl = document.getElementById('hide-def-king');
      if (!styleEl) {
        const style = document.createElement('style');
        style.id = 'hide-def-king';
        style.innerHTML = `div[data-square="${checkmateState.defKing}"] > div, div[data-square="${checkmateState.defKing}"] img, div[data-square="${checkmateState.defKing}"] svg { opacity: 0 !important; }`;
        document.head.appendChild(style);
      }
    } else {
      const styleEl = document.getElementById('hide-def-king');
      if (styleEl) styleEl.remove();
    }

    // cleanup in-check classes
    document.querySelectorAll('.in-check').forEach(el => el.classList.remove('in-check'));

    if (game.isCheckmate()) {
      let dKing = '';
      let wKing = '';
      const board = game.board();
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          if (board[r][c]?.type === 'k') {
            if (board[r][c]?.color === game.turn()) dKing = String.fromCharCode(97 + c) + (8 - r);
            else wKing = String.fromCharCode(97 + c) + (8 - r);
          }
        }
      }
      setCheckmateState({ defKing: dKing, winKing: wKing, color: game.turn(), text: 'CHECKMATE' });
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
    } else {
      setCheckState(null);
      setCheckmateState(null);
    }
  }, [game.fen()]);

  function makeAMove(move: any) {
    if (gameOverMsg) return null;
    const gameCopy = new Chess();
    gameCopy.loadPgn(game.pgn());
    try {
      const result = gameCopy.move(move);
      setGame(gameCopy);
      setRedoStack([]);

      const boardElement = document.querySelector('.react-board-wrapper') as HTMLElement;
      if (result.captured) {
        audio.capture();
        const capturedColor = result.color === 'w' ? 'b' : 'w';
        const capturedType = result.captured.toUpperCase() as 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
        setCaptureAnim({ square: result.to, pieceType: capturedType, pieceColor: capturedColor });
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
    const moves = game.moves({ square: sourceSquare, verbose: true }) as any[];
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
      square,
      verbose: true,
    }) as any[];
    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: any = {};
    moves.map((move) => {
      newSquares[move.to] = {
        background: game.get(move.to as any) && game.get(move.to as any).color !== game.get(square as any).color
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

    const moves = game.moves({ square: moveFrom, verbose: true }) as any[];
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
      const newRedos = [];
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
      const newRedoStack = [...redoStack];
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
    let dKing = '';
    let wKing = '';
    const board = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if (board[r][c]?.type === 'k') {
          if (board[r][c]?.color === defeatedColor) dKing = String.fromCharCode(97 + c) + (8 - r);
          else wKing = String.fromCharCode(97 + c) + (8 - r);
        }
      }
    }
    setCheckmateState({ defKing: dKing, winKing: wKing, color: defeatedColor, text: `${defeatedColor === 'w' ? 'WHITE' : 'BLACK'} RESIGNED` });
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

  let turnIndicator = '';
  if (gameOverMsg) turnIndicator = gameOverMsg;
  else if (checkmateState) turnIndicator = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`;
  else if (game.isDraw()) turnIndicator = 'Draw!';
  else turnIndicator = `${game.turn() === 'w' ? 'White' : 'Black'}'s Turn`;

  const activeTurn = gameOverMsg || checkmateState || game.isDraw() ? null : (game.turn() === 'w' ? 'bottom' : 'top');

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <Link to="/lobby" className="back-btn">◀ Back</Link>
      <GameLayout
        topPlayerName="Player 2"
        bottomPlayerName="Player 1"
        topPlayerClock="10:00"
        bottomPlayerClock="10:00"
        turnIndicator={turnIndicator}
        evalPercentage={50}
        topCaptures={blackC}
        bottomCaptures={whiteC}
        moveHistory={moveHistory}
        onDraw={handleDraw}
        onResign={handleResign}
        onPrev={handleUndo}
        onNext={handleRedo}
        onMoveClick={handleMoveClick}
        prevLabel="⎌ Undo"
        nextLabel="Redo ⎎"
        hideChat={true}
        activeTurn={activeTurn}
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
          <CaptureAnimation
            targetSquare={captureAnim.square}
            pieceType={captureAnim.pieceType}
            pieceColor={captureAnim.pieceColor}
            orientation="white"
            boardElement={document.querySelector('.react-board-wrapper') as HTMLElement}
            onComplete={() => setCaptureAnim(null)}
          />
        )}
        {checkState && !checkmateState && (
          <CheckIndicator
            kingSquare={checkState.king}
            attackerSquare={checkState.attacker}
            orientation="white"
            boardElement={document.querySelector('.react-board-wrapper') as HTMLElement}
          />
        )}
        {checkmateState && (
          <CheckmateAnimation
            defeatedKingSquare={checkmateState.defKing}
            winningKingSquare={checkmateState.winKing}
            defeatedColor={checkmateState.color}
            orientation="white"
            boardElement={document.querySelector('.react-board-wrapper') as HTMLElement}
            text={checkmateState.text}
            onComplete={() => { }}
          />
        )}
        {/* @ts-ignore */}
        <Chessboard
          id="LocalBoard"
          position={game.fen()}
          onPieceDrop={onDrop}
          onSquareClick={onSquareClick}
          customSquareStyles={optionSquares}
          customPieces={customPieces}
          promotionToSquare={promotionSquare}
          showPromotionDialog={!!promotionSquare}
          onPromotionPieceSelect={onPromotionPieceSelect}
          boardWidth={boardWidth}
          customDarkSquareStyle={{ backgroundColor: 'var(--board-dark)' }}
          customLightSquareStyle={{ backgroundColor: 'var(--board-light)' }}
        />
      </GameLayout>
    </div>
  );
}
