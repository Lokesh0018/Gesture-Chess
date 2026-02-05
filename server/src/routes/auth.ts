import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import crypto from 'crypto';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret';

authRouter.post('/register', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userId = crypto.randomBytes(12).toString('hex');
    const nowStr = Date.now().toString();

    // Bypass Prisma's transaction requirement for MongoDB standalone instances
    await prisma.$runCommandRaw({
      insert: 'User',
      documents: [{
        _id: { $oid: userId },
        email,
        username,
        passwordHash,
        rating: 1200,
        gamesPlayed: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        isVerified: false,
        createdAt: { $date: { $numberLong: nowStr } },
        updatedAt: { $date: { $numberLong: nowStr } }
      }]
    });

    await prisma.$runCommandRaw({
      insert: 'Settings',
      documents: [{
        _id: { $oid: crypto.randomBytes(12).toString('hex') },
        userId: { $oid: userId },
        cursorSensitivity: 1.0,
        gestureSensitivity: 1.0,
        pinchThreshold: 0.5,
        theme: "dark",
        boardTheme: "classic",
        pieceTheme: "classic",
        soundVolume: 0.8
      }]
    });

    // Fetch the created user to ensure types are correct
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const token = jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ user, token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
