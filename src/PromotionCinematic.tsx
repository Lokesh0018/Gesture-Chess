import React, { useEffect, useState } from 'react';
import { motion, useAnimation, animate } from 'framer-motion';
import { vfx } from './vfx-manager';

type CinematicProps = {
  targetSquare: string;
  color: 'w' | 'b';
  promotionType: 'q' | 'r' | 'b' | 'n';
  orientation: 'white' | 'black';
  boardElement: HTMLElement;
  onComplete: () => void;
};

const pieceNames = {
  P: 'Pawn', N: 'Horse', B: 'Bishop', R: 'Rook', Q: 'Queen', K: 'King'
};

export default function PromotionCinematic({
  targetSquare, color, promotionType, orientation, boardElement, onComplete
}: CinematicProps) {
  const [pos, setPos] = useState({ x: 0, y: 0, size: 0 });
  const [morphProgress, setMorphProgress] = useState(0);
  const containerControls = useAnimation();

  useEffect(() => {
    const boardRect = boardElement.getBoundingClientRect();
    const squareSize = boardRect.width / 8;
    const file = targetSquare.charCodeAt(0) - 97;
    const rank = parseInt(targetSquare[1]) - 1;
    const i = orientation === 'white' ? 7 - rank : rank;
    const j = orientation === 'white' ? file : 7 - file;
    setPos({
      x: boardRect.left + j * squareSize,
      y: boardRect.top + i * squareSize,
      size: squareSize
    });
  }, [targetSquare, orientation, boardElement]);

  useEffect(() => {
    if (pos.size === 0) return;

    const sequence = async () => {
      vfx.triggerFromSquare('classicalDust', targetSquare, orientation, boardElement);

      // Phase 1: Scale up to 1.25, golden shadow
      containerControls.start({
        scale: 1.25,
        filter: 'drop-shadow(0px 0px 15px rgba(255,215,0,0.6))',
        transition: { duration: 0.3, ease: 'easeOut' }
      });

      // Phase 2: Crossfade images
      await animate(0, 1, {
        duration: 0.6,
        ease: "easeInOut",
        onUpdate: (v) => setMorphProgress(v)
      });

      // Phase 3: Settle and bounce
      await containerControls.start({
        scale: 1,
        filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))',
        transition: { type: 'spring', stiffness: 300, damping: 15 }
      });

      onComplete();
    };

    sequence();
  }, [pos, targetSquare, orientation, boardElement, promotionType, containerControls, onComplete]);

  if (pos.size === 0) return null;

  const colorPrefix = color === 'w' ? 'White' : 'Black';
  const targetType = promotionType.toUpperCase() as 'Q'|'R'|'B'|'N';
  
  const pawnSrc = `/asserts/${colorPrefix}Pawn.png`;
  const targetSrc = `/asserts/${colorPrefix}${pieceNames[targetType]}.png`;

  return (
    <motion.div
      initial={{ scale: 1, filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.3))' }}
      animate={containerControls}
      style={{
        position: 'fixed', left: pos.x, top: pos.y, width: pos.size, height: pos.size,
        pointerEvents: 'none', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center',
      }}
    >
      <img
        src={pawnSrc}
        width={pos.size}
        height={pos.size}
        style={{ position: 'absolute', opacity: 1 - morphProgress }}
      />
      <img
        src={targetSrc}
        width={pos.size}
        height={pos.size}
        style={{ position: 'absolute', opacity: morphProgress }}
      />
    </motion.div>
  );
}
