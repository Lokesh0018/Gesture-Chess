import { Server, Socket } from 'socket.io';
import { prisma } from '../prisma';

const rooms = new Map<string, { white?: string, black?: string, fen: string }>();

export const initializeSocket = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', (roomId: string) => {
      rooms.set(roomId, { white: socket.id, fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' });
      socket.join(roomId);
      socket.emit('room_created', { roomId, color: 'w' });
    });

    socket.on('join_room', (roomId: string) => {
      const room = rooms.get(roomId);
      if (room) {
        if (!room.black) {
          room.black = socket.id;
          socket.join(roomId);
          socket.emit('room_joined', { roomId, color: 'b', fen: room.fen });
          io.to(roomId).emit('game_started', { fen: room.fen });
        } else {
          socket.emit('error', 'Room is full');
        }
      } else {
        socket.emit('error', 'Room not found');
      }
    });

    socket.on('make_move', ({ roomId, move, fen }) => {
      const room = rooms.get(roomId);
      if (room) {
        room.fen = fen; // Update global state
        // Broadcast to everyone else in the room
        socket.to(roomId).emit('move_made', { move, fen });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      // Clean up rooms if necessary
    });
  });
};
