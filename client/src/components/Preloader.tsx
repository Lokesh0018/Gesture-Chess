import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChessQueen } from 'lucide-react';
import './Preloader.css';

// ─── Default loading messages ─────────────────────────────
const DEFAULT_LOADING_TEXTS = [
  "Initializing GestureChess",
  "Loading AI Hand Tracking...",
  "Calibrating Chess Engine...",
  "Preparing Gesture Detection...",
  "Almost Ready..."
];

interface PreloaderProps {
  /** Called when the preloader completes (timed mode). Omit for indefinite mode (Suspense fallback). */
  onComplete?: () => void;
  /** How long (ms) before onComplete fires. Default: 4000 */
  duration?: number;
  /** Custom array of cycling status texts */
  loadingTexts?: string[];
  /** Interval (ms) between cycling texts. Default: 800 */
  textInterval?: number;
}

/**
 * A premium, animated preloading screen featuring:
 * - Chess queen SVG with a glowing outline trace animation
 * - Floating ambient particles
 * - Cycling status messages
 *
 * **Usage modes:**
 * 1. **Timed** (Landing page style) — Pass `onComplete` to auto-dismiss after `duration` ms.
 * 2. **Indefinite** (Suspense fallback) — Omit `onComplete`; shows until unmounted.
 */
export function Preloader({
  onComplete,
  duration = 4000,
  loadingTexts = DEFAULT_LOADING_TEXTS,
  textInterval = 800,
}: PreloaderProps) {
  const [textIndex, setTextIndex] = useState(0);

  const stableOnComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % loadingTexts.length);
    }, textInterval);

    let timer: ReturnType<typeof setTimeout> | undefined;
    if (onComplete) {
      timer = setTimeout(() => {
        stableOnComplete();
      }, duration);
    }

    return () => {
      clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [stableOnComplete, duration, loadingTexts.length, textInterval, onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="preloader-overlay"
    >
      {/* Floating particles */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.4, pointerEvents: 'none' }}>
        <div className="preloader-particle-1" />
        <div className="preloader-particle-2" />
        <div className="preloader-particle-3" />
        <div className="preloader-particle-4" />
      </div>

      {/* Centerpiece — floating chess queen */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: 'relative', zIndex: 10, width: 160, height: 160, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        <div className="preloader-icon-container">
          {/* Ambient glow */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="preloader-glow"
          />

          {/* Base queen shape (faded) */}
          <ChessQueen
            className="preloader-icon-base"
            strokeWidth={1.5}
            style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" }}
          />

          {/* Tracing outline */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="preloader-icon-trace preloader-trace-path"
            style={{ filter: "drop-shadow(0 0 12px #60A5FA) drop-shadow(0 0 24px #3B82F6)" }}
          >
            <path
              pathLength={1}
              d="M4 20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z M12.474 5.943 l 1.567 5.34 a 1 1 0 0 0 1.75 0.328 l 2.616 -3.402 M20 9 l -3 9 M5.594 8.209 l 2.615 3.403 a 1 1 0 0 0 1.75 -0.329 l 1.567 -5.34 M7 18 L4 9 M 10 4 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 18 7 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 2 7 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0"
            />
          </svg>
        </div>
      </motion.div>

      {/* Cycling loading text */}
      <div className="preloader-text-area">
        <AnimatePresence mode="wait">
          <motion.div
            key={textIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="preloader-text"
          >
            {loadingTexts[textIndex]}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default Preloader;
