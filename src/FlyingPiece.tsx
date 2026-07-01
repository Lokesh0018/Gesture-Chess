import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type FlyingPieceProps = {
  startSquare: string;
  pieceType: string;
  pieceColor: string;
  orientation: 'white' | 'black'; // Whose perspective is the board?
  targetSquare?: string;
  capturedBy?: 'white' | 'black'; // Who captured it? Optional for undo
  isUndo?: boolean;
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

export default function FlyingPiece({ startSquare, targetSquare, pieceType, pieceColor, orientation, capturedBy, isUndo, onComplete }: FlyingPieceProps) {
  const [startPos, setStartPos] = useState<{ x: number, y: number, width: number } | null>(null);
  const [endPos, setEndPos] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const squareEl = document.querySelector(`[data-square="${startSquare}"]`);

    if (targetSquare) {
      const boardRect = document.querySelector('.react-board-wrapper')?.getBoundingClientRect();
      if (squareEl && tEl && boardRect) {
        const squareRect = squareEl.getBoundingClientRect();
        const targetRect = tEl.getBoundingClientRect();
        setStartPos({ x: squareRect.left - boardRect.left, y: squareRect.top - boardRect.top, width: squareRect.width });
        setEndPos({ x: targetRect.left - boardRect.left, y: targetRect.top - boardRect.top });
      } else {
        onComplete();
      }
      return;
    }

    // Determine the target panel based on who captured it and orientation
    const targetPanelSelector = (orientation === capturedBy) ? '.right-captured' : '.left-captured';
    const targetEl = document.querySelector(targetPanelSelector);

    if (squareEl && targetEl) {
      const squareRect = squareEl.getBoundingClientRect();
      const targetRect = targetEl.getBoundingClientRect();
      const boardRect = document.querySelector('.react-board-wrapper')?.getBoundingClientRect() || squareRect;

      setStartPos({
        x: squareRect.left - boardRect.left,
        y: squareRect.top - boardRect.top,
        width: squareRect.width
      });

      // targetRect is relative to viewport, but we need it relative to boardElement
      // So subtract boardRect.left and boardRect.top
      setEndPos({
        x: targetRect.left + targetRect.width / 2 - 25 - boardRect.left,
        y: targetRect.bottom - 50 - boardRect.top
      });
    } else {
      // If we can't find elements, just abort
      onComplete();
    }
  }, [startSquare, targetSquare, orientation, capturedBy]);

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
          scale: isUndo ? 1 : 0.6,
          opacity: isUndo ? 0 : 0.2,
          rotate: isUndo ? 0 : (capturedBy === 'white' ? 180 : -180),
          filter: isUndo ? 'sepia(100%) hue-rotate(90deg) saturate(300%) blur(2px)' : 'none'
        }}
        transition={{
          duration: isUndo ? 0.2 : 0.6,
          ease: isUndo ? "easeIn" : "easeInOut",
          type: isUndo ? "tween" : "spring",
          stiffness: 80,
          damping: 12
        }}
        onAnimationComplete={onComplete}
        style={{
          position: 'absolute',
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
