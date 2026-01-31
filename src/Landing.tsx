import { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Piece from './Piece';

const piecesList = ['wP', 'wN', 'wB', 'wR', 'wQ', 'wK', 'bP', 'bN', 'bB', 'bR', 'bQ', 'bK'];
const customPieces = piecesList.reduce((res: any, p) => {
  const color = p[0] as 'w' | 'b';
  const type = p[1] as 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
  res[p] = ({ squareWidth, isDragging, square }: any) => (
    <Piece type={type} color={color} squareWidth={squareWidth} isDragging={isDragging} square={square} />
  );
  return res;
}, {});

const sequence = ['e4', 'e5', 'Bc4', 'Nc6', 'Qh5', 'Nf6', 'Qxf7#'];

export default function Landing() {
  const [gameFen, setGameFen] = useState(new Chess().fen());
  const [boardWidth, setBoardWidth] = useState(window.innerWidth > 800 ? 500 : window.innerWidth * 0.9);

  const stepRef = useRef(0);
  const chessRef = useRef(new Chess());

  useEffect(() => {
    const handleResize = () => setBoardWidth(window.innerWidth > 800 ? 500 : window.innerWidth * 0.9);
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
    <div className="hero-container" style={{ position: 'relative', overflow: 'hidden' }}>
      
      {/* Background glowing orbs - optimized for performance */}
      <motion.div 
        animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'absolute', top: '-20%', left: '-20%', width: '60vw', height: '60vw', background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 60%)', zIndex: -1 }}
      />
      
      <motion.div 
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="hero-text" style={{ flex: 1, zIndex: 10 }}
      >
        <h1 style={{ fontSize: '4rem', fontWeight: 900, marginBottom: '20px', lineHeight: 1.1, textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
          Play Chess<br />Online <span style={{ color: 'var(--accent)', textShadow: '0 0 20px rgba(16, 185, 129, 0.5)' }}>Now!</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '40px', maxWidth: '400px' }}>
          Experience the ultimate modern chess platform with premium aesthetics and smooth gameplay.
        </p>
        <Link to="/lobby" className="menu-btn" style={{ display: 'inline-block', fontSize: '1.3rem', padding: '18px 40px', borderRadius: '30px' }}>Play Now</Link>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        style={{ zIndex: 10 }}
      >
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          style={{ padding: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
        >
          <div style={{ borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>
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
        </motion.div>
      </motion.div>
    </div>
  );
}
