import { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

import { useGestureStore } from '../store/useGestureStore';
import { useSocketStore } from '../store/useSocketStore';
import { getCustomPieces } from '../utils/pieces';

export const OnlineGame = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { socket, connect } = useSocketStore();
  
  const { roomId, color, opponent } = location.state || {};
  
  const [game, setGame] = useState(new Chess());
  const [playerColor] = useState<'w' | 'b'>(color || 'w');
  const [status, setStatus] = useState('Game started!');
  const [boardShake, setBoardShake] = useState(false);
  const [premove, setPremove] = useState<{ from: string, to: string } | null>(null);
  
  const { isPinching, selectedSquare, hoveredSquare, clearDrag } = useGestureStore();
  const prevPinching = useRef(isPinching);

  useEffect(() => {
    if (!roomId) {
      navigate('/online-setup');
      return;
    }
    
    if (!socket?.connected) {
      connect();
    }
    
    if (!socket) return;

    socket.on('move_made', (data: { move: any, fen: string }) => {
      const newGame = new Chess(data.fen);
      setGame(newGame);
    });

    socket.on('error', (msg: string) => setStatus(`Error: ${msg}`));

    return () => {
      socket.off('move_made');
      socket.off('error');
    };
  }, [socket, roomId, navigate, connect]);

  // Handle Premoves when turn changes
  useEffect(() => {
    if (premove && game.turn() === playerColor) {
      const gameCopy = new Chess(game.fen());
      try {
        const move = gameCopy.move({
          from: premove.from,
          to: premove.to,
          promotion: 'q',
        });
        
        if (move) {
          setGame(gameCopy);
          socket?.emit('make_move', { matchId: roomId, move, fen: gameCopy.fen() });
        }
      } catch (e) {}
      setPremove(null);
    }
  }, [game.fen(), game.turn(), playerColor, premove, roomId, socket]);

  // Gesture Drop
  useEffect(() => {
    if (!isPinching && prevPinching.current) {
      const activeSquare = selectedSquare;
      if (activeSquare && hoveredSquare && activeSquare !== hoveredSquare) {
        requestMove(activeSquare, hoveredSquare);
      }
      clearDrag();
    }
    prevPinching.current = isPinching;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPinching, selectedSquare, hoveredSquare, clearDrag]);

  const requestMove = (sourceSquare: string, targetSquare: string) => {
    if (game.turn() !== playerColor) {
      // Set Premove
      setPremove({ from: sourceSquare, to: targetSquare });
      return false;
    }

    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move) {
        setGame(gameCopy);
        setPremove(null);
        socket?.emit('make_move', { matchId: roomId, move, fen: gameCopy.fen() });
        return true;
      }
      setBoardShake(true);
      setTimeout(() => setBoardShake(false), 300);
      return false;
    } catch (e) {
      setBoardShake(true);
      setTimeout(() => setBoardShake(false), 300);
      return false;
    }
  };

  function onDrop(args: any) {
    const { sourceSquare, targetSquare } = args;
    if (!targetSquare) return false;
    return requestMove(sourceSquare, targetSquare);
  }

  const optionSquares = useMemo(
    () => {
      const styles: Record<string, React.CSSProperties> = {};
      const history = game.history({ verbose: true });
      if (history.length > 0) {
        const last = history[history.length - 1];
        styles[last.from] = { backgroundColor: 'rgba(234, 179, 8, 0.4)' };
        styles[last.to] = { backgroundColor: 'rgba(234, 179, 8, 0.6)' };
      }
      
      const activeSquare = selectedSquare;
      if (activeSquare) {
        styles[activeSquare] = { backgroundColor: 'rgba(59, 130, 246, 0.5)' };
        try {
          const moves = game.moves({ square: activeSquare as any, verbose: true });
          moves.forEach(m => {
            styles[m.to] = {
              background: game.get(m.to as any)
                ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
                : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
              borderRadius: '50%'
            };
          });
        } catch (e) {}
      }

      if (game.isCheck()) {
        const kingColor = game.turn();
        const board = game.board();
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === 'k' && p.color === kingColor) {
              styles[p.square] = { background: 'radial-gradient(circle, rgba(239, 68, 68, 0.7) 35%, transparent 70%)' };
            }
          }
        }
      }

      if (premove) {
        styles[premove.from] = { backgroundColor: 'rgba(239, 68, 68, 0.4)' };
        styles[premove.to] = { backgroundColor: 'rgba(239, 68, 68, 0.4)' };
      }

      if (hoveredSquare && isPinching) {
        styles[hoveredSquare] = { ...styles[hoveredSquare], border: '3px solid rgba(74, 222, 128, 0.8)', borderRadius: '8px', boxSizing: 'border-box' };
      }
      return styles;
    },
    [game, selectedSquare, premove, hoveredSquare, isPinching],
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-3xl flex justify-between items-center mb-4">
         <h2 className="text-xl font-bold text-white">vs {opponent || 'Opponent'}</h2>
         <div className="text-sm text-gray-400">{status}</div>
      </div>
      
      <div className={`w-full max-w-2xl ${boardShake ? 'animate-shake' : ''} ${game.isCheck() ? 'check-alert' : ''}`}>
        <Chessboard 
          options={{
            position: game.fen(),
            onPieceDrop: onDrop,
            boardOrientation: playerColor === 'b' ? 'black' : 'white',
            darkSquareStyle: { backgroundColor: '#475569' },
            lightSquareStyle: { backgroundColor: '#cbd5e1' },
            squareStyles: optionSquares,
            animationDurationInMs: 200,
            allowDragging: true,
            allowDragOffBoard: true,
            allowAutoScroll: false,
            boardStyle: { touchAction: 'none' },
            draggingPieceStyle: { zIndex: 9999, cursor: 'grabbing' },
            pieces: getCustomPieces(),
          }}
        />
      </div>
    </div>
  );
};
