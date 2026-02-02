import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';
export type RightGesturePhase = 'idle' | 'pinch' | 'lift' | 'drag' | 'release';

interface CyberHandProps {
  phase: RightGesturePhase;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

export const RightCyberHand: React.FC<CyberHandProps> = ({ phase, mouseX, mouseY }) => {
  const xOffset = useTransform(mouseX, [-1, 1], [-20, 20]);
  const yOffset = useTransform(mouseY, [-1, 1], [-20, 20]);

  // Phase mapping for kinematics
  const armX = { idle: 0, pinch: -15, lift: -15, drag: -40, release: -40 }[phase] || 0;
  const armY = { idle: 0, pinch: -10, lift: -30, drag: -30, release: -30 }[phase] || 0;
  
  // Angled toward the board by default (e.g. -5 degrees)
  const palmRotation = { idle: -5, pinch: 15, lift: 15, drag: 15, release: -5 }[phase] || 0;

  // 5 Fingers Rotations (Right hand is mirrored horizontally)
  const thumbBase = { idle: 30, pinch: -10, lift: -10, drag: -10, release: 25 }[phase] || 0;
  const thumbMid = { idle: 20, pinch: -15, lift: -15, drag: -15, release: 15 }[phase] || 0;

  const indexBase = { idle: -30, pinch: 20, lift: 20, drag: 20, release: -10 }[phase] || 0;
  const indexMid = { idle: -20, pinch: 30, lift: 30, drag: 30, release: -5 }[phase] || 0;

  const middleBase = { idle: -10, pinch: -50, lift: -50, drag: -50, release: -20 }[phase] || 0;
  const middleMid = { idle: -15, pinch: -60, lift: -60, drag: -60, release: -30 }[phase] || 0;

  const ringBase = { idle: -20, pinch: -60, lift: -60, drag: -60, release: -30 }[phase] || 0;
  const ringMid = { idle: -25, pinch: -70, lift: -70, drag: -70, release: -40 }[phase] || 0;

  const pinkyBase = { idle: -35, pinch: -70, lift: -70, drag: -70, release: -40 }[phase] || 0;
  const pinkyMid = { idle: -40, pinch: -80, lift: -80, drag: -80, release: -50 }[phase] || 0;

  return (
    <div className="relative w-[360px] h-[360px] flex items-center justify-center pointer-events-none">
      
      {/* Translucent HUD Chips */}
      <motion.div 
        style={{ x: useTransform(mouseX, [-1, 1], [-15, 15]), y: useTransform(mouseY, [-1, 1], [-15, 15]) }}
        className="absolute top-12 -right-8 flex flex-col items-end gap-3"
      >
        <div className="flex items-center gap-2 bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/30 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.2)]">
          <span className="text-[10px] font-mono text-[#60A5FA] uppercase tracking-wider">AI Connected</span>
          <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }} className="w-1.5 h-1.5 rounded-full bg-[#38BDF8] shadow-[0_0_5px_#38BDF8]" />
        </div>
        <div className="flex items-center gap-2 bg-[#0F172A]/80 backdrop-blur-md border border-[#38BDF8]/30 px-3 py-1.5 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.2)] self-start">
          <span className="text-[10px] font-mono text-[#60A5FA]/80 uppercase tracking-wider">Latency: 12ms</span>
          <div className="w-1 h-1 rounded-full bg-[#38BDF8]/50" />
        </div>
      </motion.div>

      <motion.svg 
        style={{ x: xOffset, y: yOffset }}
        viewBox="0 0 400 400" 
        className="w-full h-full overflow-visible drop-shadow-[0_15px_30px_rgba(15,23,42,0.8)]"
      >
        <defs>
          <linearGradient id="metalSkeletonR" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0B132B" stopOpacity="1" />
            <stop offset="100%" stopColor="#1C2541" stopOpacity="1" />
          </linearGradient>
          <linearGradient id="energyShellR" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.6" />
          </linearGradient>
          <filter id="neonGlowR">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <motion.g animate={{ x: armX, y: armY }} transition={{ duration: 0.8, ease: "easeInOut" }}>
          
          {/* Base Forearm (Coming from right) */}
          <path d="M 400 160 L 260 170 L 260 230 L 400 240 Z" fill="url(#metalSkeletonR)" stroke="#334155" strokeWidth="2.5" />
          <path d="M 400 165 L 265 175 L 265 225 L 400 235 Z" fill="url(#energyShellR)" style={{ mixBlendMode: 'screen' }} />
          <path d="M 380 190 L 280 195 M 380 210 L 280 205" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
          
          {/* Wrist Mechanical Joint */}
          <g transform="translate(260, 200)">
            <circle cx="0" cy="0" r="30" fill="#020617" stroke="#334155" strokeWidth="3" />
            <circle cx="0" cy="0" r="22" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" filter="url(#neonGlowR)" />
            <circle cx="0" cy="0" r="10" fill="url(#metalSkeletonR)" />
            <circle cx="0" cy="0" r="4" fill="#38BDF8" filter="url(#neonGlowR)" />
            
            {/* Palm & Fingers Rig */}
            <motion.g animate={{ rotate: palmRotation }} transition={{ duration: 0.8, ease: "easeOut" }}>
              <path d="M 0 -25 L -90 -30 L -100 40 L 0 25 Z" fill="url(#metalSkeletonR)" stroke="#475569" strokeWidth="2" />
              <path d="M 0 -20 L -85 -25 L -95 35 L 0 20 Z" fill="url(#energyShellR)" style={{ mixBlendMode: 'screen' }} />
              
              {/* Palm Circuit Lines */}
              <path d="M -20 -10 L -70 -15 M -20 10 L -80 15" stroke="#38BDF8" strokeWidth="2" strokeDasharray="2 6" opacity="0.6" filter="url(#neonGlowR)" />

              {/* Thumb (Bottom Pincher) */}
              <g transform="translate(-45, 28)">
                <circle cx="0" cy="0" r="10" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
                <motion.g animate={{ rotate: thumbBase }} transition={{ duration: 0.8, ease: "easeOut" }}>
                  <path d="M 0 -8 L -30 -6 L -38 8 L 0 8 Z" fill="url(#metalSkeletonR)" stroke="#38BDF8" strokeWidth="2" />
                  <g transform="translate(-34, 0)">
                    <circle cx="0" cy="0" r="8" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" />
                    <motion.g animate={{ rotate: thumbMid }} transition={{ duration: 0.8, ease: "easeOut" }}>
                      <path d="M 0 -6 L -25 -2 L -30 6 L 0 6 Z" fill="url(#metalSkeletonR)" stroke="#38BDF8" strokeWidth="2" />
                    </motion.g>
                  </g>
                </motion.g>
              </g>

              {/* Index Finger (Top Pincher) */}
              <g transform="translate(-90, -25)">
                <circle cx="0" cy="0" r="9" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" filter="url(#neonGlowR)" />
                <motion.g animate={{ rotate: indexBase }} transition={{ duration: 0.8, ease: "easeOut" }}>
                  <path d="M 0 -7 L -45 -5 L -45 7 L 0 7 Z" fill="url(#metalSkeletonR)" stroke="#38BDF8" strokeWidth="2" />
                  <g transform="translate(-45, 1)">
                    <circle cx="0" cy="0" r="7" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" />
                    <motion.g animate={{ rotate: indexMid }} transition={{ duration: 0.8, ease: "easeOut" }}>
                      <path d="M 0 -5 L -40 -3 L -40 5 L 0 5 Z" fill="url(#metalSkeletonR)" stroke="#38BDF8" strokeWidth="2" />
                      <circle cx="-40" cy="1" r="5" fill="#38BDF8" filter="url(#neonGlowR)" />
                      {/* Pinch Glow */}
                      <motion.circle 
                        cx="-45" cy="1" r="10" fill="#FFFFFF" filter="url(#neonGlowR)"
                        animate={{ opacity: (phase === 'pinch' || phase === 'drag') ? [0.6, 1, 0.6] : 0, scale: (phase === 'pinch' || phase === 'drag') ? [1, 1.8, 1] : 1 }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      />
                    </motion.g>
                  </g>
                </motion.g>
              </g>

              {/* Middle Finger */}
              <g transform="translate(-98, 0)">
                <circle cx="0" cy="0" r="8" fill="#1E293B" stroke="#60A5FA" strokeWidth="1.5" />
                <motion.g animate={{ rotate: middleBase }} transition={{ duration: 0.8, ease: "easeOut" }}>
                  <path d="M 0 -6 L -50 -3 L -50 5 L 0 6 Z" fill="url(#metalSkeletonR)" stroke="#475569" strokeWidth="2" />
                  <g transform="translate(-50, 1)">
                    <circle cx="0" cy="0" r="6" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
                    <motion.g animate={{ rotate: middleMid }} transition={{ duration: 0.8, ease: "easeOut" }}>
                      <path d="M 0 -5 L -42 -2 L -42 4 L 0 5 Z" fill="url(#metalSkeletonR)" stroke="#475569" strokeWidth="2" />
                    </motion.g>
                  </g>
                </motion.g>
              </g>

              {/* Ring Finger */}
              <g transform="translate(-95, 22)">
                <circle cx="0" cy="0" r="7" fill="#1E293B" stroke="#60A5FA" strokeWidth="1.5" />
                <motion.g animate={{ rotate: ringBase }} transition={{ duration: 0.8, ease: "easeOut" }}>
                  <path d="M 0 -5 L -45 -2 L -45 4 L 0 5 Z" fill="url(#metalSkeletonR)" stroke="#475569" strokeWidth="2" />
                  <g transform="translate(-45, 1)">
                    <circle cx="0" cy="0" r="5" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
                    <motion.g animate={{ rotate: ringMid }} transition={{ duration: 0.8, ease: "easeOut" }}>
                      <path d="M 0 -4 L -38 -1 L -38 3 L 0 4 Z" fill="url(#metalSkeletonR)" stroke="#475569" strokeWidth="2" />
                    </motion.g>
                  </g>
                </motion.g>
              </g>

              {/* Pinky Finger */}
              <g transform="translate(-85, 40)">
                <circle cx="0" cy="0" r="6" fill="#1E293B" stroke="#60A5FA" strokeWidth="1.5" />
                <motion.g animate={{ rotate: pinkyBase }} transition={{ duration: 0.8, ease: "easeOut" }}>
                  <path d="M 0 -4 L -35 0 L -35 4 L 0 4 Z" fill="url(#metalSkeletonR)" stroke="#475569" strokeWidth="2" />
                  <g transform="translate(-35, 2)">
                    <circle cx="0" cy="0" r="4" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
                    <motion.g animate={{ rotate: pinkyMid }} transition={{ duration: 0.8, ease: "easeOut" }}>
                      <path d="M 0 -3 L -28 0 L -28 3 L 0 3 Z" fill="url(#metalSkeletonR)" stroke="#475569" strokeWidth="2" />
                    </motion.g>
                  </g>
                </motion.g>
              </g>

            </motion.g>
          </g>
        </motion.g>
      </motion.svg>
    </div>
  );
};
