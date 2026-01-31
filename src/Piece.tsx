import React from 'react';
import { motion } from 'framer-motion';

type PieceProps = {
  type: 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
  color: 'w' | 'b';
  squareWidth?: number;
  isDragging?: boolean;
};

const pieceNames = {
  P: 'Pawn',
  N: 'Horse',
  B: 'Bishop',
  R: 'Rook',
  Q: 'Queen',
  K: 'King'
};

export default function Piece({ type, color, squareWidth = 50, isDragging = false }: PieceProps) {
  const pieceName = pieceNames[type];
  const src = `/asserts/Black${pieceName}.png`;

  const whiteFilterBase = 'brightness(0) invert(1) drop-shadow(1px 0px 0px #000) drop-shadow(0px 1px 0px #000) drop-shadow(-1px 0px 0px #000) drop-shadow(0px -1px 0px #000)';
  const blackFilterBase = 'drop-shadow(1px 0px 0px rgba(255,255,255,0.5)) drop-shadow(0px 1px 0px rgba(255,255,255,0.5)) drop-shadow(-1px 0px 0px rgba(255,255,255,0.5)) drop-shadow(0px -1px 0px rgba(255,255,255,0.5))';
  
  const baseFilter = color === 'w' ? whiteFilterBase : blackFilterBase;
  const filterNormal = `${baseFilter} drop-shadow(0px 2px 4px rgba(0,0,0,0.3))`;
  const filterDrag = `${baseFilter} drop-shadow(0px 15px 15px rgba(0,0,0,0.6))`;

  return (
    <div style={{ 
      width: squareWidth, 
      height: squareWidth, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center'
    }}>
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
          scale: isDragging ? 1.15 : 1,
          y: isDragging ? -8 : 0,
          filter: isDragging ? filterDrag : filterNormal
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        draggable={false}
      />
    </div>
  );
}
