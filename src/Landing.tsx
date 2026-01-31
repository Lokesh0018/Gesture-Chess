import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Link } from 'react-router-dom';
import Piece from './Piece';

const piecesList = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
const customPieces = piecesList.reduce((res: any, p) => {
  const color = p[0] as 'w' | 'b';
  const type = p[1] as 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
  res[p] = ({ squareWidth, isDragging }: any) => (
    <Piece type={type} color={color} squareWidth={squareWidth} isDragging={isDragging} />
  );
  return res;
}, {});

const sequence = ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#'];

export default function Landing() {
  const [gameFen, setGameFen] = useState(new Chess().fen());
  const [boardWidth, setBoardWidth] = useState(window.innerWidth > 500 ? 450 : window.innerWidth * 0.9);

  const stepRef = useRef(0);
  const chessRef = useRef(new Chess());

  useEffect(() => {
    const handleResize = () => setBoardWidth(window.innerWidth > 500 ? 450 : window.innerWidth * 0.9);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      try {
        if (stepRef.current < sequence.length) {
          chessRef.current.move(sequence[stepRef.current]);
          setGameFen(chessRef.current.fen());
          stepRef.current++;
        } else {
          chessRef.current = new Chess();
          setGameFen(chessRef.current.fen());
          stepRef.current = 0;
        }
      } catch (e) {
        console.error("Animation move failed", e);
        chessRef.current = new Chess();
        setGameFen(chessRef.current.fen());
        stepRef.current = 0;
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hero-container">
      <div className="board-wrapper">
        {/* @ts-ignore */}
        <Chessboard
          id="LandingBoard"
          position={gameFen}
          boardWidth={boardWidth}
          animationDuration={400}
          arePiecesDraggable={false}
          customPieces={customPieces}
          customDarkSquareStyle={{ backgroundColor: 'var(--board-dark)' }}
          customLightSquareStyle={{ backgroundColor: 'var(--board-light)' }}
        />
      </div>
      <div className="hero-text">
        <h1>Play Chess<br />Online <span style={{ color: 'var(--accent)' }}>Now!</span></h1>
        <p>Join millions of players on the #1 rated app.</p>
        <Link to="/lobby" className="btn-play">Play Now</Link>
      </div>
    </div>
  );
}
