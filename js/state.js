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
    
    whiteTime: 600,
    blackTime: 600,
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
    
    state.currentTurn = COLORS.WHITE;
    state.selectedSquare = null;
    state.lastMove = null;
    state.halfMoveClock = 0;
    state.positionHistory = {};
    state.moveList = [];
    recordPosition();
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
