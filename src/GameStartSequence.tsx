import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audio } from './audio-manager';

export default function GameStartSequence() {
  const [isVisible, setIsVisible] = useState(true);
  const [showText, setShowText] = useState(false);

  useEffect(() => {
    // Initial delay before sequence starts
    const t1 = setTimeout(() => {
      setShowText(true);
      // Play a quick succession of thuds to simulate pieces falling
      let count = 0;
      const interval = setInterval(() => {
        audio.playThud();
        count++;
        if (count > 5) clearInterval(interval);
      }, 80);
    }, 300);

    // Fade out sequence
    const t2 = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ backgroundColor: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(0px)' }}
          animate={{ backgroundColor: 'rgba(0, 0, 0, 0)', backdropFilter: 'blur(0px)' }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            display: 'flex', justifyContent: 'center', alignItems: 'center',
            zIndex: 99999, pointerEvents: 'none'
          }}
        >
          <AnimatePresence>
            {showText && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 1.1, opacity: 0, filter: 'blur(10px)' }}
                transition={{ type: 'spring', damping: 15, stiffness: 150 }}
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  backdropFilter: 'blur(20px)',
                  padding: '30px 60px',
                  borderRadius: '24px',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5), inset 0 0 20px rgba(16, 185, 129, 0.1)'
                }}
              >
                <h1
                  style={{
                    color: 'var(--text-main)',
                    fontSize: '4rem',
                    fontWeight: 800,
                    margin: 0,
                    letterSpacing: '8px',
                    textTransform: 'uppercase',
                    textAlign: 'center'
                  }}
                >
                  GAME <span style={{ color: 'var(--accent)' }}>START</span>
                </h1>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
