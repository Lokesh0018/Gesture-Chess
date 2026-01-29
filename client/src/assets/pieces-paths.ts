// Single-path SVG silhouettes for chess pieces on a 100x100 viewport.
// These are carefully designed to be topologically continuous (a single closed loop) 
// to ensure flawless morphing with flubber.

export const piecePaths: Record<string, string> = {
  // Pawn: Flawless single continuous loop
  P: "M 20 85 L 80 85 C 75 60 65 45 60 40 C 70 30 65 15 50 15 C 35 15 30 30 40 40 C 35 45 25 60 20 85 Z",

  // Rook: Base, straight walls, battlements (single loop)
  R: "M 20 85 L 80 85 L 75 40 L 85 40 L 85 15 L 70 15 L 70 25 L 60 25 L 60 15 L 40 15 L 40 25 L 30 25 L 30 15 L 15 15 L 15 40 L 25 40 Z",

  // Bishop: Single continuous loop
  B: "M 20 85 L 80 85 C 75 75 65 65 60 60 C 70 40 55 25 50 10 C 45 25 30 40 40 60 C 35 65 25 75 20 85 Z",

  // Knight: Single continuous loop
  N: "M 20 85 L 80 85 C 75 60 85 45 80 30 C 75 20 65 15 50 20 C 40 15 30 25 25 40 C 35 40 45 35 45 50 C 35 55 25 60 25 70 Z",

  // Queen: Single continuous loop
  Q: "M 20 85 L 80 85 C 75 60 65 50 60 40 C 70 30 85 15 85 15 C 80 25 75 35 70 40 C 60 20 65 10 65 10 C 60 20 55 30 55 40 C 50 15 50 5 50 5 C 50 15 45 30 45 40 C 40 20 35 10 35 10 C 35 20 40 30 30 40 C 25 35 20 25 15 15 C 15 15 30 30 40 40 C 35 50 25 60 20 85 Z"
};

// We will use standard SVG morphing logic mapping Pawn to the target piece.