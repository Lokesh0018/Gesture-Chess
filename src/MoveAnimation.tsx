import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MoveAnimationProps = {
  startSquare: string;
  targetSquare: string;
  pieceType: string;
  pieceColor: string;
  orientation: 'white' | 'black';
  boardElement: HTMLElement;
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

export default function MoveAnimation({
  startSquare,
  targetSquare,
  pieceType,
  pieceColor,
  orientation,
  boardElement,
  onComplete
}: MoveAnimationProps) {
  const [startPos, setStartPos] = useState<{ x: number, y: number, width: number } | null>(null);
  const [endPos, setEndPos] = useState<{ x: number, y: number } | null>(null);

  useEffect(() => {
    const boardRect = boardElement.getBoundingClientRect();
    const squareSize = boardRect.width / 8;

    const getCoords = (sq: string) => {
      const file = sq.charCodeAt(0) - 97;
      const rank = parseInt(sq[1]) - 1;
      const i = orientation === 'white' ? 7 - rank : rank;
      const j = orientation === 'white' ? file : 7 - file;
      return {
        x: j * squareSize, // absolute positioning relative to .react-board-wrapper
        y: i * squareSize
      };
    };

    setStartPos({ ...getCoords(startSquare), width: squareSize });
    setEndPos(getCoords(targetSquare));

  }, [startSquare, targetSquare, orientation, boardElement]);

  if (!startPos || !endPos) return null;

  const src = `/asserts/${pieceColor === 'w' ? 'White' : 'Black'}${pieceNames[pieceType]}.png`;
  
  // Calculate distance
  const dx = endPos.x - startPos.x;
  const dy = endPos.y - startPos.y;

  // Render piece specific animation
  if (pieceType === 'Q') {
    // Royal Execution: Teleporting
    return (
      <>
        <style>{`[data-piece-square="${targetSquare}"] { opacity: 0 !important; }`}</style>
        <AnimatePresence>
          {/* Trail 1 */}
        <motion.img src={src}
          initial={{ x: startPos.x + dx * 0.3, y: startPos.y + dy * 0.3, opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.4, 0], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{ position: 'absolute', width: startPos.width, height: startPos.width, zIndex: 999, filter: 'blur(2px)' }} />
        {/* Trail 2 */}
        <motion.img src={src}
          initial={{ x: startPos.x + dx * 0.6, y: startPos.y + dy * 0.6, opacity: 0, scale: 0.8 }}
          animate={{ opacity: [0, 0.6, 0], scale: [0.8, 1, 0.8] }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{ position: 'absolute', width: startPos.width, height: startPos.width, zIndex: 999, filter: 'blur(2px)' }} />
        {/* Main Queen */}
        <motion.img src={src}
          initial={{ x: startPos.x, y: startPos.y, opacity: 1 }}
          animate={{ 
            x: [startPos.x, startPos.x + dx * 0.3, startPos.x + dx * 0.6, endPos.x], 
            y: [startPos.y, startPos.y + dy * 0.3, startPos.y + dy * 0.6, endPos.y],
            opacity: [1, 0, 1, 0, 1] 
          }}
          transition={{ duration: 0.5, times: [0, 0.2, 0.4, 0.6, 1], ease: 'linear' }}
          onAnimationComplete={onComplete}
          style={{ position: 'absolute', width: startPos.width, height: startPos.width, zIndex: 1000 }} />
        </AnimatePresence>
      </>
    );
  }

  let animation: any = { x: endPos.x, y: endPos.y };
  let transition: any = { duration: 0.3, ease: 'easeInOut' };
  let initialStyle: any = {};

  if (pieceType === 'N') {
    // Cavalry Charge
    animation = {
      x: [startPos.x, startPos.x + dx / 2, endPos.x],
      y: [startPos.y, startPos.y + dy / 2 - 60, endPos.y],
      scale: [1, 1.4, 1],
    };
    transition = { duration: 0.5, times: [0, 0.5, 1], ease: 'easeInOut' };
  } else if (pieceType === 'R') {
    // Castle Crush
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    animation = {
      x: endPos.x, y: endPos.y,
      scaleX: [1, 1.5, 1], scaleY: [1, 0.8, 1],
    };
    initialStyle.rotate = angle;
    transition = { duration: 0.2, times: [0, 0.5, 1], ease: 'circIn' };
  } else if (pieceType === 'B') {
    // Holy Strike Glide
    animation = {
      x: endPos.x, y: endPos.y,
      filter: ['drop-shadow(0 0 0px #fff)', 'drop-shadow(0 0 20px #fff)', 'drop-shadow(0 0 0px #fff)']
    };
    transition = { duration: 0.4, ease: 'backOut' };
  } else if (pieceType === 'P') {
    // Shield Bash
    animation = {
      x: [startPos.x, startPos.x - dx * 0.2, endPos.x],
      y: [startPos.y, startPos.y - dy * 0.2, endPos.y],
      scale: [1, 0.9, 1.1]
    };
    transition = { duration: 0.3, times: [0, 0.3, 1], ease: 'easeOut' };
  } else if (pieceType === 'K') {
    animation = { x: endPos.x, y: endPos.y };
    transition = { duration: 0.5, ease: 'easeInOut' };
  }

  return (
    <>
      <style>{`[data-piece-square="${targetSquare}"] { opacity: 0 !important; }`}</style>
      <AnimatePresence>
        <motion.div
        initial={{ x: startPos.x, y: startPos.y, scale: 1, rotate: initialStyle.rotate || 0 }}
        animate={animation}
        transition={transition}
        onAnimationComplete={onComplete}
        style={{
          position: 'absolute',
          top: 0, left: 0,
          width: startPos.width, height: startPos.width,
          zIndex: 99999, pointerEvents: 'none',
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}
      >
        <motion.img src={src} style={{ width: '90%', height: '90%', objectFit: 'contain' }} />
      </motion.div>
      </AnimatePresence>
    </>
  );
}
