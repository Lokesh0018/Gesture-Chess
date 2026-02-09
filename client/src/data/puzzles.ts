export interface Puzzle {
  id: string;
  fen: string;
  moves: string[];
  rating: number;
  theme: string;
}

export const PUZZLES: Puzzle[] = [
  // Zone 1: Rookie Woods
  {
    id: "1",
    fen: "r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQR1K1 w - - 0 8",
    moves: ["c1g5", "h7h6", "g5h4"],
    rating: 800,
    theme: "Opening"
  },
  {
    id: "2",
    fen: "r1b1k2r/pp3ppp/2p5/2bpq3/B3n3/5P2/PPP3PP/RNBQ1R1K b kq - 0 11",
    moves: ["e4g3", "h2g3", "e5h5"],
    rating: 1200,
    theme: "Mate in 2"
  },
  {
    id: "3",
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 3",
    moves: ["f3f7"],
    rating: 600,
    theme: "Mate in 1"
  },
  {
    id: "4",
    fen: "rnbqkbnr/ppppp1pp/8/5p2/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    moves: ["e4f5"],
    rating: 700,
    theme: "Free Pawn"
  },
  // Zone 2: Knight's Courtyard
  {
    id: "5",
    fen: "r1bqk2r/ppp2ppp/2n1pn2/3p4/1bPP4/2N1PN2/PP3PPP/R1BQKB1R w KQkq - 1 6",
    moves: ["c4d5", "e6d5"],
    rating: 1300,
    theme: "Tension"
  },
  {
    id: "6",
    fen: "rnbq1rk1/ppp1bppp/4pn2/3p2B1/2PP4/2N1PN2/PP3PPP/R2QKB1R b KQ - 2 6",
    moves: ["h7h6", "g5h4", "O-O"],
    rating: 1400,
    theme: "Development"
  },
  {
    id: "7",
    fen: "r2q1rk1/pp1b1ppp/2n1pn2/2bp4/2P5/2N1PN2/PPQ1BPPP/R1B2RK1 b - - 6 10",
    moves: ["a8c8"],
    rating: 1500,
    theme: "Rook to Open File"
  },
  // Zone 3: Grandmaster Keep
  {
    id: "8",
    fen: "r1b2rk1/ppq2ppp/2nbpn2/3p4/2P5/1PN1PN2/PB2BPPP/R2Q1RK1 b - - 0 11",
    moves: ["a7a6"],
    rating: 1800,
    theme: "Prophylaxis"
  },
  {
    id: "9",
    fen: "3r2k1/pb3ppp/1p2pn2/2q5/2P5/1P3N2/P3BPPP/1Q1R2K1 b - - 1 20",
    moves: ["d8d1", "b1d1"],
    rating: 1900,
    theme: "Simplification"
  },
  {
    id: "10",
    fen: "6k1/1p3p1p/p5p1/2P5/1P6/P4P2/3r2PP/2R3K1 w - - 0 31",
    moves: ["c5c6", "b7c6", "c1c6"],
    rating: 2200,
    theme: "Endgame Passed Pawn"
  }
];
