import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { audio } from './audio-manager';

type PostGameModalProps = {
  isOpen: boolean;
  winnerTitle: string;
  totalMoves: number;
  materialAdvantage: number;
  onRematch?: () => void;
};

export default function PostGameModal({ isOpen, winnerTitle, totalMoves, materialAdvantage, onRematch }: PostGameModalProps) {
  
  useEffect(() => {
    if (isOpen) {
      audio.playBassDrop();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
        animate={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
        exit={{ backgroundColor: 'rgba(0, 0, 0, 0)' }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          backdropFilter: 'blur(12px)',
          display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999,
          overflow: 'hidden'
        }}
      >
        {/* Cinematic Shockwave */}
        <motion.div 
          initial={{ scale: 0, opacity: 1, borderWidth: '10px' }}
          animate={{ scale: 3, opacity: 0, borderWidth: '1px' }}
          transition={{ duration: 2, ease: "easeOut" }}
          style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', border: 'solid rgba(255,255,255,0.8)', pointerEvents: 'none' }}
        />
        
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.8, rotateX: 20 }}
          animate={{ y: 0, opacity: 1, scale: 1, rotateX: 0 }}
          exit={{ y: 100, opacity: 0, scale: 0.8, rotateX: -20 }}
          transition={{ type: "spring", bounce: 0.5, duration: 1.2, delay: 0.2 }}
          className="glass-panel"
          style={{ 
            padding: '50px 40px', width: '450px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '24px', 
            border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 0 40px rgba(255,255,255,0.05)',
            perspective: '1000px'
          }}
        >
          <motion.h2 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            style={{ margin: 0, fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', textShadow: '0 0 20px rgba(255, 255, 255, 0.4)' }}
          >
            {winnerTitle}
          </motion.h2>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}
          >
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Total Moves</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{totalMoves}</div>
            </div>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Advantage</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>+{Math.abs(materialAdvantage)}</div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            style={{ display: 'flex', gap: '12px', marginTop: '20px' }}
          >
            {onRematch && (
              <button className="menu-btn" style={{ flex: 1, padding: '16px 0', fontSize: '1.1rem' }} onClick={onRematch}>Rematch</button>
            )}
            <Link to="/" className="menu-btn secondary" style={{ flex: 1, padding: '16px 0', fontSize: '1.1rem' }}>Lobby</Link>
          </motion.div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
