import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_chess_key';

interface Player {
  id: string; // Database User ID
  socketId: string;
  username: string;
  isEliminated: boolean;
}

interface Match {
  id: string; // Match ID
  white: Player;
  black: Player;
  fen: string;
  status: 'ongoing' | 'finished';
  winnerId?: string;
}

interface Tournament {
  id: string;
  hostId: string; // Socket ID
  timeControl: string;
  players: Player[];
  matches: Match[];
  status: 'waiting' | 'in_progress' | 'finished';
  round: number;
}

const tournaments = new Map<string, Tournament>();

export const initializeSocket = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error('Authentication error'));
    jwt.verify(token, JWT_SECRET, async (err: any, decoded: any) => {
      if (err) return next(new Error('Authentication error'));
      try {
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
        if (!user) return next(new Error('User not found'));
        (socket as any).user = user;
        next();
      } catch (e) {
        next(new Error('Server error'));
      }
    });
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user;
    console.log('User connected to socket:', user.username);

    socket.on('create_tournament', ({ roomId, timeControl }) => {
      if (tournaments.has(roomId)) {
        socket.emit('error', 'Room already exists');
        return;
      }
      tournaments.set(roomId, {
        id: roomId,
        hostId: socket.id,
        timeControl,
        players: [{ id: user.id, socketId: socket.id, username: user.username, isEliminated: false }],
        matches: [],
        status: 'waiting',
        round: 0
      });
      socket.join(roomId);
      socket.emit('room_created', { roomId });
      io.to(roomId).emit('players_update', { players: tournaments.get(roomId)!.players.map(p => ({ id: p.id, username: p.username })) });
    });

    socket.on('join_tournament', ({ roomId }) => {
      const tournament = tournaments.get(roomId);
      if (!tournament) return socket.emit('error', 'Tournament not found');
      if (tournament.status !== 'waiting') return socket.emit('error', 'Tournament already started');
      if (tournament.players.length >= 16) return socket.emit('error', 'Tournament is full');
      
      // Prevent double join
      if (tournament.players.some(p => p.id === user.id)) {
        return socket.emit('error', 'You are already in this tournament');
      }

      tournament.players.push({ id: user.id, socketId: socket.id, username: user.username, isEliminated: false });
      socket.join(roomId);
      socket.emit('room_joined', { roomId, players: tournament.players.map(p => ({ id: p.id, username: p.username })) });
      io.to(roomId).emit('players_update', { players: tournament.players.map(p => ({ id: p.id, username: p.username })) });
    });

    socket.on('start_tournament', ({ roomId }) => {
      const tournament = tournaments.get(roomId);
      if (!tournament) return socket.emit('error', 'Tournament not found');
      if (tournament.hostId !== socket.id) return socket.emit('error', 'Only the host can start');
      if (tournament.players.length < 2) return socket.emit('error', 'Need at least 2 players');

      tournament.status = 'in_progress';
      tournament.round = 1;
      
      pairRound(tournament, io);
    });

    socket.on('make_move', ({ matchId, move, fen }) => {
      // Find the tournament and match
      for (const t of tournaments.values()) {
        const match = t.matches.find(m => m.id === matchId);
        if (match && match.status === 'ongoing') {
          match.fen = fen;
          // Broadcast to everyone in the match room (players + spectators)
          socket.to(matchId).emit('move_made', { move, fen });
          break;
        }
      }
    });

    socket.on('match_end', ({ matchId, winnerId }) => {
       for (const t of tournaments.values()) {
        const match = t.matches.find(m => m.id === matchId);
        if (match && match.status === 'ongoing') {
          match.status = 'finished';
          match.winnerId = winnerId;
          
          // Mark loser as eliminated
          const loserId = match.white.id === winnerId ? match.black.id : match.white.id;
          const loser = t.players.find(p => p.id === loserId);
          if (loser) loser.isEliminated = true;

          io.to(matchId).emit('match_finished', { winnerId });

          // Check if all matches in round are finished
          const allFinished = t.matches.every(m => m.status === 'finished');
          if (allFinished) {
            const activePlayers = t.players.filter(p => !p.isEliminated);
            if (activePlayers.length === 1) {
              t.status = 'finished';
              
              // Save to MongoDB
              prisma.tournament.create({
                data: {
                  name: `Room ${t.id}`,
                  status: 'completed',
                  creatorId: t.players[0].id,
                  winnerId: activePlayers[0].id,
                  timeControl: t.timeControl,
                  participants: {
                    create: t.players.map(p => ({
                      userId: p.id,
                      status: p.isEliminated ? 'eliminated' : 'winner',
                      score: p.isEliminated ? 0 : 1
                    }))
                  }
                }
              }).catch(console.error);

              io.to(t.id).emit('tournament_finished', { winnerId: activePlayers[0].id, winnerName: activePlayers[0].username });
            } else {
              t.round++;
              setTimeout(() => pairRound(t, io), 3000); // 3 second delay between rounds
            }
          }
          break;
        }
      }
    });

    socket.on('join_spectator', ({ matchId }) => {
      socket.join(matchId);
      // Give them the current FEN
      for (const t of tournaments.values()) {
        const match = t.matches.find(m => m.id === matchId);
        if (match) {
          socket.emit('sync_spectator', { fen: match.fen });
          break;
        }
      }
    });

    socket.on('disconnect', () => {
      // Basic cleanup (if host disconnects, might want to destroy room)
      // If player disconnects mid-match, auto-resign them.
    });
  });
};

function pairRound(tournament: Tournament, io: Server) {
  // Clear old matches
  tournament.matches = [];
  
  // Get active players and shuffle
  const active = tournament.players.filter(p => !p.isEliminated).sort(() => Math.random() - 0.5);
  
  // Pair up
  const pairs: Player[][] = [];
  let spectator: Player | null = null;
  
  if (active.length % 2 !== 0) {
    spectator = active.pop()!;
  }
  
  for (let i = 0; i < active.length; i += 2) {
    pairs.push([active[i], active[i+1]]);
  }
  
  const currentMatches: any[] = [];
  
  pairs.forEach((pair, idx) => {
    const matchId = `${tournament.id}-R${tournament.round}-M${idx}`;
    const match: Match = {
      id: matchId,
      white: pair[0],
      black: pair[1],
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      status: 'ongoing'
    };
    tournament.matches.push(match);
    
    // Add sockets to match room
    io.sockets.sockets.get(pair[0].socketId)?.join(matchId);
    io.sockets.sockets.get(pair[1].socketId)?.join(matchId);
    
    currentMatches.push({
      matchId,
      white: pair[0],
      black: pair[1]
    });
  });

  // Notify players
  io.to(tournament.id).emit('round_started', {
    round: tournament.round,
    matches: currentMatches,
    spectator: spectator ? spectator.id : null
  });
}
