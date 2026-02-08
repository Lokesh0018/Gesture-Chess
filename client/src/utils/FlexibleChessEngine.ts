export type PieceColor = 'w' | 'b';
export type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
export type Square = string;
export type BoardPosition = Record<Square, string>;

const FILES = 'abcdefgh';

export class FlexibleChessEngine {
  position: BoardPosition;
  enPassantTarget: Square | null;
  castlingRights: { wK: boolean, wQ: boolean, bK: boolean, bQ: boolean };

  constructor(
    position: BoardPosition, 
    enPassantTarget: Square | null = null,
    castlingRights = { wK: false, wQ: false, bK: false, bQ: false }
  ) {
    this.position = { ...position };
    this.enPassantTarget = enPassantTarget;
    this.castlingRights = { ...castlingRights };
  }

  static getCoords(sq: Square): [number, number] {
    return [FILES.indexOf(sq[0]), parseInt(sq[1]) - 1];
  }

  static getSquare(f: number, r: number): Square | null {
    if (f < 0 || f > 7 || r < 0 || r > 7) return null;
    return FILES[f] + (r + 1);
  }

  getPiece(sq: Square): { color: PieceColor, type: PieceType } | null {
    const p = this.position[sq];
    if (!p) return null;
    return { color: p[0] as PieceColor, type: p[1] as PieceType };
  }

  // Generate pseudo-legal moves for a specific square (ignores if it leaves own king in check)
  generatePseudoLegalMoves(sq: Square): Square[] {
    const piece = this.getPiece(sq);
    if (!piece) return [];
    
    const moves: Square[] = [];
    const [f, r] = FlexibleChessEngine.getCoords(sq);
    const { color, type } = piece;

    const addMove = (nf: number, nr: number): boolean => {
      const targetSq = FlexibleChessEngine.getSquare(nf, nr);
      if (!targetSq) return false; // off board
      const targetPiece = this.getPiece(targetSq);
      if (!targetPiece) {
        moves.push(targetSq);
        return true; // continue sliding
      }
      if (targetPiece.color !== color) {
        moves.push(targetSq);
      }
      return false; // blocked
    };

    const slide = (df: number, dr: number) => {
      let cf = f + df;
      let cr = r + dr;
      while (addMove(cf, cr)) {
        cf += df;
        cr += dr;
      }
    };

    if (type === 'R' || type === 'Q') {
      slide(0, 1); slide(0, -1); slide(1, 0); slide(-1, 0);
    }
    if (type === 'B' || type === 'Q') {
      slide(1, 1); slide(1, -1); slide(-1, 1); slide(-1, -1);
    }
    if (type === 'N') {
      const jumps = [[1,2],[2,1],[2,-1],[1,-2],[-1,-2],[-2,-1],[-2,1],[-1,2]];
      jumps.forEach(([df, dr]) => addMove(f + df, r + dr));
    }
    if (type === 'K') {
      const steps = [[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1],[-1,0],[-1,1]];
      steps.forEach(([df, dr]) => addMove(f + df, r + dr));
      // Standard castling logic omitted for sandbox simplicity unless explicitly handled later
    }
    if (type === 'P') {
      const dir = color === 'w' ? 1 : -1;
      const startRank = color === 'w' ? 1 : 6;
      
      // Forward 1
      const forward1 = FlexibleChessEngine.getSquare(f, r + dir);
      if (forward1 && !this.getPiece(forward1)) {
        moves.push(forward1);
        // Forward 2
        if (r === startRank) {
          const forward2 = FlexibleChessEngine.getSquare(f, r + dir * 2);
          if (forward2 && !this.getPiece(forward2)) {
            moves.push(forward2);
          }
        }
      }
      
      // Captures
      const cap1 = FlexibleChessEngine.getSquare(f - 1, r + dir);
      const cap2 = FlexibleChessEngine.getSquare(f + 1, r + dir);
      
      if (cap1) {
        const p = this.getPiece(cap1);
        if ((p && p.color !== color) || cap1 === this.enPassantTarget) moves.push(cap1);
      }
      if (cap2) {
        const p = this.getPiece(cap2);
        if ((p && p.color !== color) || cap2 === this.enPassantTarget) moves.push(cap2);
      }
    }

    return moves;
  }

  // Check if a specific color has exactly one king
  getKings(color: PieceColor): Square[] {
    const kings: Square[] = [];
    Object.entries(this.position).forEach(([sq, p]) => {
      if (p === `${color}K`) kings.push(sq);
    });
    return kings;
  }

  // Check if a square is attacked by the opponent
  isSquareAttacked(sq: Square, defendingColor: PieceColor): boolean {
    const attackerColor = defendingColor === 'w' ? 'b' : 'w';
    
    for (const [attackerSq, p] of Object.entries(this.position)) {
      if (p[0] === attackerColor) {
        // Generate pseudo-legal moves for the attacker
        // To avoid infinite recursion, we instantiate a temp engine without checking kings
        const tempEngine = new FlexibleChessEngine(this.position);
        const attackerMoves = tempEngine.generatePseudoLegalMoves(attackerSq);
        if (attackerMoves.includes(sq)) return true;
      }
    }
    return false;
  }

  // Color is in check only if they have exactly one King and it is attacked
  isInCheck(color: PieceColor): boolean {
    const kings = this.getKings(color);
    if (kings.length !== 1) return false; // If 0 or >1 kings, check rules are disabled
    return this.isSquareAttacked(kings[0], color);
  }

  // Get fully legal moves (filters pseudo-legal moves if they leave the exactly-one-king in check)
  getLegalMoves(sq: Square): Square[] {
    const piece = this.getPiece(sq);
    if (!piece) return [];
    
    const pseudoMoves = this.generatePseudoLegalMoves(sq);
    const kings = this.getKings(piece.color);
    
    // If king rules do not apply (0 or >1 kings), all pseudo-legal moves are legal
    if (kings.length !== 1) return pseudoMoves;

    return pseudoMoves.filter(targetSq => {
      // Simulate move
      const simulatedPos = { ...this.position };
      delete simulatedPos[sq];
      simulatedPos[targetSq] = `${piece.color}${piece.type}`;
      
      const simEngine = new FlexibleChessEngine(simulatedPos);
      return !simEngine.isInCheck(piece.color);
    });
  }

  // Get all legal moves for a color
  getAllLegalMoves(color: PieceColor): { from: Square, to: Square }[] {
    const moves: { from: Square, to: Square }[] = [];
    Object.entries(this.position).forEach(([sq, p]) => {
      if (p[0] === color) {
        const legalDests = this.getLegalMoves(sq);
        legalDests.forEach(to => moves.push({ from: sq, to }));
      }
    });
    return moves;
  }

  // Evaluate the game state after a move has been made
  getGameState(turnColor: PieceColor): { status: 'active' | 'elimination' | 'checkmate' | 'stalemate' | 'no_legal_moves', winner?: PieceColor } {
    let wCount = 0, bCount = 0;
    Object.values(this.position).forEach(p => {
      if (p.startsWith('w')) wCount++;
      if (p.startsWith('b')) bCount++;
    });

    if (wCount === 0) return { status: 'elimination', winner: 'b' };
    if (bCount === 0) return { status: 'elimination', winner: 'w' };

    const legalMoves = this.getAllLegalMoves(turnColor);
    
    if (legalMoves.length === 0) {
      const kings = this.getKings(turnColor);
      if (kings.length === 1) {
        if (this.isInCheck(turnColor)) {
          return { status: 'checkmate', winner: turnColor === 'w' ? 'b' : 'w' };
        } else {
          return { status: 'stalemate' };
        }
      } else {
        return { status: 'no_legal_moves' };
      }
    }

    return { status: 'active' };
  }
}
