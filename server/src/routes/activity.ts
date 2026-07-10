import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get recent activity for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    // @ts-ignore - req.user is set by authenticateToken
    const userId = req.user.id;

    const activities = await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    res.json({ activities });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Post a new activity manually (e.g. from frontend)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // @ts-ignore
    const userId = req.user.id;
    const { type, title, subtitle, points, isPositive } = req.body;

    const activity = await prisma.activity.create({
      data: {
        userId,
        type,
        title,
        subtitle,
        points,
        isPositive: isPositive ?? true
      }
    });

    res.json({ activity });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
