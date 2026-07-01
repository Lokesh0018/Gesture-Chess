import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useGestureStore } from '../store/useGestureStore';

export const VirtualCursor: React.FC = () => {
  const { cursorX, cursorY, isPinching, isActive, draggedPiece } = useGestureStore();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isActive) return null;

  const pixelX = (1 - cursorX) * windowSize.width;
  const pixelY = cursorY * windowSize.height;

  // Determine Cursor Style
  let cursorColor = 'rgba(255, 255, 255, 0.8)';
  let glowColor = 'rgba(255, 255, 255, 0.4)';
  let cursorScale = 1;

  if (draggedPiece) {
    cursorColor = 'rgba(74, 222, 128, 0.9)'; // Green dragging
    glowColor = 'rgba(74, 222, 128, 0.6)';
    cursorScale = 1.2;
  } else if (isPinching) {
    cursorColor = 'rgba(96, 165, 250, 0.9)'; // Blue pinching (missed piece)
    glowColor = 'rgba(96, 165, 250, 0.6)';
    cursorScale = 0.8;
  }

  let pieceImgSrc = '';
  if (draggedPiece) {
    // draggedPiece is like "wP", "bN", etc.
    const color = draggedPiece[0];
    const type = draggedPiece[1] as 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
    const pieceNames = { P: 'Pawn', N: 'Horse', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King' };
    pieceImgSrc = `/asserts/Black${pieceNames[type]}.png`; // the project currently uses this path format
  }

  return (
    <motion.div
      className="virtual-cursor"
      animate={{
        x: pixelX,
        y: pixelY,
        scale: cursorScale,
        opacity: 1
      }}
      transition={{
        type: 'spring',
        stiffness: 1000,
        damping: 40,
        mass: 0.1
      }}
      style={{
        position: 'fixed',
        top: -15, 
        left: -15,
        width: 30,
        height: 30,
        borderRadius: '50%',
        backgroundColor: 'transparent',
        border: `3px solid ${cursorColor}`,
        pointerEvents: 'none',
        zIndex: 99999,
        boxShadow: `0 0 15px ${glowColor}, inset 0 0 10px ${glowColor}`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div 
        style={{
          width: 8,
          height: 8,
          backgroundColor: cursorColor,
          borderRadius: '50%',
          boxShadow: `0 0 8px ${cursorColor}`
        }} 
      />
      {draggedPiece && (
        <img
          src={pieceImgSrc}
          style={{
            position: 'absolute',
            width: 80, // ~120% of typical board square
            height: 80,
            objectFit: 'contain',
            top: 20, // Offset so it hangs below the cursor tip slightly
            left: '50%',
            transform: 'translateX(-50%)',
            filter: `drop-shadow(0px 25px 25px rgba(0,0,0,0.6)) drop-shadow(0 0 15px ${draggedPiece[0] === 'w' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'})`,
            pointerEvents: 'none'
          }}
        />
      )}
    </motion.div>
  );
};
