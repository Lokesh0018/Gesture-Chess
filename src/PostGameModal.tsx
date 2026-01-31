import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

type PostGameModalProps = {
  isOpen: boolean;
  winnerTitle: string;
  totalMoves: number;
  materialAdvantage: number;
  onRematch?: () => void;
};

export default function PostGameModal({ isOpen, winnerTitle, totalMoves, materialAdvantage, onRematch }: PostGameModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 99999
      }}>
        <motion.div
          initial={{ y: -50, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.9 }}
          transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
          className="glass-panel"
          style={{ padding: '40px', width: '400px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', border: '1px solid var(--accent)' }}
        >
          <h2 style={{ margin: 0, fontSize: '2.5rem', color: 'var(--accent)', textShadow: '0 0 10px rgba(16, 185, 129, 0.5)' }}>
            {winnerTitle}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Total Moves</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{totalMoves}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '15px', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Advantage</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>+{Math.abs(materialAdvantage)}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            {onRematch && (
              <button className="menu-btn" style={{ flex: 1, padding: '15px 0' }} onClick={onRematch}>Rematch</button>
            )}
            <Link to="/" className="menu-btn secondary" style={{ flex: 1, padding: '15px 0' }}>Lobby</Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
