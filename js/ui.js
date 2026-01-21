import { state } from './state.js';
import { clearDots, getSquare, getPiece } from './dom.js';
import { isMoveSafe } from './logic.js';

export const markMove = (targetI, targetJ, startI, startJ) => {
    if (targetI < 0 || targetI > 7 || targetJ < 0 || targetJ > 7) return false;
    const square = getSquare(targetI, targetJ);
    const targetPiece = getPiece(targetI, targetJ);
    
    let isValidCaptureOrEmpty = false;
    let continueRay = false;

    if (!targetPiece) {
        isValidCaptureOrEmpty = true;
        continueRay = true;
    } else if (!targetPiece.classList.contains(state.currentTurn)) {
        isValidCaptureOrEmpty = true;
        continueRay = false;
    } else {
        return false;
    }

    if (isValidCaptureOrEmpty) {
        if (isMoveSafe(startI, startJ, targetI, targetJ)) {
            square.classList.add('dot');
        }
    }
    return continueRay;
};

export const showMoves = (piece) => {
    clearDots();
    state.selectedPiece = piece;
    const startI = parseInt(piece.dataset.i);
    const startJ = parseInt(piece.dataset.j);
    const type = piece.dataset.value;
    getSquare(startI, startJ).classList.add('selected');

    const castRay = (di, dj, maxSteps = 7) => {
        for (let step = 1; step <= maxSteps; step++) {
            if (!markMove(startI + di * step, startJ + dj * step, startI, startJ)) break;
        }
    };

    const addDotIfSafe = (targetI, targetJ) => {
        if (isMoveSafe(startI, startJ, targetI, targetJ)) {
            getSquare(targetI, targetJ).classList.add('dot');
        }
    };

    if (type === 'Rook' || type === 'Queen') {
        castRay(1, 0); castRay(-1, 0); castRay(0, 1); castRay(0, -1);
    }
    if (type === 'Bishop' || type === 'Queen') {
        castRay(1, 1); castRay(1, -1); castRay(-1, 1); castRay(-1, -1);
    }
    if (type === 'King') {
        castRay(1, 0, 1); castRay(-1, 0, 1); castRay(0, 1, 1); castRay(0, -1, 1);
        castRay(1, 1, 1); castRay(1, -1, 1); castRay(-1, 1, 1); castRay(-1, -1, 1);

        if (!piece.dataset.moved) {
            const leftRook = getPiece(startI, 0);
            if (leftRook && leftRook.dataset.value === 'Rook' && !leftRook.dataset.moved) {
                if (!getPiece(startI, 1) && !getPiece(startI, 2) && !getPiece(startI, 3)) {
                    if (isMoveSafe(startI, startJ, startI, 3) && isMoveSafe(startI, startJ, startI, 2)) {
                        getSquare(startI, 2).classList.add('dot');
                    }
                }
            }
            const rightRook = getPiece(startI, 7);
            if (rightRook && rightRook.dataset.value === 'Rook' && !rightRook.dataset.moved) {
                if (!getPiece(startI, 5) && !getPiece(startI, 6)) {
                    if (isMoveSafe(startI, startJ, startI, 5) && isMoveSafe(startI, startJ, startI, 6)) {
                        getSquare(startI, 6).classList.add('dot');
                    }
                }
            }
        }
    }
    if (type === 'Horse') {
        const moves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
        moves.forEach(([di, dj]) => castRay(di, dj, 1));
    }
    if (type === 'Pawn') {
        const dir = state.currentTurn === 'White' ? -1 : 1;
        const startRow = state.currentTurn === 'White' ? 6 : 1;
        
        if (startI + dir >= 0 && startI + dir <= 7 && !getPiece(startI + dir, startJ)) {
            addDotIfSafe(startI + dir, startJ);
            if (startI === startRow && !getPiece(startI + 2 * dir, startJ)) {
                addDotIfSafe(startI + 2 * dir, startJ);
            }
        }
        [-1, 1].forEach(dj => {
            if (startI + dir >= 0 && startI + dir <= 7 && startJ + dj >= 0 && startJ + dj <= 7) {
                const targetPiece = getPiece(startI + dir, startJ + dj);
                if (targetPiece && !targetPiece.classList.contains(state.currentTurn)) {
                    addDotIfSafe(startI + dir, startJ + dj);
                }
                if (state.lastMove && state.lastMove.piece === 'Pawn' && Math.abs(state.lastMove.startI - state.lastMove.targetI) === 2) {
                    if (state.lastMove.targetI === startI && state.lastMove.targetJ === startJ + dj) {
                        addDotIfSafe(startI + dir, startJ + dj);
                    }
                }
            }
        });
    }
};

export const showPromotionModal = (piece, turn, callback) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.5)';
    overlay.style.zIndex = '999';

    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#262522';
    modal.style.padding = '30px';
    modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    modal.style.borderRadius = '8px';
    modal.style.display = 'flex';
    modal.style.gap = '15px';
    modal.style.zIndex = '1000';

    const choices = ['Queen', 'Rook', 'Horse', 'Bishop'];
    choices.forEach(choice => {
        const img = document.createElement('img');
        img.src = `./pieces/${turn}${choice}.png`;
        img.style.cursor = 'pointer';
        img.style.width = '60px';
        img.style.height = '60px';
        img.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        img.style.borderRadius = '8px';
        img.style.padding = '4px';
        img.onclick = () => {
            piece.dataset.value = choice;
            piece.src = `./pieces/${turn}${choice}.png`;
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
            callback();
        };
        modal.appendChild(img);
    });

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
};

export const showCheckMessage = () => {
    const msg = document.createElement('div');
    msg.innerText = "Check!";
    msg.style.position = 'fixed';
    msg.style.top = '20px';
    msg.style.left = '50%';
    msg.style.transform = 'translateX(-50%)';
    msg.style.backgroundColor = '#e0474c';
    msg.style.color = '#fff';
    msg.style.padding = '10px 20px';
    msg.style.fontSize = '24px';
    msg.style.fontWeight = 'bold';
    msg.style.borderRadius = '8px';
    msg.style.boxShadow = '0 4px 10px rgba(0,0,0,0.5)';
    msg.style.zIndex = '1000';
    msg.style.pointerEvents = 'none';
    msg.style.transition = 'opacity 0.5s';
    document.body.appendChild(msg);
    
    setTimeout(() => {
        msg.style.opacity = '0';
        setTimeout(() => document.body.removeChild(msg), 500);
    }, 2000);
};

export const showGameOver = (message) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    overlay.style.zIndex = '999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';

    const modal = document.createElement('div');
    modal.style.backgroundColor = '#262522';
    modal.style.color = '#fff';
    modal.style.padding = '40px';
    modal.style.borderRadius = '8px';
    modal.style.textAlign = 'center';
    modal.style.fontSize = '32px';
    modal.style.fontWeight = 'bold';
    modal.style.boxShadow = '0 10px 30px rgba(0,0,0,0.5)';
    
    modal.innerHTML = `<div>${message}</div><button onclick="location.reload()" style="margin-top:30px; padding:12px 24px; font-size:18px; font-weight:bold; cursor:pointer; background-color:#739552; color:#fff; border:none; border-radius:8px;">Play Again</button>`;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
};
