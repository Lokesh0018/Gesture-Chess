import { useState, useEffect } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Link } from 'react-router-dom';
import { vfx } from './vfx-manager';
import { audio } from './audio-manager';
import GameLayout from './GameLayout';
import type { MoveHistory } from './GameLayout';
import PromotionCinematic from './PromotionCinematic';

const pieces = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
const customPieces = pieces.reduce((res: any, p) => {
  res[p] = ({ squareWidth }: any) => (
    <div style={{ width: squareWidth, height: squareWidth, backgroundImage: `url(https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${p.toLowerCase()}.png)`, backgroundSize: '100%', backgroundRepeat: 'no-repeat' }} />
  );
  return res;
}, {});

export default function LocalGame() {
  const [game, setGame] = useState(new Chess());
  const [boardWidth, setBoardWidth] = useState(window.innerWidth > 850 ? 500 : window.innerWidth - 60);
  const [cinematic, setCinematic] = useState<{square: string, color: 'w'|'b', type: 'q'|'r'|'b'|'n'} | null>(null);

  const [moveFrom, setMoveFrom] = useState('');
  const [optionSquares, setOptionSquares] = useState({});
  const [redoStack, setRedoStack] = useState<any[]>([]);
  const [moveToPromote, setMoveToPromote] = useState<{from: string, to: string} | null>(null);

  useEffect(() => {
    const handleResize = () => setBoardWidth(window.innerWidth > 850 ? 500 : window.innerWidth - 60);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function makeAMove(move: any) {
    const gameCopy = new Chess(game.fen());
    try {
      const result = gameCopy.move(move);
      setGame(gameCopy);
      setRedoStack([]);
      
      const boardElement = document.querySelector('.react-board-wrapper') as HTMLElement;
      if (result.captured) {
        audio.capture();
        vfx.triggerFromSquare('capture', result.to, 'white', boardElement, game.turn() === 'w' ? '#ebecd0' : '#739552');
      }
      if (result.promotion) {
        audio.promote();
        setCinematic({ square: result.to, color: result.color as 'w'|'b', type: result.promotion as 'q'|'r'|'b'|'n' });
      }
      
      return result;
    } catch (e) {
      return null;
    }
  }

  function onDrop(sourceSquare: string, targetSquare: string, piece: string) {
    const isPromotion = game.get(sourceSquare as any)?.type === 'p' && (targetSquare[1] === '8' || targetSquare[1] === '1');
    if (isPromotion) {
      setMoveToPromote({ from: sourceSquare, to: targetSquare });
      return false; // Return false so board doesn't auto-promote internally
    }

    const move = makeAMove({
      from: sourceSquare,
      to: targetSquare,
      promotion: 'q',
    });
    if (move !== null) {
      setMoveFrom('');
      setOptionSquares({});
    }
    return move !== null;
  }

  function onPromotionPieceSelect(piece: string | undefined) {
    if (piece && moveToPromote) {
      let promoChar = 'q';
      const pLower = piece.toLowerCase();
      if (pLower.includes('r')) promoChar = 'r';
      else if (pLower.includes('b')) promoChar = 'b';
      else if (pLower.includes('n')) promoChar = 'n';
      
      makeAMove({
        from: moveToPromote.from,
        to: moveToPromote.to,
        promotion: promoChar,
      });
    }
    setMoveToPromote(null);
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

    const isPromotion = game.get(moveFrom as any)?.type === 'p' && (square[1] === '8' || square[1] === '1');
    if (isPromotion) {
      setMoveToPromote({ from: moveFrom, to: square });
      return;
    }

    const move = makeAMove({
      from: moveFrom,
      to: square,
      promotion: 'q',
    });

    if (move === null) {
      resetFirstMove(square);
    } else {
      setMoveFrom('');
      setOptionSquares({});
    }
  }

  const handleUndo = () => {
    const gameCopy = new Chess(game.fen());
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
      const gameCopy = new Chess(game.fen());
      const moveToRedo = redoStack[redoStack.length - 1];
      gameCopy.move(moveToRedo);
      setGame(gameCopy);
      setRedoStack(prev => prev.slice(0, -1));
      setMoveFrom('');
      setOptionSquares({});
    }
  };

  const history = game.history();
  const moveHistory: MoveHistory[] = [];
  for (let i = 0; i < history.length; i += 2) {
    moveHistory.push({ white: history[i], black: history[i + 1] || '' });
  }

  const whiteC: string[] = [];
  const blackC: string[] = [];
  
  (game.history({ verbose: true }) as any[]).forEach((m) => {
    if (m.captured) {
      if (m.color === 'w') whiteC.push(`b${m.captured}`);
      else blackC.push(`w${m.captured}`);
    }
  });

  let turnIndicator = `${game.turn() === 'w' ? "White" : "Black"}'s Turn`;
  if (game.isCheckmate()) turnIndicator = `Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} Wins!`;
  else if (game.isDraw()) turnIndicator = "Draw!";

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
        whiteCaptures={whiteC}
        blackCaptures={blackC}
        moveHistory={moveHistory}
        onDraw={() => alert('Draw offered')}
        onResign={() => alert('Resigned')}
        onPrev={handleUndo}
        onNext={handleRedo}
        prevLabel="⎌ Undo"
        nextLabel="Redo ⎎"
        hideChat={true}
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
        {/* @ts-ignore */}
        <Chessboard 
            id="LocalBoard"
            position={game.fen()} 
            onPieceDrop={onDrop}
            onSquareClick={onSquareClick}
            customSquareStyles={optionSquares}
            customPieces={customPieces}
            promotionToSquare={moveToPromote?.to ?? null}
            onPromotionPieceSelect={onPromotionPieceSelect}
            boardWidth={boardWidth}
            customDarkSquareStyle={{ backgroundColor: '#739552' }}
            customLightSquareStyle={{ backgroundColor: '#ebecd0' }}
        />
      </GameLayout>
    </div>
  );
}
