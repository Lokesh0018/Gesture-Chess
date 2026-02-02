import { useEffect, useMemo, useRef, useState } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess, type Color, type PieceSymbol, type Square } from 'chess.js';
import { RotateCcw, RefreshCw, FlipVertical } from 'lucide-react';
import toast from 'react-hot-toast';

type PromotionMove = { from: Square; to: Square };
type CapturedPiece = { type: PieceSymbol; by: Color };

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
        background: 'rgba(220, 38, 38, 0.45)',
      };
    }
  }

  if (!selectedSquare) return styles;
  const moves = game.moves({ square: selectedSquare as Square, verbose: true });
  if (!moves.length) return styles;

  styles[selectedSquare] = { background: 'rgba(250, 204, 21, 0.45)' };
  for (const move of moves) {
    const isCapture = Boolean(move.captured) || move.flags.includes('e');
    styles[move.to] = {
      background: isCapture
        ? 'radial-gradient(circle, rgba(239, 68, 68, 0.35) 65%, transparent 66%)'
        : 'radial-gradient(circle, rgba(255,255,255,.35) 25%, transparent 26%)',
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
    // No-op on unsupported environments.
  }
}

export const LocalGame = () => {
  const [game, setGame] = useState(new Chess());
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [selectedSquare, setSelectedSquare] = useState('');
  const [redoStack, setRedoStack] = useState<Array<{ from: string; to: string; promotion?: PieceSymbol }>>([]);
  const [pendingPromotion, setPendingPromotion] = useState<PromotionMove | null>(null);
  const [capturedPieces, setCapturedPieces] = useState<CapturedPiece[]>([]);
  const boardContainerRef = useRef<HTMLDivElement | null>(null);

  const optionSquares = useMemo(
    () => generateSquareStyles(game, selectedSquare),
    [game, selectedSquare],
  );

  const gameStatus = useMemo(() => {
    if (game.isCheckmate()) return 'Checkmate';
    if (game.isStalemate()) return 'Stalemate';
    if (game.isInsufficientMaterial()) return 'Draw: insufficient material';
    if (game.isThreefoldRepetition()) return 'Draw: threefold repetition';
    if ('isDrawByFiftyMoves' in game && typeof game.isDrawByFiftyMoves === 'function' && game.isDrawByFiftyMoves()) {
      return 'Draw: fifty-move rule';
    }
    if (game.isDraw()) return 'Draw';
    if (game.isCheck()) return 'Check';
    return 'Active';
  }, [game]);

  const movePairs = useMemo(() => {
    return game.history().reduce((result: Array<{ w: string; b: string }>, move, index) => {
      if (index % 2 === 0) result.push({ w: move, b: '' });
      else result[result.length - 1].b = move;
      return result;
    }, []);
  }, [game]);

  useEffect(() => {
    if (game.isCheckmate()) toast.error(`Checkmate! ${game.turn() === 'w' ? 'Black' : 'White'} wins!`);
    else if (game.isStalemate()) toast('Draw by stalemate.', { icon: '🤝' });
    else if (game.isInsufficientMaterial()) toast('Draw by insufficient material.', { icon: '🤝' });
    else if (game.isThreefoldRepetition()) toast('Draw by threefold repetition.', { icon: '🤝' });
    else if ('isDrawByFiftyMoves' in game && typeof game.isDrawByFiftyMoves === 'function' && game.isDrawByFiftyMoves()) {
      toast('Draw by fifty-move rule.', { icon: '🤝' });
    } else if (game.isCheck()) toast.error('Check!');
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
    const captures: CapturedPiece[] = currentGame
      .history({ verbose: true })
      .filter((move) => Boolean(move.captured))
      .map((move) => ({
        type: move.captured!,
        by: move.color,
      }));
    setCapturedPieces(captures);
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
    setCapturedPieces([]);
  }

  return (
    <div className="flex flex-col xl:flex-row max-w-6xl mx-auto gap-8">
      {/* Main Board Area */}
      <div className="flex-1 flex flex-col space-y-6 items-center">
        <div className="flex justify-between w-full max-w-[600px]">
          <h2 className="text-2xl font-bold">Local Game</h2>
          <div className="px-4 py-1 bg-gray-800 rounded-lg text-sm text-gray-400 flex items-center">
            Turn: <span className="ml-2 font-bold text-white capitalize">{game.turn() === 'w' ? 'White' : 'Black'}</span>
          </div>
        </div>

        <div ref={boardContainerRef} className="w-full max-w-[600px] shadow-2xl rounded-sm overflow-hidden border border-gray-700 relative">
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
              allowAutoScroll: false,
              animationDurationInMs: 200,
              darkSquareStyle: { backgroundColor: 'var(--color-board-dark)' },
              lightSquareStyle: { backgroundColor: 'var(--color-board-light)' },
              squareStyles: optionSquares,
              boardStyle: { cursor: 'pointer', touchAction: 'none' },
              draggingPieceStyle: { zIndex: 9999, cursor: 'grabbing' },
            }}
          />
        </div>

        {/* Game Controls */}
        <div className="flex space-x-2 md:space-x-4 w-full max-w-[600px]">
          <button
            onClick={onUndo}
            disabled={!game.history().length}
            className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center space-x-2 transition"
          >
            <RotateCcw className="w-5 h-5" /> <span>Undo</span>
          </button>
          <button
            onClick={onRedo}
            disabled={!redoStack.length}
            className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg flex items-center justify-center space-x-2 transition"
          >
            <RotateCcw className="w-5 h-5 rotate-180" /> <span>Redo</span>
          </button>
          <button
            onClick={onRestart}
            className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center space-x-2 transition"
          >
            <RefreshCw className="w-5 h-5" /> <span>Restart</span>
          </button>
          <button
            onClick={() => setBoardOrientation(prev => prev === 'white' ? 'black' : 'white')}
            className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg flex items-center justify-center space-x-2 transition"
          >
            <FlipVertical className="w-5 h-5" /> <span>Flip Board</span>
          </button>
        </div>
      </div>

      {/* Sidebar Info */}
      <div className="w-full xl:w-80 space-y-6">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-primary-400">Game Status</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span
                className={`font-bold ${
                  gameStatus.startsWith('Checkmate')
                    ? 'text-danger-500'
                    : gameStatus.startsWith('Check')
                      ? 'text-yellow-500'
                      : gameStatus.startsWith('Draw') || gameStatus.startsWith('Stalemate')
                        ? 'text-blue-400'
                        : 'text-success-500'
                }`}
              >
                {gameStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Moves</span>
              <span className="font-bold">{Math.floor(game.history().length / 2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Halfmove Clock</span>
              <span className="font-bold">{Number(game.fen().split(' ')[4])}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Fullmove Number</span>
              <span className="font-bold">{Number(game.fen().split(' ')[5])}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700">
          <h3 className="text-lg font-semibold mb-4 text-primary-400">Captured Pieces</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-400 mb-2">Captured by White</p>
              <p className="font-mono break-words">{capturedPieces.filter((piece) => piece.by === 'w').map((piece) => piece.type.toUpperCase()).join(' ') || '-'}</p>
            </div>
            <div>
              <p className="text-gray-400 mb-2">Captured by Black</p>
              <p className="font-mono break-words">{capturedPieces.filter((piece) => piece.by === 'b').map((piece) => piece.type.toUpperCase()).join(' ') || '-'}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 h-96 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 text-primary-400">Move History</h3>
          <div className="flex-1 overflow-y-auto space-y-2 text-sm pr-2">
            {movePairs.map((pair, i) => (
              <div key={i} className="flex justify-between p-2 hover:bg-gray-700/50 rounded-lg">
                <span className="text-gray-500 w-8">{i + 1}.</span>
                <span className="font-mono flex-1 text-center">{pair.w}</span>
                <span className="font-mono flex-1 text-center">{pair.b}</span>
              </div>
            ))}
            {game.history().length === 0 && <p className="text-gray-500 text-center mt-4">No moves yet</p>}
          </div>
        </div>
      </div>

      {pendingPromotion && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-gray-900 rounded-2xl border border-gray-700 p-6">
            <h3 className="text-xl font-semibold mb-4">Choose Promotion</h3>
            <p className="text-sm text-gray-400 mb-5">Select the piece for pawn promotion.</p>
            <div className="grid grid-cols-2 gap-3">
              {PROMOTION_PIECES.map((piece) => (
                <button
                  key={piece}
                  onClick={() => commitPromotion(piece)}
                  className="py-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition font-semibold uppercase"
                >
                  {piece}
                </button>
              ))}
            </div>
            <button onClick={cancelPromotion} className="w-full mt-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
