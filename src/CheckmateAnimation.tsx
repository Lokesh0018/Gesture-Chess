import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import Piece from './Piece';

type CheckmateProps = {
  defeatedKingSquare: string;
  winningKingSquare: string;
  defeatedColor: 'w' | 'b';
  orientation: 'white' | 'black';
  boardElement: HTMLElement;
  text: string;
  onComplete: () => void;
};

export default function CheckmateAnimation({
  defeatedKingSquare, winningKingSquare, defeatedColor, orientation, boardElement, text, onComplete
}: CheckmateProps) {
  const [defKingPos, setDefKingPos] = useState({ x: 0, y: 0, size: 0 });
  const [winKingPos, setWinKingPos] = useState({ x: 0, y: 0, size: 0 });
  
  const defKingControls = useAnimation();
  const overlayControls = useAnimation();
  const textControls = useAnimation();
  const winKingControls = useAnimation();

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

    setDefKingPos(getPos(defeatedKingSquare));
    setWinKingPos(getPos(winningKingSquare));
  }, [defeatedKingSquare, winningKingSquare, orientation, boardElement]);

  useEffect(() => {
    if (defKingPos.size === 0) return;

    const sequence = async () => {
      // Stage 1: Board darkens
      overlayControls.start({ opacity: 0.5, transition: { duration: 1 } });
      
      // Stage 2: Defeated king pauses
      await new Promise(r => setTimeout(r, 800));

      // Stage 3: King tilts and falls
      defKingControls.start({
        rotateZ: 85,
        y: defKingPos.size * 0.2, // Fall down slightly
        transition: { duration: 0.8, ease: "easeIn" }
      });

      // Stage 4: Winning king gold outline
      winKingControls.start({
        boxShadow: 'inset 0 0 30px rgba(255,215,0,0.8)',
        transition: { duration: 1 }
      });

      // Stage 5: "Checkmate" overlay appears
      await new Promise(r => setTimeout(r, 600));
      await textControls.start({ opacity: 1, y: 0, transition: { duration: 1, ease: 'easeOut' } });

      // Hold
      await new Promise(r => setTimeout(r, 3000));

      // Stage 6: Return to normal (optional, or just let it stay)
      await overlayControls.start({ opacity: 0, transition: { duration: 1 } });
      
      onComplete();
    };
    sequence();
  }, [defKingPos, overlayControls, defKingControls, textControls, winKingControls, onComplete]);

  if (defKingPos.size === 0) return null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={overlayControls}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'black', pointerEvents: 'none', zIndex: 9990
        }}
      />
      
      <motion.div
        initial={{ boxShadow: 'inset 0 0 0px rgba(255,215,0,0)' }}
        animate={winKingControls}
        style={{
          position: 'fixed', left: winKingPos.x, top: winKingPos.y, width: winKingPos.size, height: winKingPos.size,
          pointerEvents: 'none', zIndex: 9991, borderRadius: '8px'
        }}
      />

      <motion.div
        initial={{ rotateZ: 0, y: 0, originX: 0.5, originY: 1 }}
        animate={defKingControls}
        style={{
          position: 'fixed', left: defKingPos.x, top: defKingPos.y, width: defKingPos.size, height: defKingPos.size,
          pointerEvents: 'none', zIndex: 9992
        }}
      >
        <Piece type="K" color={defeatedColor} squareWidth={defKingPos.size} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={textControls}
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          color: '#f0d9b5', fontSize: '4rem', fontFamily: 'serif', letterSpacing: '8px',
          textShadow: '0px 4px 15px rgba(0,0,0,0.8)', zIndex: 9995, pointerEvents: 'none',
          textAlign: 'center', whiteSpace: 'nowrap'
        }}
      >
        {text}
      </motion.div>
    </>
  );
}
