import { Router } from 'express';
import { verifyToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

export const userRouter = Router();

userRouter.get('/profile', verifyToken, (req: AuthRequest, res) => {
  if (!req.user) return res.status(404).json({ error: 'User not found' });
  
  // Exclude password hash
  const { passwordHash, ...safeUser } = req.user;
  res.json({ user: safeUser });
});

userRouter.put('/profile', verifyToken, async (req: AuthRequest, res) => {
  try {
    const { username, avatarUrl } = req.body;
    
    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, id: { not: req.user.id } }
      });
      if (existing) {
        return res.status(400).json({ error: 'Username taken' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        ...(username && { username }),
        ...(avatarUrl && { avatarUrl }),
      }
    });

    const { passwordHash, ...safeUser } = updated;
    res.json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
