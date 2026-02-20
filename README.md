# Gesture Chess

A modern, full-stack chess application with real-time multiplayer capabilities, a comprehensive learning academy, tactical puzzles, AI bot matches, and innovative **hand-gesture controls**.

## Features

- **Real-Time Multiplayer**: Play against friends or random opponents seamlessly using Socket.io.
- **Gesture Controls**: Control your chess pieces using your computer's webcam and hand gestures.
- **Chess Academy (Learn)**: Interactive, step-by-step tactical lessons designed to improve your game.
- **Puzzles**: Solve chess tactics and improve your rating.
- **Play vs Bot**: Challenge the AI to sharpen your skills.
- **Local Multiplayer**: Play locally on the same device with a friend.
- **Customizable Themes**: Choose from multiple board and piece themes, including Classic, Neon, Wood, and more.

## Tech Stack

### Frontend (Client)
- **Framework**: React 18 with Vite
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Chess Engine**: `chess.js` & `react-chessboard`
- **Styling**: Tailwind CSS & Vanilla CSS modules

### Backend (Server)
- **Runtime**: Node.js & Express.js
- **Real-Time**: Socket.io
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens) & bcrypt

## Getting Started

### Prerequisites
- Node.js (v18 or higher recommended)
- PostgreSQL instance

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Lokesh0018/Gesture-Chess.git
   cd Gesture-Chess
   ```

2. **Install all dependencies:**
   The repository uses a single command to install dependencies for both the root, server, and client.
   ```bash
   npm run install:all
   ```

3. **Environment Setup:**
   Navigate to the `server/` directory and create a `.env` file with the following configurations:
   ```env
   PORT=5000
   DATABASE_URL="postgresql://postgres:password@localhost:5432/chess_db" # Or your PostgreSQL connection string
   JWT_SECRET="your_super_secret_jwt_string"
   CLIENT_URL="http://localhost:5173"
   ```

### Running the Application

You can start both the client and server concurrently from the root directory:

```bash
npm run dev
```

- The **Client** will start on `http://localhost:5173`
- The **Server** will start on `http://localhost:5000`

## Documentation

For a deep dive into the architecture, state management, socket events, and project structure, please see the [DOCUMENTATION.md](./DOCUMENTATION.md) file.
