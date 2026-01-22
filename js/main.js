import { state, initializeBoard } from './state.js';
import { createBoard, renderBoard, clearDots } from './dom.js';
import { showMoves, showGameOver } from './ui.js';
import { movePiece } from './game.js';

window.onload = () => {
    initializeBoard();
    createBoard();
    renderBoard();
    
    const container = document.querySelector(".container");

    // Main layout wrapper
    const layoutWrapper = document.createElement("div");
    layoutWrapper.style.display = "flex";
    layoutWrapper.style.flexDirection = "row";
    layoutWrapper.style.justifyContent = "center";
    layoutWrapper.style.alignItems = "flex-start";
    layoutWrapper.style.gap = "20px";
    layoutWrapper.style.width = "100%";
    layoutWrapper.style.padding = "20px";
    layoutWrapper.style.boxSizing = "border-box";

    // 1. Main Game Area (Center)
    const mainGameArea = document.createElement("div");
    mainGameArea.className = "main-game-area";

    // Player 2 Header (Top)
    const topPlayer = document.createElement("div");
    topPlayer.className = "player-info";
    topPlayer.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <div class="player-avatar" style="background-color: #7b4f3b; background-image: url('https://images.chesscomfiles.com/uploads/v1/user/103289066.b68ed511.50x50o.c6d040715cf4.png');"></div>
            <div class="player-name">Player 2</div>
        </div>
        <div class="player-clock clock-dark" id="black-clock">10:00</div>
    `;

    // Player 1 Header (Bottom)
    const bottomPlayer = document.createElement("div");
    bottomPlayer.className = "player-info";
    bottomPlayer.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <div class="player-avatar" style="background-color: #aaa; background-image: url('https://images.chesscomfiles.com/uploads/v1/user/103289066.b68ed511.50x50o.c6d040715cf4.png');"></div>
            <div class="player-name">Player 1</div>
        </div>
        <div class="player-clock" id="white-clock">10:00</div>
    `;

    // Board Row (Left Capture, Board, Right Capture)
    const boardRow = document.createElement("div");
    boardRow.style.display = "flex";
    boardRow.style.flexDirection = "row";
    boardRow.style.alignItems = "stretch";
    boardRow.style.gap = "10px";

    // Left Capture Panel (White pieces killed by Black)
    const leftCapturePanel = document.createElement("div");
    leftCapturePanel.className = "capture-panel";
    
    const blackCaptures = document.createElement("div");
    blackCaptures.className = "side-captures";
    blackCaptures.id = "black-captures"; // Black's captures (White pieces)

    leftCapturePanel.appendChild(blackCaptures);

    // Right Capture Panel (Black pieces killed by White)
    const rightCapturePanel = document.createElement("div");
    rightCapturePanel.className = "capture-panel";

    const whiteCaptures = document.createElement("div");
    whiteCaptures.className = "side-captures";
    whiteCaptures.id = "white-captures"; // White's captures (Black pieces)

    rightCapturePanel.appendChild(whiteCaptures);

    boardRow.appendChild(leftCapturePanel);
    boardRow.appendChild(container);
    boardRow.appendChild(rightCapturePanel);

    mainGameArea.appendChild(topPlayer);
    mainGameArea.appendChild(boardRow);
    mainGameArea.appendChild(bottomPlayer);

    // Wire state for clocks and captures
    state.rightPanel = blackCaptures; 
    state.leftPanel = whiteCaptures;  
    state.clockBlackDOM = topPlayer.querySelector('#black-clock');
    state.clockWhiteDOM = bottomPlayer.querySelector('#white-clock');

    // 2. Right Sidebar (Restart + Move History + Draw/Resign)
    const rightSidebar = document.createElement("div");
    rightSidebar.className = "right-sidebar";

    const restartBtn = document.createElement("button");
    restartBtn.innerHTML = "↻ Restart Game";
    restartBtn.title = "Restart Game";
    restartBtn.style.cssText = "background:#2b2927; border:none; border-bottom: 1px solid #403d39; color:#fff; font-size:16px; font-weight:bold; cursor:pointer; padding:15px; width: 100%; text-align:center;";
    restartBtn.onclick = () => location.reload();
    restartBtn.onmouseover = () => restartBtn.style.backgroundColor = "#3d3b39";
    restartBtn.onmouseout = () => restartBtn.style.backgroundColor = "#2b2927";

    const movesContainer = document.createElement("div");
    movesContainer.className = "moves-container";
    state.moveHistoryPanel = movesContainer;

    const controlsBar = document.createElement("div");
    controlsBar.className = "controls-bar";

    const actionButtons = document.createElement("div");
    actionButtons.className = "action-buttons";

    const drawBtn = document.createElement("button");
    drawBtn.className = "action-btn";
    drawBtn.innerHTML = "½ Draw";
    drawBtn.onclick = () => showGameOver("Draw by Agreement");

    const resignBtn = document.createElement("button");
    resignBtn.className = "action-btn";
    resignBtn.innerHTML = "🏳 Resign";
    resignBtn.onclick = () => showGameOver("White Resigned");

    actionButtons.appendChild(drawBtn);
    actionButtons.appendChild(resignBtn);
    controlsBar.appendChild(actionButtons);

    rightSidebar.appendChild(restartBtn);
    rightSidebar.appendChild(movesContainer);
    rightSidebar.appendChild(controlsBar);

    layoutWrapper.appendChild(mainGameArea);
    layoutWrapper.appendChild(rightSidebar);

    document.body.appendChild(layoutWrapper);

    const dummyTurn = document.createElement("div");
    state.turnIndicator = dummyTurn;

    container.addEventListener("click", (e) => {
        const target = e.target;
        const square = target.classList.contains('child') ? target : target.parentElement;
        if (!square || !square.classList.contains('child')) return;

        const i = parseInt(square.dataset.i);
        const j = parseInt(square.dataset.j);

        if (square.classList.contains('dot')) {
            movePiece(i, j);
            return;
        }

        const piece = state.board[i][j];
        if (piece && piece.color === state.currentTurn) {
            showMoves(i, j);
        } else {
            clearDots();
            state.selectedSquare = null;
        }
    });

    container.addEventListener("dragstart", (e) => {
        const target = e.target;
        if (target.matches("img")) {
            const i = parseInt(target.dataset.i);
            const j = parseInt(target.dataset.j);
            const piece = state.board[i][j];
            if (piece && piece.color === state.currentTurn) {
                showMoves(i, j);
                target.classList.add("dragging");
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", "chess-piece");
            } else {
                e.preventDefault();
            }
        }
    });

    container.addEventListener("dragend", (e) => {
        if (e.target.matches("img")) {
            e.target.classList.remove("dragging");
        }
    });

    container.addEventListener("dragover", (e) => {
        e.preventDefault(); 
        e.dataTransfer.dropEffect = "move";
    });

    container.addEventListener("drop", (e) => {
        e.preventDefault();
        const target = e.target;
        const square = target.classList.contains('child') ? target : target.parentElement;
        if (!square || !square.classList.contains('child')) return;

        const i = parseInt(square.dataset.i);
        const j = parseInt(square.dataset.j);

        if (square.classList.contains('dot')) {
            movePiece(i, j);
        } else {
            clearDots();
            state.selectedSquare = null;
        }
    });
};
