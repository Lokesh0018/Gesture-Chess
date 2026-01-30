import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type CheckProps = {
  kingSquare: string;
  attackerSquare: string | null;
  orientation: 'white' | 'black';
  boardElement: HTMLElement;
};

export default function CheckIndicator({ kingSquare, attackerSquare, orientation, boardElement }: CheckProps) {
  const [kingPos, setKingPos] = useState({ x: 0, y: 0, size: 0 });
  const [attackerPos, setAttackerPos] = useState({ x: 0, y: 0, size: 0 });

  useEffect(() => {
    const boardRect = boardElement.getBoundingClientRect();
    const squareSize = boardRect.width / 8;

    const getPos = (sq: string) => {
      const file = sq.charCodeAt(0) - 97;
      const rank = parseInt(sq[1]) - 1;
      const i = orientation === 'white' ? 7 - rank : rank;
      const j = orientation === 'white' ? file : 7 - file;
      return { x: boardRect.left + j * squareSize, y: boardRect.top + i * squareSize, size: squareSize };
    };

    if (kingSquare) setKingPos(getPos(kingSquare));
    if (attackerSquare) setAttackerPos(getPos(attackerSquare));

  }, [kingSquare, attackerSquare, orientation, boardElement]);

  if (kingPos.size === 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.05, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          left: kingPos.x,
          top: kingPos.y,
          width: kingPos.size,
          height: kingPos.size,
          pointerEvents: 'none',
          zIndex: 9997,
          background: 'radial-gradient(circle, rgba(220, 20, 60, 0.6) 0%, rgba(220, 20, 60, 0) 70%)',
          borderRadius: '50%',
        }}
      />
      <div style={{
        position: 'fixed',
        left: kingPos.x,
        top: kingPos.y,
        width: kingPos.size,
        height: kingPos.size,
        pointerEvents: 'none',
        zIndex: 9996,
        boxShadow: 'inset 0 0 20px rgba(220,20,60,0.8)',
      }} />

      {attackerSquare && attackerPos.size > 0 && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
          style={{
            position: 'fixed',
            left: attackerPos.x,
            top: attackerPos.y,
            width: attackerPos.size,
            height: attackerPos.size,
            pointerEvents: 'none',
            zIndex: 9996,
            boxShadow: 'inset 0 0 25px rgba(255,215,0,1)',
          }}
        />
      )}
    </>
  );
}
