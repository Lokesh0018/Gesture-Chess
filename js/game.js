import { state } from './state.js';
import { clearDots, getSquare, getPiece } from './dom.js';
import { isUnderAttack, hasAnyValidMoves } from './logic.js';
import { showPromotionModal, showCheckMessage, showGameOver } from './ui.js';

// Phase 2: Sound effects
const moveSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3');
const captureSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3');
const checkSound = new Audio('https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3');

export const postMoveChecks = () => {
    const king = document.querySelector(`.child img.${state.currentTurn}[data-value="King"]`);
    let inCheck = false;
    if (king) {
        const kingI = parseInt(king.dataset.i);
        const kingJ = parseInt(king.dataset.j);
        if (isUnderAttack(kingI, kingJ, state.currentTurn)) {
            inCheck = true;
        }
    }

    if (!hasAnyValidMoves()) {
        if (inCheck) showGameOver(`Checkmate! ${state.currentTurn === 'White' ? 'Black' : 'White'} Wins!`);
        else showGameOver("Stalemate! It's a draw!");
        return;
    }

    if (inCheck) {
        showCheckMessage();
        checkSound.play().catch(e => console.warn("Audio play prevented", e));
    }
};

export const movePiece = (square) => {
    const startI = parseInt(state.selectedPiece.dataset.i);
    const startJ = parseInt(state.selectedPiece.dataset.j);
    const targetI = parseInt(square.dataset.i);
    const targetJ = parseInt(square.dataset.j);

    let captured = false;

    // Phase 2: Last move highlights
    document.querySelectorAll('.last-move').forEach(el => el.classList.remove('last-move'));
    getSquare(startI, startJ).classList.add('last-move');
    square.classList.add('last-move');

    const existingPiece = square.querySelector('img');
    if (existingPiece) {
        existingPiece.style.width = "40px";
        existingPiece.style.height = "40px";
        existingPiece.classList.remove('last-move'); 
        if (existingPiece.classList.contains("White")) {
            state.leftPanel.appendChild(existingPiece);
        } else if (existingPiece.classList.contains("Black")) {
            state.rightPanel.appendChild(existingPiece);
        }
        captured = true;
    } else if (state.selectedPiece.dataset.value === 'Pawn' && Math.abs(startJ - targetJ) === 1) {
        const capturedSq = getSquare(startI, targetJ);
        const capturedPiece = capturedSq.querySelector('img');
        if (capturedPiece) {
            capturedPiece.style.width = "40px";
            capturedPiece.style.height = "40px";
            capturedPiece.classList.remove('last-move');
            if (capturedPiece.classList.contains("White")) state.leftPanel.appendChild(capturedPiece);
            else state.rightPanel.appendChild(capturedPiece);
            captured = true;
        }
    }

    if (state.selectedPiece.dataset.value === 'King' && Math.abs(startJ - targetJ) === 2) {
        if (targetJ === 2) {
            const rook = getPiece(startI, 0);
            if (rook) {
                getSquare(startI, 3).appendChild(rook);
                rook.dataset.j = 3;
                rook.dataset.moved = 'true';
            }
        } else if (targetJ === 6) {
            const rook = getPiece(startI, 7);
            if (rook) {
                getSquare(startI, 5).appendChild(rook);
                rook.dataset.j = 5;
                rook.dataset.moved = 'true';
            }
        }
    }

    state.selectedPiece.dataset.moved = 'true';
    state.selectedPiece.dataset.i = targetI;
    state.selectedPiece.dataset.j = targetJ;
    square.appendChild(state.selectedPiece);

    if (captured) {
        captureSound.play().catch(e => console.warn("Audio play prevented", e));
    } else {
        moveSound.play().catch(e => console.warn("Audio play prevented", e));
    }

    const endTurn = () => {
        state.lastMove = {
            piece: state.selectedPiece.dataset.value,
            color: state.currentTurn,
            startI: startI,
            startJ: startJ,
            targetI: targetI,
            targetJ: targetJ
        };
        clearDots();
        state.selectedPiece = null;
        state.currentTurn = state.currentTurn === 'White' ? 'Black' : 'White';
        state.turnIndicator.innerText = `${state.currentTurn}'s Turn`;
        postMoveChecks();
    };

    if (state.selectedPiece.dataset.value === 'Pawn') {
        const row = parseInt(state.selectedPiece.dataset.i);
        if ((state.currentTurn === 'White' && row === 0) || (state.currentTurn === 'Black' && row === 7)) {
            showPromotionModal(state.selectedPiece, state.currentTurn, () => {
                endTurn();
            });
            return;
        }
    }

    endTurn();
};
