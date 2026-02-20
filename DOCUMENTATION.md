# Gesture Chess - Comprehensive Documentation

This document serves as the technical documentation for the Gesture Chess application. It covers the system architecture, file structure, key technologies, and core feature implementations.

---

## 1. System Architecture

Gesture Chess operates as a monorepo containing two main parts:
- **Client**: A React Single Page Application (SPA) built with Vite.
- **Server**: A Node.js Express server that handles REST APIs and real-time Socket.io connections.

### 1.1 Database Schema (Prisma & PostgreSQL)
The application uses PostgreSQL as its primary datastore, managed via Prisma ORM. Core models include:
- **User**: Stores authentication details, username, email, ELO ratings (bullet, blitz, rapid), and preferences.
- **Match / Game**: Stores move history (PGN), FEN state, players involved, and match results.
- **Activity / Achievement**: Tracks user progress, tactics solved, and milestones reached.

### 1.2 Authentication Flow
- **Registration/Login**: Users authenticate via the `/api/auth/` REST endpoints. Passwords are encrypted using `bcrypt`.
- **Session Management**: A JWT (JSON Web Token) is returned upon successful authentication.
- **Socket Authentication**: Real-time connections are authenticated by passing the JWT token during the Socket.io handshake. The server drops unauthorized connections.

---

## 2. Real-Time Multiplayer (Socket.io)

Real-time gameplay is orchestrated through the `server/src/socket/index.ts` file. 
The system operates on an event-driven architecture:

### Client-to-Server Events
- `find_match`: Client requests to join the matchmaking queue.
- `make_move`: Client submits a valid move (including FEN and SAN notation).
- `resign` / `offer_draw`: Game termination requests.
- `disconnect`: Handled gracefully by the server to forfeit matches if a player drops out and does not reconnect in time.

### Server-to-Client Events
- `match_found`: Server notifies paired clients of a new match, providing initial game state and opponent details.
- `move_made`: Broadcasts the opponent's validated move to the client.
- `game_over`: Broadcasts termination conditions (Checkmate, Stalemate, Resignation).

---

## 3. Frontend Architecture

### 3.1 State Management (Zustand)
The application utilizes Zustand for global, lightweight state management:
- `useAuthStore`: Manages the JWT token, current user details, and logout functionality.
- `useSettingsStore`: Manages UI preferences (Board themes, piece themes, sound toggles) and persists them to `localStorage`.
- `useGestureStore`: Manages the state of the webcam, hand-tracking status, and mapped gesture inputs.

### 3.2 Key Pages & Routing
React Router handles client-side navigation:
- **`/` (Home)**: Landing page with navigation and quick-play buttons.
- **`/play/online`**: Initiates the matchmaking queue and renders the real-time board.
- **`/play/local`**: An offline mode for two players on the same screen.
- **`/learn`**: Interactive chess academy. Lessons are state-managed and restrict invalid moves until the user solves the puzzle.
- **`/puzzles`**: Tactical challenges pulled from a database or static set to train pattern recognition.
- **`/play/bot`**: A sandbox for playing against a local JS-based chess engine / bot algorithm.

### 3.3 Chess Logic & UI
- **`chess.js`**: Handles all internal board logic, move validation, PGN generation, and checkmate detection.
- **`react-chessboard`**: Renders the SVG board and pieces. It seamlessly integrates with `chess.js` to reflect FEN changes.
- **Drag & Drop vs Click-to-Move**: The application supports both UX paradigms.

---

## 4. Gesture Integration

One of the unique features of the application is the ability to control the board without a mouse.
- The **Camera Panel** captures video feed.
- A hand-tracking model (e.g., MediaPipe) processes the video stream to identify pinch gestures and hand coordinates.
- Coordinates are mapped to board squares, allowing users to "pick up" and "drop" pieces virtually.

---

## 5. Security & Best Practices

- **CORS Handling**: The Express server restricts API and Socket connections strictly to the `CLIENT_URL` defined in the environment variables.
- **JWT Protection**: Secrets are securely managed in `.env` and are never hardcoded. 
- **Graceful Error Handling**: Missing environment variables trigger fail-fast mechanisms on server boot to prevent silent failures in production.
- **Payload Sanitization**: Critical fields like `passwordHash` are stripped before transmitting user data to the client.

---

## 6. Project Directory Structure

```text
Gesture-Chess/
├── package.json              # Root workspace manager
├── README.md                 # Brief project overview
├── DOCUMENTATION.md          # Technical documentation
│
├── client/                   # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components (CameraPanel, etc.)
│   │   ├── pages/            # Routable views (Learn, LocalGame, OnlineGame)
│   │   ├── store/            # Zustand stores
│   │   ├── utils/            # Helper functions (audio, formatting)
│   │   ├── App.tsx           # Router and main layout
│   │   └── index.css         # Global styles and CSS variables
│   └── package.json          
│
└── server/                   # Express Backend
    ├── src/
    │   ├── routes/           # Express REST endpoints
    │   ├── middleware/       # JWT verification and error handlers
    │   ├── socket/           # Socket.io orchestration
    │   └── index.ts          # Server entry point
    ├── prisma/
    │   ├── schema.prisma     # PostgreSQL models
    │   └── migrations/       # Database migrations
    ├── .env                  # Environment variables
    └── package.json
```
