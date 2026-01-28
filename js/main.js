import { state, initializeBoard } from './state.js';
import { createBoard, renderBoard, clearDots } from './dom.js';
import { showMoves, showGameOver } from './ui.js';
import { movePiece, undoAction, redoAction, handleHover, handleHoverOut, updateEvalBar } from './game.js';
import { initNetwork } from './network.js';

window.onload = () => {
    initializeBoard();
    createBoard();
    renderBoard();
    
    const container = document.querySelector(".container");

    // Main layout wrapper
    const layoutWrapper = document.createElement("div");
    layoutWrapper.className = "layout-wrapper";
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
        <div style="display:flex; align-items:center; gap:10px; position:relative;">
            <div class="player-avatar" style="background-color: #7b4f3b; background-image: url('https://images.chesscomfiles.com/uploads/v1/user/103289066.b68ed511.50x50o.c6d040715cf4.png');"></div>
            <div class="player-name">Player 2</div>
            <div id="p2-trumpet" style="position: absolute; right: -60px; bottom: -10px; z-index: 100;"></div>
        </div>
        <div class="player-clock clock-dark" id="black-clock">00:00</div>
    `;

    // Player 1 Header (Bottom)
    const bottomPlayer = document.createElement("div");
    bottomPlayer.className = "player-info";
    bottomPlayer.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px; position:relative;">
            <div class="player-avatar" style="background-color: #aaa; background-image: url('https://images.chesscomfiles.com/uploads/v1/user/103289066.b68ed511.50x50o.c6d040715cf4.png');"></div>
            <div class="player-name">Player 1</div>
            <div id="p1-trumpet" style="position: absolute; right: -60px; bottom: -10px; z-index: 100;"></div>
        </div>
        <div class="player-clock" id="white-clock">00:00</div>
    `;

    // Board Row (Left Capture, Board, Right Capture)
    const boardRow = document.createElement("div");
    boardRow.className = "board-row";
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

    const evalBarWrapper = document.createElement("div");
    evalBarWrapper.className = "eval-bar-wrapper";
    evalBarWrapper.innerHTML = `<div id="eval-fill" style="transition: height 0.4s ease-in-out;"></div>`;

    boardRow.appendChild(evalBarWrapper);
    boardRow.appendChild(leftCapturePanel);
    boardRow.appendChild(container);
    boardRow.appendChild(rightCapturePanel);

    // Create a real, visible turn indicator
    const turnIndicatorWrapper = document.createElement("div");
    turnIndicatorWrapper.style.cssText = "text-align: center; font-size: 20px; font-weight: bold; color: #ebecd0; margin: 10px 0; padding: 10px; background: #2b2927; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.3);";
    turnIndicatorWrapper.innerText = "White's Turn";
    state.turnIndicator = turnIndicatorWrapper;

    mainGameArea.appendChild(topPlayer);
    mainGameArea.appendChild(turnIndicatorWrapper);
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

    updateEvalBar();

    if (window.isOnlineMultiplayer) {
        initNetwork();
    }

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

    container.addEventListener("contextmenu", (e) => e.preventDefault());

    let draggedImg = null;
    let dragStartSquare = null;
    let pointerId = null;
    let startX = 0, startY = 0;
    let isDragging = false;
    
    let rightDragStartSquare = null;
    let activeArrow = null;

    container.addEventListener("pointerdown", (e) => {
        if (window.isAnimating) return;
        
        if (e.button === 2) {
            e.preventDefault();
            const sq = e.target.closest('.child');
            if (sq) {
                rightDragStartSquare = sq;
                const rect = sq.getBoundingClientRect();
                const boardRect = container.getBoundingClientRect();
                const sX = rect.left + rect.width / 2 - boardRect.left;
                const sY = rect.top + rect.height / 2 - boardRect.top;
                
                activeArrow = document.createElementNS('http://www.w3.org/2000/svg', 'line');
                activeArrow.setAttribute('x1', sX);
                activeArrow.setAttribute('y1', sY);
                activeArrow.setAttribute('x2', sX);
                activeArrow.setAttribute('y2', sY);
                activeArrow.setAttribute('stroke', 'rgba(235, 97, 80, 0.8)');
                activeArrow.setAttribute('stroke-width', '12');
                activeArrow.setAttribute('stroke-linecap', 'round');
                activeArrow.setAttribute('marker-end', 'url(#arrowhead)');
                
                const svg = document.getElementById('tactical-overlay');
                if (svg) svg.appendChild(activeArrow);
            }
            return;
        }

        if (e.button === 0) {
            const svg = document.getElementById('tactical-overlay');
            if (svg) Array.from(svg.querySelectorAll('line')).forEach(line => line.remove());
            document.querySelectorAll('.highlight-square').forEach(el => el.classList.remove('highlight-square'));
            
            // Left click also clears premoves
            state.premove = null;
            document.querySelectorAll('.premove-square').forEach(el => el.classList.remove('premove-square'));
        }

        if (e.target.matches("img") && !e.target.classList.contains('particle')) {
            const sq = e.target.parentElement;
            const i = parseInt(sq.dataset.i);
            const j = parseInt(sq.dataset.j);
            const piece = state.board[i][j];
            if (piece) {
                if (window.isOnlineMultiplayer && state.playerRole && piece.color !== state.playerRole) return;
                
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
                if (piece.color === state.currentTurn) showMoves(i, j);
            }
        }
    });

    window.addEventListener("pointermove", (e) => {
        if (activeArrow) {
            const boardRect = container.getBoundingClientRect();
            activeArrow.setAttribute('x2', e.clientX - boardRect.left);
            activeArrow.setAttribute('y2', e.clientY - boardRect.top);
            return;
        }

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
                    draggedImg.style.transform = 'scale(1.15)';
                    draggedImg.style.filter = 'drop-shadow(0 15px 20px rgba(0,0,0,0.6))';
                    draggedImg.style.cursor = 'grabbing';
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
        if (activeArrow) {
            const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
            const dropSquare = elemBelow ? elemBelow.closest('.child') : null;
            
            if (dropSquare && dropSquare !== rightDragStartSquare) {
                const rect = dropSquare.getBoundingClientRect();
                const boardRect = container.getBoundingClientRect();
                const endX = rect.left + rect.width / 2 - boardRect.left;
                const endY = rect.top + rect.height / 2 - boardRect.top;
                
                const startX = parseFloat(activeArrow.getAttribute('x1'));
                const startY = parseFloat(activeArrow.getAttribute('y1'));
                const angle = Math.atan2(endY - startY, endX - startX);
                const offset = 22; 
                
                activeArrow.setAttribute('x2', endX - Math.cos(angle) * offset);
                activeArrow.setAttribute('y2', endY - Math.sin(angle) * offset);
            } else if (dropSquare === rightDragStartSquare) {
                activeArrow.remove();
                dropSquare.classList.toggle('highlight-square');
            } else {
                activeArrow.remove();
            }
            activeArrow = null;
            rightDragStartSquare = null;
            return;
        }

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
                draggedImg.style.filter = '';
                draggedImg.style.cursor = '';
                
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
                
                const piece = state.board[startI][startJ];
                if (piece && piece.color === state.currentTurn) {
                    if (startI === targetI && startJ === targetJ) {
                        // It's a click, leave the piece selected
                    } else if (dropSquare.classList.contains('dot')) {
                        movePiece(targetI, targetJ);
                    } else {
                        clearDots();
                        state.selectedSquare = null;
                    }
                } else if (piece && piece.color !== state.currentTurn) {
                    // Premove logic!
                    if (startI !== targetI || startJ !== targetJ) {
                        state.premove = { startI, startJ, targetI, targetJ };
                        document.querySelectorAll('.premove-square').forEach(el => el.classList.remove('premove-square'));
                        dropSquare.classList.add('premove-square');
                    }
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

    window.addEventListener('execute-premove', (e) => {
        const pm = e.detail;
        const p = state.board[pm.startI][pm.startJ];
        if (p && p.color === state.currentTurn) {
            showMoves(pm.startI, pm.startJ);
            const targetSq = document.querySelector(`.child[data-i="${pm.targetI}"][data-j="${pm.targetJ}"]`);
            if (targetSq && targetSq.classList.contains('dot')) {
                movePiece(pm.targetI, pm.targetJ);
            } else {
                clearDots();
                state.selectedSquare = null;
            }
        }
    });
};
