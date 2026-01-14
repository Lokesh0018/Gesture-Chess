
const container = document.getElementsByClassName("container");
const board = () => {
    const c1 = container[0];
    let child = "";
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const colorClass = (i + j) % 2 === 0 ? "black" : "white";
            let p = "";
            if ((i === 0 && j === 0) || (i === 0 && j === 7))
                p = `<img src="./pieces/BlackRook.png" data-i="${i}" data-j="${j}" data-value="Rook" class="Black"/>`;
            if ((i === 7 && j === 0) || (i === 7 && j === 7))
                p = `<img src="./pieces/WhiteRook.png" data-i="${i}" data-j="${j}" data-value="Rook" class="White"/>`;
            if ((i === 0 && j === 1) || (i === 0 && j === 6))
                p = `<img src="./pieces/BlackHorse.png" data-i="${i}" data-j="${j}" data-value="Horse" class="Black"/>`;
            if ((i === 7 && j === 1) || (i === 7 && j === 6))
                p = `<img src="./pieces/WhiteHorse.png" data-i="${i}" data-j="${j}" data-value="Horse" class="White"/>`;
            if ((i === 0 && j === 2) || (i === 0 && j === 5))
                p = `<img src="./pieces/BlackBishop.png" data-i="${i}" data-j="${j}" data-value="Bishop" class="Black"/>`;
            if ((i === 7 && j === 2) || (i === 7 && j === 5))
                p = `<img src="./pieces/WhiteBishop.png" data-i="${i}" data-j="${j}" data-value="Bishop" class="White"/>`;
            if (i === 0 && j === 3)
                p = `<img src="./pieces/BlackKing.png" data-i="${i}" data-j="${j}" data-value="King" class="Black"/>`;
            if (i === 7 && j === 3)
                p = `<img src="./pieces/WhiteKing.png" data-i="${i}" data-j="${j}" data-value="King" class="White"/>`;
            if (i === 0 && j === 4)
                p = `<img src="./pieces/BlackQueen.png" data-i="${i}" data-j="${j}" data-value="Queen" class="Black"/>`;
            if (i === 7 && j === 4)
                p = `<img src="./pieces/WhiteQueen.png" data-i="${i}" data-j="${j}" data-value="Queen" class="White"/>`;
            if (i === 1)
                p = `<img src="./pieces/BlackPawn.png" data-i="${i}" data-j="${j}" data-value="Pawn" class="Black"/>`;
            if (i === 6)
                p = `<img src="./pieces/WhitePawn.png" data-i="${i}" data-j="${j}" data-value="Pawn" class="White"/>`;
            child += `<div class="child ${colorClass}" data-i="${i}" data-j="${j}">${p}</div>`;
        }
    }
    c1.innerHTML = child;
}
window.onload = () => {
    board();
    let currentTurn = "White";
    let selectedPiece = null;

    const leftPanel = document.createElement("div");
    leftPanel.style.position = "absolute";
    leftPanel.style.left = "20px";
    leftPanel.style.top = "50px";
    leftPanel.style.width = "120px";
    leftPanel.style.display = "flex";
    leftPanel.style.flexWrap = "wrap";
    leftPanel.style.gap = "5px";
    document.body.appendChild(leftPanel);

    const rightPanel = document.createElement("div");
    rightPanel.style.position = "absolute";
    rightPanel.style.right = "20px";
    rightPanel.style.top = "50px";
    rightPanel.style.width = "120px";
    rightPanel.style.display = "flex";
    rightPanel.style.flexWrap = "wrap";
    rightPanel.style.gap = "5px";
    document.body.appendChild(rightPanel);

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
        const targetPiece = getPiece(targetI, targetJ);
        
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
        modal.style.backgroundColor = '#fff';
        modal.style.padding = '20px';
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
        msg.style.backgroundColor = '#ff4444';
        msg.style.color = '#fff';
        msg.style.padding = '10px 20px';
        msg.style.fontSize = '24px';
        msg.style.fontWeight = 'bold';
        msg.style.borderRadius = '5px';
        msg.style.zIndex = '1000';
        msg.style.pointerEvents = 'none';
        msg.style.transition = 'opacity 0.5s';
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.style.opacity = '0';
            setTimeout(() => document.body.removeChild(msg), 500);
        }, 2000);
    };

    const postMoveChecks = () => {
        const king = document.querySelector(`.child img.${currentTurn}[data-value="King"]`);
        if (king) {
            const kingI = parseInt(king.dataset.i);
            const kingJ = parseInt(king.dataset.j);
            if (isUnderAttack(kingI, kingJ, currentTurn)) {
                showCheckMessage();
            }
        }
    };

    const movePiece = (square) => {
        const existingPiece = square.querySelector('img');
        if (existingPiece) {
            existingPiece.style.width = "40px";
            existingPiece.style.height = "40px";
            if (existingPiece.classList.contains("White")) {
                leftPanel.appendChild(existingPiece);
            } else if (existingPiece.classList.contains("Black")) {
                rightPanel.appendChild(existingPiece);
            }
        }

        selectedPiece.dataset.i = square.dataset.i;
        selectedPiece.dataset.j = square.dataset.j;
        square.appendChild(selectedPiece);

        if (selectedPiece.dataset.value === 'Pawn') {
            const row = parseInt(selectedPiece.dataset.i);
            if ((currentTurn === 'White' && row === 0) || (currentTurn === 'Black' && row === 7)) {
                showPromotionModal(selectedPiece, currentTurn, () => {
                    clearDots();
                    selectedPiece = null;
                    currentTurn = currentTurn === 'White' ? 'Black' : 'White';
                    postMoveChecks();
                });
                return;
            }
        }

        clearDots();
        selectedPiece = null;
        currentTurn = currentTurn === 'White' ? 'Black' : 'White';
        postMoveChecks();
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
};