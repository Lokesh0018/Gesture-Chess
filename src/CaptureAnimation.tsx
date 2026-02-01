import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { vfx } from './vfx-manager';
import Piece from './Piece';

type CaptureProps = {
  targetSquare: string;
  pieceType: 'P' | 'N' | 'B' | 'R' | 'Q' | 'K';
  pieceColor: 'w' | 'b';
  orientation: 'white' | 'black';
  boardElement: HTMLElement;
  onComplete: () => void;
};

export default function CaptureAnimation({
  targetSquare, pieceType, pieceColor, orientation, boardElement, onComplete
}: CaptureProps) {
  const [pos, setPos] = useState({ x: 0, y: 0, size: 0 });
  const controls = useAnimation();

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
      await controls.start({
        scale: 0.95,
        opacity: 0,
        filter: 'blur(2px)',
        transition: { duration: 0.5, ease: "easeOut" }
      });
      onComplete();
    };
    sequence();
  }, [pos, targetSquare, orientation, boardElement, pieceColor, controls, onComplete]);

  if (pos.size === 0) return null;

  const particles = Array.from({ length: 15 }).map((_, i) => {
    const angle = (Math.PI * 2 * i) / 15;
    const distance = pos.size * 0.8;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    return { id: i, dx, dy };
  });

  return (
    <>
    <motion.div
      initial={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
      animate={controls}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: pos.size,
        height: pos.size,
        pointerEvents: 'none',
        zIndex: 9998,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Piece type={pieceType} color={pieceColor} squareWidth={pos.size} />
    </motion.div>
    {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, x: pos.x + pos.size / 2, y: pos.y + pos.size / 2, scale: 1 }}
          animate={{ opacity: 0, x: pos.x + pos.size / 2 + p.dx, y: pos.y + pos.size / 2 + p.dy, scale: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: 'fixed',
            width: pos.size * 0.15,
            height: pos.size * 0.15,
            backgroundColor: pieceColor === 'w' ? '#f8fafc' : '#0f172a',
            boxShadow: `0 0 10px ${pieceColor === 'w' ? '#f8fafc' : '#0f172a'}`,
            borderRadius: '50%',
            pointerEvents: 'none',
            zIndex: 9999
          }}
        />
    ))}
    </>
  );
}
