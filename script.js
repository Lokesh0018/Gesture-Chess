
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

    const clearDots = () => {
        document.querySelectorAll('.dot').forEach(el => el.classList.remove('dot'));
    };

    const getSquare = (i, j) => document.querySelector(`.child[data-i="${i}"][data-j="${j}"]`);
    
    const getPiece = (i, j) => {
        const sq = getSquare(i, j);
        return sq ? sq.querySelector('img') : null;
    };

    const markMove = (i, j) => {
        if (i < 0 || i > 7 || j < 0 || j > 7) return false;
        const square = getSquare(i, j);
        const piece = getPiece(i, j);
        
        if (!piece) {
            square.classList.add('dot');
            return true;
        } else if (!piece.classList.contains(currentTurn)) {
            square.classList.add('dot');
            return false;
        }
        return false;
    };

    const showMoves = (piece) => {
        clearDots();
        selectedPiece = piece;
        const i = parseInt(piece.dataset.i);
        const j = parseInt(piece.dataset.j);
        const type = piece.dataset.value;

        const castRay = (di, dj, maxSteps = 7) => {
            for (let step = 1; step <= maxSteps; step++) {
                if (!markMove(i + di * step, j + dj * step)) break;
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
            
           
            if (i + dir >= 0 && i + dir <= 7 && !getPiece(i + dir, j)) {
                getSquare(i + dir, j).classList.add('dot');
               
                if (i === startRow && !getPiece(i + 2 * dir, j)) {
                    getSquare(i + 2 * dir, j).classList.add('dot');
                }
            }
           
            [-1, 1].forEach(dj => {
                if (i + dir >= 0 && i + dir <= 7 && j + dj >= 0 && j + dj <= 7) {
                    const targetPiece = getPiece(i + dir, j + dj);
                    if (targetPiece && !targetPiece.classList.contains(currentTurn)) {
                        getSquare(i + dir, j + dj).classList.add('dot');
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

    const movePiece = (square) => {
        const existingPiece = square.querySelector('img');
        if (existingPiece) {
            existingPiece.remove();
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
                });
                return;
            }
        }

        clearDots();
        selectedPiece = null;
        currentTurn = currentTurn === 'White' ? 'Black' : 'White';
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