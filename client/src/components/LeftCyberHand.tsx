import React from 'react';
import { motion, MotionValue, useTransform } from 'framer-motion';

export type GesturePhase = 'idle' | 'point';

interface CyberHandProps {
  phase: GesturePhase;
  mouseX: MotionValue<number>;
  mouseY: MotionValue<number>;
}

export const LeftCyberHand: React.FC<CyberHandProps> = ({ phase, mouseX, mouseY }) => {
  const xOffset = useTransform(mouseX, [-1, 1], [-20, 20]);
  const yOffset = useTransform(mouseY, [-1, 1], [-20, 20]);
  
  const springTransition = { type: "spring", stiffness: 40, damping: 12, mass: 1 };

  // Base translation
  const armX = { idle: 0, point: 10 }[phase] || 0;
  const armY = { idle: 0, point: -5 }[phase] || 0;
  
  // Dedicated Wrist Rotation
  const wristRotation = { idle: 0, point: -15 }[phase] || 0;
  // Palm Rotation relative to Wrist
  const palmRotation = { idle: -5, point: -5 }[phase] || 0;

  // THUMB (Angled low)
  const thumbCmc = { idle: -40, point: -45 }[phase] || 0;
  const thumbMcp = { idle: 10, point: 5 }[phase] || 0;
  const thumbIp = { idle: 5, point: 5 }[phase] || 0;

  // INDEX (Pointing finger)
  const indexMcp = { idle: 5, point: -5 }[phase] || 0;
  const indexPip = { idle: 10, point: -2 }[phase] || 0;
  const indexDip = { idle: 5, point: 0 }[phase] || 0;

  // MIDDLE
  const middleMcp = { idle: 10, point: 75 }[phase] || 0;
  const middlePip = { idle: 15, point: 85 }[phase] || 0;
  const middleDip = { idle: 10, point: 75 }[phase] || 0;

  // RING
  const ringMcp = { idle: 15, point: 85 }[phase] || 0;
  const ringPip = { idle: 20, point: 95 }[phase] || 0;
  const ringDip = { idle: 15, point: 85 }[phase] || 0;

  // PINKY
  const pinkyMcp = { idle: 25, point: 95 }[phase] || 0;
  const pinkyPip = { idle: 30, point: 105 }[phase] || 0;
  const pinkyDip = { idle: 25, point: 95 }[phase] || 0;

  const breatheRotate = phase === 'idle' ? [-3, 3, -3] : wristRotation;
  const breatheDuration = 5;

  // SCULPTED PATH GENERATOR
  // Creates a tapered trapezoid path
  const getTaperedPath = (len: number, baseW: number, tipW: number) => {
    return `M 0 ${-baseW} L ${len} ${-tipW} A ${tipW} ${tipW} 0 0 1 ${len} ${tipW} L 0 ${baseW} Z`;
  };

  const SculptedBone = ({ length, baseWidth, tipWidth }: { length: number, baseWidth: number, tipWidth: number }) => (
    <>
      {/* 1. Sculpted Titanium Core */}
      <path d={getTaperedPath(length, baseWidth, tipWidth)} fill="url(#titanium)" stroke="#0F172A" strokeWidth="1" />
      {/* Titanium Highlight */}
      <path d={getTaperedPath(length, baseWidth - 0.5, tipWidth - 0.5)} fill="none" stroke="url(#titaniumHighlight)" strokeWidth="0.5" opacity="0.6" />
      
      {/* 2. Glassmorphic Refractive Shell (Slightly larger) */}
      <path 
        d={getTaperedPath(length, baseWidth + 3, tipWidth + 2)} 
        fill="rgba(56,189,248, 0.08)" 
        stroke="#38BDF8" 
        strokeWidth="1" 
        className="mix-blend-screen"
      />
      
      {/* 3. Glowing Neural Circuit */}
      <motion.path 
        d={`M 0 0 L ${length} 0`} 
        stroke="#FFFFFF" 
        strokeWidth="1" 
        strokeLinecap="round" 
        strokeDasharray={`4 ${length * 2}`} 
        filter="url(#glowStrong)"
        animate={{ strokeDashoffset: [length * 2, -4] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="mix-blend-screen"
      />
    </>
  );

  const SculptedJoint = ({ radius }: { radius: number }) => (
    <>
      {/* Base Socket */}
      <circle cx="0" cy="0" r={radius} fill="#0F172A" stroke="#334155" strokeWidth="1" />
      
      {/* Glowing Inner Servo */}
      <circle cx="0" cy="0" r={radius * 0.6} fill="none" stroke="#38BDF8" strokeWidth="1.5" filter="url(#glowSoft)" />
      
      {/* Outer Holographic Bearing Ring */}
      <circle cx="0" cy="0" r={radius + 3} fill="none" stroke="rgba(56,189,248,0.4)" strokeWidth="0.5" />
      
      {/* Emissive Center */}
      <circle cx="0" cy="0" r="1.5" fill="#FFFFFF" filter="url(#glowStrong)" />
    </>
  );

  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center pointer-events-none">
      <motion.svg 
        style={{ x: xOffset, y: yOffset }}
        viewBox="0 0 600 600" 
        className="w-full h-full overflow-visible drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]"
      >
        <defs>
          <filter id="glowSoft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          <filter id="glowStrong" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur2" />
            <feMerge><feMergeNode in="blur2" /><feMergeNode in="blur1" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* Premium Titanium Shader */}
          <linearGradient id="titanium" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="20%" stopColor="#94A3B8" /> {/* Highlight */}
            <stop offset="50%" stopColor="#1E293B" />
            <stop offset="80%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#334155" /> {/* Rim light */}
          </linearGradient>

          <linearGradient id="titaniumHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>

          {/* Holographic Palm Gradient */}
          <linearGradient id="glassPalm" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(56,189,248, 0.15)" />
            <stop offset="50%" stopColor="rgba(56,189,248, 0.05)" />
            <stop offset="100%" stopColor="rgba(56,189,248, 0.1)" />
          </linearGradient>
        </defs>

        <motion.g animate={{ x: armX, y: armY }} transition={springTransition}>
          
          {/* ================= FOREARM ================= */}
          <g transform="translate(60, 300)">
            {/* Slim, elegant forearm connection */}
            <path d="M -100 -12 L 25 -8 L 25 8 L -100 12 Z" fill="url(#titanium)" stroke="#0F172A" strokeWidth="1" />
            <path d="M -100 -18 L 30 -14 L 30 14 L -100 18 Z" fill="rgba(56,189,248,0.05)" stroke="#38BDF8" strokeWidth="0.5" className="mix-blend-screen" />
            
            {/* Forearm energy pulse */}
            <motion.line 
              x1="-80" y1="0" x2="20" y2="0" 
              stroke="#38BDF8" strokeWidth="2" strokeDasharray="15 30" filter="url(#glowStrong)"
              animate={{ strokeDashoffset: [45, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />

            {/* ================= WRIST JOINT (Independent Rotation) ================= */}
            <motion.g 
              transform="translate(35, 0)"
              animate={{ rotate: breatheRotate }} 
              transition={phase === 'idle' ? { duration: breatheDuration, ease: "easeInOut", repeat: Infinity } : springTransition}
            >
              {/* Circular Holographic Wrist Stabilizer Ring */}
              <ellipse cx="0" cy="0" rx="12" ry="24" fill="none" stroke="#38BDF8" strokeWidth="2" filter="url(#glowSoft)" opacity="0.8" />
              <ellipse cx="0" cy="0" rx="16" ry="28" fill="none" stroke="rgba(56,189,248,0.3)" strokeWidth="1" />
              {/* Central Core */}
              <circle cx="0" cy="0" r="8" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
              <circle cx="0" cy="0" r="3" fill="#FFFFFF" filter="url(#glowStrong)" />

              {/* ================= PALM (Rotates relative to wrist) ================= */}
              <motion.g 
                transform="translate(15, 0)"
                animate={{ rotate: palmRotation }}
                transition={springTransition}
              >
                {/* Refined Palm Chassis - Smaller, curved, elegant */}
                <path d="M 0 -25 C 40 -35, 80 -40, 110 -25 C 115 0, 115 20, 105 35 C 70 45, 30 40, 0 25 Z" fill="#0F172A" stroke="url(#titanium)" strokeWidth="2" />
                <path d="M -5 -30 C 40 -40, 85 -45, 118 -30 C 122 -5, 122 25, 110 42 C 70 55, 25 48, -5 30 Z" fill="url(#glassPalm)" stroke="#38BDF8" strokeWidth="1.5" className="mix-blend-screen" filter="url(#glowSoft)" opacity="0.7" />
                
                {/* Palm Neural Network Lines */}
                <path d="M 10 0 Q 50 -20 100 -20" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.6" filter="url(#glowSoft)" />
                <path d="M 10 0 Q 60 5 105 5" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.6" filter="url(#glowSoft)" />
                <path d="M 10 0 Q 50 25 95 28" fill="none" stroke="#38BDF8" strokeWidth="1" opacity="0.6" filter="url(#glowSoft)" />

                {/* ================= PINKY FINGER (75% Length) ================= */}
                <g transform="translate(95, 30) rotate(12)">
                  <SculptedJoint radius={6.5} />
                  <motion.g animate={{ rotate: pinkyMcp }} transition={springTransition}>
                    <SculptedBone length={28} baseWidth={4.5} tipWidth={3.5} />
                    <g transform="translate(28, 0)">
                      <SculptedJoint radius={5} />
                      <motion.g animate={{ rotate: pinkyPip }} transition={springTransition}>
                        <SculptedBone length={20} baseWidth={3.5} tipWidth={2.5} />
                        <g transform="translate(20, 0)">
                          <SculptedJoint radius={4} />
                          <motion.g animate={{ rotate: pinkyDip }} transition={springTransition}>
                            <SculptedBone length={16} baseWidth={2.5} tipWidth={1.5} />
                          </motion.g>
                        </g>
                      </motion.g>
                    </g>
                  </motion.g>
                </g>

                {/* ================= RING FINGER (95% Length) ================= */}
                <g transform="translate(105, 12) rotate(4)">
                  <SculptedJoint radius={7.5} />
                  <motion.g animate={{ rotate: ringMcp }} transition={springTransition}>
                    <SculptedBone length={40} baseWidth={5} tipWidth={4} />
                    <g transform="translate(40, 0)">
                      <SculptedJoint radius={6} />
                      <motion.g animate={{ rotate: ringPip }} transition={springTransition}>
                        <SculptedBone length={30} baseWidth={4} tipWidth={3} />
                        <g transform="translate(30, 0)">
                          <SculptedJoint radius={5} />
                          <motion.g animate={{ rotate: ringDip }} transition={springTransition}>
                            <SculptedBone length={24} baseWidth={3} tipWidth={2} />
                          </motion.g>
                        </g>
                      </motion.g>
                    </g>
                  </motion.g>
                </g>

                {/* ================= MIDDLE FINGER (100% Length) ================= */}
                <g transform="translate(110, -8)">
                  <SculptedJoint radius={8.5} />
                  <motion.g animate={{ rotate: middleMcp }} transition={springTransition}>
                    <SculptedBone length={46} baseWidth={5.5} tipWidth={4.5} />
                    <g transform="translate(46, 0)">
                      <SculptedJoint radius={7} />
                      <motion.g animate={{ rotate: middlePip }} transition={springTransition}>
                        <SculptedBone length={34} baseWidth={4.5} tipWidth={3.5} />
                        <g transform="translate(34, 0)">
                          <SculptedJoint radius={6} />
                          <motion.g animate={{ rotate: middleDip }} transition={springTransition}>
                            <SculptedBone length={28} baseWidth={3.5} tipWidth={2.5} />
                          </motion.g>
                        </g>
                      </motion.g>
                    </g>
                  </motion.g>
                </g>

                {/* ================= INDEX FINGER (90% Length - Pointing) ================= */}
                <g transform="translate(100, -28) rotate(-5)">
                  {/* Highlight Index Joint as the Emitter Base */}
                  <circle cx="0" cy="0" r="14" fill="none" stroke="#FFFFFF" strokeWidth="1" filter="url(#glowStrong)" opacity="0.3" />
                  <SculptedJoint radius={8} />
                  
                  <motion.g animate={{ rotate: indexMcp }} transition={springTransition}>
                    <SculptedBone length={40} baseWidth={5} tipWidth={4} />
                    <g transform="translate(40, 0)">
                      <SculptedJoint radius={6.5} />
                      <motion.g animate={{ rotate: indexPip }} transition={springTransition}>
                        <SculptedBone length={30} baseWidth={4} tipWidth={3} />
                        <g transform="translate(30, 0)">
                          <SculptedJoint radius={5.5} />
                          <motion.g animate={{ rotate: indexDip }} transition={springTransition}>
                            <SculptedBone length={24} baseWidth={3} tipWidth={2} />
                            
                            {/* Energy Emitter Tip */}
                            <motion.g
                              animate={{ 
                                opacity: phase === 'point' ? 1 : 0, 
                                scale: phase === 'point' ? [1, 1.5, 1] : 0 
                              }}
                              transition={{ duration: 0.8, repeat: Infinity }}
                            >
                              <circle cx="24" cy="0" r="8" fill="#FFFFFF" filter="url(#glowStrong)" />
                              <circle cx="24" cy="0" r="16" fill="none" stroke="#38BDF8" strokeWidth="2" filter="url(#glowSoft)" />
                            </motion.g>
                          </motion.g>
                        </g>
                      </motion.g>
                    </g>
                  </motion.g>
                </g>

                {/* ================= THUMB (Properly mounted to palm base) ================= */}
                <g transform="translate(25, 30) rotate(35)">
                  <SculptedJoint radius={9} />
                  <motion.g animate={{ rotate: thumbCmc }} transition={springTransition}>
                    <SculptedBone length={36} baseWidth={6} tipWidth={5} />
                    <g transform="translate(36, 0)">
                      <SculptedJoint radius={8} />
                      <motion.g animate={{ rotate: thumbMcp }} transition={springTransition}>
                        <SculptedBone length={28} baseWidth={5} tipWidth={4} />
                        <g transform="translate(28, 0)">
                          <SculptedJoint radius={7} />
                          <motion.g animate={{ rotate: thumbIp }} transition={springTransition}>
                            <SculptedBone length={24} baseWidth={4} tipWidth={3} />
                          </motion.g>
                        </g>
                      </motion.g>
                    </g>
                  </motion.g>
                </g>

              </motion.g>
            </motion.g>
          </g>
        </motion.g>
      </motion.svg>
    </div>
  );
};
