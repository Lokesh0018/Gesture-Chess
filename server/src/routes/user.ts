import { Router } from 'express';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { prisma } from '../prisma';

export const userRouter = Router();

userRouter.get('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        gamesAsWhite: { orderBy: { createdAt: 'desc' }, take: 20 },
        gamesAsBlack: { orderBy: { createdAt: 'desc' }, take: 20 },
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Combine and sort games
    const allGames = [...user.gamesAsWhite, ...user.gamesAsBlack].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    ).slice(0, 20);
    
    const { passwordHash, ...safeUser } = user;
    res.json({ user: safeUser, recentGames: allGames });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

userRouter.put('/profile', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { username, avatarUrl } = req.body;
    
    if (username) {
      const existing = await prisma.user.findFirst({
        where: { username, id: { not: req.user!.id } }
      });
      if (existing) {
        return res.status(400).json({ error: 'Username taken' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
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

userRouter.get('/settings', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const settings = await prisma.settings.findUnique({
      where: { userId: req.user!.id }
    });
    if (!settings) {
      // create default settings if they don't exist
      const newSettings = await prisma.settings.create({
        data: { userId: req.user!.id }
      });
      return res.json({ settings: newSettings });
    }
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

userRouter.post('/settings', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { cursorSensitivity, gestureSensitivity, pinchThreshold, theme, boardTheme, pieceTheme, soundVolume } = req.body;
    
    const settings = await prisma.settings.upsert({
      where: { userId: req.user!.id },
      update: {
        ...(cursorSensitivity !== undefined && { cursorSensitivity }),
        ...(gestureSensitivity !== undefined && { gestureSensitivity }),
        ...(pinchThreshold !== undefined && { pinchThreshold }),
        ...(theme !== undefined && { theme }),
        ...(boardTheme !== undefined && { boardTheme }),
        ...(pieceTheme !== undefined && { pieceTheme }),
        ...(soundVolume !== undefined && { soundVolume }),
      },
      create: {
        userId: req.user!.id,
        cursorSensitivity: cursorSensitivity ?? 1.0,
        gestureSensitivity: gestureSensitivity ?? 1.0,
        pinchThreshold: pinchThreshold ?? 0.5,
        theme: theme ?? 'dark',
        boardTheme: boardTheme ?? 'classic',
        pieceTheme: pieceTheme ?? 'classic',
        soundVolume: soundVolume ?? 0.8,
      }
    });

    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

userRouter.post('/match', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { pgn, fen, result, opponentType } = req.body; // result: 'win', 'loss', 'draw'
    
    // In a local/bot match, we only track the current user.
    // If we want to strictly say the user is always white or black against a bot, we could.
    // For now, we just save the user as White for simplicity if they played local/bot.
    const game = await prisma.game.create({
      data: {
        whiteId: req.user!.id,
        status: 'completed',
        pgn,
        fen,
        winnerId: result === 'win' ? req.user!.id : null,
      }
    });

    // Update user stats
    const updateData: any = {
      gamesPlayed: { increment: 1 },
    };
    if (result === 'win') updateData.wins = { increment: 1 };
    else if (result === 'loss') updateData.losses = { increment: 1 };
    else if (result === 'draw') updateData.draws = { increment: 1 };

    await prisma.user.update({
      where: { id: req.user!.id },
      data: updateData
    });

    res.json({ game });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
