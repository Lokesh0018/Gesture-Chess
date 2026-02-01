import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BackgroundLayer() {
  const [theme, setTheme] = useState(document.body.getAttribute('data-theme') || 'midnight');

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-theme') {
          setTheme(document.body.getAttribute('data-theme') || 'midnight');
        }
      });
    });

    observer.observe(document.body, { attributes: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      zIndex: -10, pointerEvents: 'none', overflow: 'hidden',
      backgroundColor: 'var(--bg-main, #0f172a)'
    }}>
      <AnimatePresence>
        {theme === 'midnight' && (
          <motion.div
            key="midnight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
          >
            {/* Drifting Aurora Orbs */}
            <motion.div
              animate={{
                x: [0, 100, -50, 0],
                y: [0, -50, 100, 0],
                scale: [1, 1.2, 0.9, 1],
              }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vh',
                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)',
                filter: 'blur(60px)', borderRadius: '50%'
              }}
            />
            <motion.div
              animate={{
                x: [0, -100, 50, 0],
                y: [0, 100, -50, 0],
                scale: [1, 0.8, 1.1, 1],
              }}
              transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
              style={{
                position: 'absolute', bottom: '-10%', right: '-10%', width: '60vw', height: '60vh',
                background: 'radial-gradient(circle, rgba(56, 189, 248, 0.1) 0%, transparent 70%)',
                filter: 'blur(80px)', borderRadius: '50%'
              }}
            />
          </motion.div>
        )}

        {theme === 'cyber' && (
          <motion.div
            key="cyber"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{ width: '100%', height: '100%', position: 'absolute' }}
          >
            {/* Synthwave Grid */}
            <div className="cyber-grid" />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Dynamic Overlay for Check/Low Time is handled by CSS classes on body */}
      <div className="state-overlay" />
    </div>
  );
}
