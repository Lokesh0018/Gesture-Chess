import { state } from './state.js';

export const getSquare = (i, j) => document.querySelector(`.child[data-i="${i}"][data-j="${j}"]`);

export const getPiece = (i, j) => {
    const sq = getSquare(i, j);
    return sq ? sq.querySelector('img') : null;
};

export const clearDots = () => {
    document.querySelectorAll('.dot').forEach(el => el.classList.remove('dot'));
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
};

export const createBoard = () => {
    const container = document.getElementsByClassName("container");
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
};
