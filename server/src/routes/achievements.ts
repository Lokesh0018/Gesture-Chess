import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get achievements for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.user.id;

    // Check if user has achievements, if not, initialize default ones
    let achievements = await prisma.achievement.findMany({
      where: { userId }
    });

    if (achievements.length === 0) {
      // Initialize defaults
      const defaults = [
        { userId, badgeName: 'First Victory', description: 'Win your first game', icon: 'Crown', progress: 0, maxProgress: 1 },
        { userId, badgeName: 'Sharpshooter', description: 'Solve 10 puzzles', icon: 'Target', progress: 0, maxProgress: 10 },
        { userId, badgeName: '3 Day Streak', description: 'Log in for 3 consecutive days', icon: 'Flame', progress: 0, maxProgress: 3 }
      ];
      await prisma.achievement.createMany({ data: defaults });
      achievements = await prisma.achievement.findMany({ where: { userId } });
    }

    res.json({ achievements });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
