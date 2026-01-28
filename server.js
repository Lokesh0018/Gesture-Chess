const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(__dirname));

// Serve index.html by default
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Rooms state
const rooms = {};

const generateRoomCode = () => {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
};

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    socket.on('create_room', () => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = { players: [{ id: socket.id, role: 'White' }] };
        socket.join(roomCode);
        socket.emit('room_created', roomCode);
        console.log(`Room ${roomCode} created by ${socket.id}`);
    });

    socket.on('join_room', (roomCode) => {
        roomCode = roomCode.toUpperCase();
        const room = rooms[roomCode];

        if (!room) {
            socket.emit('error', 'Room not found');
            return;
        }

        if (room.players.length >= 2) {
            socket.emit('error', 'Room is full');
            return;
        }

        room.players.push({ id: socket.id, role: 'Black' });
        socket.join(roomCode);
        
        console.log(`${socket.id} joined room ${roomCode}`);
        
        // Notify both players to start
        io.to(roomCode).emit('game_start', {
            players: room.players
        });
    });

    socket.on('move', (data) => {
        // data contains { roomCode, move: {...} }
        socket.to(data.roomCode).emit('opponent_move', data.move);
    });

    socket.on('chat', (data) => {
        // data contains { roomCode, message, senderId, senderRole }
        io.to(data.roomCode).emit('chat_message', data);
    });

    socket.on('emote', (data) => {
        // data contains { roomCode, emoteId, senderRole }
        io.to(data.roomCode).emit('player_emote', data);
    });

    socket.on('offer_draw', (roomCode) => {
        socket.to(roomCode).emit('draw_offered');
    });

    socket.on('accept_draw', (roomCode) => {
        io.to(roomCode).emit('draw_agreed');
    });

    socket.on('rejoin_room', (data) => {
        const room = rooms[data.roomCode];
        if (room) {
            const player = room.players.find(p => p.role === data.role);
            if (player && player.disconnected) {
                clearTimeout(player.disconnectTimer);
                player.disconnected = false;
                player.id = socket.id;
                socket.join(data.roomCode);
                console.log(`${socket.id} rejoined room ${data.roomCode}`);
            }
        } else {
            socket.emit('rejoin_failed');
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (const [code, room] of Object.entries(rooms)) {
            const index = room.players.findIndex(p => p.id === socket.id);
            if (index !== -1) {
                const disconnectedPlayer = room.players[index];
                disconnectedPlayer.disconnected = true;
                disconnectedPlayer.disconnectTimer = setTimeout(() => {
                    if (rooms[code]) {
                        const i = rooms[code].players.findIndex(p => p.id === socket.id && p.disconnected);
                        if (i !== -1) {
                            rooms[code].players.splice(i, 1);
                            io.to(code).emit('opponent_disconnected');
                            if (rooms[code].players.length === 0) {
                                delete rooms[code];
                            }
                        }
                    }
                }, 5000);
                break;
            }
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
