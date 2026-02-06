import { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';

import { useGestureStore } from '../store/useGestureStore';
import { useSocketStore } from '../store/useSocketStore';
import { getCustomPieces } from '../utils/pieces';


export const OnlineGame = () => {
  const [game, setGame] = useState(new Chess());
  const { socket, connect } = useSocketStore();
  const [roomId, setRoomId] = useState('');
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
  const [status, setStatus] = useState('Disconnected');
  const [boardShake, setBoardShake] = useState(false);
  
  const { isPinching, selectedSquare, hoveredSquare, clearDrag } = useGestureStore();
  const prevPinching = useRef(isPinching);

  useEffect(() => {

    connect();
    
    if (!socket) return;
    
    socket.on('connect', () => setStatus('Connected to server. Create or Join a room.'));
    
    socket.on('room_created', (data) => {
      setRoomId(data.roomId);
      setPlayerColor(data.color);
      setStatus(`Room Created: ${data.roomId}. Waiting for opponent...`);
    });

    socket.on('room_joined', (data) => {
      setRoomId(data.roomId);
      setPlayerColor(data.color);
      const newGame = new Chess(data.fen);
      setGame(newGame);
      setStatus(`Joined room ${data.roomId} as Black. Game started!`);
    });

    socket.on('game_started', () => setStatus('Opponent joined. Game started!'));

    socket.on('move_made', (data) => {
      const newGame = new Chess(data.fen);
      setGame(newGame);
    });

    socket.on('error', (msg) => setStatus(`Error: ${msg}`));

    return () => {
      socket.off('connect');
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('game_started');
      socket.off('move_made');
      socket.off('error');
    };
  }, [socket]);

  // Custom gesture drop logic
  useEffect(() => {
    if (!isPinching && prevPinching.current) {
      if (selectedSquare && hoveredSquare && selectedSquare !== hoveredSquare) {
        if (game.turn() === playerColor) {
          const gameCopy = new Chess(game.fen());
          try {
            const move = gameCopy.move({
              from: selectedSquare,
              to: hoveredSquare,
              promotion: 'q',
            });
            
            if (move) {
              setGame(gameCopy);
              if (socket) {
                socket.emit('make_move', { roomId, move, fen: gameCopy.fen() });
              }
            }
          } catch (e) {}
        }
      }
      clearDrag();
    }
    prevPinching.current = isPinching;
  }, [isPinching, selectedSquare, hoveredSquare, game, playerColor, socket, roomId, clearDrag]);

  const createRoom = () => {
    if (socket) {
      const newRoomId = Math.random().toString(36).substring(2, 8);
      socket.emit('create_room', newRoomId);
    }
  };

  const joinRoom = () => {
    if (socket && roomId) {
      socket.emit('join_room', roomId);
    }
  };

  function onDrop(args: { sourceSquare: string; targetSquare: string | null }) {
    const { sourceSquare, targetSquare } = args;
    if (!targetSquare) return false;
    if (game.turn() !== playerColor) return false; // Not your turn

    const gameCopy = new Chess(game.fen());
    try {
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: 'q',
      });

      if (move === null) {
        setBoardShake(true);
        setTimeout(() => setBoardShake(false), 300);
        return false;
      }

      setGame(gameCopy);
      if (socket) {
        socket.emit('make_move', { roomId, move, fen: gameCopy.fen() });
      }
      return true;
    } catch (e) {
      setBoardShake(true);
      setTimeout(() => setBoardShake(false), 300);
      return false;
    }
  }

  // Snap Highlighting Logic
  const optionSquares = (() => {
    const styles: Record<string, React.CSSProperties> = {};
    const history = game.history({ verbose: true });
    if (history.length > 0) {
      const last = history[history.length - 1];
      styles[last.from] = { backgroundColor: 'rgba(234, 179, 8, 0.4)' };
      styles[last.to] = { backgroundColor: 'rgba(234, 179, 8, 0.6)' };
    }
    if (selectedSquare) {
      styles[selectedSquare] = { backgroundColor: 'rgba(59, 130, 246, 0.5)' };
      const moves = game.moves({ square: selectedSquare as import('chess.js').Square, verbose: true });
      moves.forEach(m => {
        styles[m.to] = {
          background: game.get(m.to as import('chess.js').Square)
            ? 'radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)'
            : 'radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)',
          borderRadius: '50%'
        };
      });
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
    return styles;
  })();

  return (
    <div className="online-game-container">
      <div className="online-game-header">
        <h2 className="online-game-title">Online Match</h2>
        <div className="online-game-status">{status}</div>
      </div>
      
      {!playerColor && (
        <div className="online-room-controls">
          <button onClick={createRoom} className="online-btn-primary">
            Create Room
          </button>
          <div className="online-input-group">
            <input 
              type="text" 
              placeholder="Room ID" 
              className="online-input"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
            <button onClick={joinRoom} className="online-btn-secondary">
              Join
            </button>
          </div>
        </div>
      )}

      <div className={`online-board-wrapper ${boardShake ? 'shake-error' : ''} ${game.isCheck() ? 'check-alert' : ''}`}>
        <Chessboard 
          options={{
            position: game.fen(),
            onPieceDrop: onDrop,
            boardOrientation: playerColor === 'b' ? 'black' : 'white',
            darkSquareStyle: { backgroundColor: 'var(--color-board-dark)' },
            lightSquareStyle: { backgroundColor: 'var(--color-board-light)' },
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
