import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { vfx } from './vfx-manager';

type CinematicProps = {
  targetSquare: string;
  color: 'w' | 'b';
  promotionType: 'q' | 'r' | 'b' | 'n';
  orientation: 'white' | 'black';
  boardElement: HTMLElement;
  onComplete: () => void;
};

export default function PromotionCinematic({
  targetSquare,
  color,
  promotionType,
  orientation,
  boardElement,
  onComplete
}: CinematicProps) {
  const [pos, setPos] = useState({ x: 0, y: 0, size: 0 });
  const containerControls = useAnimation();
  const pawnControls = useAnimation();
  const promoControls = useAnimation();

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
      // Dust starts drifting right away
      vfx.triggerFromSquare('classicalDust', targetSquare, orientation, boardElement);

      const baseFilter = color === 'w' ? 'brightness(0) invert(1)' : 'brightness(0)';
      
      // Phase 1: Solidify into silhouette and scale up (0.0s - 0.5s)
      containerControls.start({
        scale: [1, 1.3],
        filter: [
          'drop-shadow(0px 0px 0px rgba(240,230,200,0))',
          'drop-shadow(0px 0px 15px rgba(240,230,200,0.8))'
        ],
        transition: { duration: 0.5, ease: 'easeOut' }
      });
      pawnControls.start({
        filter: ['brightness(1)', baseFilter],
        transition: { duration: 0.4 }
      });

      // Phase 2: Silhouette Crossfade ("Sculpting") (0.4s - 0.9s)
      await new Promise(r => setTimeout(r, 400));
      promoControls.start({ opacity: 1, filter: baseFilter, transition: { duration: 0.5 } });
      pawnControls.start({ opacity: 0, transition: { duration: 0.5 } });

      // Phase 3: Reveal and scale down (1.0s - 1.5s)
      await new Promise(r => setTimeout(r, 600));
      containerControls.start({
        scale: 1,
        filter: 'drop-shadow(0px 0px 0px rgba(240,230,200,0))',
        transition: { duration: 0.5, ease: 'easeIn' }
      });
      await promoControls.start({
        filter: 'brightness(1)',
        transition: { duration: 0.5 }
      });

      onComplete();
    };

    sequence();
  }, [pos, targetSquare, orientation, boardElement, color, promotionType, containerControls, pawnControls, promoControls, onComplete]);

  if (pos.size === 0) return null;

  const pawnUrl = `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${color}p.png`;
  const promoUrl = `https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${color}${promotionType}.png`;

  return (
    <motion.div
      initial={{ scale: 1, filter: 'drop-shadow(0px 0px 0px rgba(240,230,200,0))' }}
      animate={containerControls}
      style={{
        position: 'fixed',
        left: pos.x,
        top: pos.y,
        width: pos.size,
        height: pos.size,
        pointerEvents: 'none',
        zIndex: 9999,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <motion.img 
        src={pawnUrl} 
        initial={{ opacity: 1, filter: 'brightness(1)' }}
        animate={pawnControls}
        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }}
      />
      <motion.img 
        src={promoUrl} 
        initial={{ opacity: 0, filter: color === 'w' ? 'brightness(0) invert(1)' : 'brightness(0)' }}
        animate={promoControls}
        style={{ position: 'absolute', width: '100%', height: '100%', objectFit: 'contain' }}
      />
    </motion.div>
  );
}
