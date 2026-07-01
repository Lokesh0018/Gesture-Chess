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
      x: j * squareSize,
      y: i * squareSize,
      size: squareSize
    });
  }, [targetSquare, orientation, boardElement]);

  useEffect(() => {
    if (pos.size === 0) return;

    const sequence = async () => {
      await controls.start({
        scale: [1, 1.2, 0],
        opacity: [1, 1, 0],
        filter: ['blur(0px) brightness(1)', 'blur(0px) brightness(2)', 'blur(4px) brightness(0)'],
        transition: { duration: 0.4, times: [0, 0.3, 1], ease: "easeInOut" }
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
        <motion.div
          initial={{ scale: 0, opacity: 1, borderWidth: '2px' }}
          animate={{ scale: [0, 2, 4], opacity: [1, 0.8, 0], borderWidth: ['10px', '2px', '0px'] }}
          transition={{ duration: pieceType === 'K' ? 1.0 : 0.6, ease: "easeOut" }}
          style={{
            position: 'absolute',
            width: '100%', height: '100%',
            borderRadius: '50%',
            borderColor: pieceType === 'K' ? '#fbbf24' : 'rgba(255, 255, 255, 0.8)',
            borderStyle: 'solid',
            boxShadow: pieceType === 'K' ? '0 0 40px #fbbf24, inset 0 0 20px #fbbf24' : '0 0 20px rgba(255, 255, 255, 0.8)',
            boxSizing: 'border-box'
          }}
        />

        {/* Holy Strike Beam (Bishop) */}
        {pieceType === 'B' && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: ['0%', '300%', '300%'], opacity: [0, 1, 0] }}
            transition={{ duration: 0.5, times: [0, 0.3, 1], ease: 'easeOut' }}
            style={{
              position: 'absolute',
              width: '40px',
              background: 'linear-gradient(to bottom, rgba(255,255,255,0), #fff, #a855f7, rgba(255,255,255,0))',
              boxShadow: '0 0 30px #a855f7',
              transform: 'rotate(45deg) translateY(-50%)',
              transformOrigin: 'top center',
              zIndex: 10
            }}
          />
        )}

        {/* Cavalry Charge Slash (Knight) */}
        {pieceType === 'N' && (
          <motion.div
            initial={{ width: 0, opacity: 1, rotate: -30 }}
            animate={{ width: '200%', opacity: 0, rotate: -20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              height: '8px',
              background: '#fff',
              boxShadow: '0 0 20px #fff, 0 0 40px #38bdf8',
              borderRadius: '4px',
              zIndex: 10
            }}
          />
        )}
      </motion.div>
      <motion.div
        initial={{ opacity: 0.8, scale: 0 }}
        animate={{ opacity: 0, scale: 2.5 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          position: 'fixed',
          left: pos.x,
          top: pos.y,
          width: pos.size,
          height: pos.size,
          borderRadius: '50%',
          border: `3px solid ${pieceColor === 'w' ? '#f8fafc' : '#0f172a'}`,
          boxShadow: `0 0 15px ${pieceColor === 'w' ? '#f8fafc' : '#0f172a'}`,
          pointerEvents: 'none',
          zIndex: 9997,
        }}
      />
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
