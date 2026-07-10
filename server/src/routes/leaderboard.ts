import { Router } from 'express';
import { prisma } from '../prisma';

export const leaderboardRouter = Router();

leaderboardRouter.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { rating: 'desc' },
      take: 50,
      select: {
        id: true,
        username: true,
        rating: true,
        wins: true,
        losses: true,
        gamesPlayed: true,
        avatarUrl: true
      }
    });
    res.json({ leaderboard: users });
  } catch (err) {
    res.status(500).json({ error: 'Server error fetching leaderboard' });
  }
});
