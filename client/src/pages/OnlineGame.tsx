import { useState, useEffect, useRef } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { io, Socket } from 'socket.io-client';
import { useGestureStore } from '../store/useGestureStore';
import './Game.css';

export const OnlineGame = () => {
  const [game, setGame] = useState(new Chess());
  const [socket, setSocket] = useState<Socket | null>(null);
  const [roomId, setRoomId] = useState('');
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | null>(null);
  const [status, setStatus] = useState('Disconnected');
  
  const { isPinching, selectedSquare, hoveredSquare, clearDrag } = useGestureStore();
  const prevPinching = useRef(isPinching);

  useEffect(() => {
    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.on('connect', () => setStatus('Connected to server. Create or Join a room.'));
    
    newSocket.on('room_created', (data) => {
      setRoomId(data.roomId);
      setPlayerColor(data.color);
      setStatus(`Room Created: ${data.roomId}. Waiting for opponent...`);
    });

    newSocket.on('room_joined', (data) => {
      setRoomId(data.roomId);
      setPlayerColor(data.color);
      const newGame = new Chess(data.fen);
      setGame(newGame);
      setStatus(`Joined room ${data.roomId} as Black. Game started!`);
    });

    newSocket.on('game_started', () => setStatus('Opponent joined. Game started!'));

    newSocket.on('move_made', (data) => {
      const newGame = new Chess(data.fen);
      setGame(newGame);
    });

    newSocket.on('error', (msg) => setStatus(`Error: ${msg}`));

    return () => { newSocket.close(); };
  }, []);

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

      if (move === null) return false;

      setGame(gameCopy);
      if (socket) {
        socket.emit('make_move', { roomId, move, fen: gameCopy.fen() });
      }
      return true;
    } catch (e) {
      return false;
    }
  }

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

      <div className="online-board-wrapper">
        <Chessboard 
          options={{
            position: game.fen(),
            onPieceDrop: onDrop,
            boardOrientation: playerColor === 'b' ? 'black' : 'white',
            darkSquareStyle: { backgroundColor: 'var(--color-board-dark)' },
            lightSquareStyle: { backgroundColor: 'var(--color-board-light)' },
            animationDurationInMs: 200,
            allowDragging: true,
            allowDragOffBoard: true,
            allowAutoScroll: false,
            boardStyle: { touchAction: 'none' },
            draggingPieceStyle: { zIndex: 9999, cursor: 'grabbing' },
          }}
        />
      </div>
    </div>
  );
};
