
const container = document.getElementsByClassName("container");
const board = () => {
    const c1 = container[0];
    let child = "";
    const initialBoard = [
        ['BlackRook', 'BlackHorse', 'BlackBishop', 'BlackKing', 'BlackQueen', 'BlackBishop', 'BlackHorse', 'BlackRook'],
        Array(8).fill('BlackPawn'),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill(null),
        Array(8).fill('WhitePawn'),
        ['WhiteRook', 'WhiteHorse', 'WhiteBishop', 'WhiteKing', 'WhiteQueen', 'WhiteBishop', 'WhiteHorse', 'WhiteRook']
    ];
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const colorClass = (i + j) % 2 === 0 ? "black" : "white";
            let p = "";
            const pieceDef = initialBoard[i][j];
            if (pieceDef) {
                const color = pieceDef.startsWith('White') ? 'White' : 'Black';
                const value = pieceDef.substring(5);
                p = `<img src="./pieces/${pieceDef}.png" draggable="true" data-i="${i}" data-j="${j}" data-value="${value}" class="${color}"/>`;
            }
            
            let coords = "";
            const textColor = (i + j) % 2 === 0 ? "#fff" : "#000";
            if (j === 0) coords += `<span style="position:absolute; top:2px; left:4px; font-size:12px; font-weight:bold; color:${textColor}; pointer-events:none;">${8 - i}</span>`;
            if (i === 7) coords += `<span style="position:absolute; bottom:2px; right:4px; font-size:12px; font-weight:bold; color:${textColor}; pointer-events:none;">${String.fromCharCode(97 + j)}</span>`;

            child += `<div class="child ${colorClass}" style="position:relative;" data-i="${i}" data-j="${j}">${coords}${p}</div>`;
        }
    }
    c1.innerHTML = child;
}
window.onload = () => {
    board();
    let currentTurn = "White";
    let selectedPiece = null;
    let lastMove = null;

    const headerWrapper = document.createElement("div");
    headerWrapper.style.marginBottom = "20px";

    const turnIndicator = document.createElement("div");
    turnIndicator.innerText = "White's Turn";
    turnIndicator.className = "turn-indicator";
    headerWrapper.appendChild(turnIndicator);

    const mainWrapper = document.createElement("div");
    mainWrapper.className = "main-wrapper";
    
    const c1 = container[0];
    c1.parentNode.insertBefore(headerWrapper, c1);
    c1.parentNode.insertBefore(mainWrapper, c1);

    const leftPanel = document.createElement("div");
    leftPanel.className = "capture-panel";

    const rightPanel = document.createElement("div");
    rightPanel.className = "capture-panel";

    mainWrapper.appendChild(leftPanel);
    mainWrapper.appendChild(c1);
    mainWrapper.appendChild(rightPanel);

    const clearDots = () => {
        document.querySelectorAll('.dot').forEach(el => el.classList.remove('dot'));
        document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
    };

    const getSquare = (i, j) => document.querySelector(`.child[data-i="${i}"][data-j="${j}"]`);
    
    const getPiece = (i, j) => {
        const sq = getSquare(i, j);
        return sq ? sq.querySelector('img') : null;
    };

    const isUnderAttack = (r, c, color) => {
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

    const isMoveSafe = (startI, startJ, targetI, targetJ) => {
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
        const king = document.querySelector(`.child img.${currentTurn}[data-value="King"]`);
        if (king) {
            kingSq = {i: parseInt(king.dataset.i), j: parseInt(king.dataset.j)};
        }
        
        let safe = true;
        if (kingSq) {
            safe = !isUnderAttack(kingSq.i, kingSq.j, currentTurn);
        }
        
        startSq.appendChild(piece);
        piece.dataset.i = startI;
        piece.dataset.j = startJ;
        if (targetPiece) targetSq.appendChild(targetPiece);
        if (epPiece) epSq.appendChild(epPiece);
        
        return safe;
    };

    const markMove = (targetI, targetJ, startI, startJ) => {
        if (targetI < 0 || targetI > 7 || targetJ < 0 || targetJ > 7) return false;
        const square = getSquare(targetI, targetJ);
        const targetPiece = getPiece(targetI, targetJ);
        
        let isValidCaptureOrEmpty = false;
        let continueRay = false;

        if (!targetPiece) {
            isValidCaptureOrEmpty = true;
            continueRay = true;
        } else if (!targetPiece.classList.contains(currentTurn)) {
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

    const showMoves = (piece) => {
        clearDots();
        selectedPiece = piece;
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

            if (!piece.dataset.moved && !isUnderAttack(startI, startJ, currentTurn)) {
                const leftRook = getPiece(startI, 0);
                if (leftRook && leftRook.dataset.value === 'Rook' && !leftRook.dataset.moved) {
                    if (!getPiece(startI, 1) && !getPiece(startI, 2)) {
                        if (isMoveSafe(startI, startJ, startI, 2) && isMoveSafe(startI, startJ, startI, 1)) {
                            getSquare(startI, 1).classList.add('dot');
                        }
                    }
                }
                const rightRook = getPiece(startI, 7);
                if (rightRook && rightRook.dataset.value === 'Rook' && !rightRook.dataset.moved) {
                    if (!getPiece(startI, 4) && !getPiece(startI, 5) && !getPiece(startI, 6)) {
                        if (isMoveSafe(startI, startJ, startI, 4) && isMoveSafe(startI, startJ, startI, 5)) {
                            getSquare(startI, 5).classList.add('dot');
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
            const dir = currentTurn === 'White' ? -1 : 1;
            const startRow = currentTurn === 'White' ? 6 : 1;
            
           
            if (startI + dir >= 0 && startI + dir <= 7 && !getPiece(startI + dir, startJ)) {
                addDotIfSafe(startI + dir, startJ);
               
                if (startI === startRow && !getPiece(startI + 2 * dir, startJ)) {
                    addDotIfSafe(startI + 2 * dir, startJ);
                }
            }
           
            [-1, 1].forEach(dj => {
                if (startI + dir >= 0 && startI + dir <= 7 && startJ + dj >= 0 && startJ + dj <= 7) {
                    const targetPiece = getPiece(startI + dir, startJ + dj);
                    if (targetPiece && !targetPiece.classList.contains(currentTurn)) {
                        addDotIfSafe(startI + dir, startJ + dj);
                    }
                    
                    if (lastMove && lastMove.piece === 'Pawn' && Math.abs(lastMove.startI - lastMove.targetI) === 2) {
                        if (lastMove.targetI === startI && lastMove.targetJ === startJ + dj) {
                            addDotIfSafe(startI + dir, startJ + dj);
                        }
                    }
                }
            });
        }
    };

    const showPromotionModal = (piece, turn, callback) => {
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

    const showCheckMessage = () => {
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

    const showGameOver = (message) => {
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

    const hasAnyValidMoves = () => {
        const pieces = document.querySelectorAll(`.child img.${currentTurn}`);
        for (let piece of pieces) {
            const startI = parseInt(piece.dataset.i);
            const startJ = parseInt(piece.dataset.j);
            const type = piece.dataset.value;

            const tryMove = (targetI, targetJ) => {
                if (targetI < 0 || targetI > 7 || targetJ < 0 || targetJ > 7) return false;
                const targetPiece = getPiece(targetI, targetJ);
                if (targetPiece && targetPiece.classList.contains(currentTurn)) return false;
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
                        if (!targetPiece.classList.contains(currentTurn)) {
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
                const dir = currentTurn === 'White' ? -1 : 1;
                const startRow = currentTurn === 'White' ? 6 : 1;
                
                if (startI + dir >= 0 && startI + dir <= 7 && !getPiece(startI + dir, startJ)) {
                    if (tryMove(startI + dir, startJ)) return true;
                    if (startI === startRow && !getPiece(startI + 2 * dir, startJ)) {
                        if (tryMove(startI + 2 * dir, startJ)) return true;
                    }
                }
                for (let dj of [-1, 1]) {
                    if (startI + dir >= 0 && startI + dir <= 7 && startJ + dj >= 0 && startJ + dj <= 7) {
                        const targetPiece = getPiece(startI + dir, startJ + dj);
                        if (targetPiece && !targetPiece.classList.contains(currentTurn)) {
                            if (tryMove(startI + dir, startJ + dj)) return true;
                        }
                        if (lastMove && lastMove.piece === 'Pawn' && Math.abs(lastMove.startI - lastMove.targetI) === 2) {
                            if (lastMove.targetI === startI && lastMove.targetJ === startJ + dj) {
                                if (isMoveSafe(startI, startJ, startI + dir, startJ + dj)) return true;
                            }
                        }
                    }
                }
            }
        }
        return false;
    };

    const postMoveChecks = () => {
        const king = document.querySelector(`.child img.${currentTurn}[data-value="King"]`);
        let inCheck = false;
        if (king) {
            const kingI = parseInt(king.dataset.i);
            const kingJ = parseInt(king.dataset.j);
            if (isUnderAttack(kingI, kingJ, currentTurn)) {
                inCheck = true;
            }
        }

        if (!hasAnyValidMoves()) {
            if (inCheck) showGameOver(`Checkmate! ${currentTurn === 'White' ? 'Black' : 'White'} Wins!`);
            else showGameOver("Stalemate! It's a draw!");
            return;
        }

        if (inCheck) showCheckMessage();
    };

    const movePiece = (square) => {
        const startI = parseInt(selectedPiece.dataset.i);
        const startJ = parseInt(selectedPiece.dataset.j);
        const targetI = parseInt(square.dataset.i);
        const targetJ = parseInt(square.dataset.j);

        const existingPiece = square.querySelector('img');
        if (existingPiece) {
            existingPiece.style.width = "40px";
            existingPiece.style.height = "40px";
            if (existingPiece.classList.contains("White")) {
                leftPanel.appendChild(existingPiece);
            } else if (existingPiece.classList.contains("Black")) {
                rightPanel.appendChild(existingPiece);
            }
        } else if (selectedPiece.dataset.value === 'Pawn' && Math.abs(startJ - targetJ) === 1) {
            const capturedSq = getSquare(startI, targetJ);
            const capturedPiece = capturedSq.querySelector('img');
            if (capturedPiece) {
                capturedPiece.style.width = "40px";
                capturedPiece.style.height = "40px";
                if (capturedPiece.classList.contains("White")) leftPanel.appendChild(capturedPiece);
                else rightPanel.appendChild(capturedPiece);
            }
        }

        if (selectedPiece.dataset.value === 'King' && Math.abs(startJ - targetJ) === 2) {
            if (targetJ === 1) {
                const rook = getPiece(startI, 0);
                if (rook) {
                    getSquare(startI, 2).appendChild(rook);
                    rook.dataset.j = 2;
                    rook.dataset.moved = 'true';
                }
            } else if (targetJ === 5) {
                const rook = getPiece(startI, 7);
                if (rook) {
                    getSquare(startI, 4).appendChild(rook);
                    rook.dataset.j = 4;
                    rook.dataset.moved = 'true';
                }
            }
        }

        selectedPiece.dataset.moved = 'true';
        selectedPiece.dataset.i = targetI;
        selectedPiece.dataset.j = targetJ;
        square.appendChild(selectedPiece);

        const endTurn = () => {
            lastMove = {
                piece: selectedPiece.dataset.value,
                color: currentTurn,
                startI: startI,
                startJ: startJ,
                targetI: targetI,
                targetJ: targetJ
            };
            clearDots();
            selectedPiece = null;
            currentTurn = currentTurn === 'White' ? 'Black' : 'White';
            turnIndicator.innerText = `${currentTurn}'s Turn`;
            postMoveChecks();
        };

        if (selectedPiece.dataset.value === 'Pawn') {
            const row = parseInt(selectedPiece.dataset.i);
            if ((currentTurn === 'White' && row === 0) || (currentTurn === 'Black' && row === 7)) {
                showPromotionModal(selectedPiece, currentTurn, () => {
                    endTurn();
                });
                return;
            }
        }

        endTurn();
    };

    document.querySelector(".container").addEventListener("click", (e) => {
        const target = e.target;
        const square = target.classList.contains('child') ? target : target.parentElement;

       
        if (square && square.classList.contains('dot')) {
            movePiece(square);
            return;
        }

       
        if (target.matches("img") && target.classList.contains(currentTurn)) {
            showMoves(target);
        } else {
           
            clearDots();
            selectedPiece = null;
        }
    });

    document.querySelector(".container").addEventListener("dragstart", (e) => {
        const target = e.target;
        if (target.matches("img") && target.classList.contains(currentTurn)) {
            showMoves(target);
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", "chess-piece");
        } else {
            e.preventDefault(); // Prevents dragging opponent pieces
        }
    });

    document.querySelector(".container").addEventListener("dragover", (e) => {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = "move";
    });

    document.querySelector(".container").addEventListener("drop", (e) => {
        e.preventDefault();
        const target = e.target;
        const square = target.classList.contains('child') ? target : target.parentElement;

        if (square && square.classList.contains('dot')) {
            movePiece(square);
        } else {
            clearDots();
            selectedPiece = null;
        }
    });
};