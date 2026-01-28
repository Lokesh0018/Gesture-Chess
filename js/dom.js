import { state } from './state.js';

export let isFirstRender = true;

export const getSquare = (i, j) => document.querySelector(`.child[data-i="${i}"][data-j="${j}"]`);

export const clearDots = () => {
    document.querySelectorAll('.dot').forEach(el => el.classList.remove('dot', 'pulsing-dot'));
    document.querySelectorAll('.selected').forEach(el => el.classList.remove('selected'));
};

export const createBoard = () => {
    const container = document.querySelector(".container");
    let child = "";
    const isBlack = state.playerRole === 'Black';
    
    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const i = isBlack ? 7 - row : row;
            const j = isBlack ? 7 - col : col;
            const colorClass = (i + j) % 2 === 0 ? "black" : "white";
            let coords = "";
            const textColor = (i + j) % 2 === 0 ? "#fff" : "#000";
            if (col === 0) coords += `<span style="position:absolute; top:2px; left:4px; font-size:12px; font-weight:bold; color:${textColor}; pointer-events:none;">${8 - i}</span>`;
            if (row === 7) coords += `<span style="position:absolute; bottom:2px; right:4px; font-size:12px; font-weight:bold; color:${textColor}; pointer-events:none;">${String.fromCharCode(97 + j)}</span>`;

            child += `<div class="child ${colorClass}" style="position:relative;" data-i="${i}" data-j="${j}">${coords}</div>`;
        }
    }
    container.innerHTML = child;

    // Create SVG overlay for tactical arrows
    const svgOverlay = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgOverlay.id = 'tactical-overlay';
    svgOverlay.style.position = 'absolute';
    svgOverlay.style.top = '0';
    svgOverlay.style.left = '0';
    svgOverlay.style.width = '100%';
    svgOverlay.style.height = '100%';
    svgOverlay.style.pointerEvents = 'none';
    svgOverlay.style.zIndex = '500';
    
    // Arrowhead marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '5');
    marker.setAttribute('markerHeight', '4');
    marker.setAttribute('refX', '3');
    marker.setAttribute('refY', '2');
    marker.setAttribute('orient', 'auto-start-reverse');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0 0 L 5 2 L 0 4 z');
    path.setAttribute('fill', 'rgba(235, 97, 80, 0.8)');
    
    marker.appendChild(path);
    defs.appendChild(marker);
    svgOverlay.appendChild(defs);
    
    container.appendChild(svgOverlay);
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
                img.src = `./asserts/${piece.color}${piece.type}.png`;
                img.style.touchAction = 'none';
                img.dataset.i = i;
                img.dataset.j = j;
                img.dataset.value = piece.type;
                img.className = piece.color;
                
                if (isFirstRender) {
                    img.classList.add('drop-in');
                    img.style.animationDelay = `${(7 - i) * 0.05 + Math.random() * 0.1}s`;
                }
                
                sq.appendChild(img);
            }
        }
    }
    isFirstRender = false;
};
