import { state, initializeBoard } from './state.js';
import { createBoard, renderBoard, clearDots } from './dom.js';
import { showMoves, showGameOver } from './ui.js';
import { movePiece, undoAction, redoAction, handleHover, handleHoverOut } from './game.js';

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
        <div class="player-clock clock-dark" id="black-clock">00:00</div>
    `;

    // Player 1 Header (Bottom)
    const bottomPlayer = document.createElement("div");
    bottomPlayer.className = "player-info";
    bottomPlayer.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <div class="player-avatar" style="background-color: #aaa; background-image: url('https://images.chesscomfiles.com/uploads/v1/user/103289066.b68ed511.50x50o.c6d040715cf4.png');"></div>
            <div class="player-name">Player 1</div>
        </div>
        <div class="player-clock" id="white-clock">00:00</div>
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

    const controlsBar = document.createElement("div");
    controlsBar.className = "controls-bar";

    const drawResignRow = document.createElement("div");
    drawResignRow.className = "action-buttons";

    const drawBtn = document.createElement("button");
    drawBtn.className = "action-btn";
    drawBtn.innerHTML = "½ Draw";
    drawBtn.onclick = () => showGameOver("Draw by Agreement");

    const resignBtn = document.createElement("button");
    resignBtn.className = "action-btn";
    resignBtn.innerHTML = "🏳 Resign";
    resignBtn.onclick = () => showGameOver("White Resigned");

    drawResignRow.appendChild(drawBtn);
    drawResignRow.appendChild(resignBtn);

    const undoRedoRow = document.createElement("div");
    undoRedoRow.className = "action-buttons";

    const undoBtn = document.createElement("button");
    undoBtn.className = "action-btn";
    undoBtn.innerHTML = "⤺ Undo";
    undoBtn.onclick = undoAction;

    const redoBtn = document.createElement("button");
    redoBtn.className = "action-btn";
    redoBtn.innerHTML = "⤻ Redo";
    redoBtn.onclick = redoAction;

    undoRedoRow.appendChild(undoBtn);
    undoRedoRow.appendChild(redoBtn);

    controlsBar.appendChild(drawResignRow);
    controlsBar.appendChild(undoRedoRow);

    const movesContainer = document.createElement("div");
    movesContainer.className = "moves-container";
    state.moveHistoryPanel = movesContainer;

    rightSidebar.appendChild(restartBtn);
    rightSidebar.appendChild(controlsBar);
    rightSidebar.appendChild(movesContainer);

    layoutWrapper.appendChild(mainGameArea);
    layoutWrapper.appendChild(rightSidebar);

    document.body.appendChild(layoutWrapper);

    const dummyTurn = document.createElement("div");
    state.turnIndicator = dummyTurn;

    container.addEventListener("mousemove", (e) => {
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        container.style.setProperty('--mouse-x', `${x}px`);
        container.style.setProperty('--mouse-y', `${y}px`);
    });

    container.addEventListener("mouseover", (e) => {
        const square = e.target.closest('.child');
        if (!square) return;
        const i = parseInt(square.dataset.i);
        const j = parseInt(square.dataset.j);
        handleHover(i, j);
    });

    container.addEventListener("mouseout", (e) => {
        const square = e.target.closest('.child');
        if (!square) return;
        handleHoverOut();
    });

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

    let draggedImg = null;
    let dragStartSquare = null;
    let pointerId = null;
    let startX = 0, startY = 0;
    let isDragging = false;

    container.addEventListener("pointerdown", (e) => {
        if (window.isAnimating) return;
        if (e.target.matches("img") && !e.target.classList.contains('particle')) {
            const sq = e.target.parentElement;
            const i = parseInt(sq.dataset.i);
            const j = parseInt(sq.dataset.j);
            const piece = state.board[i][j];
            if (piece && piece.color === state.currentTurn) {
                e.preventDefault();
                pointerId = e.pointerId;
                draggedImg = e.target;
                draggedImg.classList.remove('drop-in'); // Prevent animation from replaying
                dragStartSquare = sq;
                startX = e.clientX;
                startY = e.clientY;
                isDragging = false;
                
                const sqRect = sq.getBoundingClientRect();
                const imgW = sqRect.width * 0.85;
                const imgH = sqRect.height * 0.85;
                const imgLeft = sqRect.left + (sqRect.width - imgW) / 2;
                const imgTop = sqRect.top + (sqRect.height - imgH) / 2;
                
                draggedImg.dataset.width = imgW;
                draggedImg.dataset.height = imgH;
                draggedImg.dataset.offsetX = startX - imgLeft;
                draggedImg.dataset.offsetY = startY - imgTop;
                
                draggedImg.setPointerCapture(pointerId);
                showMoves(i, j);
            }
        }
    });

    window.addEventListener("pointermove", (e) => {
        if (draggedImg && e.pointerId === pointerId) {
            if (!isDragging) {
                const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
                if (dist > 5) {
                    isDragging = true;
                    
                    document.body.appendChild(draggedImg);
                    draggedImg.classList.add("dragging");
                    draggedImg.style.transition = 'none';
                    draggedImg.style.position = 'fixed';
                    draggedImg.style.zIndex = '1000';
                    draggedImg.style.margin = '0';
                    draggedImg.style.width = `${draggedImg.dataset.width}px`;
                    draggedImg.style.height = `${draggedImg.dataset.height}px`;
                    draggedImg.style.transform = 'none';
                }
            }

            if (isDragging) {
                const ox = parseFloat(draggedImg.dataset.offsetX) || 0;
                const oy = parseFloat(draggedImg.dataset.offsetY) || 0;
                draggedImg.style.left = `${e.clientX - ox}px`;
                draggedImg.style.top = `${e.clientY - oy}px`;
            }
        }
    });

    window.addEventListener("pointerup", (e) => {
        if (draggedImg && e.pointerId === pointerId) {
            draggedImg.releasePointerCapture(pointerId);
            
            let dropSquare = null;
            
            if (isDragging) {
                draggedImg.classList.remove("dragging");
                draggedImg.style.transition = '';
                draggedImg.style.position = '';
                draggedImg.style.zIndex = '';
                draggedImg.style.width = '';
                draggedImg.style.height = '';
                draggedImg.style.left = '';
                draggedImg.style.top = '';
                draggedImg.style.margin = '';
                draggedImg.style.transform = '';
                
                draggedImg.style.display = 'none';
                const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
                draggedImg.style.display = '';
                
                dropSquare = elemBelow ? elemBelow.closest('.child') : null;
                dragStartSquare.appendChild(draggedImg);
            }

            if (isDragging && dropSquare) {
                const targetI = parseInt(dropSquare.dataset.i);
                const targetJ = parseInt(dropSquare.dataset.j);
                const startI = parseInt(dragStartSquare.dataset.i);
                const startJ = parseInt(dragStartSquare.dataset.j);
                
                if (startI === targetI && startJ === targetJ) {
                    // It's a click, leave the piece selected
                } else if (dropSquare.classList.contains('dot')) {
                    movePiece(targetI, targetJ);
                } else {
                    clearDots();
                    state.selectedSquare = null;
                }
            } else if (isDragging && !dropSquare) {
                clearDots();
                state.selectedSquare = null;
            }
            
            draggedImg = null;
            dragStartSquare = null;
            pointerId = null;
            isDragging = false;
        }
    });
};
