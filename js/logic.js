import { state } from './state.js';
import { getSquare, getPiece } from './dom.js';

export const isUnderAttack = (r, c, color) => {
    const enemy = color === 'White' ? 'Black' : 'White';
    
    const checkRay = (dr, dc, pieces, maxSteps = 7) => {
        for(let step = 1; step <= maxSteps; step++) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if(nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
            const p = getPiece(nr, nc);
            if(p) {
                if(p.classList.contains(enemy) && pieces.includes(p.dataset.value)) return true;
                break;
            }
        }
        return false;
    };

    if(checkRay(1, 0, ['Rook', 'Queen'])) return true;
    if(checkRay(-1, 0, ['Rook', 'Queen'])) return true;
    if(checkRay(0, 1, ['Rook', 'Queen'])) return true;
    if(checkRay(0, -1, ['Rook', 'Queen'])) return true;

    if(checkRay(1, 1, ['Bishop', 'Queen'])) return true;
    if(checkRay(1, -1, ['Bishop', 'Queen'])) return true;
    if(checkRay(-1, 1, ['Bishop', 'Queen'])) return true;
    if(checkRay(-1, -1, ['Bishop', 'Queen'])) return true;

    const knightMoves = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
    for(let [dr, dc] of knightMoves) {
        const nr = r + dr, nc = c + dc;
        if(nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
            const p = getPiece(nr, nc);
            if(p && p.classList.contains(enemy) && p.dataset.value === 'Horse') return true;
        }
    }

    if (color === 'White') {
        for(let dc of [-1, 1]) {
            const nr = r - 1, nc = c + dc;
            if(nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
                const p = getPiece(nr, nc);
                if(p && p.classList.contains('Black') && p.dataset.value === 'Pawn') return true;
            }
        }
    } else {
        for(let dc of [-1, 1]) {
            const nr = r + 1, nc = c + dc;
            if(nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
                const p = getPiece(nr, nc);
                if(p && p.classList.contains('White') && p.dataset.value === 'Pawn') return true;
            }
        }
    }

    if(checkRay(1,0,['King'],1) || checkRay(-1,0,['King'],1) || 
       checkRay(0,1,['King'],1) || checkRay(0,-1,['King'],1) ||
       checkRay(1,1,['King'],1) || checkRay(1,-1,['King'],1) || 
       checkRay(-1,1,['King'],1) || checkRay(-1,-1,['King'],1)) return true;

    return false;
};

export const isMoveSafe = (startI, startJ, targetI, targetJ) => {
    const startSq = getSquare(startI, startJ);
    const targetSq = getSquare(targetI, targetJ);
    const piece = getPiece(startI, startJ);
    let targetPiece = getPiece(targetI, targetJ);
    
    let epSq = null;
    let epPiece = null;
    if (piece.dataset.value === 'Pawn' && Math.abs(startJ - targetJ) === 1 && !targetPiece) {
        epSq = getSquare(startI, targetJ);
        epPiece = epSq.querySelector('img');
        if (epPiece) epSq.removeChild(epPiece);
    }
    
    if (targetPiece) targetSq.removeChild(targetPiece);
    targetSq.appendChild(piece);
    piece.dataset.i = targetI;
    piece.dataset.j = targetJ;
    
    let kingSq = null;
    const king = document.querySelector(`.child img.${state.currentTurn}[data-value="King"]`);
    if (king) {
        kingSq = {i: parseInt(king.dataset.i), j: parseInt(king.dataset.j)};
    }
    
    let safe = true;
    if (kingSq) {
        safe = !isUnderAttack(kingSq.i, kingSq.j, state.currentTurn);
    }
    
    startSq.appendChild(piece);
    piece.dataset.i = startI;
    piece.dataset.j = startJ;
    if (targetPiece) targetSq.appendChild(targetPiece);
    if (epPiece) epSq.appendChild(epPiece);
    
    return safe;
};

export const hasAnyValidMoves = () => {
    const pieces = document.querySelectorAll(`.child img.${state.currentTurn}`);
    for (let piece of pieces) {
        const startI = parseInt(piece.dataset.i);
        const startJ = parseInt(piece.dataset.j);
        const type = piece.dataset.value;

        const tryMove = (targetI, targetJ) => {
            if (targetI < 0 || targetI > 7 || targetJ < 0 || targetJ > 7) return false;
            const targetPiece = getPiece(targetI, targetJ);
            if (targetPiece && targetPiece.classList.contains(state.currentTurn)) return false;
            return isMoveSafe(startI, startJ, targetI, targetJ);
        };

        const tryRay = (di, dj, maxSteps = 7) => {
            for (let step = 1; step <= maxSteps; step++) {
                const targetI = startI + di * step;
                const targetJ = startJ + dj * step;
                if (targetI < 0 || targetI > 7 || targetJ < 0 || targetJ > 7) break;
                const targetPiece = getPiece(targetI, targetJ);
                
                if (!targetPiece) {
                    if (isMoveSafe(startI, startJ, targetI, targetJ)) return true;
                } else {
                    if (!targetPiece.classList.contains(state.currentTurn)) {
                        if (isMoveSafe(startI, startJ, targetI, targetJ)) return true;
                    }
                    break;
                }
            }
            return false;
        };

        if (type === 'Rook' || type === 'Queen') {
            if (tryRay(1, 0) || tryRay(-1, 0) || tryRay(0, 1) || tryRay(0, -1)) return true;
        }
        if (type === 'Bishop' || type === 'Queen') {
            if (tryRay(1, 1) || tryRay(1, -1) || tryRay(-1, 1) || tryRay(-1, -1)) return true;
        }
        if (type === 'King') {
            if (tryRay(1, 0, 1) || tryRay(-1, 0, 1) || tryRay(0, 1, 1) || tryRay(0, -1, 1) ||
                tryRay(1, 1, 1) || tryRay(1, -1, 1) || tryRay(-1, 1, 1) || tryRay(-1, -1, 1)) return true;
        }
        if (type === 'Horse') {
            const moves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
            for (let [di, dj] of moves) {
                if (tryMove(startI + di, startJ + dj)) return true;
            }
        }
        if (type === 'Pawn') {
            const dir = state.currentTurn === 'White' ? -1 : 1;
            const startRow = state.currentTurn === 'White' ? 6 : 1;
            
            if (startI + dir >= 0 && startI + dir <= 7 && !getPiece(startI + dir, startJ)) {
                if (tryMove(startI + dir, startJ)) return true;
                if (startI === startRow && !getPiece(startI + 2 * dir, startJ)) {
                    if (tryMove(startI + 2 * dir, startJ)) return true;
                }
            }
            for (let dj of [-1, 1]) {
                if (startI + dir >= 0 && startI + dir <= 7 && startJ + dj >= 0 && startJ + dj <= 7) {
                    const targetPiece = getPiece(startI + dir, startJ + dj);
                    if (targetPiece && !targetPiece.classList.contains(state.currentTurn)) {
                        if (tryMove(startI + dir, startJ + dj)) return true;
                    }
                    if (state.lastMove && state.lastMove.piece === 'Pawn' && Math.abs(state.lastMove.startI - state.lastMove.targetI) === 2) {
                        if (state.lastMove.targetI === startI && state.lastMove.targetJ === startJ + dj) {
                            if (isMoveSafe(startI, startJ, startI + dir, startJ + dj)) return true;
                        }
                    }
                }
            }
        }
    }
    return false;
};
