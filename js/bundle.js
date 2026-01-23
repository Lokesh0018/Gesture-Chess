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
    whiteTime: 600,
    blackTime: 600,
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
    state.currentTurn = COLORS.WHITE;
    state.selectedSquare = null;
    state.lastMove = null;
    state.halfMoveClock = 0;
    state.positionHistory = {};
    state.moveList = [];
    recordPosition();
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
  var getSquare = (i, j) => document.querySelector(`.child[data-i="${i}"][data-j="${j}"]`);
  var clearDots = () => {
    document.querySelectorAll(".dot").forEach((el) => el.classList.remove("dot"));
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
          img.src = `./pngs/${piece.color}${piece.type}.png`;
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
  var markMove = (targetI, targetJ, startI, startJ) => {
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
        if (sq) sq.classList.add("dot");
      }
    }
    return continueRay;
  };
  var showMoves = (i, j) => {
    clearDots();
    state.selectedSquare = { i, j };
    const piece = state.board[i][j];
    if (!piece) return;
    const sq = getSquare(i, j);
    if (sq) sq.classList.add("selected");
    const castRay = (di, dj, maxSteps = 7) => {
      for (let step = 1; step <= maxSteps; step++) {
        if (!markMove(i + di * step, j + dj * step, i, j)) break;
      }
    };
    const addDotIfSafe = (targetI, targetJ) => {
      if (isMoveSafe(i, j, targetI, targetJ)) {
        const sq2 = getSquare(targetI, targetJ);
        if (sq2) sq2.classList.add("dot");
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
      img.src = `./pngs/${color}${choice}.png`;
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
  var formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };
  var startTimer = () => {
    if (state.timerInterval) return;
    state.timerInterval = setInterval(() => {
      if (state.currentTurn === COLORS.WHITE) {
        state.whiteTime--;
        if (state.clockWhiteDOM) state.clockWhiteDOM.innerText = formatTime(state.whiteTime);
        if (state.whiteTime <= 0) {
          stopTimer();
          showGameOver("Black Wins on Time");
        }
      } else {
        state.blackTime--;
        if (state.clockBlackDOM) state.clockBlackDOM.innerText = formatTime(state.blackTime);
        if (state.blackTime <= 0) {
          stopTimer();
          showGameOver("White Wins on Time");
        }
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
      showGameOver(drawMsg);
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
  var playShootingAnimation = (startI, startJ, targetI, targetJ) => {
    return new Promise((resolve) => {
      const attackerSq = getSquare(startI, startJ);
      const targetSq = getSquare(targetI, targetJ);
      if (!attackerSq || !targetSq) {
        resolve();
        return;
      }
      const color = state.currentTurn;
      const weapons = [`${color}Gun.png`, "gun.png", "knife.png", "missile.png", "hand-grenade.png", "bomb.png", "star.png", "sight.png"];
      const randomWeapon = weapons[Math.floor(Math.random() * weapons.length)];
      const isGun = randomWeapon.toLowerCase().includes("gun");
      const weaponNode = document.createElement("img");
      weaponNode.src = `./pngs/${randomWeapon}`;
      weaponNode.style.position = "absolute";
      weaponNode.style.width = "30px";
      weaponNode.style.height = "auto";
      weaponNode.style.zIndex = "100";
      weaponNode.style.left = "50%";
      weaponNode.style.top = "50%";
      const attRect = attackerSq.getBoundingClientRect();
      const tgtRect = targetSq.getBoundingClientRect();
      const dx = tgtRect.left - attRect.left;
      const dy = tgtRect.top - attRect.top;
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = angleRad * 180 / Math.PI;
      const offsetX = Math.cos(angleRad) * 25;
      const offsetY = Math.sin(angleRad) * 25;
      const flipY = Math.abs(angleDeg) > 90 ? -1 : 1;
      if (isGun) {
        weaponNode.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${angleDeg}deg) scaleX(0) scaleY(0)`;
        weaponNode.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        attackerSq.appendChild(weaponNode);
        requestAnimationFrame(() => {
          weaponNode.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${angleDeg}deg) scaleX(1) scaleY(${flipY})`;
        });
        setTimeout(() => {
          const bullet = document.createElement("div");
          bullet.style.position = "absolute";
          bullet.style.width = "12px";
          bullet.style.height = "4px";
          bullet.style.backgroundColor = "#ffcc00";
          bullet.style.borderRadius = "2px";
          bullet.style.boxShadow = "0 0 5px #ff6600";
          bullet.style.zIndex = "99";
          bullet.style.left = "50%";
          bullet.style.top = "50%";
          bullet.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${angleDeg}deg)`;
          bullet.style.transition = "transform 0.15s linear";
          attackerSq.appendChild(bullet);
          requestAnimationFrame(() => {
            bullet.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${angleDeg}deg)`;
          });
          setTimeout(() => {
            if (bullet.parentNode) bullet.parentNode.removeChild(bullet);
            showExplosion(targetSq, resolve, weaponNode);
          }, 150);
        }, 200);
      } else {
        weaponNode.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${angleDeg}deg) scaleX(0) scaleY(0)`;
        weaponNode.style.transition = "transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
        attackerSq.appendChild(weaponNode);
        requestAnimationFrame(() => {
          weaponNode.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px)) rotate(${angleDeg}deg) scaleX(1) scaleY(${flipY})`;
          setTimeout(() => {
            weaponNode.style.transition = "transform 0.25s ease-in";
            weaponNode.style.transform = `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${angleDeg}deg) scaleX(1) scaleY(${flipY})`;
            setTimeout(() => {
              showExplosion(targetSq, resolve, weaponNode);
            }, 250);
          }, 150);
        });
      }
      function showExplosion(tSq, res, wNode) {
        const explosions = ["blasting.png", "explosion.png", "nuclear-explosion.png"];
        const randomExplosion = explosions[Math.floor(Math.random() * explosions.length)];
        const bang = document.createElement("img");
        bang.src = `./pngs/${randomExplosion}`;
        bang.style.position = "absolute";
        bang.style.width = "60px";
        bang.style.height = "auto";
        bang.style.zIndex = "100";
        bang.style.left = "50%";
        bang.style.top = "50%";
        bang.style.transform = "translate(-50%, -50%) scale(0)";
        bang.style.transition = "transform 0.1s";
        tSq.appendChild(bang);
        requestAnimationFrame(() => {
          bang.style.transform = "translate(-50%, -50%) scale(1.5)";
        });
        const tgtImgReal = Array.from(tSq.querySelectorAll("img")).find((img) => img.dataset && img.dataset.value);
        if (tgtImgReal) {
          tgtImgReal.style.transition = "opacity 0.2s, transform 0.2s";
          tgtImgReal.style.opacity = "0";
          tgtImgReal.style.transform = "scale(0.5)";
        }
        setTimeout(() => {
          if (wNode.parentNode) wNode.parentNode.removeChild(wNode);
          if (bang.parentNode) bang.parentNode.removeChild(bang);
          res();
        }, 300);
      }
    });
  };
  var movePiece = async (targetI, targetJ) => {
    if (window.isAnimating) return;
    const { i: startI, j: startJ } = state.selectedSquare;
    const piece = state.board[startI][startJ];
    const targetPiece = state.board[targetI][targetJ];
    let captured = false;
    if (piece.type === PIECES.PAWN || targetPiece) {
      state.halfMoveClock = 0;
    } else {
      state.halfMoveClock++;
    }
    document.querySelectorAll(".last-move").forEach((el) => el.classList.remove("last-move"));
    const sSq = getSquare(startI, startJ);
    const tSq = getSquare(targetI, targetJ);
    if (sSq) sSq.classList.add("last-move");
    if (tSq) tSq.classList.add("last-move");
    if (targetPiece) {
      captured = true;
      window.isAnimating = true;
      await playShootingAnimation(startI, startJ, targetI, targetJ);
      window.isAnimating = false;
      addCapturedToPanel(targetPiece);
    } else if (piece.type === PIECES.PAWN && Math.abs(startJ - targetJ) === 1) {
      const capturedPawn = state.board[startI][targetJ];
      if (capturedPawn) {
        captured = true;
        window.isAnimating = true;
        await playShootingAnimation(startI, startJ, startI, targetJ);
        window.isAnimating = false;
        addCapturedToPanel(capturedPawn);
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
        showPromotionModal(state.currentTurn, (chosenType) => {
          piece.type = chosenType;
          let char = chosenType === PIECES.HORSE ? "N" : chosenType[0];
          endTurn(char);
        });
        return;
      }
    }
    endTurn();
  };
  var addCapturedToPanel = (piece) => {
    const img = document.createElement("img");
    img.src = `./pngs/${piece.color}${piece.type}.png`;
    img.style.width = "40px";
    img.style.height = "40px";
    img.style.cursor = "default";
    img.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    img.style.borderRadius = "4px";
    img.style.padding = "2px";
    if (piece.color === COLORS.WHITE) {
      state.leftPanel.appendChild(img);
    } else {
      state.rightPanel.appendChild(img);
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
      row.innerHTML = `<span class="move-number">${idx + 1}.</span><span class="move-white">${m.white}</span><span class="move-black">${m.black}</span>`;
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
        <div class="player-clock clock-dark" id="black-clock">10:00</div>
    `;
    const bottomPlayer = document.createElement("div");
    bottomPlayer.className = "player-info";
    bottomPlayer.innerHTML = `
        <div style="display:flex; align-items:center; gap:10px;">
            <div class="player-avatar" style="background-color: #aaa; background-image: url('https://images.chesscomfiles.com/uploads/v1/user/103289066.b68ed511.50x50o.c6d040715cf4.png');"></div>
            <div class="player-name">Player 1</div>
        </div>
        <div class="player-clock" id="white-clock">10:00</div>
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
    const movesContainer = document.createElement("div");
    movesContainer.className = "moves-container";
    state.moveHistoryPanel = movesContainer;
    const controlsBar = document.createElement("div");
    controlsBar.className = "controls-bar";
    const actionButtons = document.createElement("div");
    actionButtons.className = "action-buttons";
    const drawBtn = document.createElement("button");
    drawBtn.className = "action-btn";
    drawBtn.innerHTML = "\xBD Draw";
    drawBtn.onclick = () => showGameOver("Draw by Agreement");
    const resignBtn = document.createElement("button");
    resignBtn.className = "action-btn";
    resignBtn.innerHTML = "\u{1F3F3} Resign";
    resignBtn.onclick = () => showGameOver("White Resigned");
    actionButtons.appendChild(drawBtn);
    actionButtons.appendChild(resignBtn);
    controlsBar.appendChild(actionButtons);
    rightSidebar.appendChild(restartBtn);
    rightSidebar.appendChild(movesContainer);
    rightSidebar.appendChild(controlsBar);
    layoutWrapper.appendChild(mainGameArea);
    layoutWrapper.appendChild(rightSidebar);
    document.body.appendChild(layoutWrapper);
    const dummyTurn = document.createElement("div");
    state.turnIndicator = dummyTurn;
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
    container.addEventListener("dragstart", (e) => {
      const target = e.target;
      if (target.matches("img")) {
        const i = parseInt(target.dataset.i);
        const j = parseInt(target.dataset.j);
        const piece = state.board[i][j];
        if (piece && piece.color === state.currentTurn) {
          showMoves(i, j);
          target.classList.add("dragging");
          e.dataTransfer.effectAllowed = "move";
          e.dataTransfer.setData("text/plain", "chess-piece");
        } else {
          e.preventDefault();
        }
      }
    });
    container.addEventListener("dragend", (e) => {
      if (e.target.matches("img")) {
        e.target.classList.remove("dragging");
      }
    });
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    });
    container.addEventListener("drop", (e) => {
      e.preventDefault();
      const target = e.target;
      const square = target.classList.contains("child") ? target : target.parentElement;
      if (!square || !square.classList.contains("child")) return;
      const i = parseInt(square.dataset.i);
      const j = parseInt(square.dataset.j);
      if (square.classList.contains("dot")) {
        movePiece(i, j);
      } else {
        clearDots();
        state.selectedSquare = null;
      }
    });
  };
})();
