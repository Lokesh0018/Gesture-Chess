import React, { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { vfx } from './vfx-manager';

type PieceProps = {
  type: 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
  color: 'w' | 'b';
  squareWidth?: number;
  isDragging?: boolean;
  square?: string;
};

const pieceNames = {
  P: 'Pawn',
  N: 'Horse',
  B: 'Bishop',
  R: 'Rook',
  Q: 'Queen',
  K: 'King'
};

export default function Piece({ type, color, squareWidth = 50, isDragging = false, square }: PieceProps) {
  const [isDefeated, setIsDefeated] = useState(false);
  const [isWinner, setIsWinner] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isFalling, setIsFalling] = useState(false);

  useEffect(() => {
    if ((window as any).gameJustStarted) {
      setIsFalling(true);
      setTimeout(() => setIsFalling(false), 2000);
    }
    
    const checkState = () => {
      const defColor = document.body.getAttribute('data-def-color');
      const winColor = document.body.getAttribute('data-win-color');
      
      if (defColor === color && type === 'K') {
        setIsDefeated(true);
      } else {
        setIsDefeated(false);
      }

      if (winColor === color && type === 'K') {
        setIsWinner(true);
      } else {
        setIsWinner(false);
      }
    };

    checkState();
    const observer = new MutationObserver(checkState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-def-color', 'data-win-color'] });
    return () => observer.disconnect();
  }, [color, type]);

  useEffect(() => {
    if (!isDragging) {
      setTilt({ x: 0, y: 0 });
      return;
    }
    const is3dEnabled = localStorage.getItem('chess_3d_drag') !== 'false';
    if (!is3dEnabled) return;

    let lastX = 0;
    let lastY = 0;
    let velocityX = 0;
    let velocityY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (lastX === 0 && lastY === 0) {
        lastX = e.clientX;
        lastY = e.clientY;
        return;
      }
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      
      velocityX = dx * 1.5;
      velocityY = dy * 1.5;
      
      // Clamp the tilt
      const maxTilt = 45;
      const tiltX = Math.max(-maxTilt, Math.min(maxTilt, -velocityY));
      const tiltY = Math.max(-maxTilt, Math.min(maxTilt, velocityX));
      
      setTilt({ x: tiltX, y: tiltY });
      
      // Emit trail
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        vfx.emit('trail', e.clientX, e.clientY + 20); // offset slightly to bottom of piece
      }

      lastX = e.clientX;
      lastY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isDragging]);

  const pieceName = pieceNames[type];
  const src = `/asserts/Black${pieceName}.png`;

  const whiteFilterBase = 'brightness(0) invert(1) drop-shadow(1px 0px 0px #000) drop-shadow(0px 1px 0px #000) drop-shadow(-1px 0px 0px #000) drop-shadow(0px -1px 0px #000)';
  const blackFilterBase = 'drop-shadow(1px 0px 0px rgba(255,255,255,0.5)) drop-shadow(0px 1px 0px rgba(255,255,255,0.5)) drop-shadow(-1px 0px 0px rgba(255,255,255,0.5)) drop-shadow(0px -1px 0px rgba(255,255,255,0.5))';
  
  const baseFilter = color === 'w' ? whiteFilterBase : blackFilterBase;
  const filterNormal = `${baseFilter} drop-shadow(0px 2px 4px rgba(0,0,0,0.3))`;
  const filterDrag = `${baseFilter} drop-shadow(0px 25px 25px rgba(0,0,0,0.5))`;
  const filterWinner = `${baseFilter} drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))`;
  const filterDefeated = `${baseFilter} drop-shadow(0px 15px 15px rgba(0,0,0,0.5))`;

  const currentFilter = isWinner ? filterWinner : isDefeated ? filterDefeated : (isDragging ? filterDrag : filterNormal);

  const rowMatch = square ? square.match(/\d/) : null;
  const rowNum = rowMatch ? parseInt(rowMatch[0]) : 1;
  // Delay calculation: center pieces fall first, outer fall later
  const delay = isFalling ? (8 - rowNum) * 0.1 : 0;

  // FIX: react-chessboard sometimes passes the full board width instead of the square width to the drag layer!
  let actualSquareWidth = squareWidth;
  if (isDragging && squareWidth > 200) {
    actualSquareWidth = squareWidth / 8;
  }

  if (isDragging) {
    return (
      <img
        src={src}
        style={{
          width: actualSquareWidth * 1.3, // Scale up slightly to look like it's lifted
          height: actualSquareWidth * 1.3,
          objectFit: 'contain',
          filter: filterDrag,
          cursor: 'grabbing',
          transform: `translate(-10%, -10%)`, // Center the scaled image on the cursor
          pointerEvents: 'none'
        }}
        draggable={false}
      />
    );
  }

  return (
    <div data-piece-square={square} className={isFalling ? "falling-piece" : ""} style={{ 
      width: actualSquareWidth, 
      height: actualSquareWidth, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      position: 'relative',
      zIndex: isDefeated ? 9999 : (isDragging ? 100 : 1),
      perspective: '800px',
      animationDelay: `${delay}s`
    }}>
      <motion.div
        initial={false}
        animate={isDefeated ? { 
          rotateZ: 85,
          y: squareWidth * 0.15,
          scale: 1
        } : { rotateZ: 0, y: 0, scale: 1 }}
        transition={isDefeated ? { duration: 1.0, ease: "easeIn" } : { duration: 0 }}
        style={{ 
          width: '100%', height: '100%', 
          transformOrigin: 'bottom right', 
          display: 'flex', justifyContent: 'center', alignItems: 'center' 
        }}
      >
        <motion.img
          src={src}
          style={{ 
            width: '90%', 
            height: '90%', 
            objectFit: 'contain', 
            cursor: isDragging ? 'grabbing' : 'grab', 
            userSelect: 'none' 
          }}
          initial={{ scale: 1, y: 0, filter: filterNormal, rotateX: 0, rotateY: 0 }}
          animate={{
            scale: isDragging && !isDefeated ? 1.1 : 1,
            y: 0,
            rotateX: isDragging && !isDefeated ? tilt.x : 0,
            rotateY: isDragging && !isDefeated ? tilt.y : 0,
            filter: currentFilter
          }}
          transition={{ 
            type: 'spring', stiffness: isDragging ? 100 : 300, damping: isDragging ? 10 : 20 
          }}
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
