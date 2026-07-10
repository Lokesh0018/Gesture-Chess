import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get puzzles
router.get('/', async (req, res) => {
  try {
    const puzzles = await prisma.puzzle.findMany({
      orderBy: { rating: 'asc' },
      take: 10
    });
    res.json({ puzzles });
  } catch (error) {
    console.error('Error fetching puzzles:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Solve a puzzle
router.post('/solve', authenticateToken, async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { puzzleId } = req.body;

    const puzzle = await prisma.puzzle.findUnique({ where: { id: puzzleId } });
    if (!puzzle) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }

    // Give user 5 rating points and 5 EXP (wins acting as EXP)
    await prisma.user.update({
      where: { id: userId },
      data: {
        rating: { increment: 5 },
        wins: { increment: 1 } // using wins as general exp for now
      }
    });

    // Create Activity
    await prisma.activity.create({
      data: {
        userId,
        type: 'puzzle',
        title: `Solved Puzzle #${puzzle.id.substring(0, 4)}`,
        subtitle: `Theme: ${puzzle.theme}`,
        points: 5,
        isPositive: true
      }
    });

    // Update Achievement progress
    const sharpshooter = await prisma.achievement.findFirst({
      where: { userId, badgeName: 'Sharpshooter' }
    });
    
    if (sharpshooter && !sharpshooter.isCompleted) {
      const newProgress = sharpshooter.progress + 1;
      const isCompleted = newProgress >= sharpshooter.maxProgress;
      await prisma.achievement.update({
        where: { id: sharpshooter.id },
        data: {
          progress: newProgress,
          isCompleted
        }
      });
      
      if (isCompleted) {
        await prisma.activity.create({
          data: {
            userId,
            type: 'achievement',
            title: 'Achievement Unlocked!',
            subtitle: 'Sharpshooter',
            points: 50,
            isPositive: true
          }
        });
      }
    }

    res.json({ success: true, message: 'Puzzle solved successfully' });
  } catch (error) {
    console.error('Error solving puzzle:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
