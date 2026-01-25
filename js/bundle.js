(() => {
  // js/state.js
  var COLORS = {
    WHITE: "White",
    BLACK: "Black"
  };
  var PIECES = {
    ROOK: "Rook",
    HORSE: "Horse",
    BISHOP: "Bishop",
    QUEEN: "Queen",
    KING: "King",
    PAWN: "Pawn"
  };
  var state = {
    currentTurn: COLORS.WHITE,
    selectedSquare: null,
    // {i, j}
    lastMove: null,
    board: Array(8).fill(null).map(() => Array(8).fill(null)),
    leftPanel: null,
    rightPanel: null,
    turnIndicator: null,
    moveHistoryPanel: null,
    halfMoveClock: 0,
    positionHistory: {},
    // Store counts of FEN-like strings
    moveList: [],
    // Array of {white: 'e4', black: 'e5'}
    stateHistory: [],
    // Store deep copies for Undo
    redoHistory: [],
    // Store copies for Redo
    whiteTime: 0,
    blackTime: 0,
    timerInterval: null,
    clockWhiteDOM: null,
    clockBlackDOM: null
  };
  var initializeBoard = () => {
    const initRow = (color) => [
      { color, type: PIECES.ROOK, moved: false },
      { color, type: PIECES.HORSE, moved: false },
      { color, type: PIECES.BISHOP, moved: false },
      { color, type: PIECES.QUEEN, moved: false },
      { color, type: PIECES.KING, moved: false },
      { color, type: PIECES.BISHOP, moved: false },
      { color, type: PIECES.HORSE, moved: false },
      { color, type: PIECES.ROOK, moved: false }
    ];
    state.board[0] = initRow(COLORS.BLACK);
    state.board[1] = Array(8).fill(null).map(() => ({ color: COLORS.BLACK, type: PIECES.PAWN, moved: false }));
    for (let i = 2; i <= 5; i++) state.board[i] = Array(8).fill(null);
    state.board[6] = Array(8).fill(null).map(() => ({ color: COLORS.WHITE, type: PIECES.PAWN, moved: false }));
    state.board[7] = initRow(COLORS.WHITE);
    if (state.leftPanel) state.leftPanel.innerHTML = "";
    if (state.rightPanel) state.rightPanel.innerHTML = "";
    if (state.moveHistoryPanel) state.moveHistoryPanel.innerHTML = "";
    state.positionHistory = {};
    state.moveList = [];
    state.stateHistory = [];
    state.redoHistory = [];
    state.whiteTime = 0;
    state.blackTime = 0;
    state.currentTurn = COLORS.WHITE;
    state.selectedSquare = null;
    state.lastMove = null;
    state.halfMoveClock = 0;
    recordPosition();
  };
  var _captureStateSnapshot = () => ({
    board: JSON.parse(JSON.stringify(state.board)),
    currentTurn: state.currentTurn,
    halfMoveClock: state.halfMoveClock,
    positionHistory: JSON.parse(JSON.stringify(state.positionHistory)),
    moveList: JSON.parse(JSON.stringify(state.moveList)),
    whiteTime: state.whiteTime,
    blackTime: state.blackTime,
    lastMove: state.lastMove ? JSON.parse(JSON.stringify(state.lastMove)) : null,
    leftPanelHTML: state.leftPanel ? state.leftPanel.innerHTML : "",
    rightPanelHTML: state.rightPanel ? state.rightPanel.innerHTML : ""
  });
  var _applyStateSnapshot = (snap) => {
    state.board = snap.board;
    state.currentTurn = snap.currentTurn;
    state.halfMoveClock = snap.halfMoveClock;
    state.positionHistory = snap.positionHistory;
    state.moveList = snap.moveList;
    state.whiteTime = snap.whiteTime;
    state.blackTime = snap.blackTime;
    state.selectedSquare = null;
    state.lastMove = snap.lastMove;
    if (state.leftPanel) state.leftPanel.innerHTML = snap.leftPanelHTML;
    if (state.rightPanel) state.rightPanel.innerHTML = snap.rightPanelHTML;
    if (state.clockWhiteDOM) {
      const m1 = Math.floor(state.whiteTime / 60);
      const s1 = state.whiteTime % 60;
      state.clockWhiteDOM.innerText = `${m1}:${s1.toString().padStart(2, "0")}`;
    }
    if (state.clockBlackDOM) {
      const m2 = Math.floor(state.blackTime / 60);
      const s2 = state.blackTime % 60;
      state.clockBlackDOM.innerText = `${m2}:${s2.toString().padStart(2, "0")}`;
    }
  };
  var saveState = () => {
    state.stateHistory.push(_captureStateSnapshot());
    state.redoHistory = [];
  };
  var restoreState = () => {
    if (state.stateHistory.length === 0) return false;
    state.redoHistory.push(_captureStateSnapshot());
    const prev = state.stateHistory.pop();
    _applyStateSnapshot(prev);
    return true;
  };
  var redoState = () => {
    if (state.redoHistory.length === 0) return false;
    state.stateHistory.push(_captureStateSnapshot());
    const next = state.redoHistory.pop();
    _applyStateSnapshot(next);
    return true;
  };
  var getBoardString = () => {
    return state.board.map(
      (row) => row.map((p) => p ? `${p.color[0]}${p.type[0]}` : "--").join(",")
    ).join(";");
  };
  var recordPosition = () => {
    const pos = getBoardString() + `|${state.currentTurn}`;
    const newCount = (state.positionHistory[pos] || 0) + 1;
    state.positionHistory[pos] = newCount;
    return newCount;
  };

  // js/dom.js
  var isFirstRender = true;
  var getSquare = (i, j) => document.querySelector(`.child[data-i="${i}"][data-j="${j}"]`);
  var clearDots = () => {
    document.querySelectorAll(".dot").forEach((el) => el.classList.remove("dot", "pulsing-dot"));
    document.querySelectorAll(".selected").forEach((el) => el.classList.remove("selected"));
  };
  var createBoard = () => {
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
  var renderBoard = () => {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const sq = getSquare(i, j);
        if (!sq) continue;
        const oldImg = sq.querySelector("img");
        if (oldImg) oldImg.remove();
        const piece = state.board[i][j];
        if (piece) {
          const img = document.createElement("img");
          img.src = `./asserts/${piece.color}${piece.type}.png`;
          img.style.touchAction = "none";
          img.dataset.i = i;
          img.dataset.j = j;
          img.dataset.value = piece.type;
          img.className = piece.color;
          if (isFirstRender) {
            img.classList.add("drop-in");
            img.style.animationDelay = `${(7 - i) * 0.05 + Math.random() * 0.1}s`;
          }
          sq.appendChild(img);
        }
      }
    }
    isFirstRender = false;
  };

  // js/logic.js
  var isUnderAttack = (r, c, color, board = state.board) => {
    const enemy = color === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
    const checkRay = (dr, dc, pieces, maxSteps = 7) => {
      for (let step = 1; step <= maxSteps; step++) {
        const nr = r + dr * step;
        const nc = c + dc * step;
        if (nr < 0 || nr > 7 || nc < 0 || nc > 7) break;
        const p = board[nr][nc];
        if (p) {
          if (p.color === enemy && pieces.includes(p.type)) return true;
          break;
        }
      }
      return false;
    };
    if (checkRay(1, 0, [PIECES.ROOK, PIECES.QUEEN])) return true;
    if (checkRay(-1, 0, [PIECES.ROOK, PIECES.QUEEN])) return true;
    if (checkRay(0, 1, [PIECES.ROOK, PIECES.QUEEN])) return true;
    if (checkRay(0, -1, [PIECES.ROOK, PIECES.QUEEN])) return true;
    if (checkRay(1, 1, [PIECES.BISHOP, PIECES.QUEEN])) return true;
    if (checkRay(1, -1, [PIECES.BISHOP, PIECES.QUEEN])) return true;
    if (checkRay(-1, 1, [PIECES.BISHOP, PIECES.QUEEN])) return true;
    if (checkRay(-1, -1, [PIECES.BISHOP, PIECES.QUEEN])) return true;
    const knightMoves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
    for (let [dr, dc] of knightMoves) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
        const p = board[nr][nc];
        if (p && p.color === enemy && p.type === PIECES.HORSE) return true;
      }
    }
    const pawnDir = color === COLORS.WHITE ? -1 : 1;
    for (let dc of [-1, 1]) {
      const nr = r + pawnDir, nc = c + dc;
      if (nr >= 0 && nr <= 7 && nc >= 0 && nc <= 7) {
        const p = board[nr][nc];
        if (p && p.color === enemy && p.type === PIECES.PAWN) return true;
      }
    }
    if (checkRay(1, 0, [PIECES.KING], 1) || checkRay(-1, 0, [PIECES.KING], 1) || checkRay(0, 1, [PIECES.KING], 1) || checkRay(0, -1, [PIECES.KING], 1) || checkRay(1, 1, [PIECES.KING], 1) || checkRay(1, -1, [PIECES.KING], 1) || checkRay(-1, 1, [PIECES.KING], 1) || checkRay(-1, -1, [PIECES.KING], 1)) return true;
    return false;
  };
  var isMoveSafe = (startI, startJ, targetI, targetJ, color = state.currentTurn) => {
    const tempBoard = state.board.map((row) => row.map((p) => p ? { ...p } : null));
    const piece = tempBoard[startI][startJ];
    if (!piece) return false;
    if (piece.type === PIECES.PAWN && Math.abs(startJ - targetJ) === 1 && !tempBoard[targetI][targetJ]) {
      tempBoard[startI][targetJ] = null;
    }
    tempBoard[targetI][targetJ] = piece;
    tempBoard[startI][startJ] = null;
    let kingSq = null;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const p = tempBoard[i][j];
        if (p && p.color === color && p.type === PIECES.KING) {
          kingSq = { i, j };
          break;
        }
      }
    }
    if (kingSq) {
      return !isUnderAttack(kingSq.i, kingSq.j, color, tempBoard);
    }
    return true;
  };
  var hasAnyValidMoves = (color = state.currentTurn) => {
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = state.board[i][j];
        if (piece && piece.color === color) {
          const type = piece.type;
          const tryMove = (ti, tj) => {
            if (ti < 0 || ti > 7 || tj < 0 || tj > 7) return false;
            const tp = state.board[ti][tj];
            if (tp && tp.color === color) return false;
            return isMoveSafe(i, j, ti, tj, color);
          };
          const tryRay = (di, dj, maxSteps = 7) => {
            for (let step = 1; step <= maxSteps; step++) {
              const ti = i + di * step;
              const tj = j + dj * step;
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
            if (tryRay(1, 0) || tryRay(-1, 0) || tryRay(0, 1) || tryRay(0, -1)) return true;
          }
          if (type === PIECES.BISHOP || type === PIECES.QUEEN) {
            if (tryRay(1, 1) || tryRay(1, -1) || tryRay(-1, 1) || tryRay(-1, -1)) return true;
          }
          if (type === PIECES.KING) {
            if (tryRay(1, 0, 1) || tryRay(-1, 0, 1) || tryRay(0, 1, 1) || tryRay(0, -1, 1) || tryRay(1, 1, 1) || tryRay(1, -1, 1) || tryRay(-1, 1, 1) || tryRay(-1, -1, 1)) return true;
          }
          if (type === PIECES.HORSE) {
            const moves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
            for (let [di, dj] of moves) {
              if (tryMove(i + di, j + dj)) return true;
            }
          }
          if (type === PIECES.PAWN) {
            const dir = color === COLORS.WHITE ? -1 : 1;
            const startRow = color === COLORS.WHITE ? 6 : 1;
            if (i + dir >= 0 && i + dir <= 7 && !state.board[i + dir][j]) {
              if (tryMove(i + dir, j)) return true;
              if (i === startRow && !state.board[i + 2 * dir][j]) {
                if (tryMove(i + 2 * dir, j)) return true;
              }
            }
            for (let dj of [-1, 1]) {
              if (i + dir >= 0 && i + dir <= 7 && j + dj >= 0 && j + dj <= 7) {
                const tp = state.board[i + dir][j + dj];
                if (tp && tp.color !== color) {
                  if (tryMove(i + dir, j + dj)) return true;
                }
                if (state.lastMove && state.lastMove.piece === PIECES.PAWN && Math.abs(state.lastMove.startI - state.lastMove.targetI) === 2) {
                  if (state.lastMove.targetI === i && state.lastMove.targetJ === j + dj) {
                    if (isMoveSafe(i, j, i + dir, j + dj, color)) return true;
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
  var checkDrawConditions = () => {
    if (state.halfMoveClock >= 100) return "Draw by 50-move rule";
    const posKeys = Object.values(state.positionHistory);
    if (posKeys.some((count) => count >= 3)) return "Draw by threefold repetition";
    let whitePieces = [];
    let blackPieces = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const p = state.board[i][j];
        if (p) {
          if (p.type === PIECES.PAWN || p.type === PIECES.ROOK || p.type === PIECES.QUEEN) return null;
          if (p.color === COLORS.WHITE) whitePieces.push(p.type);
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

  // js/ui.js
  var markMove = (targetI, targetJ, startI, startJ, isHover = false) => {
    if (targetI < 0 || targetI > 7 || targetJ < 0 || targetJ > 7) return false;
    const targetPiece = state.board[targetI][targetJ];
    let isValidCaptureOrEmpty = false;
    let continueRay = false;
    if (!targetPiece) {
      isValidCaptureOrEmpty = true;
      continueRay = true;
    } else if (targetPiece.color !== state.currentTurn) {
      isValidCaptureOrEmpty = true;
      continueRay = false;
    } else {
      return false;
    }
    if (isValidCaptureOrEmpty) {
      if (isMoveSafe(startI, startJ, targetI, targetJ)) {
        const sq = getSquare(targetI, targetJ);
        if (sq) {
          if (isHover) sq.classList.add("hover-dot");
          else sq.classList.add("dot", "pulsing-dot");
        }
      }
    }
    return continueRay;
  };
  var showMoves = (i, j, isHover = false) => {
    if (!isHover) {
      clearDots();
      state.selectedSquare = { i, j };
    }
    const piece = state.board[i][j];
    if (!piece) return;
    const sq = getSquare(i, j);
    if (sq && !isHover) sq.classList.add("selected");
    const castRay = (di, dj, maxSteps = 7) => {
      for (let step = 1; step <= maxSteps; step++) {
        if (!markMove(i + di * step, j + dj * step, i, j, isHover)) break;
      }
    };
    const addDotIfSafe = (targetI, targetJ) => {
      if (isMoveSafe(i, j, targetI, targetJ)) {
        const sq2 = getSquare(targetI, targetJ);
        if (sq2) {
          if (isHover) sq2.classList.add("hover-dot");
          else sq2.classList.add("dot", "pulsing-dot");
        }
      }
    };
    const type = piece.type;
    if (type === PIECES.ROOK || type === PIECES.QUEEN) {
      castRay(1, 0);
      castRay(-1, 0);
      castRay(0, 1);
      castRay(0, -1);
    }
    if (type === PIECES.BISHOP || type === PIECES.QUEEN) {
      castRay(1, 1);
      castRay(1, -1);
      castRay(-1, 1);
      castRay(-1, -1);
    }
    if (type === PIECES.KING) {
      castRay(1, 0, 1);
      castRay(-1, 0, 1);
      castRay(0, 1, 1);
      castRay(0, -1, 1);
      castRay(1, 1, 1);
      castRay(1, -1, 1);
      castRay(-1, 1, 1);
      castRay(-1, -1, 1);
      if (!piece.moved && !isUnderAttack(i, j, state.currentTurn)) {
        const leftRook = state.board[i][0];
        if (leftRook && leftRook.type === PIECES.ROOK && !leftRook.moved) {
          if (!state.board[i][1] && !state.board[i][2] && !state.board[i][3]) {
            if (!isUnderAttack(i, 2, state.currentTurn) && !isUnderAttack(i, 3, state.currentTurn)) {
              addDotIfSafe(i, 2);
            }
          }
        }
        const rightRook = state.board[i][7];
        if (rightRook && rightRook.type === PIECES.ROOK && !rightRook.moved) {
          if (!state.board[i][5] && !state.board[i][6]) {
            if (!isUnderAttack(i, 5, state.currentTurn) && !isUnderAttack(i, 6, state.currentTurn)) {
              addDotIfSafe(i, 6);
            }
          }
        }
      }
    }
    if (type === PIECES.HORSE) {
      const moves = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
      moves.forEach(([di, dj]) => castRay(di, dj, 1));
    }
    if (type === PIECES.PAWN) {
      const dir = state.currentTurn === COLORS.WHITE ? -1 : 1;
      const startRow = state.currentTurn === COLORS.WHITE ? 6 : 1;
      if (i + dir >= 0 && i + dir <= 7 && !state.board[i + dir][j]) {
        addDotIfSafe(i + dir, j);
        if (i === startRow && !state.board[i + 2 * dir][j]) {
          addDotIfSafe(i + 2 * dir, j);
        }
      }
      [-1, 1].forEach((dj) => {
        if (i + dir >= 0 && i + dir <= 7 && j + dj >= 0 && j + dj <= 7) {
          const tp = state.board[i + dir][j + dj];
          if (tp && tp.color !== state.currentTurn) {
            addDotIfSafe(i + dir, j + dj);
          }
          if (state.lastMove && state.lastMove.piece === PIECES.PAWN && Math.abs(state.lastMove.startI - state.lastMove.targetI) === 2) {
            if (state.lastMove.targetI === i && state.lastMove.targetJ === j + dj) {
              addDotIfSafe(i + dir, j + dj);
            }
          }
        }
      });
    }
  };
  var showPromotionModal = (color, callback) => {
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
    const choices = [PIECES.QUEEN, PIECES.ROOK, PIECES.HORSE, PIECES.BISHOP];
    choices.forEach((choice) => {
      const img = document.createElement("img");
      img.src = `./asserts/${color}${choice}.png`;
      img.style.cursor = "pointer";
      img.style.width = "60px";
      img.style.height = "60px";
      img.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
      img.style.borderRadius = "8px";
      img.style.padding = "4px";
      img.onclick = () => {
        document.body.removeChild(modal);
        document.body.removeChild(overlay);
        callback(choice);
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
  var showNotification = (message) => {
    const msg = document.createElement("div");
    msg.innerText = message;
    msg.style.position = "fixed";
    msg.style.bottom = "20px";
    msg.style.left = "50%";
    msg.style.transform = "translateX(-50%)";
    msg.style.backgroundColor = "#f6f669";
    msg.style.color = "#302e2b";
    msg.style.padding = "10px 20px";
    msg.style.fontSize = "18px";
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
    }, 3e3);
  };
  var showGameOver = (message) => {
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0,0,0,0.85)";
    overlay.style.zIndex = "999";
    overlay.style.display = "flex";
    overlay.style.justifyContent = "center";
    overlay.style.alignItems = "center";
    overlay.style.flexDirection = "column";
    overlay.style.opacity = "0";
    overlay.style.transition = "opacity 1s ease-in";
    document.body.appendChild(overlay);
    const loserColor = message.includes("Wins") ? message.includes("White Wins") ? COLORS.BLACK : COLORS.WHITE : state.currentTurn;
    const losingKingImg = Array.from(document.querySelectorAll(`img.${loserColor}`)).find((img) => img.dataset.value === PIECES.KING);
    if (losingKingImg) {
      losingKingImg.style.transition = "transform 1.5s cubic-bezier(0.5, 0, 1, 1)";
      losingKingImg.style.transformOrigin = "bottom right";
      losingKingImg.style.zIndex = "100";
      void losingKingImg.offsetWidth;
      losingKingImg.style.transform = "rotate(90deg) translate(0, 20%)";
    }
    setTimeout(() => {
      overlay.style.opacity = "1";
      let mainTextStr = "GAME OVER";
      if (message.includes("Checkmate")) mainTextStr = "CHECKMATE";
      else if (message.includes("Time")) mainTextStr = "TIME'S UP";
      else if (message.includes("Draw") || message.includes("Stalemate")) mainTextStr = "DRAW";
      const bannerText = document.createElement("div");
      bannerText.innerText = mainTextStr;
      bannerText.style.fontFamily = "Arial, sans-serif";
      bannerText.style.fontSize = "min(10vw, 80px)";
      bannerText.style.fontWeight = "900";
      bannerText.style.color = "#ebecd0";
      bannerText.style.textShadow = "0 0 20px rgba(115, 149, 82, 0.5), 0 0 40px #739552, 0 0 80px #739552";
      bannerText.style.letterSpacing = "8px";
      bannerText.style.textTransform = "uppercase";
      bannerText.style.transform = "scale(0)";
      overlay.appendChild(bannerText);
      bannerText.animate([
        { transform: "scale(3)", opacity: 0, filter: "blur(20px)" },
        { transform: "scale(1)", opacity: 1, filter: "blur(0px)" }
      ], { duration: 1e3, easing: "cubic-bezier(0.16, 1, 0.3, 1)", fill: "forwards" });
      const subMsg = document.createElement("div");
      subMsg.innerText = message;
      subMsg.style.fontFamily = "Arial, sans-serif";
      subMsg.style.fontSize = "24px";
      subMsg.style.color = "#ebecd0";
      subMsg.style.marginTop = "20px";
      subMsg.style.textShadow = "0 2px 4px rgba(0,0,0,0.8)";
      subMsg.style.opacity = "0";
      overlay.appendChild(subMsg);
      subMsg.animate([
        { opacity: 0, transform: "translateY(20px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: 800, delay: 600, easing: "ease-out", fill: "forwards" });
      const btn = document.createElement("button");
      btn.innerText = "Play Again";
      btn.style.marginTop = "40px";
      btn.style.padding = "15px 40px";
      btn.style.fontSize = "20px";
      btn.style.fontWeight = "bold";
      btn.style.color = "#fff";
      btn.style.backgroundColor = "#739552";
      btn.style.border = "1px solid #ebecd0";
      btn.style.borderRadius = "30px";
      btn.style.cursor = "pointer";
      btn.style.backdropFilter = "blur(10px)";
      btn.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";
      btn.style.transition = "all 0.3s ease";
      btn.style.opacity = "0";
      btn.onmouseover = () => {
        btn.style.backgroundColor = "#81b64c";
        btn.style.transform = "translateY(-2px)";
        btn.style.boxShadow = "0 6px 20px rgba(115, 149, 82, 0.6)";
      };
      btn.onmouseout = () => {
        btn.style.backgroundColor = "#739552";
        btn.style.transform = "translateY(0)";
        btn.style.boxShadow = "0 4px 15px rgba(0,0,0,0.5)";
      };
      btn.onclick = () => window.location.reload();
      overlay.appendChild(btn);
      btn.animate([
        { opacity: 0, transform: "translateY(20px)" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: 800, delay: 1e3, easing: "ease-out", fill: "forwards" });
    }, 1200);
  };

  // js/animations.js
  var playMoveAnimation = (startI, startJ, targetI, targetJ, pieceType, isCapture, isEnPassant, actualVictimSq) => {
    return new Promise((resolve) => {
      const attackerSq = getSquare(startI, startJ);
      const targetSq = getSquare(targetI, targetJ);
      if (!attackerSq || !targetSq) {
        resolve();
        return;
      }
      const pieceImg = attackerSq.querySelector("img:not(.particle):not(.shockwave)");
      if (!pieceImg) {
        resolve();
        return;
      }
      const attRect = attackerSq.getBoundingClientRect();
      const tgtRect = targetSq.getBoundingClientRect();
      const dx = tgtRect.left - attRect.left;
      const dy = tgtRect.top - attRect.top;
      let duration = 300;
      let easing = "cubic-bezier(0.25, 0.1, 0.25, 1)";
      let needsArc = false;
      let blurClass = "";
      let needsAnticipation = true;
      switch (pieceType.toLowerCase()) {
        case "pawn":
          duration = 200;
          easing = "linear";
          needsAnticipation = false;
          break;
        case "horse":
          duration = 400;
          needsArc = true;
          easing = "cubic-bezier(0.25, 1, 0.5, 1)";
          break;
        case "bishop":
          duration = 350;
          blurClass = "motion-blur-light";
          easing = "cubic-bezier(0.4, 0, 0.2, 1)";
          break;
        case "rook":
          duration = 400;
          easing = "cubic-bezier(0.5, 0, 0.1, 1)";
          needsAnticipation = true;
          break;
        case "queen":
          duration = 250;
          blurClass = "motion-blur-heavy";
          easing = "cubic-bezier(0.8, 0, 0.2, 1)";
          needsAnticipation = true;
          break;
        case "king":
          duration = 500;
          easing = "cubic-bezier(0.2, 0.8, 0.2, 1)";
          needsAnticipation = true;
          break;
      }
      if (blurClass) pieceImg.classList.add(blurClass);
      const sequence = [];
      if (needsAnticipation) {
        const normX = dx === 0 ? 0 : dx / Math.abs(dx);
        const normY = dy === 0 ? 0 : dy / Math.abs(dy);
        sequence.push({
          transform: `translate(${-normX * 10}px, ${-normY * 10}px)`,
          offset: 0.15
        });
      }
      if (needsArc) {
        sequence.push({
          transform: `translate(${dx / 2}px, ${dy / 2 - 50}px) scale(1.2)`,
          offset: 0.5
        });
      }
      sequence.push({
        transform: `translate(${dx}px, ${dy}px) scale(1)`,
        offset: 1
      });
      const anim = pieceImg.animate([
        { transform: "translate(0, 0) scale(1)", offset: 0 },
        ...sequence
      ], {
        duration,
        easing,
        fill: "forwards"
      });
      anim.onfinish = () => {
        if (blurClass) pieceImg.classList.remove(blurClass);
        if (isCapture) {
          playCombatAnimation(attackerSq, actualVictimSq || targetSq, pieceImg, resolve, pieceType, isEnPassant);
        } else {
          triggerShockwave(targetSq);
          resolve();
        }
      };
    });
  };
  var playCombatAnimation = (attackerSq, targetSq, pieceImg, resolve, attackerType, isEnPassant) => {
    const pType = (attackerType || "").toLowerCase();
    const container = document.querySelector(".container");
    if (container) {
      container.classList.remove("camera-shake");
      void container.offsetWidth;
      container.classList.add("camera-shake");
    }
    if (isEnPassant) {
      const slash = document.createElement("div");
      slash.style.position = "absolute";
      slash.style.width = "140px";
      slash.style.height = "6px";
      slash.style.background = "linear-gradient(90deg, transparent, #fff, #00ffff, transparent)";
      slash.style.boxShadow = "0 0 15px #00ffff, 0 0 30px #00ffff";
      slash.style.left = "50%";
      slash.style.top = "50%";
      slash.style.zIndex = "105";
      slash.style.transformOrigin = "center";
      slash.style.transform = "translate(-50%, -50%) scaleX(0) rotate(45deg)";
      targetSq.appendChild(slash);
      slash.animate([
        { transform: "translate(-50%, -50%) scaleX(0) rotate(45deg)", opacity: 1 },
        { transform: "translate(-50%, -50%) scaleX(1.5) rotate(45deg)", opacity: 1 },
        { transform: "translate(-50%, -50%) scaleX(0) rotate(45deg)", opacity: 0 }
      ], { duration: 300, fill: "forwards" });
      setTimeout(() => {
        if (slash.parentNode) slash.parentNode.removeChild(slash);
        createParticles(targetSq);
        triggerShockwave(targetSq);
        showExplosion(targetSq, resolve);
      }, 300);
      return;
    }
    if (pType === "bishop") {
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.style.position = "absolute";
      svg.style.width = "100px";
      svg.style.height = "300px";
      svg.style.left = "50%";
      svg.style.bottom = "50%";
      svg.style.transform = "translate(-50%, 0)";
      svg.style.zIndex = "101";
      svg.style.pointerEvents = "none";
      const path = document.createElementNS(svgNS, "path");
      let d = "M 50,0 ";
      let currentX = 50;
      for (let y = 20; y <= 300; y += 20) {
        currentX += (Math.random() - 0.5) * 40;
        d += `L ${currentX},${y} `;
      }
      path.setAttribute("d", d);
      path.setAttribute("stroke", "#00ffff");
      path.setAttribute("stroke-width", "4");
      path.setAttribute("fill", "none");
      path.style.filter = "drop-shadow(0 0 10px #00ffff) drop-shadow(0 0 20px #ffffff)";
      svg.appendChild(path);
      targetSq.appendChild(svg);
      const flash = document.createElement("div");
      flash.style.position = "absolute";
      flash.style.inset = "0";
      flash.style.backgroundColor = "white";
      flash.style.zIndex = "100";
      targetSq.appendChild(flash);
      svg.animate([
        { opacity: 0 },
        { opacity: 1, offset: 0.1 },
        { opacity: 0, offset: 0.2 },
        { opacity: 1, offset: 0.3 },
        { opacity: 0 }
      ], { duration: 300, fill: "forwards" });
      flash.animate([
        { opacity: 1 },
        { opacity: 0 }
      ], { duration: 300, fill: "forwards" });
      setTimeout(() => {
        if (svg.parentNode) svg.parentNode.removeChild(svg);
        if (flash.parentNode) flash.parentNode.removeChild(flash);
        createParticles(targetSq);
        triggerShockwave(targetSq);
        showExplosion(targetSq, resolve);
      }, 300);
      return;
    }
    if (pType === "queen") {
      const laser = document.createElement("div");
      laser.style.position = "absolute";
      laser.style.height = "6px";
      laser.style.background = "linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,0,0,1) 50%, rgba(255,0,0,0) 100%)";
      laser.style.boxShadow = "0 0 10px #ff0000, 0 0 20px #ff0000";
      laser.style.borderRadius = "3px";
      laser.style.zIndex = "101";
      const attRect = attackerSq.getBoundingClientRect();
      const tgtRect = targetSq.getBoundingClientRect();
      const dx = tgtRect.left - attRect.left;
      const dy = tgtRect.top - attRect.top;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      laser.style.width = `${dist}px`;
      laser.style.transformOrigin = "left center";
      laser.style.transform = `translate(0, -50%) rotate(${angle}rad)`;
      laser.style.left = "50%";
      laser.style.top = "50%";
      attackerSq.appendChild(laser);
      laser.animate([
        { transform: `translate(0, -50%) rotate(${angle}rad) scaleX(0)`, opacity: 0 },
        { transform: `translate(0, -50%) rotate(${angle}rad) scaleX(1)`, opacity: 1 },
        { transform: `translate(0, -50%) rotate(${angle}rad) scaleX(1)`, opacity: 0 }
      ], { duration: 500, fill: "forwards" });
      setTimeout(() => {
        if (laser.parentNode) laser.parentNode.removeChild(laser);
        createParticles(targetSq);
        triggerShockwave(targetSq);
        showExplosion(targetSq, resolve);
      }, 500);
      return;
    }
    if (pType === "horse") {
      for (let i = 0; i < 30; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.backgroundColor = "#654321";
        p.style.width = Math.random() * 8 + 4 + "px";
        p.style.height = p.style.width;
        p.style.borderRadius = "50%";
        p.style.left = "50%";
        p.style.top = "50%";
        p.style.zIndex = "102";
        targetSq.appendChild(p);
        const angle = Math.random() * Math.PI * 2;
        const velocity = 30 + Math.random() * 60;
        const dx = Math.cos(angle) * velocity;
        const dy = Math.sin(angle) * velocity - 20;
        p.animate([
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
        ], { duration: 600 + Math.random() * 300, easing: "cubic-bezier(0.1, 0.8, 0.3, 1)", fill: "forwards" });
        setTimeout(() => {
          if (p.parentNode) p.parentNode.removeChild(p);
        }, 1e3);
      }
      setTimeout(() => {
        createParticles(targetSq);
        triggerShockwave(targetSq);
        showExplosion(targetSq, resolve);
      }, 300);
      return;
    }
    if (pType === "rook") {
      const attRect = attackerSq.getBoundingClientRect();
      const tgtRect = targetSq.getBoundingClientRect();
      const mainDx = tgtRect.left - attRect.left;
      const mainDy = tgtRect.top - attRect.top;
      const dist = Math.sqrt(mainDx * mainDx + mainDy * mainDy);
      const normX = dist === 0 ? 0 : mainDx / dist;
      const normY = dist === 0 ? 0 : mainDy / dist;
      for (let i = 0; i < 30; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.backgroundColor = "#aaa";
        p.style.width = Math.random() * 6 + 4 + "px";
        p.style.height = p.style.width;
        p.style.borderRadius = "2px";
        p.style.left = "50%";
        p.style.top = "50%";
        p.style.zIndex = "102";
        targetSq.appendChild(p);
        const velocity = 50 + Math.random() * 80;
        const spread = (Math.random() - 0.5) * 1.5;
        const dx = (normX * Math.cos(spread) - normY * Math.sin(spread)) * velocity;
        const dy = (normX * Math.sin(spread) + normY * Math.cos(spread)) * velocity;
        p.animate([
          { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
          { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
        ], { duration: 400 + Math.random() * 200, easing: "cubic-bezier(0.1, 0.8, 0.3, 1)", fill: "forwards" });
        setTimeout(() => {
          if (p.parentNode) p.parentNode.removeChild(p);
        }, 600);
      }
      setTimeout(() => {
        triggerShockwave(targetSq);
        showExplosion(targetSq, resolve);
      }, 200);
      return;
    }
    const color = state.currentTurn;
    const weapons = [`${color}Gun.png`, "gun.png", "knife.png", "missile.png", "hand-grenade.png", "bomb.png", "star.png", "sight.png"];
    const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
    const targetLock = document.createElement("div");
    targetLock.className = "target-lock";
    targetSq.appendChild(targetLock);
    const weaponNode = document.createElement("img");
    weaponNode.src = `./asserts/${randomWeapon}`;
    weaponNode.style.position = "absolute";
    weaponNode.style.width = "30px";
    weaponNode.style.height = "auto";
    weaponNode.style.zIndex = "100";
    weaponNode.style.left = "50%";
    weaponNode.style.top = "50%";
    setTimeout(() => {
      if (targetLock.parentNode) targetLock.parentNode.removeChild(targetLock);
      createParticles(targetSq);
      triggerShockwave(targetSq);
      showExplosion(targetSq, () => {
        resolve();
      });
    }, 400);
  };
  var showExplosion = (tSq, res) => {
    const bang = document.createElement("div");
    bang.style.position = "absolute";
    bang.style.width = "80px";
    bang.style.height = "80px";
    bang.style.background = "radial-gradient(circle, rgba(255,200,0,1) 0%, rgba(255,0,0,0.8) 50%, rgba(0,0,0,0) 70%)";
    bang.style.borderRadius = "50%";
    bang.style.zIndex = "100";
    bang.style.left = "50%";
    bang.style.top = "50%";
    bang.style.transform = "translate(-50%, -50%) scale(0)";
    tSq.appendChild(bang);
    bang.animate([
      { transform: "translate(-50%, -50%) scale(0)", opacity: 1 },
      { transform: "translate(-50%, -50%) scale(1.5)", opacity: 0.8 },
      { transform: "translate(-50%, -50%) scale(2)", opacity: 0 }
    ], { duration: 300, easing: "ease-out", fill: "forwards" });
    const tgtImgReal = Array.from(tSq.querySelectorAll("img:not(.particle):not(.shockwave)")).find((img) => img.dataset && img.dataset.value);
    if (tgtImgReal) {
      tgtImgReal.style.transition = "opacity 0.2s, transform 0.2s";
      tgtImgReal.style.opacity = "0";
      tgtImgReal.style.transform = "scale(0.5)";
    }
    setTimeout(() => {
      if (bang.parentNode) bang.parentNode.removeChild(bang);
      res();
    }, 300);
  };
  var createParticles = (sq) => {
    const rect = sq.getBoundingClientRect();
    const tgtImg = Array.from(sq.querySelectorAll("img")).find((img) => img.dataset && img.dataset.value);
    const color = tgtImg && tgtImg.classList.contains("white") ? "#ebecd0" : "#739552";
    for (let i = 0; i < 15; i++) {
      const p = document.createElement("div");
      p.className = "particle";
      p.style.backgroundColor = color;
      p.style.left = "50%";
      p.style.top = "50%";
      sq.appendChild(p);
      const angle = Math.random() * Math.PI * 2;
      const velocity = 20 + Math.random() * 40;
      const dx = Math.cos(angle) * velocity;
      const dy = Math.sin(angle) * velocity;
      p.animate([
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
      ], {
        duration: 300 + Math.random() * 200,
        easing: "cubic-bezier(0.1, 0.8, 0.3, 1)",
        fill: "forwards"
      });
      setTimeout(() => {
        if (p.parentNode) p.parentNode.removeChild(p);
      }, 600);
    }
  };
  var triggerShockwave = (sq) => {
    const wave = document.createElement("div");
    wave.className = "shockwave";
    sq.appendChild(wave);
    requestAnimationFrame(() => {
      wave.style.transform = "translate(-50%, -50%) scale(10)";
      wave.style.opacity = "0";
    });
    setTimeout(() => {
      if (wave.parentNode) wave.parentNode.removeChild(wave);
    }, 400);
  };
  var playCastlingRookAnimation = (startI, startJ, targetI, targetJ) => {
    return new Promise((resolve) => {
      const rookSq = getSquare(startI, startJ);
      const destSq = getSquare(targetI, targetJ);
      if (!rookSq || !destSq) return resolve();
      const rookImg = rookSq.querySelector("img:not(.particle):not(.shockwave)");
      if (!rookImg) return resolve();
      const rRect = rookSq.getBoundingClientRect();
      const dRect = destSq.getBoundingClientRect();
      const dx = dRect.left - rRect.left;
      const dy = dRect.top - rRect.top;
      const dustInterval = setInterval(() => {
        const dust = document.createElement("div");
        dust.style.position = "absolute";
        dust.style.width = "20px";
        dust.style.height = "20px";
        dust.style.backgroundColor = "rgba(200, 200, 200, 0.6)";
        dust.style.borderRadius = "50%";
        dust.style.boxShadow = "0 0 10px rgba(200, 200, 200, 0.4)";
        dust.style.transform = "translate(-50%, -50%)";
        dust.style.left = "50%";
        dust.style.top = "50%";
        dust.style.pointerEvents = "none";
        dust.style.zIndex = "90";
        rookSq.appendChild(dust);
        dust.animate([
          { transform: "translate(-50%, -50%) scale(0.5)", opacity: 0.8 },
          { transform: "translate(-50%, -100%) scale(2.5)", opacity: 0 }
        ], { duration: 600, fill: "forwards" });
        setTimeout(() => {
          if (dust.parentNode) dust.parentNode.removeChild(dust);
        }, 600);
      }, 50);
      const anim = rookImg.animate([
        { transform: "translate(0, 0)" },
        { transform: `translate(${dx}px, ${dy}px)` }
      ], { duration: 400, easing: "cubic-bezier(0.5, 0, 0.1, 1)", fill: "forwards" });
      anim.onfinish = () => {
        clearInterval(dustInterval);
        triggerShockwave(destSq);
        resolve();
      };
    });
  };
  var playPromotionAscension = (targetI, targetJ, color, chosenType) => {
    return new Promise((resolve) => {
      const sq = getSquare(targetI, targetJ);
      if (!sq) return resolve();
      const oldImg = sq.querySelector("img:not(.particle):not(.shockwave)");
      const halo = document.createElement("div");
      halo.style.position = "absolute";
      halo.style.width = "100px";
      halo.style.height = "300px";
      halo.style.background = "linear-gradient(to top, rgba(255, 255, 150, 0.9), transparent)";
      halo.style.boxShadow = "0 0 30px rgba(255, 255, 150, 0.5)";
      halo.style.borderRadius = "50px 50px 0 0";
      halo.style.zIndex = "90";
      halo.style.left = "50%";
      halo.style.bottom = "0%";
      halo.style.transform = "translate(-50%, 0) scaleY(0)";
      halo.style.transformOrigin = "bottom center";
      sq.appendChild(halo);
      halo.animate([
        { transform: "translate(-50%, 0) scaleY(0)", opacity: 0 },
        { transform: "translate(-50%, 0) scaleY(1)", opacity: 0.8 }
      ], { duration: 400, fill: "forwards" });
      if (oldImg) {
        oldImg.animate([
          { transform: "translate(0, 0)", opacity: 1 },
          { transform: "translate(0, -100px)", opacity: 0 }
        ], { duration: 600, delay: 200, fill: "forwards" });
      }
      setTimeout(() => {
        createParticles(sq);
        if (oldImg && oldImg.parentNode) oldImg.parentNode.removeChild(oldImg);
        const newImg = document.createElement("img");
        newImg.src = `./asserts/${color}${chosenType}.png`;
        newImg.style.position = "absolute";
        newImg.style.width = "85%";
        newImg.style.height = "85%";
        newImg.style.zIndex = "95";
        newImg.style.left = "50%";
        newImg.style.top = "50%";
        sq.appendChild(newImg);
        newImg.animate([
          { transform: "translate(-50%, -150%)", opacity: 0 },
          { transform: "translate(-50%, -50%)", opacity: 1 }
        ], { duration: 500, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "forwards" });
        halo.animate([
          { transform: "translate(-50%, 0) scaleY(1)", opacity: 0.8 },
          { transform: "translate(-50%, 0) scaleY(0)", opacity: 0 }
        ], { duration: 400, delay: 500, fill: "forwards" }).onfinish = () => {
          if (halo.parentNode) halo.parentNode.removeChild(halo);
          resolve();
        };
      }, 800);
    });
  };

  // js/game.js
  var moveSound = new Audio("https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-self.mp3");
  var captureSound = new Audio("https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/capture.mp3");
  var formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  var startTimer = () => {
    if (state.timerInterval) return;
    state.timerInterval = setInterval(() => {
      if (state.currentTurn === COLORS.WHITE) {
        state.whiteTime++;
        if (state.clockWhiteDOM) state.clockWhiteDOM.innerText = formatTime(state.whiteTime);
      } else {
        state.blackTime++;
        if (state.clockBlackDOM) state.clockBlackDOM.innerText = formatTime(state.blackTime);
      }
    }, 1e3);
  };
  var stopTimer = () => {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  };
  var checkSound = new Audio("https://images.chesscomfiles.com/chess-themes/sounds/_MP3_/default/move-check.mp3");
  var postMoveChecks = () => {
    let kingSq = null;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const p = state.board[i][j];
        if (p && p.color === state.currentTurn && p.type === PIECES.KING) {
          kingSq = { i, j };
          break;
        }
      }
    }
    let inCheck = false;
    if (kingSq) {
      inCheck = isUnderAttack(kingSq.i, kingSq.j, state.currentTurn);
    }
    document.querySelectorAll(".in-check").forEach((el) => el.classList.remove("in-check"));
    if (inCheck && kingSq) {
      const sq = getSquare(kingSq.i, kingSq.j);
      if (sq) sq.classList.add("in-check");
    }
    if (!hasAnyValidMoves()) {
      if (inCheck) showGameOver(`Checkmate! ${state.currentTurn === COLORS.WHITE ? "Black" : "White"} Wins!`);
      else showGameOver("Stalemate! It's a draw!");
      return;
    }
    const drawMsg = checkDrawConditions();
    if (drawMsg) {
      stopTimer();
      if (state.whiteTime > state.blackTime) {
        showGameOver(`Black Wins! (Time Tiebreaker on ${drawMsg})`);
      } else if (state.blackTime > state.whiteTime) {
        showGameOver(`White Wins! (Time Tiebreaker on ${drawMsg})`);
      } else {
        showGameOver(`Stalemate! (Time Tied on ${drawMsg})`);
      }
      return;
    }
    if (inCheck) {
      showCheckMessage();
      checkSound.play().catch((e) => console.warn("Audio play prevented", e));
    }
  };
  var getAlgebraic = (piece, startI, startJ, targetI, targetJ, captured) => {
    const files = "abcdefgh";
    const ranks = "87654321";
    let notation = "";
    if (piece.type === PIECES.KING && Math.abs(startJ - targetJ) === 2) {
      return targetJ === 6 ? "O-O" : "O-O-O";
    }
    if (piece.type !== PIECES.PAWN) {
      const pChar = piece.type === PIECES.HORSE ? "N" : piece.type[0];
      notation += pChar;
    } else if (captured) {
      notation += files[startJ];
    }
    if (captured) notation += "x";
    notation += files[targetJ] + ranks[targetI];
    return notation;
  };
  var handleHover = (i, j) => {
    if (window.isAnimating || state.selectedSquare) return;
    const piece = state.board[i][j];
    if (piece && piece.color === state.currentTurn) {
      showMoves(i, j, true);
    }
  };
  var handleHoverOut = () => {
    if (!state.selectedSquare) {
      document.querySelectorAll(".hover-dot").forEach((el) => el.classList.remove("hover-dot"));
    }
  };
  var restoreHighlights = () => {
    document.querySelectorAll(".in-check").forEach((el) => el.classList.remove("in-check"));
    document.querySelectorAll(".last-move").forEach((el) => el.classList.remove("last-move"));
    if (state.lastMove) {
      const sSq = getSquare(state.lastMove.startI, state.lastMove.startJ);
      const tSq = getSquare(state.lastMove.targetI, state.lastMove.targetJ);
      if (sSq) sSq.classList.add("last-move");
      if (tSq) tSq.classList.add("last-move");
    }
    let kingSq = null;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = state.board[r][c];
        if (p && p.color === state.currentTurn && p.type === PIECES.KING) {
          kingSq = { r, c };
          break;
        }
      }
    }
    if (kingSq && isUnderAttack(kingSq.r, kingSq.c, state.currentTurn)) {
      const kDom = getSquare(kingSq.r, kingSq.c);
      if (kDom) kDom.classList.add("in-check");
    }
  };
  var undoAction = () => {
    if (window.isAnimating) return;
    if (restoreState()) {
      restoreHighlights();
      renderBoard();
      renderMoveHistory();
    }
  };
  var redoAction = () => {
    if (window.isAnimating) return;
    if (redoState()) {
      restoreHighlights();
      renderBoard();
      renderMoveHistory();
    }
  };
  var timeTravelTo = (targetIndex) => {
    if (window.isAnimating) return;
    if (targetIndex < state.stateHistory.length) {
      while (state.stateHistory.length > targetIndex) {
        if (!restoreState()) break;
      }
      restoreHighlights();
      renderBoard();
      renderMoveHistory();
    } else if (targetIndex > state.stateHistory.length) {
      while (state.stateHistory.length < targetIndex) {
        if (!redoState()) break;
      }
      restoreHighlights();
      renderBoard();
      renderMoveHistory();
    }
  };
  var movePiece = async (targetI, targetJ) => {
    if (window.isAnimating) return;
    saveState();
    const { i: startI, j: startJ } = state.selectedSquare;
    const piece = state.board[startI][startJ];
    const targetPiece = state.board[targetI][targetJ];
    let captured = false;
    let isEnPassant = false;
    if (targetPiece) {
      captured = true;
    } else if (piece.type === PIECES.PAWN && Math.abs(startJ - targetJ) === 1) {
      if (state.board[startI][targetJ]) {
        captured = true;
        isEnPassant = true;
      }
    }
    if (piece.type === PIECES.PAWN || captured) {
      state.halfMoveClock = 0;
    } else {
      state.halfMoveClock++;
    }
    document.querySelectorAll(".last-move").forEach((el) => el.classList.remove("last-move"));
    const sSq = getSquare(startI, startJ);
    const tSq = getSquare(targetI, targetJ);
    if (sSq) sSq.classList.add("last-move");
    if (tSq) tSq.classList.add("last-move");
    window.isAnimating = true;
    const actualVictimSq = isEnPassant ? getSquare(startI, targetJ) : getSquare(targetI, targetJ);
    const animations = [playMoveAnimation(startI, startJ, targetI, targetJ, piece.type, captured, isEnPassant, actualVictimSq)];
    if (piece.type === PIECES.KING && Math.abs(startJ - targetJ) === 2) {
      const rookJ = targetJ === 2 ? 0 : 7;
      const rookDestJ = targetJ === 2 ? 3 : 5;
      animations.push(playCastlingRookAnimation(startI, rookJ, startI, rookDestJ));
    }
    await Promise.all(animations);
    window.isAnimating = false;
    if (targetPiece) {
      addCapturedToPanel(targetPiece, targetI, targetJ);
    } else if (isEnPassant) {
      const capturedPawn = state.board[startI][targetJ];
      if (capturedPawn) {
        addCapturedToPanel(capturedPawn, startI, targetJ);
        state.board[startI][targetJ] = null;
      }
    }
    if (piece.type === PIECES.KING && Math.abs(startJ - targetJ) === 2) {
      if (targetJ === 2) {
        state.board[startI][3] = state.board[startI][0];
        state.board[startI][3].moved = true;
        state.board[startI][0] = null;
      } else if (targetJ === 6) {
        state.board[startI][5] = state.board[startI][7];
        state.board[startI][5].moved = true;
        state.board[startI][7] = null;
      }
    }
    state.board[targetI][targetJ] = piece;
    state.board[startI][startJ] = null;
    piece.moved = true;
    if (captured) captureSound.play().catch((e) => console.warn(e));
    else moveSound.play().catch((e) => console.warn(e));
    const endTurn = (promotionChar = "") => {
      state.lastMove = {
        piece: piece.type,
        color: state.currentTurn,
        startI,
        startJ,
        targetI,
        targetJ
      };
      clearDots();
      state.selectedSquare = null;
      let notation = getAlgebraic(piece, startI, startJ, targetI, targetJ, captured);
      if (promotionChar) notation += "=" + promotionChar;
      state.currentTurn = state.currentTurn === COLORS.WHITE ? COLORS.BLACK : COLORS.WHITE;
      let kingSq = null;
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const p = state.board[r][c];
          if (p && p.color === state.currentTurn && p.type === PIECES.KING) {
            kingSq = { r, c };
            break;
          }
        }
      }
      if (kingSq && isUnderAttack(kingSq.r, kingSq.c, state.currentTurn)) {
        notation += "+";
      }
      updateMoveHistory(notation);
      state.turnIndicator.innerText = `${state.currentTurn}'s Turn`;
      const repCount = recordPosition();
      if (repCount === 2) {
        showNotification("Position repeated 2 times! One more for a draw.");
      }
      renderBoard();
      postMoveChecks();
      startTimer();
    };
    if (piece.type === PIECES.PAWN) {
      if (state.currentTurn === COLORS.WHITE && targetI === 0 || state.currentTurn === COLORS.BLACK && targetI === 7) {
        showPromotionModal(state.currentTurn, async (chosenType) => {
          piece.type = chosenType;
          let char = chosenType === PIECES.HORSE ? "N" : chosenType[0];
          window.isAnimating = true;
          await playPromotionAscension(targetI, targetJ, state.currentTurn, chosenType);
          window.isAnimating = false;
          endTurn(char);
        });
        return;
      }
    }
    endTurn();
  };
  var addCapturedToPanel = (piece, victimI, victimJ) => {
    const img = document.createElement("img");
    img.src = `./asserts/${piece.color}${piece.type}.png`;
    img.style.width = "40px";
    img.style.height = "40px";
    img.style.cursor = "default";
    img.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    img.style.borderRadius = "4px";
    img.style.padding = "2px";
    const panel = piece.color === COLORS.WHITE ? state.leftPanel : state.rightPanel;
    panel.appendChild(img);
    const startSq = getSquare(victimI, victimJ);
    if (startSq) {
      const startRect = startSq.getBoundingClientRect();
      const endRect = img.getBoundingClientRect();
      img.animate([
        { transform: `translate(${startRect.left - endRect.left}px, ${startRect.top - endRect.top}px) scale(1.5)`, opacity: 0.5 },
        { transform: "translate(0, 0) scale(1)", opacity: 1 }
      ], { duration: 500, easing: "ease-out" });
    }
  };
  var updateMoveHistory = (notation) => {
    if (state.currentTurn === COLORS.BLACK) {
      const m = { white: notation, black: "" };
      state.moveList.push(m);
      renderMoveHistory();
    } else {
      state.moveList[state.moveList.length - 1].black = notation;
      renderMoveHistory();
    }
  };
  var renderMoveHistory = () => {
    const panel = state.moveHistoryPanel;
    panel.innerHTML = "";
    state.moveList.forEach((m, idx) => {
      const row = document.createElement("div");
      row.className = "move-row";
      const numSpan = document.createElement("span");
      numSpan.className = "move-number";
      numSpan.innerText = `${idx + 1}.`;
      const whiteSpan = document.createElement("span");
      whiteSpan.className = "move-white";
      whiteSpan.innerText = m.white;
      whiteSpan.style.cursor = "pointer";
      whiteSpan.onclick = () => timeTravelTo(idx * 2 + 1);
      const blackSpan = document.createElement("span");
      blackSpan.className = "move-black";
      blackSpan.innerText = m.black;
      if (m.black) {
        blackSpan.style.cursor = "pointer";
        blackSpan.onclick = () => timeTravelTo(idx * 2 + 2);
      }
      row.appendChild(numSpan);
      row.appendChild(whiteSpan);
      row.appendChild(blackSpan);
      panel.appendChild(row);
    });
    panel.scrollTop = panel.scrollHeight;
  };

  // js/main.js
  window.onload = () => {
    initializeBoard();
    createBoard();
    renderBoard();
    const container = document.querySelector(".container");
    const layoutWrapper = document.createElement("div");
    layoutWrapper.style.display = "flex";
    layoutWrapper.style.flexDirection = "row";
    layoutWrapper.style.justifyContent = "center";
    layoutWrapper.style.alignItems = "flex-start";
    layoutWrapper.style.gap = "20px";
    layoutWrapper.style.width = "100%";
    layoutWrapper.style.padding = "20px";
    layoutWrapper.style.boxSizing = "border-box";
    const mainGameArea = document.createElement("div");
    mainGameArea.className = "main-game-area";
    const topPlayer = document.createElement("div");
    topPlayer.className = "player-info";
    topPlayer.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <div class="player-avatar" style="background-color: #7b4f3b; background-image: url('https://images.chesscomfiles.com/uploads/v1/user/103289066.b68ed511.50x50o.c6d040715cf4.png');"></div>
            <div class="player-name">Player 2</div>
        </div>
        <div class="player-clock clock-dark" id="black-clock">00:00</div>
    `;
    const bottomPlayer = document.createElement("div");
    bottomPlayer.className = "player-info";
    bottomPlayer.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <div class="player-avatar" style="background-color: #aaa; background-image: url('https://images.chesscomfiles.com/uploads/v1/user/103289066.b68ed511.50x50o.c6d040715cf4.png');"></div>
            <div class="player-name">Player 1</div>
        </div>
        <div class="player-clock" id="white-clock">00:00</div>
    `;
    const boardRow = document.createElement("div");
    boardRow.style.display = "flex";
    boardRow.style.flexDirection = "row";
    boardRow.style.alignItems = "stretch";
    boardRow.style.gap = "10px";
    const leftCapturePanel = document.createElement("div");
    leftCapturePanel.className = "capture-panel";
    const blackCaptures = document.createElement("div");
    blackCaptures.className = "side-captures";
    blackCaptures.id = "black-captures";
    leftCapturePanel.appendChild(blackCaptures);
    const rightCapturePanel = document.createElement("div");
    rightCapturePanel.className = "capture-panel";
    const whiteCaptures = document.createElement("div");
    whiteCaptures.className = "side-captures";
    whiteCaptures.id = "white-captures";
    rightCapturePanel.appendChild(whiteCaptures);
    boardRow.appendChild(leftCapturePanel);
    boardRow.appendChild(container);
    boardRow.appendChild(rightCapturePanel);
    mainGameArea.appendChild(topPlayer);
    mainGameArea.appendChild(boardRow);
    mainGameArea.appendChild(bottomPlayer);
    state.rightPanel = blackCaptures;
    state.leftPanel = whiteCaptures;
    state.clockBlackDOM = topPlayer.querySelector("#black-clock");
    state.clockWhiteDOM = bottomPlayer.querySelector("#white-clock");
    const rightSidebar = document.createElement("div");
    rightSidebar.className = "right-sidebar";
    const restartBtn = document.createElement("button");
    restartBtn.innerHTML = "\u21BB Restart Game";
    restartBtn.title = "Restart Game";
    restartBtn.style.cssText = "background:#2b2927; border:none; border-bottom: 1px solid #403d39; color:#fff; font-size:16px; font-weight:bold; cursor:pointer; padding:15px; width: 100%; text-align:center;";
    restartBtn.onclick = () => location.reload();
    restartBtn.onmouseover = () => restartBtn.style.backgroundColor = "#3d3b39";
    restartBtn.onmouseout = () => restartBtn.style.backgroundColor = "#2b2927";
    const controlsBar = document.createElement("div");
    controlsBar.className = "controls-bar";
    const drawResignRow = document.createElement("div");
    drawResignRow.className = "action-buttons";
    const drawBtn = document.createElement("button");
    drawBtn.className = "action-btn";
    drawBtn.innerHTML = "\xBD Draw";
    drawBtn.onclick = () => showGameOver("Draw by Agreement");
    const resignBtn = document.createElement("button");
    resignBtn.className = "action-btn";
    resignBtn.innerHTML = "\u{1F3F3} Resign";
    resignBtn.onclick = () => showGameOver("White Resigned");
    drawResignRow.appendChild(drawBtn);
    drawResignRow.appendChild(resignBtn);
    const undoRedoRow = document.createElement("div");
    undoRedoRow.className = "action-buttons";
    const undoBtn = document.createElement("button");
    undoBtn.className = "action-btn";
    undoBtn.innerHTML = "\u293A Undo";
    undoBtn.onclick = undoAction;
    const redoBtn = document.createElement("button");
    redoBtn.className = "action-btn";
    redoBtn.innerHTML = "\u293B Redo";
    redoBtn.onclick = redoAction;
    undoRedoRow.appendChild(undoBtn);
    undoRedoRow.appendChild(redoBtn);
    controlsBar.appendChild(drawResignRow);
    controlsBar.appendChild(undoRedoRow);
    const movesContainer = document.createElement("div");
    movesContainer.className = "moves-container";
    state.moveHistoryPanel = movesContainer;
    rightSidebar.appendChild(restartBtn);
    rightSidebar.appendChild(controlsBar);
    rightSidebar.appendChild(movesContainer);
    layoutWrapper.appendChild(mainGameArea);
    layoutWrapper.appendChild(rightSidebar);
    document.body.appendChild(layoutWrapper);
    const dummyTurn = document.createElement("div");
    state.turnIndicator = dummyTurn;
    container.addEventListener("mousemove", (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      container.style.setProperty("--mouse-x", `${x}px`);
      container.style.setProperty("--mouse-y", `${y}px`);
    });
    container.addEventListener("mouseover", (e) => {
      const square = e.target.closest(".child");
      if (!square) return;
      const i = parseInt(square.dataset.i);
      const j = parseInt(square.dataset.j);
      handleHover(i, j);
    });
    container.addEventListener("mouseout", (e) => {
      const square = e.target.closest(".child");
      if (!square) return;
      handleHoverOut();
    });
    container.addEventListener("click", (e) => {
      const target = e.target;
      const square = target.classList.contains("child") ? target : target.parentElement;
      if (!square || !square.classList.contains("child")) return;
      const i = parseInt(square.dataset.i);
      const j = parseInt(square.dataset.j);
      if (square.classList.contains("dot")) {
        movePiece(i, j);
        return;
      }
      const piece = state.board[i][j];
      if (piece && piece.color === state.currentTurn) {
        showMoves(i, j);
      } else {
        clearDots();
        state.selectedSquare = null;
      }
    });
    let draggedImg = null;
    let dragStartSquare = null;
    let pointerId = null;
    let startX = 0, startY = 0;
    let isDragging = false;
    container.addEventListener("pointerdown", (e) => {
      if (window.isAnimating) return;
      if (e.target.matches("img") && !e.target.classList.contains("particle")) {
        const sq = e.target.parentElement;
        const i = parseInt(sq.dataset.i);
        const j = parseInt(sq.dataset.j);
        const piece = state.board[i][j];
        if (piece && piece.color === state.currentTurn) {
          e.preventDefault();
          pointerId = e.pointerId;
          draggedImg = e.target;
          draggedImg.classList.remove("drop-in");
          dragStartSquare = sq;
          startX = e.clientX;
          startY = e.clientY;
          isDragging = false;
          const sqRect = sq.getBoundingClientRect();
          const imgW = sqRect.width * 0.85;
          const imgH = sqRect.height * 0.85;
          const imgLeft = sqRect.left + (sqRect.width - imgW) / 2;
          const imgTop = sqRect.top + (sqRect.height - imgH) / 2;
          draggedImg.dataset.width = imgW;
          draggedImg.dataset.height = imgH;
          draggedImg.dataset.offsetX = startX - imgLeft;
          draggedImg.dataset.offsetY = startY - imgTop;
          draggedImg.setPointerCapture(pointerId);
          showMoves(i, j);
        }
      }
    });
    window.addEventListener("pointermove", (e) => {
      if (draggedImg && e.pointerId === pointerId) {
        if (!isDragging) {
          const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
          if (dist > 5) {
            isDragging = true;
            document.body.appendChild(draggedImg);
            draggedImg.classList.add("dragging");
            draggedImg.style.transition = "none";
            draggedImg.style.position = "fixed";
            draggedImg.style.zIndex = "1000";
            draggedImg.style.margin = "0";
            draggedImg.style.width = `${draggedImg.dataset.width}px`;
            draggedImg.style.height = `${draggedImg.dataset.height}px`;
            draggedImg.style.transform = "none";
          }
        }
        if (isDragging) {
          const ox = parseFloat(draggedImg.dataset.offsetX) || 0;
          const oy = parseFloat(draggedImg.dataset.offsetY) || 0;
          draggedImg.style.left = `${e.clientX - ox}px`;
          draggedImg.style.top = `${e.clientY - oy}px`;
        }
      }
    });
    window.addEventListener("pointerup", (e) => {
      if (draggedImg && e.pointerId === pointerId) {
        draggedImg.releasePointerCapture(pointerId);
        let dropSquare = null;
        if (isDragging) {
          draggedImg.classList.remove("dragging");
          draggedImg.style.transition = "";
          draggedImg.style.position = "";
          draggedImg.style.zIndex = "";
          draggedImg.style.width = "";
          draggedImg.style.height = "";
          draggedImg.style.left = "";
          draggedImg.style.top = "";
          draggedImg.style.margin = "";
          draggedImg.style.transform = "";
          draggedImg.style.display = "none";
          const elemBelow = document.elementFromPoint(e.clientX, e.clientY);
          draggedImg.style.display = "";
          dropSquare = elemBelow ? elemBelow.closest(".child") : null;
          dragStartSquare.appendChild(draggedImg);
        }
        if (isDragging && dropSquare) {
          const targetI = parseInt(dropSquare.dataset.i);
          const targetJ = parseInt(dropSquare.dataset.j);
          const startI = parseInt(dragStartSquare.dataset.i);
          const startJ = parseInt(dragStartSquare.dataset.j);
          if (startI === targetI && startJ === targetJ) {
          } else if (dropSquare.classList.contains("dot")) {
            movePiece(targetI, targetJ);
          } else {
            clearDots();
            state.selectedSquare = null;
          }
        } else if (isDragging && !dropSquare) {
          clearDots();
          state.selectedSquare = null;
        }
        draggedImg = null;
        dragStartSquare = null;
        pointerId = null;
        isDragging = false;
      }
    });
  };
})();
