export const COLORS = {
    WHITE: 'White',
    BLACK: 'Black'
};

export const PIECES = {
    ROOK: 'Rook',
    HORSE: 'Horse',
    BISHOP: 'Bishop',
    QUEEN: 'Queen',
    KING: 'King',
    PAWN: 'Pawn'
};

export const state = {
    currentTurn: COLORS.WHITE,
    selectedSquare: null, // {i, j}
    lastMove: null,
    board: Array(8).fill(null).map(() => Array(8).fill(null)),
    
    leftPanel: null,
    rightPanel: null,
    turnIndicator: null,
    moveHistoryPanel: null,
    
    halfMoveClock: 0,
    positionHistory: {}, // Store counts of FEN-like strings
    moveList: [], // Array of {white: 'e4', black: 'e5'}
    stateHistory: [], // Store deep copies for Undo
    redoHistory: [], // Store copies for Redo
    
    premove: null,
    whiteTime: 0,
    blackTime: 0,
    timerInterval: null,
    clockWhiteDOM: null,
    clockBlackDOM: null
};

export const initializeBoard = () => {
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
    for(let i=2; i<=5; i++) state.board[i] = Array(8).fill(null);
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

const _captureStateSnapshot = () => ({
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

const _applyStateSnapshot = (snap) => {
    state.board = snap.board;
    state.currentTurn = snap.currentTurn;
    state.halfMoveClock = snap.halfMoveClock;
    state.positionHistory = snap.positionHistory;
    state.moveList = snap.moveList;
    state.whiteTime = snap.whiteTime;
    state.blackTime = snap.blackTime;
    state.selectedSquare = null;
    state.lastMove = snap.lastMove;
    if(state.leftPanel) state.leftPanel.innerHTML = snap.leftPanelHTML;
    if(state.rightPanel) state.rightPanel.innerHTML = snap.rightPanelHTML;
    
    if (state.clockWhiteDOM) {
        const m1 = Math.floor(state.whiteTime / 60);
        const s1 = state.whiteTime % 60;
        state.clockWhiteDOM.innerText = `${m1}:${s1.toString().padStart(2, '0')}`;
    }
    if (state.clockBlackDOM) {
        const m2 = Math.floor(state.blackTime / 60);
        const s2 = state.blackTime % 60;
        state.clockBlackDOM.innerText = `${m2}:${s2.toString().padStart(2, '0')}`;
    }
};

export const saveState = () => {
    state.stateHistory.push(_captureStateSnapshot());
    state.redoHistory = [];
};

export const restoreState = () => {
    if (state.stateHistory.length === 0) return false;
    state.redoHistory.push(_captureStateSnapshot());
    const prev = state.stateHistory.pop();
    _applyStateSnapshot(prev);
    return true;
};

export const redoState = () => {
    if (state.redoHistory.length === 0) return false;
    state.stateHistory.push(_captureStateSnapshot());
    const next = state.redoHistory.pop();
    _applyStateSnapshot(next);
    return true;
};

export const getBoardString = () => {
    return state.board.map(row => 
        row.map(p => p ? `${p.color[0]}${p.type[0]}` : '--').join(',')
    ).join(';');
};

export const recordPosition = () => {
    const pos = getBoardString() + `|${state.currentTurn}`;
    const newCount = (state.positionHistory[pos] || 0) + 1;
    state.positionHistory[pos] = newCount;
    return newCount;
};
