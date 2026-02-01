import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type FlyingPieceProps = {
  startSquare: string;
  pieceType: string;
  pieceColor: string;
  orientation: 'white' | 'black'; // Whose perspective is the board?
  capturedBy: 'white' | 'black'; // Who captured it?
  onComplete: () => void;
};

const pieceNames: Record<string, string> = {
  P: 'Pawn',
  N: 'Horse',
  B: 'Bishop',
  R: 'Rook',
  Q: 'Queen',
  K: 'King'
};

export default function FlyingPiece({ startSquare, pieceType, pieceColor, orientation, capturedBy, onComplete }: FlyingPieceProps) {
  const [startPos, setStartPos] = useState<{ x: number, y: number, width: number } | null>(null);
  const [endPos, setEndPos] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const squareEl = document.querySelector(`[data-square="${startSquare}"]`);
    
    // Determine the target panel based on who captured it and orientation
    const targetPanelSelector = (orientation === capturedBy) ? '.right-captured' : '.left-captured';
    const targetEl = document.querySelector(targetPanelSelector);

    if (squareEl && targetEl) {
      const squareRect = squareEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      
      setStartPos({
        x: squareRect.left,
        y: squareRect.top,
        width: squareRect.width
      });

      // Fly to the bottom center of the respective panel
      setEndPos({
        x: targetRect.left + targetRect.width / 2 - 25,
        y: targetRect.bottom - 50
      });
    } else {
      // If we can't find elements, just abort
      onComplete();
    }
  }, [startSquare, orientation, capturedBy]);

  if (!startPos || !endPos) return null;

  const src = `/asserts/Black${pieceNames[pieceType]}.png`;
  const filterBase = pieceColor === 'w' 
    ? 'brightness(0) invert(1) drop-shadow(1px 0px 0px #000) drop-shadow(0px 1px 0px #000) drop-shadow(-1px 0px 0px #000) drop-shadow(0px -1px 0px #000)'
    : 'drop-shadow(1px 0px 0px rgba(255,255,255,0.5)) drop-shadow(0px 1px 0px rgba(255,255,255,0.5)) drop-shadow(-1px 0px 0px rgba(255,255,255,0.5)) drop-shadow(0px -1px 0px rgba(255,255,255,0.5))';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ 
          x: startPos.x, 
          y: startPos.y, 
          scale: 1, 
          opacity: 1,
          rotate: 0,
        }}
        animate={{ 
          x: endPos.x, 
          y: endPos.y, 
          scale: 0.6, 
          opacity: 0.2,
          rotate: capturedBy === 'white' ? 180 : -180,
        }}
        transition={{ 
          duration: 0.6, 
          ease: "easeInOut",
          type: "spring",
          stiffness: 80,
          damping: 12
        }}
        onAnimationComplete={onComplete}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: startPos.width,
          height: startPos.width,
          zIndex: 99999,
          pointerEvents: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <img 
          src={src} 
          style={{ width: '90%', height: '90%', objectFit: 'contain', filter: `${filterBase} drop-shadow(0px 15px 15px rgba(0,0,0,0.8))` }} 
        />
      </motion.div>
    </AnimatePresence>
  );
}
