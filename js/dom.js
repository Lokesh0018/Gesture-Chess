import { state } from './state.js';

export const getSquare = (i, j) => document.querySelector(`.child[data-i="${i}"][data-j="${j}"]`);

export const clearDots = () => {
    document.querySelectorAll('.dot').forEach(el => el.classList.remove('dot'));
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
};

export const createBoard = () => {
    const container = document.querySelector(".container");
    let child = "";
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const colorClass = (i + j) % 2 === 0 ? "black" : "white";
            let coords = "";
            const textColor = (i + j) % 2 === 0 ? "#fff" : "#000";
            if (j === 0) coords += `<span style="position:absolute; top:2px; left:4px; font-size:12px; font-weight:bold; color:${textColor}; pointer-events:none;">${8 - i}</span>`;
            if (i === 7) coords += `<span style="position:absolute; bottom:2px; right:4px; font-size:12px; font-weight:bold; color:${textColor}; pointer-events:none;">${String.fromCharCode(97 + j)}</span>`;

            child += `<div class="child ${colorClass}" style="position:relative;" data-i="${i}" data-j="${j}">${coords}</div>`;
        }
    }
    container.innerHTML = child;
};

export const renderBoard = () => {
    for (let i = 0; i < 8; i++) {
        for (let j = 0; j < 8; j++) {
            const sq = getSquare(i, j);
            if (!sq) continue;
            
            // Remove existing image
            const oldImg = sq.querySelector('img');
            if (oldImg) oldImg.remove();
            
            const piece = state.board[i][j];
            if (piece) {
                const img = document.createElement('img');
                img.src = `./pieces/${piece.color}${piece.type}.png`;
                img.draggable = true;
                img.dataset.i = i;
                img.dataset.j = j;
                img.dataset.value = piece.type;
                img.className = piece.color;
                sq.appendChild(img);
            }
        }
    }
};
