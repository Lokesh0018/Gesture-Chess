import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { userRouter } from './routes/user';
import { leaderboardRouter } from './routes/leaderboard';
import activityRouter from './routes/activity';
import achievementsRouter from './routes/achievements';
import puzzlesRouter from './routes/puzzles';
import { initializeSocket } from './socket';

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/activity', activityRouter);
app.use('/api/achievements', achievementsRouter);
app.use('/api/puzzles', puzzlesRouter);

app.get('/api/health', (req, res) => {
  res.send('GestureChess API is running');
});

// Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

initializeSocket(io);

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
