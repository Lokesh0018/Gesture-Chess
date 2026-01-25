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
        
        let mainTextStr = "GAME OVER";
        if (message.includes("Checkmate")) mainTextStr = "CHECKMATE";
        else if (message.includes("Time")) mainTextStr = "TIME'S UP";
        else if (message.includes("Draw") || message.includes("Stalemate")) mainTextStr = "DRAW";

        const bannerText = document.createElement('div');
        bannerText.innerText = mainTextStr;
        bannerText.style.fontFamily = "Arial, sans-serif";
        bannerText.style.fontSize = 'min(10vw, 80px)';
        bannerText.style.fontWeight = '900';
        bannerText.style.color = '#ebecd0';
        bannerText.style.textShadow = '0 0 20px rgba(115, 149, 82, 0.5), 0 0 40px #739552, 0 0 80px #739552';
        bannerText.style.letterSpacing = '8px';
        bannerText.style.textTransform = 'uppercase';
        bannerText.style.transform = 'scale(0)';
        overlay.appendChild(bannerText);

        bannerText.animate([
            { transform: 'scale(3)', opacity: 0, filter: 'blur(20px)' },
            { transform: 'scale(1)', opacity: 1, filter: 'blur(0px)' }
        ], { duration: 1000, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', fill: 'forwards' });

        const subMsg = document.createElement('div');
        subMsg.innerText = message;
        subMsg.style.fontFamily = "Arial, sans-serif";
        subMsg.style.fontSize = '24px';
        subMsg.style.color = '#ebecd0';
        subMsg.style.marginTop = '20px';
        subMsg.style.textShadow = '0 2px 4px rgba(0,0,0,0.8)';
        subMsg.style.opacity = '0';
        overlay.appendChild(subMsg);

        subMsg.animate([
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 800, delay: 600, easing: 'ease-out', fill: 'forwards' });

        const btn = document.createElement('button');
        btn.innerText = 'Play Again';
        btn.style.marginTop = '40px';
        btn.style.padding = '15px 40px';
        btn.style.fontSize = '20px';
        btn.style.fontWeight = 'bold';
        btn.style.color = '#fff';
        btn.style.backgroundColor = '#739552';
        btn.style.border = '1px solid #ebecd0';
        btn.style.borderRadius = '30px';
        btn.style.cursor = 'pointer';
        btn.style.backdropFilter = 'blur(10px)';
        btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
        btn.style.transition = 'all 0.3s ease';
        btn.style.opacity = '0';
        
        btn.onmouseover = () => {
            btn.style.backgroundColor = '#81b64c';
            btn.style.transform = 'translateY(-2px)';
            btn.style.boxShadow = '0 6px 20px rgba(115, 149, 82, 0.6)';
        };
        btn.onmouseout = () => {
            btn.style.backgroundColor = '#739552';
            btn.style.transform = 'translateY(0)';
            btn.style.boxShadow = '0 4px 15px rgba(0,0,0,0.5)';
        };

        btn.onclick = () => window.location.reload();
        overlay.appendChild(btn);

        btn.animate([
            { opacity: 0, transform: 'translateY(20px)' },
            { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 800, delay: 1000, easing: 'ease-out', fill: 'forwards' });

    }, 1200);
};
