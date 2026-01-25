import { state, COLORS, PIECES, recordPosition, saveState, restoreState, redoState } from './state.js';
import { clearDots, renderBoard, getSquare } from './dom.js';
import { isUnderAttack, hasAnyValidMoves, checkDrawConditions } from './logic.js';
import { showPromotionModal, showCheckMessage, showGameOver, showNotification, showMoves } from './ui.js';
import { playMoveAnimation, playCastlingRookAnimation, playPromotionAscension } from './animations.js';

const moveSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3');
const captureSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3');

export const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
};

export const startTimer = () => {
    if (state.timerInterval) return;
    state.timerInterval = setInterval(() => {
        if (state.currentTurn === COLORS.WHITE) {
            state.whiteTime++;
            if (state.clockWhiteDOM) state.clockWhiteDOM.innerText = formatTime(state.whiteTime);
        } else {
            state.blackTime++;
            if (state.clockBlackDOM) state.clockBlackDOM.innerText = formatTime(state.blackTime);
        }
    }, 1000);
};

export const stopTimer = () => {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
};
const checkSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3');

export const postMoveChecks = () => {
    let kingSq = null;
    for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
            const p = state.board[i][j];
            if(p && p.color === state.currentTurn && p.type === PIECES.KING) {
                kingSq = {i, j};
                break;
            }
        }
    }
    
    let inCheck = false;
    if (kingSq) {
        inCheck = isUnderAttack(kingSq.i, kingSq.j, state.currentTurn);
    }
    
    document.querySelectorAll('.in-check').forEach(el => el.classList.remove('in-check'));
    if (inCheck && kingSq) {
        const sq = getSquare(kingSq.i, kingSq.j);
        if(sq) sq.classList.add('in-check');
    }

    if (!hasAnyValidMoves()) {
        if (inCheck) showGameOver(`Checkmate! ${state.currentTurn === COLORS.WHITE ? 'Black' : 'White'} Wins!`);
        else showGameOver("Stalemate! It's a draw!");
        return;
    }
    
    const drawMsg = checkDrawConditions();
    if (drawMsg) {
        stopTimer();
        if (state.whiteTime > state.blackTime) {
            showGameOver(`Black Wins! (Time Tiebreaker on ${drawMsg})`);
        } else if (state.blackTime > state.whiteTime) {
            showGameOver(`White Wins! (Time Tiebreaker on ${drawMsg})`);
        } else {
            showGameOver(`Stalemate! (Time Tied on ${drawMsg})`);
        }
        return;
    }

    if (inCheck) {
        showCheckMessage();
        checkSound.play().catch(e => console.warn("Audio play prevented", e));
    }
};

const getAlgebraic = (piece, startI, startJ, targetI, targetJ, captured) => {
    const files = "abcdefgh";
    const ranks = "87654321";
    let notation = "";
    
    if (piece.type === PIECES.KING && Math.abs(startJ - targetJ) === 2) {
        return targetJ === 6 ? "O-O" : "O-O-O";
    }
    
    if (piece.type !== PIECES.PAWN) {
        const pChar = piece.type === PIECES.HORSE ? 'N' : piece.type[0];
        notation += pChar;
    } else if (captured) {
        notation += files[startJ];
    }
    
    if (captured) notation += "x";
    notation += files[targetJ] + ranks[targetI];
    
    return notation;
}

export const handleHover = (i, j) => {
    if (window.isAnimating || state.selectedSquare) return;
    const piece = state.board[i][j];
    if (piece && piece.color === state.currentTurn) {
        showMoves(i, j, true);
    }
};

export const handleHoverOut = () => {
    if (!state.selectedSquare) {
        document.querySelectorAll('.hover-dot').forEach(el => el.classList.remove('hover-dot'));
    }
};


const restoreHighlights = () => {
    document.querySelectorAll('.in-check').forEach(el => el.classList.remove('in-check'));
    document.querySelectorAll('.last-move').forEach(el => el.classList.remove('last-move'));
    
    if (state.lastMove) {
        const sSq = getSquare(state.lastMove.startI, state.lastMove.startJ);
        const tSq = getSquare(state.lastMove.targetI, state.lastMove.targetJ);
        if (sSq) sSq.classList.add('last-move');
        if (tSq) tSq.classList.add('last-move');
    }

    let kingSq = null;
    for(let r=0; r<8; r++) {
        for(let c=0; c<8; c++) {
            const p = state.board[r][c];
            if(p && p.color === state.currentTurn && p.type === PIECES.KING) { kingSq = {r,c}; break;}
        }
    }
    if (kingSq && isUnderAttack(kingSq.r, kingSq.c, state.currentTurn)) {
        const kDom = getSquare(kingSq.r, kingSq.c);
        if(kDom) kDom.classList.add('in-check');
    }
};

export const undoAction = () => {
    if (window.isAnimating) return;
    if (restoreState()) {
        restoreHighlights();
        renderBoard();
        renderMoveHistory();
    }
};

export const redoAction = () => {
    if (window.isAnimating) return;
    if (redoState()) {
        restoreHighlights();
        renderBoard();
        renderMoveHistory();
    }
};

export const timeTravelTo = (targetIndex) => {
    if (window.isAnimating) return;
    if (targetIndex < state.stateHistory.length) {
        while (state.stateHistory.length > targetIndex) {
            if (!restoreState()) break;
        }
        restoreHighlights();
        renderBoard();
        renderMoveHistory();
    } else if (targetIndex > state.stateHistory.length) {
        while (state.stateHistory.length < targetIndex) {
            if (!redoState()) break;
        }
        restoreHighlights();
        renderBoard();
        renderMoveHistory();
    }
};

export const movePiece = async (targetI, targetJ) => {
    if (window.isAnimating) return;
    saveState();
    const {i: startI, j: startJ} = state.selectedSquare;
    const piece = state.board[startI][startJ];
    const targetPiece = state.board[targetI][targetJ];

    let captured = false;
    let isEnPassant = false;

    if (targetPiece) {
        captured = true;
    } else if (piece.type === PIECES.PAWN && Math.abs(startJ - targetJ) === 1) {
        if (state.board[startI][targetJ]) {
            captured = true;
            isEnPassant = true;
        }
    }

    if (piece.type === PIECES.PAWN || captured) {
        state.halfMoveClock = 0;
    } else {
        state.halfMoveClock++;
    }

    document.querySelectorAll('.last-move').forEach(el => el.classList.remove('last-move'));
    const sSq = getSquare(startI, startJ);
    const tSq = getSquare(targetI, targetJ);
    if(sSq) sSq.classList.add('last-move');
    if(tSq) tSq.classList.add('last-move');

    window.isAnimating = true;
    const actualVictimSq = isEnPassant ? getSquare(startI, targetJ) : getSquare(targetI, targetJ);
    const animations = [playMoveAnimation(startI, startJ, targetI, targetJ, piece.type, captured, isEnPassant, actualVictimSq)];
    
    if (piece.type === PIECES.KING && Math.abs(startJ - targetJ) === 2) {
        const rookJ = targetJ === 2 ? 0 : 7;
        const rookDestJ = targetJ === 2 ? 3 : 5;
        animations.push(playCastlingRookAnimation(startI, rookJ, startI, rookDestJ));
    }

    await Promise.all(animations);
    window.isAnimating = false;

    if (targetPiece) {
        addCapturedToPanel(targetPiece, targetI, targetJ);
    } else if (isEnPassant) {
        const capturedPawn = state.board[startI][targetJ];
        if (capturedPawn) {
            addCapturedToPanel(capturedPawn, startI, targetJ);
            state.board[startI][targetJ] = null;
        }
    }

    if (piece.type === PIECES.KING && Math.abs(startJ - targetJ) === 2) {
        if (targetJ === 2) {
            state.board[startI][3] = state.board[startI][0];
            state.board[startI][3].moved = true;
            state.board[startI][0] = null;
        } else if (targetJ === 6) {
            state.board[startI][5] = state.board[startI][7];
            state.board[startI][5].moved = true;
            state.board[startI][7] = null;
        }
    }

    state.board[targetI][targetJ] = piece;
    state.board[startI][startJ] = null;
    piece.moved = true;

    if (captured) captureSound.play().catch(e => console.warn(e));
    else moveSound.play().catch(e => console.warn(e));

    const endTurn = (promotionChar = "") => {
        state.lastMove = {
            piece: piece.type,
            color: state.currentTurn,
            startI, startJ, targetI, targetJ
        };
        
        clearDots();
        state.selectedSquare = null;
        
        let notation = getAlgebraic(piece, startI, startJ, targetI, targetJ, captured);
        if (promotionChar) notation += "=" + promotionChar;
        
        state.currentTurn = state.currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
        
        let kingSq = null;
        for(let r=0; r<8; r++) {
            for(let c=0; c<8; c++) {
                const p = state.board[r][c];
                if(p && p.color === state.currentTurn && p.type === PIECES.KING) { kingSq = {r,c}; break;}
            }
        }
        if (kingSq && isUnderAttack(kingSq.r, kingSq.c, state.currentTurn)) {
            // Need to know if checkmate for '#' but we check mate in postMoveChecks. Just add '+'
            notation += "+";
        }
        
        updateMoveHistory(notation);
        
        state.turnIndicator.innerText = `${state.currentTurn}'s Turn`;
        const repCount = recordPosition();
        if (repCount === 2) {
            showNotification("Position repeated 2 times! One more for a draw.");
        }
        renderBoard();
        postMoveChecks();
        startTimer(); // Ensure timer runs after the first move
    };

    if (piece.type === PIECES.PAWN) {
        if ((state.currentTurn === COLORS.WHITE && targetI === 0) || (state.currentTurn === COLORS.BLACK && targetI === 7)) {
            showPromotionModal(state.currentTurn, async (chosenType) => {
                piece.type = chosenType;
                let char = chosenType === PIECES.HORSE ? 'N' : chosenType[0];
                window.isAnimating = true;
                await playPromotionAscension(targetI, targetJ, state.currentTurn, chosenType);
                window.isAnimating = false;
                endTurn(char);
            });
            return;
        }
    }

    endTurn();
};

const addCapturedToPanel = (piece, victimI, victimJ) => {
    const img = document.createElement('img');
    img.src = `./asserts/${piece.color}${piece.type}.png`;
    img.style.width = '40px';
    img.style.height = '40px';
    img.style.cursor = 'default';
    img.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
    img.style.borderRadius = '4px';
    img.style.padding = '2px';
    
    const panel = piece.color === COLORS.WHITE ? state.leftPanel : state.rightPanel;
    panel.appendChild(img);

    const startSq = getSquare(victimI, victimJ);
    if (startSq) {
        const startRect = startSq.getBoundingClientRect();
        const endRect = img.getBoundingClientRect();
        
        img.animate([
            { transform: `translate(${startRect.left - endRect.left}px, ${startRect.top - endRect.top}px) scale(1.5)`, opacity: 0.5 },
            { transform: 'translate(0, 0) scale(1)', opacity: 1 }
        ], { duration: 500, easing: 'ease-out' });
    }
};

const updateMoveHistory = (notation) => {
    if (state.currentTurn === COLORS.BLACK) {
        const m = { white: notation, black: "" };
        state.moveList.push(m);
        renderMoveHistory();
    } else {
        state.moveList[state.moveList.length-1].black = notation;
        renderMoveHistory();
    }
};

const renderMoveHistory = () => {
    const panel = state.moveHistoryPanel;
    panel.innerHTML = "";
    state.moveList.forEach((m, idx) => {
        const row = document.createElement("div");
        row.className = "move-row";
        
        const numSpan = document.createElement("span");
        numSpan.className = "move-number";
        numSpan.innerText = `${idx+1}.`;
        
        const whiteSpan = document.createElement("span");
        whiteSpan.className = "move-white";
        whiteSpan.innerText = m.white;
        whiteSpan.style.cursor = 'pointer';
        whiteSpan.onclick = () => timeTravelTo(idx * 2 + 1);
        
        const blackSpan = document.createElement("span");
        blackSpan.className = "move-black";
        blackSpan.innerText = m.black;
        if (m.black) {
            blackSpan.style.cursor = 'pointer';
            blackSpan.onclick = () => timeTravelTo(idx * 2 + 2);
        }
        
        row.appendChild(numSpan);
        row.appendChild(whiteSpan);
        row.appendChild(blackSpan);
        
        panel.appendChild(row);
    });
    panel.scrollTop = panel.scrollHeight;
};
