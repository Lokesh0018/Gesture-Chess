import React from 'react';
import { Chessboard } from 'react-chessboard';
import { motion, MotionValue, useTransform } from 'framer-motion';

interface AnimatedChessboardProps {
  fen: string;
  customArrows: any[];
  shockwave: boolean;
  mouseX?: MotionValue<number>;
  mouseY?: MotionValue<number>;
}

export const AnimatedChessboard: React.FC<AnimatedChessboardProps> = ({
  fen,
  customArrows,
  shockwave,
  mouseX,
  mouseY
}) => {
  const fallbackX = new MotionValue(0);
  const fallbackY = new MotionValue(0);

  const mX = mouseX || fallbackX;
  const mY = mouseY || fallbackY;

  const rotateX = useTransform(mY, [-1, 1], [30, 10]); // Enhanced deep tilt
  const rotateY = useTransform(mX, [-1, 1], [-18, 18]); // Enhanced horizontal tilt

  return (
    <motion.div
      className="relative w-full aspect-square max-w-[500px] mx-auto z-10 perspective-[1400px]"
      animate={{ y: [0, -25, 0] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Deep volumetric background glow strictly confined to board */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[#3B82F6]/20 blur-[100px] rounded-full -z-10 pointer-events-none" />

      {/* Moving floor shadow */}
      <motion.div
        className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-[95%] h-20 bg-[#000000]/80 blur-[40px] rounded-[100%]"
        style={{ x: useTransform(mX, [-1, 1], [-40, 40]) }}
      />

      <motion.div
        className="w-full h-full rounded-2xl overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.9),inset_0_0_0_1px_rgba(59,130,246,0.3)] relative bg-[#0F172A]"
        style={{
          rotateX,
          rotateY,
          scale: 0.95,
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Blue rim lighting overlay */}
        <div className="absolute inset-0 border-t-2 border-[#60A5FA]/40 rounded-2xl pointer-events-none z-20" />

        <Chessboard
          id="LandingAnimatedBoard"
          position={fen}
          customArrows={customArrows}
          customBoardStyle={{
            borderRadius: '16px',
            boxShadow: 'inset 0 0 40px rgba(0,0,0,0.9)'
          }}
          customDarkSquareStyle={{ backgroundColor: '#1B2433' }}
          customLightSquareStyle={{ backgroundColor: '#CBD5E1' }}
          animationDuration={500} // Smooth easing
          arePiecesDraggable={false}
        />

        {/* Interaction Glow when piece is highlighted */}
        {customArrows.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 bg-[#38BDF8]/10 pointer-events-none mix-blend-screen z-10"
          />
        )}

        {/* Impact Shockwave on piece landing */}
        {shockwave && (
          <motion.div
            initial={{ opacity: 1, scale: 0.1 }}
            animate={{ opacity: 0, scale: 2.5 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] border-[3px] border-[#38BDF8]/60 rounded-full pointer-events-none z-10"
          />
        )}
      </motion.div>
    </motion.div>
  );
};
