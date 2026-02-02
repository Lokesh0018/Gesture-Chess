import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Play, Shield, Zap, Hand, Camera, CheckCircle, Globe, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { LandingNavbar } from '../components/LandingNavbar';
import { AnimatedChessboard } from '../components/AnimatedChessboard';
import { LeftCyberHand } from '../components/LeftCyberHand';
import type { GesturePhase } from '../components/LeftCyberHand';
import { RightCyberHand } from '../components/RightCyberHand';
import type { RightGesturePhase } from '../components/RightCyberHand';
import { Chess } from 'chess.js';

export const LandingPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [leftHandPhase, setLeftHandPhase] = useState<GesturePhase>('idle');
  const [rightHandPhase, setRightHandPhase] = useState<RightGesturePhase>('idle');
  
  const [game, setGame] = useState(new Chess());
  const [customArrows, setCustomArrows] = useState<any[]>([]);
  const [shockwave, setShockwave] = useState(false);
  const [energyBeam, setEnergyBeam] = useState<'none' | 'left' | 'right'>('none');

  // Parallax Mouse Tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    mouseX.set((clientX / innerWidth) * 2 - 1);
    mouseY.set((clientY / innerHeight) * 2 - 1);
  }, [mouseX, mouseY]);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  // Master Orchestration Timeline (Asymmetrical Story)
  useEffect(() => {
    const sequence = [
      { from: 'e2', to: 'e4' },
      { from: 'e7', to: 'e5' },
      { from: 'g1', to: 'f3' }
    ];

    let step = 0;
    
    const playTurn = () => {
      if (step >= sequence.length) {
        setGame(new Chess());
        step = 0;
        setTimeout(playTurn, 2000); // 2 second pause before restart
        return;
      }

      const move = sequence[step];

      setLeftHandPhase('idle');
      setRightHandPhase('idle');

      // Timeline (Total ~4500ms per turn)
      // 500ms: Left hand (Commander) points
      setTimeout(() => {
        setLeftHandPhase('point');
        setCustomArrows([[move.from, move.to, 'rgba(56, 189, 248, 0.6)']]);
        setEnergyBeam('left'); // Energy beam from left to board
      }, 500);

      // 1200ms: Right hand (Manipulator) pinches
      setTimeout(() => {
        setRightHandPhase('pinch');
      }, 1200);

      // 1800ms: Right hand lifts
      setTimeout(() => {
        setRightHandPhase('lift');
      }, 1800);

      // 2400ms: Right hand drags, board moves
      setTimeout(() => {
        setRightHandPhase('drag');
        const newGame = new Chess(game.fen());
        try {
          newGame.move({ from: move.from, to: move.to });
          setGame(newGame);
        } catch(e) {}
      }, 2400);

      // 3000ms: Right hand releases, piece lands, shockwave
      setTimeout(() => {
        setRightHandPhase('release');
        setLeftHandPhase('idle');
        setEnergyBeam('none');
        setCustomArrows([]);
        setShockwave(true);
      }, 3000);

      // 3400ms: Shockwave off
      setTimeout(() => setShockwave(false), 3400);

      // 3800ms: Hands to idle
      setTimeout(() => {
        setRightHandPhase('idle');
      }, 3800);

      step++;
    };

    const intervalId = setInterval(playTurn, 4500);
    playTurn();

    return () => clearInterval(intervalId);
  }, [game]);

  return (
    <div 
      className="min-h-screen bg-[#0F172A] text-white font-sans overflow-x-hidden selection:bg-[#3B82F6] selection:text-white relative"
      onMouseMove={handleMouseMove}
    >
      <LandingNavbar />

      {/* 1. HERO SECTION */}
      <section className="relative w-full min-h-screen flex flex-col items-center justify-start overflow-hidden pt-36 pb-0" id="home">
        
        {/* Deep 5-Layer Background System */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Layer 1: Base Dark Gradient is the body bg */}
          
          {/* Layer 2: Subtle Animated Grid */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CgkgPHBhdGggZD0iTTU5LjUgMEw1OS41IDYwTTAgNTkuNUw2MCA1OS41IiBmaWxsPSJub25lIiBzdHJva2U9InJnYmEoNTksIDEzMCwgMjQ2LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+Cjwvc3ZnPg==')] opacity-15 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]" />
          
          {/* Layer 3: Volumetric Blue Glow (strictly behind board) */}
          <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#3B82F6]/5 rounded-full blur-[100px]" />
          
          {/* Layer 4: Tiny Floating Particles (Reduced by 60% for minimalism) */}
          {[...Array(6)].map((_, i) => (
            <motion.div 
              key={i}
              className="absolute w-[2px] h-[2px] bg-[#38BDF8] rounded-full blur-[1px]"
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: Math.random() * window.innerHeight,
                opacity: Math.random() * 0.3 + 0.1
              }}
              animate={{ 
                y: [null, Math.random() * -100],
                opacity: [null, 0]
              }}
              transition={{ 
                duration: Math.random() * 15 + 10, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
          ))}

          {/* Layer 5: Soft Vignette */}
          <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(15,23,42,1)]" />
        </div>
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-start w-full max-w-[1200px] mx-auto px-4 z-10">
          
          {/* Typography Hierarchy */}
          <div className="text-center w-full max-w-[700px] mx-auto">
            <motion.h1 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-[48px] md:text-[56px] leading-[1.1] font-extrabold tracking-tight mb-8"
            >
              Play Chess <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3B82F6] to-[#38BDF8] drop-shadow-sm text-[85%]">
                With Your Gestures
              </span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="text-[16px] md:text-[18px] text-slate-400 max-w-[500px] mx-auto leading-relaxed font-light mb-4"
            >
              Control every move using natural hand gestures. Experience AI-powered gesture recognition in real time.
            </motion.p>
          </div>

          {/* Interactive Core: Hands & Board tightly framed */}
          <div className="relative w-full flex flex-col lg:flex-row items-center justify-center gap-0 lg:gap-4 mt-6">
            
            {/* Left Hand */}
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:flex flex-col items-end w-[280px] relative z-20 order-1 lg:order-1"
            >
              <div className="relative translate-x-12">
                <LeftCyberHand phase={leftHandPhase} mouseX={smoothMouseX} mouseY={smoothMouseY} />
                
                {/* Energy Connection Spline */}
                <AnimatePresence>
                  {energyBeam === 'left' && (
                    <motion.svg 
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ opacity: 1, scaleX: 1 }}
                      exit={{ opacity: 0, scaleX: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute top-[45%] right-[-140px] w-[200px] h-[60px] pointer-events-none origin-left z-30 drop-shadow-[0_0_15px_rgba(56,189,248,0.8)]"
                      viewBox="0 0 200 60"
                    >
                      <path 
                        d="M 0 30 Q 100 0 200 30" 
                        fill="none" stroke="url(#energyGradLeft)" strokeWidth="6" 
                        strokeDasharray="8 8"
                        className="animate-[dash_1s_linear_infinite]"
                      />
                      <path 
                        d="M 0 30 Q 100 0 200 30" 
                        fill="none" stroke="#FFFFFF" strokeWidth="2" 
                        opacity="0.8"
                      />
                      <defs>
                        <linearGradient id="energyGradLeft" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#38BDF8" stopOpacity="1" />
                          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.3" />
                        </linearGradient>
                      </defs>
                    </motion.svg>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Chessboard */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full max-w-[360px] md:max-w-[440px] lg:max-w-[480px] flex flex-col items-center z-10 order-2 lg:order-2"
            >
              <AnimatedChessboard 
                fen={game.fen()} 
                customArrows={customArrows} 
                shockwave={shockwave} 
                mouseX={smoothMouseX} 
                mouseY={smoothMouseY} 
              />
            </motion.div>

            {/* Right Hand */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="hidden lg:flex flex-col items-start w-[280px] relative z-20 order-3 lg:order-3"
            >
              <div className="relative -translate-x-12">
                <RightCyberHand phase={rightHandPhase} mouseX={smoothMouseX} mouseY={smoothMouseY} />
              </div>
            </motion.div>
          </div>

          {/* Premium Anchored Play CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="z-20 text-center mt-8 mb-4 order-4 lg:order-4"
          >
            <button 
              onClick={() => isAuthenticated ? navigate('/dashboard') : navigate('/login')}
              className="group relative w-[280px] h-[60px] mx-auto flex items-center justify-center bg-gradient-to-r from-[#3B82F6] to-[#38BDF8] rounded-2xl text-[18px] font-bold text-white shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(56,189,248,0.6)] transition-all duration-300 hover:scale-[1.02] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <motion.div 
                className="absolute inset-0 rounded-2xl border border-white/30"
                animate={{ opacity: [0.3, 1, 0.3], boxShadow: ["inset 0 0 0px #fff", "inset 0 0 10px #fff", "inset 0 0 0px #fff"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <span className="relative flex items-center justify-center gap-3">
                <Play className="w-5 h-5 fill-white" /> Start Playing
              </span>
            </button>
            <p className="mt-4 text-[12px] text-[#60A5FA] uppercase tracking-widest font-mono opacity-80">Use your camera to control chess pieces</p>
          </motion.div>
        </div>

        {/* Feature Cards pushed lower */}
        <div className="w-full max-w-[1200px] mx-auto px-4 z-20 mt-24 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Hand, title: "Gesture Control", desc: "Play using natural hand movements." },
              { icon: Camera, title: "AI Tracking", desc: "Advanced real-time pose detection." },
              { icon: Zap, title: "Instant Response", desc: "12ms latency edge-optimized processing." },
              { icon: Shield, title: "Secure Matches", desc: "Anti-cheat and protected gameplay." }
            ].map((feat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 + (i * 0.1) }}
                className="bg-[#1B2433]/60 backdrop-blur-xl border border-[#3B82F6]/10 rounded-2xl p-6 flex flex-col justify-center h-[130px] hover:-translate-y-2 hover:bg-[#1B2433]/90 hover:shadow-[0_15px_40px_rgba(59,130,246,0.1)] hover:border-[#38BDF8]/40 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-[#3B82F6]/10 rounded-full blur-md group-hover:bg-[#38BDF8]/30 transition-all duration-300" />
                    <feat.icon className="w-7 h-7 text-[#60A5FA] group-hover:text-[#38BDF8] relative z-10 transition-colors duration-300" />
                  </div>
                  <div>
                    <h3 className="text-[16px] font-bold text-white mb-1 tracking-wide">{feat.title}</h3>
                    <p className="text-[13px] text-slate-400 leading-tight font-light">{feat.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="relative w-full py-24 bg-[#0B1220] border-t border-[#3B82F6]/10">
        <div className="max-w-[1200px] mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-16 text-white tracking-tight">How GestureChess Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: "1", title: "Enable Camera", desc: "Allow access so our AI can securely map your hand joints in real time." },
              { step: "2", title: "Make a Move", desc: "Pinch to grab a piece, drag it to a square, and release to drop it." },
              { step: "3", title: "Win the Game", desc: "Focus entirely on your strategy without ever touching a mouse or screen." }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1B2433] to-[#0F172A] border border-[#3B82F6]/30 flex items-center justify-center text-2xl font-bold mb-6 shadow-[0_0_30px_rgba(59,130,246,0.15)] text-[#38BDF8]">
                  {item.step}
                </div>
                <h3 className="text-[20px] font-bold mb-3 text-white">{item.title}</h3>
                <p className="text-slate-400 text-[15px] leading-relaxed max-w-[280px] font-light">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full border-t border-[#3B82F6]/10 py-12 text-center text-slate-500 text-sm bg-[#0F172A]">
        <p>&copy; {new Date().getFullYear()} GestureChess. All rights reserved.</p>
        <div className="flex justify-center gap-8 mt-6">
          <a href="#" className="hover:text-[#38BDF8] transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-[#38BDF8] transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-[#38BDF8] transition-colors">Contact</a>
        </div>
      </footer>

      {/* Global Style for animating SVG dashed lines */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -12;
          }
        }
      `}</style>
    </div>
  );
};
