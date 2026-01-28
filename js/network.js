import { state, COLORS } from './state.js';
import { movePiece } from './game.js';

export let socket = null;
export let roomCode = null;

export const initNetwork = () => {
    if (!window.isOnlineMultiplayer) return;

    socket = io();

    const btnCreate = document.getElementById('btn-create');
    const btnJoin = document.getElementById('btn-join');
    const inputJoin = document.getElementById('input-join');
    const statusDiv = document.getElementById('lobby-status');
    const roomDisplay = document.getElementById('room-display');

    const savedRoom = sessionStorage.getItem('chessRoomCode');
    const savedRole = sessionStorage.getItem('chessPlayerRole');
    
    if (savedRoom && savedRole) {
        roomCode = savedRoom;
        state.playerRole = savedRole;
        socket.emit('rejoin_room', { roomCode, role: state.playerRole });
        document.getElementById('lobby-overlay').style.display = 'none';
        document.getElementById('chat-fab').style.display = 'flex';
        
        if (state.playerRole === 'Black') {
            import('./dom.js').then(dom => {
                dom.createBoard();
                dom.renderBoard();
            });
            const topName = document.getElementById('top-player-name');
            const botName = document.getElementById('bottom-player-name');
            if (topName) topName.innerText = "Player 1";
            if (botName) botName.innerText = "Player 2";
        }
    }

    if (btnCreate) {
        btnCreate.addEventListener('click', () => {
            socket.emit('create_room');
            btnCreate.disabled = true;
            btnJoin.disabled = true;
            inputJoin.disabled = true;
            statusDiv.innerText = "Creating room...";
        });
    }

    if (btnJoin) {
        btnJoin.addEventListener('click', () => {
            const code = inputJoin.value.trim().toUpperCase();
            if (code.length === 4) {
                socket.emit('join_room', code);
                btnCreate.disabled = true;
                btnJoin.disabled = true;
                inputJoin.disabled = true;
                statusDiv.innerText = "Joining room...";
            }
        });
    }

    socket.on('room_created', (code) => {
        roomCode = code;
        state.playerRole = COLORS.WHITE; // Creator is White
        statusDiv.innerText = "Waiting for opponent...";
        roomDisplay.innerText = `CODE: ${code}`;
    });

    socket.on('game_start', (data) => {
        // If we are the joiner
        if (!state.playerRole) {
            state.playerRole = COLORS.BLACK;
            roomCode = inputJoin.value.trim().toUpperCase();
        }

        document.getElementById('lobby-overlay').style.display = 'none';
        document.getElementById('chat-fab').style.display = 'flex';
        
        if (state.playerRole === 'Black') {
            import('./dom.js').then(dom => {
                dom.createBoard();
                dom.renderBoard();
            });
            const topName = document.getElementById('top-player-name');
            const botName = document.getElementById('bottom-player-name');
            if (topName) topName.innerText = "Player 1";
            if (botName) botName.innerText = "Player 2";
        }

        sessionStorage.setItem('chessRoomCode', roomCode);
        sessionStorage.setItem('chessPlayerRole', state.playerRole);
    });

    socket.on('opponent_move', (moveData) => {
        // moveData = { startI, startJ, targetI, targetJ, promotionType }
        state.isExecutingNetworkMove = true;
        state.networkPromotionType = moveData.promotionType;
        state.selectedSquare = { i: moveData.startI, j: moveData.startJ };
        movePiece(moveData.targetI, moveData.targetJ);
        state.isExecutingNetworkMove = false;
        state.networkPromotionType = null;
    });

    socket.on('chat_message', (data) => {
        addChatMessage(data.message, data.senderRole === state.playerRole);
        const chatContainer = document.getElementById('chat-container');
        const chatFab = document.getElementById('chat-fab');
        if (chatContainer && chatContainer.style.display !== 'flex' && chatFab) {
            chatFab.classList.add('unread');
        }
    });

    socket.on('error', (msg) => {
        statusDiv.innerText = msg;
        btnCreate.disabled = false;
        btnJoin.disabled = false;
        inputJoin.disabled = false;
    });

    socket.on('opponent_disconnected', () => {
        document.getElementById('lobby-status').innerText = "Opponent disconnected.";
        alert('Opponent has disconnected. The game has ended.');
        sessionStorage.removeItem('chessRoomCode');
        sessionStorage.removeItem('chessPlayerRole');
        sessionStorage.removeItem('chessGameState');
        window.location.reload();
    });

    socket.on('rejoin_failed', () => {
        sessionStorage.removeItem('chessRoomCode');
        sessionStorage.removeItem('chessPlayerRole');
        sessionStorage.removeItem('chessGameState');
        window.location.reload();
    });

    socket.on('draw_offered', () => {
        if (confirm('Your opponent has offered a draw. Do you accept?')) {
            socket.emit('accept_draw', roomCode);
        }
    });

    socket.on('draw_agreed', () => {
        import('./ui.js').then(ui => ui.showGameOver("Draw by Agreement"));
    });

    // Chat functionality
    const chatInput = document.getElementById('chat-input');
    const chatSendBtn = document.getElementById('chat-send');
    const chatFab = document.getElementById('chat-fab');
    const chatContainer = document.getElementById('chat-container');
    const chatClose = document.getElementById('chat-close');

    if (chatFab) {
        chatFab.addEventListener('click', () => {
            chatContainer.style.display = 'flex';
            chatFab.classList.remove('unread');
            chatFab.style.display = 'none';
        });
    }

    if (chatClose) {
        chatClose.addEventListener('click', () => {
            chatContainer.style.display = 'none';
            chatFab.style.display = 'flex';
        });
    }
    
    const sendChat = () => {
        if (chatInput.value.trim()) {
            socket.emit('chat', {
                roomCode,
                message: chatInput.value.trim(),
                senderId: socket.id,
                senderRole: state.playerRole
            });
            chatInput.value = '';
        }
    };

    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendChat();
        });
    }
    
    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', sendChat);
    }
};

export const emitMove = (startI, startJ, targetI, targetJ, promotionType = null) => {
    if (!socket || !roomCode) return;
    if (state.isExecutingNetworkMove) return; // Don't echo

    socket.emit('move', {
        roomCode,
        move: { startI, startJ, targetI, targetJ, promotionType }
    });
};

const addChatMessage = (msg, isSelf) => {
    const container = document.getElementById('chat-messages');
    if (!container) return;

    const div = document.createElement('div');
    div.className = `chat-msg ${isSelf ? 'self' : ''}`;
    div.innerText = msg;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
};
