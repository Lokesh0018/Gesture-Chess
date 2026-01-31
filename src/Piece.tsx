import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

  useEffect(() => {
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

    // Check immediately
    checkState();

    // Observe body attributes for changes
    const observer = new MutationObserver(checkState);
    observer.observe(document.body, { attributes: true, attributeFilter: ['data-def-color', 'data-win-color'] });

    return () => observer.disconnect();
  }, [color, type]);

  const pieceName = pieceNames[type];
  const src = `/asserts/Black${pieceName}.png`;

  const whiteFilterBase = 'brightness(0) invert(1) drop-shadow(1px 0px 0px #000) drop-shadow(0px 1px 0px #000) drop-shadow(-1px 0px 0px #000) drop-shadow(0px -1px 0px #000)';
  const blackFilterBase = 'drop-shadow(1px 0px 0px rgba(255,255,255,0.5)) drop-shadow(0px 1px 0px rgba(255,255,255,0.5)) drop-shadow(-1px 0px 0px rgba(255,255,255,0.5)) drop-shadow(0px -1px 0px rgba(255,255,255,0.5))';
  
  const baseFilter = color === 'w' ? whiteFilterBase : blackFilterBase;
  const filterNormal = `${baseFilter} drop-shadow(0px 2px 4px rgba(0,0,0,0.3))`;
  const filterDrag = `${baseFilter} drop-shadow(0px 15px 15px rgba(0,0,0,0.6))`;
  const filterWinner = `${baseFilter} drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))`;
  const filterDefeated = `${baseFilter} drop-shadow(0px 15px 15px rgba(0,0,0,0.5))`;

  const currentFilter = isWinner ? filterWinner : isDefeated ? filterDefeated : (isDragging ? filterDrag : filterNormal);

  return (
    <div data-piece-square={square} style={{ 
      width: squareWidth, 
      height: squareWidth, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      position: 'relative',
      zIndex: isDefeated ? 9999 : (isDragging ? 100 : 1)
    }}>
      <motion.div
        initial={false}
        animate={isDefeated ? { 
          rotateZ: 85,
          y: squareWidth * 0.15,
          scale: 1
        } : { rotateZ: 0, rotateX: 0, y: 0, scale: 1 }}
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
          initial={{ scale: 1, y: 0, filter: filterNormal }}
          animate={{
            scale: isDragging && !isDefeated ? 1.15 : 1,
            y: isDragging && !isDefeated ? -8 : 0,
            filter: currentFilter
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          draggable={false}
        />
      </motion.div>
    </div>
  );
}
