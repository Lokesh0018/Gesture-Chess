import { state } from './state.js';
import { createBoard, clearDots } from './dom.js';
import { showMoves } from './ui.js';
import { movePiece } from './game.js';

window.onload = () => {
    createBoard();
    
    const container = document.getElementsByClassName("container");
    const c1 = container[0];

    const headerWrapper = document.createElement("div");
    headerWrapper.style.marginBottom = "20px";
    headerWrapper.style.display = "flex";
    headerWrapper.style.gap = "20px";
    headerWrapper.style.alignItems = "center";
    headerWrapper.style.justifyContent = "center";

    const turnIndicator = document.createElement("div");
    turnIndicator.innerText = "White's Turn";
    turnIndicator.className = "turn-indicator";
    headerWrapper.appendChild(turnIndicator);
    state.turnIndicator = turnIndicator;

    const restartBtn = document.createElement("button");
    restartBtn.innerText = "Restart Game";
    restartBtn.style.cssText = "padding:12px 24px; font-size:18px; font-weight:bold; cursor:pointer; background-color:#739552; color:#fff; border:none; border-radius:8px; box-shadow: 0 4px 10px rgba(0,0,0,0.4);";
    restartBtn.onclick = () => location.reload();
    headerWrapper.appendChild(restartBtn);

    const mainWrapper = document.createElement("div");
    mainWrapper.className = "main-wrapper";
    
    c1.parentNode.insertBefore(headerWrapper, c1);
    c1.parentNode.insertBefore(mainWrapper, c1);

    const leftPanel = document.createElement("div");
    leftPanel.className = "capture-panel";
    state.leftPanel = leftPanel;

    const rightPanel = document.createElement("div");
    rightPanel.className = "capture-panel";
    state.rightPanel = rightPanel;

    mainWrapper.appendChild(leftPanel);
    mainWrapper.appendChild(c1);
    mainWrapper.appendChild(rightPanel);

    document.querySelector(".container").addEventListener("click", (e) => {
        const target = e.target;
        const square = target.classList.contains('child') ? target : target.parentElement;

        if (square && square.classList.contains('dot')) {
            movePiece(square);
            return;
        }

        if (target.matches("img") && target.classList.contains(state.currentTurn)) {
            showMoves(target);
        } else {
            clearDots();
            state.selectedPiece = null;
        }
    });

    document.querySelector(".container").addEventListener("dragstart", (e) => {
        const target = e.target;
        if (target.matches("img") && target.classList.contains(state.currentTurn)) {
            showMoves(target);
            target.classList.add("dragging");
            e.dataTransfer.effectAllowed = "move";
            e.dataTransfer.setData("text/plain", "chess-piece");
        } else {
            e.preventDefault(); 
        }
    });

    document.querySelector(".container").addEventListener("dragend", (e) => {
        if (e.target.matches("img")) {
            e.target.classList.remove("dragging");
        }
    });

    document.querySelector(".container").addEventListener("dragover", (e) => {
        e.preventDefault(); 
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
            state.selectedPiece = null;
        }
    });
};
