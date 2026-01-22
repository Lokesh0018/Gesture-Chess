import { state, COLORS, PIECES } from './state.js';

export const isUnderAttack = (r, c, color, board = state.board) => {
    const enemy = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    
    const checkRay = (dr, dc, pieces, maxSteps = 7) => {
        for(let step = 1; step <= maxSteps; step++) {
            const nr = r + dr * step;
            const nc = c + dc * step;
            if(nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
            const p = board[nr][nc];
            if(p) {
                if(p.color === enemy && pieces.includes(p.type)) return true;
                break;
            }
        }
        return false;
    };

    if(checkRay(1, 0, [PIECES.ROOK, PIECES.QUEEN])) return true;
    if(checkRay(-1, 0, [PIECES.ROOK, PIECES.QUEEN])) return true;
    if(checkRay(0, 1, [PIECES.ROOK, PIECES.QUEEN])) return true;
    if(checkRay(0, -1, [PIECES.ROOK, PIECES.QUEEN])) return true;

    if(checkRay(1, 1, [PIECES.BISHOP, PIECES.QUEEN])) return true;
    if(checkRay(1, -1, [PIECES.BISHOP, PIECES.QUEEN])) return true;
    if(checkRay(-1, 1, [PIECES.BISHOP, PIECES.QUEEN])) return true;
    if(checkRay(-1, -1, [PIECES.BISHOP, PIECES.QUEEN])) return true;

    const knightMoves = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
    for(let [dr, dc] of knightMoves) {
        const nr = r + dr, nc = c + dc;
        if(nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
            const p = board[nr][nc];
            if(p && p.color === enemy && p.type === PIECES.HORSE) return true;
        }
    }

    const pawnDir = color === COLORS.WHITE ? -1 : 1;
    for(let dc of [-1, 1]) {
        const nr = r + pawnDir, nc = c + dc;
        if(nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
            const p = board[nr][nc];
            if(p && p.color === enemy && p.type === PIECES.PAWN) return true;
        }
    }

    if(checkRay(1,0,[PIECES.KING],1) || checkRay(-1,0,[PIECES.KING],1) || 
       checkRay(0,1,[PIECES.KING],1) || checkRay(0,-1,[PIECES.KING],1) ||
       checkRay(1,1,[PIECES.KING],1) || checkRay(1,-1,[PIECES.KING],1) || 
       checkRay(-1,1,[PIECES.KING],1) || checkRay(-1,-1,[PIECES.KING],1)) return true;

    return false;
};

export const isMoveSafe = (startI, startJ, targetI, targetJ, color = state.currentTurn) => {
    const tempBoard = state.board.map(row => row.map(p => p ? {...p} : null));
    const piece = tempBoard[startI][startJ];
    
    if (!piece) return false;
    
    if (piece.type === PIECES.PAWN && Math.abs(startJ - targetJ) === 1 && !tempBoard[targetI][targetJ]) {
        tempBoard[startI][targetJ] = null;
    }
    
    tempBoard[targetI][targetJ] = piece;
    tempBoard[startI][startJ] = null;
    
    let kingSq = null;
    for(let i=0; i<8; i++) {
        for(let j=0; j<8; j++) {
            const p = tempBoard[i][j];
            if (p && p.color === color && p.type === PIECES.KING) {
                kingSq = {i, j};
                break;
            }
        }
    }
    
    if (kingSq) {
        return !isUnderAttack(kingSq.i, kingSq.j, color, tempBoard);
    }
    return true; 
};

export const hasAnyValidMoves = (color = state.currentTurn) => {
    for (let i=0; i<8; i++) {
        for (let j=0; j<8; j++) {
            const piece = state.board[i][j];
            if (piece && piece.color === color) {
                const type = piece.type;
                const tryMove = (ti, tj) => {
                    if (ti < 0 || ti > 7 || tj < 0 || tj > 7) return false;
                    const tp = state.board[ti][tj];
                    if (tp && tp.color === color) return false;
                    return isMoveSafe(i, j, ti, tj, color);
                };
                
                const tryRay = (di, dj, maxSteps=7) => {
                    for (let step=1; step<=maxSteps; step++) {
                        const ti = i + di*step;
                        const tj = j + dj*step;
                        if (ti < 0 || ti > 7 || tj < 0 || tj > 7) break;
                        const tp = state.board[ti][tj];
                        if (!tp) {
                            if (isMoveSafe(i, j, ti, tj, color)) return true;
                        } else {
                            if (tp.color !== color && isMoveSafe(i, j, ti, tj, color)) return true;
                            break;
                        }
                    }
                    return false;
                };

                if (type === PIECES.ROOK || type === PIECES.QUEEN) {
                    if (tryRay(1,0) || tryRay(-1,0) || tryRay(0,1) || tryRay(0,-1)) return true;
                }
                if (type === PIECES.BISHOP || type === PIECES.QUEEN) {
                    if (tryRay(1,1) || tryRay(1,-1) || tryRay(-1,1) || tryRay(-1,-1)) return true;
                }
                if (type === PIECES.KING) {
                    if (tryRay(1,0,1) || tryRay(-1,0,1) || tryRay(0,1,1) || tryRay(0,-1,1) ||
                        tryRay(1,1,1) || tryRay(1,-1,1) || tryRay(-1,1,1) || tryRay(-1,-1,1)) return true;
                }
                if (type === PIECES.HORSE) {
                    const moves = [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
                    for (let [di, dj] of moves) {
                        if (tryMove(i+di, j+dj)) return true;
                    }
                }
                if (type === PIECES.PAWN) {
                    const dir = color === COLORS.WHITE ? -1 : 1;
                    const startRow = color === COLORS.WHITE ? 6 : 1;
                    if (i+dir>=0 && i+dir<=7 && !state.board[i+dir][j]) {
                        if (tryMove(i+dir, j)) return true;
                        if (i === startRow && !state.board[i+2*dir][j]) {
                            if (tryMove(i+2*dir, j)) return true;
                        }
                    }
                    for (let dj of [-1, 1]) {
                        if (i+dir>=0 && i+dir<=7 && j+dj>=0 && j+dj<=7) {
                            const tp = state.board[i+dir][j+dj];
                            if (tp && tp.color !== color) {
                                if (tryMove(i+dir, j+dj)) return true;
                            }
                            if (state.lastMove && state.lastMove.piece === PIECES.PAWN && Math.abs(state.lastMove.startI - state.lastMove.targetI) === 2) {
                                if (state.lastMove.targetI === i && state.lastMove.targetJ === j+dj) {
                                    if (isMoveSafe(i, j, i+dir, j+dj, color)) return true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return false;
};

export const checkDrawConditions = () => {
    if (state.halfMoveClock >= 100) return "Draw by 50-move rule";
    
    const posKeys = Object.values(state.positionHistory);
    if (posKeys.some(count => count >= 3)) return "Draw by threefold repetition";
    
    let whitePieces = [];
    let blackPieces = [];
    for(let i=0; i<8; i++){
        for(let j=0; j<8; j++){
            const p = state.board[i][j];
            if(p) {
                if(p.type === PIECES.PAWN || p.type === PIECES.ROOK || p.type === PIECES.QUEEN) return null;
                if(p.color === COLORS.WHITE) whitePieces.push(p.type);
                else blackPieces.push(p.type);
            }
        }
    }
    if (whitePieces.length === 1 && blackPieces.length === 1) {
        if (whitePieces[0] === PIECES.KING && blackPieces[0] === PIECES.KING) {
            return "Draw by insufficient material (King vs King)";
        }
    }
    
    return null;
};
