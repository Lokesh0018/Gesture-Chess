import { state, COLORS, PIECES } from './state.js';
import { clearDots, getSquare } from './dom.js';
import { isMoveSafe, isUnderAttack } from './logic.js';

export const markMove = (targetI, targetJ, startI, startJ) => {
    if (targetI < 0 || targetI > 7 || targetJ < 0 || targetJ > 7) return false;
    
    const targetPiece = state.board[targetI][targetJ];
    
    let isValidCaptureOrEmpty = false;
    let continueRay = false;

    if (!targetPiece) {
        isValidCaptureOrEmpty = true;
        continueRay = true;
    } else if (targetPiece.color !== state.currentTurn) {
        isValidCaptureOrEmpty = true;
        continueRay = false;
    } else {
        return false;
    }

    if (isValidCaptureOrEmpty) {
        if (isMoveSafe(startI, startJ, targetI, targetJ)) {
            const sq = getSquare(targetI, targetJ);
            if (sq) sq.classList.add('dot', 'pulsing-dot');
        }
    }
    return continueRay;
};

export const showMoves = (i, j) => {
    clearDots();
    state.selectedSquare = {i, j};
    const piece = state.board[i][j];
    if (!piece) return;
    
    const sq = getSquare(i, j);
    if(sq) sq.classList.add('selected');

    const castRay = (di, dj, maxSteps = 7) => {
        for (let step = 1; step <= maxSteps; step++) {
            if (!markMove(i + di * step, j + dj * step, i, j)) break;
        }
    };

    const addDotIfSafe = (targetI, targetJ) => {
        if (isMoveSafe(i, j, targetI, targetJ)) {
            const sq = getSquare(targetI, targetJ);
            if (sq) sq.classList.add('dot', 'pulsing-dot');
        }
    };

    const type = piece.type;

    if (type === PIECES.ROOK || type === PIECES.QUEEN) {
        castRay(1, 0); castRay(-1, 0); castRay(0, 1); castRay(0, -1);
    }
    if (type === PIECES.BISHOP || type === PIECES.QUEEN) {
        castRay(1, 1); castRay(1, -1); castRay(-1, 1); castRay(-1, -1);
    }
    if (type === PIECES.KING) {
        castRay(1, 0, 1); castRay(-1, 0, 1); castRay(0, 1, 1); castRay(0, -1, 1);
        castRay(1, 1, 1); castRay(1, -1, 1); castRay(-1, 1, 1); castRay(-1, -1, 1);

        if (!piece.moved && !isUnderAttack(i, j, state.currentTurn)) {
            const leftRook = state.board[i][0];
            if (leftRook && leftRook.type === PIECES.ROOK && !leftRook.moved) {
                if (!state.board[i][1] && !state.board[i][2] && !state.board[i][3]) {
                    if (!isUnderAttack(i, 2, state.currentTurn) && !isUnderAttack(i, 3, state.currentTurn)) {
                        addDotIfSafe(i, 2);
                    }
                }
            }
            const rightRook = state.board[i][7];
            if (rightRook && rightRook.type === PIECES.ROOK && !rightRook.moved) {
                if (!state.board[i][5] && !state.board[i][6]) {
                    if (!isUnderAttack(i, 5, state.currentTurn) && !isUnderAttack(i, 6, state.currentTurn)) {
                        addDotIfSafe(i, 6);
                    }
                }
            }
        }
    }
    if (type === PIECES.HORSE) {
        const moves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
        moves.forEach(([di, dj]) => castRay(di, dj, 1));
    }
    if (type === PIECES.PAWN) {
        const dir = state.currentTurn === COLORS.WHITE ? -1 : 1;
        const startRow = state.currentTurn === COLORS.WHITE ? 6 : 1;
        
        if (i + dir >= 0 && i + dir <= 7 && !state.board[i + dir][j]) {
            addDotIfSafe(i + dir, j);
            if (i === startRow && !state.board[i + 2 * dir][j]) {
                addDotIfSafe(i + 2 * dir, j);
            }
        }
        [-1, 1].forEach(dj => {
            if (i + dir >= 0 && i + dir <= 7 && j + dj >= 0 && j + dj <= 7) {
                const tp = state.board[i + dir][j + dj];
                if (tp && tp.color !== state.currentTurn) {
                    addDotIfSafe(i + dir, j + dj);
                }
                if (state.lastMove && state.lastMove.piece === PIECES.PAWN && Math.abs(state.lastMove.startI - state.lastMove.targetI) === 2) {
                    if (state.lastMove.targetI === i && state.lastMove.targetJ === j + dj) {
                        addDotIfSafe(i + dir, j + dj);
                    }
                }
            }
        });
    }
};

export const showPromotionModal = (color, callback) => {
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

    const choices = [PIECES.QUEEN, PIECES.ROOK, PIECES.HORSE, PIECES.BISHOP];
    choices.forEach(choice => {
        const img = document.createElement('img');
        img.src = `./asserts/${color}${choice}.png`;
        img.style.cursor = 'pointer';
        img.style.width = '60px';
        img.style.height = '60px';
        img.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        img.style.borderRadius = '8px';
        img.style.padding = '4px';
        img.onclick = () => {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
            callback(choice);
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

export const showNotification = (message) => {
    const msg = document.createElement('div');
    msg.innerText = message;
    msg.style.position = 'fixed';
    msg.style.bottom = '20px';
    msg.style.left = '50%';
    msg.style.transform = 'translateX(-50%)';
    msg.style.backgroundColor = '#f6f669';
    msg.style.color = '#302e2b';
    msg.style.padding = '10px 20px';
    msg.style.fontSize = '18px';
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
    }, 3000);
};

export const showGameOver = (message) => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
    overlay.style.zIndex = '999';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.flexDirection = 'column';
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 1s ease-in';
    document.body.appendChild(overlay);

    const loserColor = message.includes("Wins") ? (message.includes("White Wins") ? COLORS.BLACK : COLORS.WHITE) : state.currentTurn;
    const losingKingImg = Array.from(document.querySelectorAll(`img.${loserColor}`)).find(img => img.dataset.value === PIECES.KING);

    if (losingKingImg) {
        losingKingImg.style.transition = 'transform 1.5s cubic-bezier(0.5, 0, 1, 1)';
        losingKingImg.style.transformOrigin = 'bottom right';
        requestAnimationFrame(() => {
            losingKingImg.style.transform = 'rotate(90deg) translate(0, 20%)';
        });
    }

    setTimeout(() => {
        overlay.style.opacity = '1';
        
        const isWin = message.includes("Wins") || message.includes("Checkmate");
        const bannerSrc = isWin ? './asserts/game-over.gif' : './asserts/banner.gif';
        
        const banner = document.createElement('img');
        banner.src = bannerSrc;
        banner.style.width = '600px';
        banner.style.maxWidth = '90vw';
        banner.style.height = 'auto';
        banner.style.transform = 'scale(0)';
        overlay.appendChild(banner);

        banner.animate([
            { transform: 'scale(0) rotate(-10deg)', opacity: 0 },
            { transform: 'scale(1.1) rotate(5deg)', opacity: 1 },
            { transform: 'scale(1) rotate(0deg)', opacity: 1 }
        ], { duration: 800, easing: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)', fill: 'forwards' });

        const modal = document.createElement('div');
        modal.style.marginTop = '30px';
        modal.style.textAlign = 'center';
        modal.innerHTML = `<div style="color:#fff; font-size:32px; font-weight:bold; margin-bottom:20px; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">${message}</div>
                           <button onclick="location.reload()" style="padding:12px 24px; font-size:18px; font-weight:bold; cursor:pointer; background-color:#739552; color:#fff; border:none; border-radius:8px; box-shadow: 0 4px 10px rgba(0,0,0,0.8); transition: transform 0.2s;">Play Again</button>`;
        overlay.appendChild(modal);
        
        modal.animate([
            { transform: 'translateY(50px)', opacity: 0 },
            { transform: 'translateY(0)', opacity: 1 }
        ], { duration: 600, delay: 600, fill: 'forwards' });

    }, 1200);
};
