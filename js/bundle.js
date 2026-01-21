(() => {
  // js/state.js
  var state = {
    currentTurn: "White",
    selectedPiece: null,
    lastMove: null,
    leftPanel: null,
    rightPanel: null,
    turnIndicator: null
  };

  // js/dom.js
  var getSquare = (i, j) => document.querySelector(`.child[data-i="${i}"][data-j="${j}"]`);
  var getPiece = (i, j) => {
    const sq = getSquare(i, j);
    return sq ? sq.querySelector("img") : null;
  };
  var clearDots = () => {
    document.querySelectorAll(".dot").forEach((el) => el.classList.remove("dot"));
    document.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));
  };
  var createBoard = () => {
    const container = document.getElementsByClassName("container");
    const c1 = container[0];
    let child = "";
    const initialBoard = [
      ["BlackRook", "BlackHorse", "BlackBishop", "BlackKing", "BlackQueen", "BlackBishop", "BlackHorse", "BlackRook"],
      Array(8).fill("BlackPawn"),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill(null),
      Array(8).fill("WhitePawn"),
      ["WhiteRook", "WhiteHorse", "WhiteBishop", "WhiteKing", "WhiteQueen", "WhiteBishop", "WhiteHorse", "WhiteRook"]
    ];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const colorClass = (i + j) % 2 === 0 ? "black" : "white";
        let p = "";
        const pieceDef = initialBoard[i][j];
        if (pieceDef) {
          const color = pieceDef.startsWith("White") ? "White" : "Black";
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

  // js/logic.js
  var isUnderAttack = (r, c, color) => {
    const enemy = color === "White" ? "Black" : "White";
    const checkRay = (dr, dc, pieces, maxSteps = 7) => {
      for (let step = 1; step <= maxSteps; step++) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
        const p = getPiece(nr, nc);
        if (p) {
          if (p.classList.contains(enemy) && pieces.includes(p.dataset.value)) return true;
          break;
        }
      }
      return false;
    };
    if (checkRay(1, 0, ["Rook", "Queen"])) return true;
    if (checkRay(-1, 0, ["Rook", "Queen"])) return true;
    if (checkRay(0, 1, ["Rook", "Queen"])) return true;
    if (checkRay(0, -1, ["Rook", "Queen"])) return true;
    if (checkRay(1, 1, ["Bishop", "Queen"])) return true;
    if (checkRay(1, -1, ["Bishop", "Queen"])) return true;
    if (checkRay(-1, 1, ["Bishop", "Queen"])) return true;
    if (checkRay(-1, -1, ["Bishop", "Queen"])) return true;
    const knightMoves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
    for (let [dr, dc] of knightMoves) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
        const p = getPiece(nr, nc);
        if (p && p.classList.contains(enemy) && p.dataset.value === "Horse") return true;
      }
    }
    if (color === "White") {
      for (let dc of [-1, 1]) {
        const nr = r - 1, nc = c + dc;
        if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
          const p = getPiece(nr, nc);
          if (p && p.classList.contains("Black") && p.dataset.value === "Pawn") return true;
        }
      }
    } else {
      for (let dc of [-1, 1]) {
        const nr = r + 1, nc = c + dc;
        if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
          const p = getPiece(nr, nc);
          if (p && p.classList.contains("White") && p.dataset.value === "Pawn") return true;
        }
      }
    }
    if (checkRay(1, 0, ["King"], 1) || checkRay(-1, 0, ["King"], 1) || checkRay(0, 1, ["King"], 1) || checkRay(0, -1, ["King"], 1) || checkRay(1, 1, ["King"], 1) || checkRay(1, -1, ["King"], 1) || checkRay(-1, 1, ["King"], 1) || checkRay(-1, -1, ["King"], 1)) return true;
    return false;
  };
  var isMoveSafe = (startI, startJ, targetI, targetJ) => {
    const startSq = getSquare(startI, startJ);
    const targetSq = getSquare(targetI, targetJ);
    const piece = getPiece(startI, startJ);
    let targetPiece = getPiece(targetI, targetJ);
    let epSq = null;
    let epPiece = null;
    if (piece.dataset.value === "Pawn" && Math.abs(startJ - targetJ) === 1 && !targetPiece) {
      epSq = getSquare(startI, targetJ);
      epPiece = epSq.querySelector("img");
      if (epPiece) epSq.removeChild(epPiece);
    }
    if (targetPiece) targetSq.removeChild(targetPiece);
    targetSq.appendChild(piece);
    piece.dataset.i = targetI;
    piece.dataset.j = targetJ;
    let kingSq = null;
    const king = document.querySelector(`.child img.${state.currentTurn}[data-value="King"]`);
    if (king) {
      kingSq = { i: parseInt(king.dataset.i), j: parseInt(king.dataset.j) };
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
  var hasAnyValidMoves = () => {
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
      if (type === "Rook" || type === "Queen") {
        if (tryRay(1, 0) || tryRay(-1, 0) || tryRay(0, 1) || tryRay(0, -1)) return true;
      }
      if (type === "Bishop" || type === "Queen") {
        if (tryRay(1, 1) || tryRay(1, -1) || tryRay(-1, 1) || tryRay(-1, -1)) return true;
      }
      if (type === "King") {
        if (tryRay(1, 0, 1) || tryRay(-1, 0, 1) || tryRay(0, 1, 1) || tryRay(0, -1, 1) || tryRay(1, 1, 1) || tryRay(1, -1, 1) || tryRay(-1, 1, 1) || tryRay(-1, -1, 1)) return true;
      }
      if (type === "Horse") {
        const moves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
        for (let [di, dj] of moves) {
          if (tryMove(startI + di, startJ + dj)) return true;
        }
      }
      if (type === "Pawn") {
        const dir = state.currentTurn === "White" ? -1 : 1;
        const startRow = state.currentTurn === "White" ? 6 : 1;
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
            if (state.lastMove && state.lastMove.piece === "Pawn" && Math.abs(state.lastMove.startI - state.lastMove.targetI) === 2) {
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

  // js/ui.js
  var markMove = (targetI, targetJ, startI, startJ) => {
    if (targetI < 0 || targetI > 7 || targetJ < 0 || targetJ > 7) return false;
    const square = getSquare(targetI, targetJ);
    const targetPiece = getPiece(targetI, targetJ);
    let isValidCaptureOrEmpty = false;
    let continueRay = false;
    if (!targetPiece) {
      isValidCaptureOrEmpty = true;
      continueRay = true;
    } else if (!targetPiece.classList.contains(state.currentTurn)) {
      isValidCaptureOrEmpty = true;
      continueRay = false;
    } else {
      return false;
    }
    if (isValidCaptureOrEmpty) {
      if (isMoveSafe(startI, startJ, targetI, targetJ)) {
        square.classList.add("dot");
      }
    }
    return continueRay;
  };
  var showMoves = (piece) => {
    clearDots();
    state.selectedPiece = piece;
    const startI = parseInt(piece.dataset.i);
    const startJ = parseInt(piece.dataset.j);
    const type = piece.dataset.value;
    getSquare(startI, startJ).classList.add("selected");
    const castRay = (di, dj, maxSteps = 7) => {
      for (let step = 1; step <= maxSteps; step++) {
        if (!markMove(startI + di * step, startJ + dj * step, startI, startJ)) break;
      }
    };
    const addDotIfSafe = (targetI, targetJ) => {
      if (isMoveSafe(startI, startJ, targetI, targetJ)) {
        getSquare(targetI, targetJ).classList.add("dot");
      }
    };
    if (type === "Rook" || type === "Queen") {
      castRay(1, 0);
      castRay(-1, 0);
      castRay(0, 1);
      castRay(0, -1);
    }
    if (type === "Bishop" || type === "Queen") {
      castRay(1, 1);
      castRay(1, -1);
      castRay(-1, 1);
      castRay(-1, -1);
    }
    if (type === "King") {
      castRay(1, 0, 1);
      castRay(-1, 0, 1);
      castRay(0, 1, 1);
      castRay(0, -1, 1);
      castRay(1, 1, 1);
      castRay(1, -1, 1);
      castRay(-1, 1, 1);
      castRay(-1, -1, 1);
      if (!piece.dataset.moved) {
        const leftRook = getPiece(startI, 0);
        if (leftRook && leftRook.dataset.value === "Rook" && !leftRook.dataset.moved) {
          if (!getPiece(startI, 1) && !getPiece(startI, 2)) {
            if (isMoveSafe(startI, startJ, startI, 2) && isMoveSafe(startI, startJ, startI, 1)) {
              getSquare(startI, 1).classList.add("dot");
            }
          }
        }
        const rightRook = getPiece(startI, 7);
        if (rightRook && rightRook.dataset.value === "Rook" && !rightRook.dataset.moved) {
          if (!getPiece(startI, 4) && !getPiece(startI, 5) && !getPiece(startI, 6)) {
            if (isMoveSafe(startI, startJ, startI, 4) && isMoveSafe(startI, startJ, startI, 5)) {
              getSquare(startI, 5).classList.add("dot");
            }
          }
        }
      }
    }
    if (type === "Horse") {
      const moves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
      moves.forEach(([di, dj]) => castRay(di, dj, 1));
    }
    if (type === "Pawn") {
      const dir = state.currentTurn === "White" ? -1 : 1;
      const startRow = state.currentTurn === "White" ? 6 : 1;
      if (startI + dir >= 0 && startI + dir <= 7 && !getPiece(startI + dir, startJ)) {
        addDotIfSafe(startI + dir, startJ);
        if (startI === startRow && !getPiece(startI + 2 * dir, startJ)) {
          addDotIfSafe(startI + 2 * dir, startJ);
        }
      }
      [-1, 1].forEach((dj) => {
        if (startI + dir >= 0 && startI + dir <= 7 && startJ + dj >= 0 && startJ + dj <= 7) {
          const targetPiece = getPiece(startI + dir, startJ + dj);
          if (targetPiece && !targetPiece.classList.contains(state.currentTurn)) {
            addDotIfSafe(startI + dir, startJ + dj);
          }
          if (state.lastMove && state.lastMove.piece === "Pawn" && Math.abs(state.lastMove.startI - state.lastMove.targetI) === 2) {
            if (state.lastMove.targetI === startI && state.lastMove.targetJ === startJ + dj) {
              addDotIfSafe(startI + dir, startJ + dj);
            }
          }
        }
      });
    }
  };
  var showPromotionModal = (piece, turn, callback) => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0,0,0,0.5)";
    overlay.style.zIndex = "999";
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "50%";
    modal.style.left = "50%";
    modal.style.transform = "translate(-50%, -50%)";
    modal.style.backgroundColor = "#262522";
    modal.style.padding = "30px";
    modal.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
    modal.style.borderRadius = "8px";
    modal.style.display = "flex";
    modal.style.gap = "15px";
    modal.style.zIndex = "1000";
    const choices = ["Queen", "Rook", "Horse", "Bishop"];
    choices.forEach((choice) => {
      const img = document.createElement("img");
      img.src = `./pieces/${turn}${choice}.png`;
      img.style.cursor = "pointer";
      img.style.width = "60px";
      img.style.height = "60px";
      img.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
      img.style.borderRadius = "8px";
      img.style.padding = "4px";
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
  var showCheckMessage = () => {
    const msg = document.createElement("div");
    msg.innerText = "Check!";
    msg.style.position = "fixed";
    msg.style.top = "20px";
    msg.style.left = "50%";
    msg.style.transform = "translateX(-50%)";
    msg.style.backgroundColor = "#e0474c";
    msg.style.color = "#fff";
    msg.style.padding = "10px 20px";
    msg.style.fontSize = "24px";
    msg.style.fontWeight = "bold";
    msg.style.borderRadius = "8px";
    msg.style.boxShadow = "0 4px 10px rgba(0,0,0,0.5)";
    msg.style.zIndex = "1000";
    msg.style.pointerEvents = "none";
    msg.style.transition = "opacity 0.5s";
    document.body.appendChild(msg);
    setTimeout(() => {
      msg.style.opacity = "0";
      setTimeout(() => document.body.removeChild(msg), 500);
    }, 2e3);
  };
  var showGameOver = (message) => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0,0,0,0.7)";
    overlay.style.zIndex = "999";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    const modal = document.createElement("div");
    modal.style.backgroundColor = "#262522";
    modal.style.color = "#fff";
    modal.style.padding = "40px";
    modal.style.borderRadius = "8px";
    modal.style.textAlign = "center";
    modal.style.fontSize = "32px";
    modal.style.fontWeight = "bold";
    modal.style.boxShadow = "0 10px 30px rgba(0,0,0,0.5)";
    modal.innerHTML = `<div>${message}</div><button onclick="location.reload()" style="margin-top:30px; padding:12px 24px; font-size:18px; font-weight:bold; cursor:pointer; background-color:#739552; color:#fff; border:none; border-radius:8px;">Play Again</button>`;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  };

  // js/game.js
  var moveSound = new Audio("https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3");
  var captureSound = new Audio("https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3");
  var checkSound = new Audio("https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3");
  var postMoveChecks = () => {
    const king = document.querySelector(`.child img.${state.currentTurn}[data-value="King"]`);
    let inCheck = false;
    if (king) {
      const kingI = parseInt(king.dataset.i);
      const kingJ = parseInt(king.dataset.j);
      if (isUnderAttack(kingI, kingJ, state.currentTurn)) {
        inCheck = true;
      }
    }
    if (!hasAnyValidMoves()) {
      if (inCheck) showGameOver(`Checkmate! ${state.currentTurn === "White" ? "Black" : "White"} Wins!`);
      else showGameOver("Stalemate! It's a draw!");
      return;
    }
    if (inCheck) {
      showCheckMessage();
      checkSound.play().catch((e) => console.warn("Audio play prevented", e));
    }
  };
  var movePiece = (square) => {
    const startI = parseInt(state.selectedPiece.dataset.i);
    const startJ = parseInt(state.selectedPiece.dataset.j);
    const targetI = parseInt(square.dataset.i);
    const targetJ = parseInt(square.dataset.j);
    let captured = false;
    document.querySelectorAll(".last-move").forEach((el) => el.classList.remove("last-move"));
    getSquare(startI, startJ).classList.add("last-move");
    square.classList.add("last-move");
    const existingPiece = square.querySelector("img");
    if (existingPiece) {
      existingPiece.style.width = "40px";
      existingPiece.style.height = "40px";
      existingPiece.classList.remove("last-move");
      if (existingPiece.classList.contains("White")) {
        state.leftPanel.appendChild(existingPiece);
      } else if (existingPiece.classList.contains("Black")) {
        state.rightPanel.appendChild(existingPiece);
      }
      captured = true;
    } else if (state.selectedPiece.dataset.value === "Pawn" && Math.abs(startJ - targetJ) === 1) {
      const capturedSq = getSquare(startI, targetJ);
      const capturedPiece = capturedSq.querySelector("img");
      if (capturedPiece) {
        capturedPiece.style.width = "40px";
        capturedPiece.style.height = "40px";
        capturedPiece.classList.remove("last-move");
        if (capturedPiece.classList.contains("White")) state.leftPanel.appendChild(capturedPiece);
        else state.rightPanel.appendChild(capturedPiece);
        captured = true;
      }
    }
    if (state.selectedPiece.dataset.value === "King" && Math.abs(startJ - targetJ) === 2) {
      if (targetJ === 1) {
        const rook = getPiece(startI, 0);
        if (rook) {
          getSquare(startI, 2).appendChild(rook);
          rook.dataset.j = 2;
          rook.dataset.moved = "true";
        }
      } else if (targetJ === 5) {
        const rook = getPiece(startI, 7);
        if (rook) {
          getSquare(startI, 4).appendChild(rook);
          rook.dataset.j = 4;
          rook.dataset.moved = "true";
        }
      }
    }
    state.selectedPiece.dataset.moved = "true";
    state.selectedPiece.dataset.i = targetI;
    state.selectedPiece.dataset.j = targetJ;
    square.appendChild(state.selectedPiece);
    if (captured) {
      captureSound.play().catch((e) => console.warn("Audio play prevented", e));
    } else {
      moveSound.play().catch((e) => console.warn("Audio play prevented", e));
    }
    const endTurn = () => {
      state.lastMove = {
        piece: state.selectedPiece.dataset.value,
        color: state.currentTurn,
        startI,
        startJ,
        targetI,
        targetJ
      };
      clearDots();
      state.selectedPiece = null;
      state.currentTurn = state.currentTurn === "White" ? "Black" : "White";
      state.turnIndicator.innerText = `${state.currentTurn}'s Turn`;
      postMoveChecks();
    };
    if (state.selectedPiece.dataset.value === "Pawn") {
      const row = parseInt(state.selectedPiece.dataset.i);
      if (state.currentTurn === "White" && row === 0 || state.currentTurn === "Black" && row === 7) {
        showPromotionModal(state.selectedPiece, state.currentTurn, () => {
          endTurn();
        });
        return;
      }
    }
    endTurn();
  };

  // js/main.js
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
      const square = target.classList.contains("child") ? target : target.parentElement;
      if (square && square.classList.contains("dot")) {
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
      const square = target.classList.contains("child") ? target : target.parentElement;
      if (square && square.classList.contains("dot")) {
        movePiece(square);
      } else {
        clearDots();
        state.selectedPiece = null;
      }
    });
  };
})();
