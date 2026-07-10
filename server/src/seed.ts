import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PUZZLES = [
  {
    fen: "r1bq1rk1/1pp2ppp/p1np1n2/2b1p3/2B1P3/2PP1N2/PP3PPP/RNBQR1K1 w - - 0 8",
    moves: ["c1g5", "h7h6", "g5h4"],
    rating: 800,
    theme: "Opening"
  },
  {
    fen: "r1b1k2r/pp3ppp/2p5/2bpq3/B3n3/5P2/PPP3PP/RNBQ1R1K b kq - 0 11",
    moves: ["e4g3", "h2g3", "e5h5"],
    rating: 1200,
    theme: "Mate in 2"
  },
  {
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 4 3",
    moves: ["f3f7"],
    rating: 600,
    theme: "Mate in 1"
  },
  {
    fen: "8/8/8/8/4k3/8/5P2/4K2R w K - 0 1",
    moves: ["e1g1"],
    rating: 900,
    theme: "Castling"
  },
  {
    fen: "rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2",
    moves: ["e4d5"],
    rating: 700,
    theme: "Capture"
  }
];

async function main() {
  console.log('Seeding puzzles...');
  const count = await prisma.puzzle.count();
  if (count > 0) {
    console.log('Puzzles already seeded');
    return;
  }
  
  for (const puzzle of PUZZLES) {
    await prisma.puzzle.create({
      data: puzzle
    });
  }
  
  console.log('Puzzles seeded successfully!');
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
