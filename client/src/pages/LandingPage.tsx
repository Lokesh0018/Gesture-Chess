import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Play, Hand, Camera, Zap, Shield, Sun, Moon } from 'lucide-react';
import { AnimatedChessboard } from '../components/AnimatedChessboard';
import { LeftCyberHand } from '../components/LeftCyberHand';
import type { GesturePhase } from '../components/LeftCyberHand';
import { RightCyberHand } from '../components/RightCyberHand';
import type { RightGesturePhase } from '../components/RightCyberHand';
import { Chess } from 'chess.js';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAuthenticated] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const [game, setGame] = useState(new Chess());
  const [leftHandPhase, setLeftHandPhase] = useState<GesturePhase>('idle');
  const [rightHandPhase, setRightHandPhase] = useState<RightGesturePhase>('idle');
  const [shockwave, setShockwave] = useState<{ x: number, y: number } | null>(null);
  
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMouseX(x);
      setMouseY(y);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let timeoutIds: NodeJS.Timeout[] = [];
    const runSequence = () => {
      const newGame = new Chess();
      setGame(newGame);
      setLeftHandPhase('idle');
      setRightHandPhase('idle');
      setShockwave(null);

      timeoutIds.push(setTimeout(() => setLeftHandPhase('point'), 1000));
      timeoutIds.push(setTimeout(() => setRightHandPhase('pinch'), 2500));
      timeoutIds.push(setTimeout(() => setRightHandPhase('drag'), 3500));
      timeoutIds.push(setTimeout(() => {
        try {
          newGame.move('e4');
          setGame(new Chess(newGame.fen()));
          setRightHandPhase('release');
          setShockwave({ x: 50, y: 50 });
        } catch (e) {
          console.error(e);
        }
      }, 5000));

      timeoutIds.push(setTimeout(() => {
        setLeftHandPhase('idle');
        setRightHandPhase('idle');
      }, 6000));
    };

    runSequence();
    const intervalId = setInterval(runSequence, 8000);

    return () => {
      clearInterval(intervalId);
      timeoutIds.forEach(clearTimeout);
    };
  }, []);

  const smoothMouseX = useMotionValue(0);
  const smoothMouseY = useMotionValue(0);
  useEffect(() => {
    smoothMouseX.set(mouseX);
    smoothMouseY.set(mouseY);
  }, [mouseX, mouseY, smoothMouseX, smoothMouseY]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#08111F] text-white selection:bg-[#3B82F6]/30">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-[1000px] max-h-[1000px] bg-gradient-to-r from-[#3B82F6]/10 to-[#38BDF8]/10 rounded-full blur-[120px] opacity-70 pointer-events-none mix-blend-screen" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_20%,transparent_100%)]" />
      </div>

      {/* Navigation */}
      <header className="absolute top-0 left-0 right-0 h-20 px-8 flex items-center justify-between z-50 bg-[#08111F]/50 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <Hand className="w-8 h-8 text-[#3B82F6]" />
          <span className="text-xl font-bold tracking-tight">GestureChess</span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <a href="#" className="relative text-white group">Home
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#38BDF8] rounded-full" />
          </a>
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">How It Works</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 text-slate-400 hover:text-white transition-colors">
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button className="px-5 py-2 text-sm font-medium hover:text-white transition-colors">Login</button>
          <button className="px-6 py-2 text-sm font-medium bg-gradient-to-r from-[#3B82F6] to-[#0055FF] rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(59,130,246,0.5)] transition-all">Sign Up</button>
        </div>
      </header>

      <main className="relative z-10 w-full h-full flex flex-col items-center justify-start pt-28">
        
        <div className="text-center z-30 mb-8 max-w-[700px] px-4">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6"
          >
            Play Chess <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#60A5FA] to-[#3B82F6]">With Your Gestures</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-slate-400 font-light"
          >
            Control every move using natural hand gestures. <br />
            Experience AI-powered gesture recognition in real time.
          </motion.p>
        </div>

        <div className="relative w-full max-w-[1400px] flex-1 flex items-center justify-center -mt-12">
          
          <div className="absolute left-0 lg:left-12 top-1/2 -translate-y-1/2 z-40 hidden md:block">
            <LeftCyberHand phase={leftHandPhase} mouseX={smoothMouseX} mouseY={smoothMouseY} />
            
            <AnimatePresence>
              {leftHandPhase === 'point' && (
                <motion.svg 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                  className="absolute top-1/2 left-3/4 w-[300px] h-[100px] pointer-events-none -translate-y-1/2 overflow-visible"
                >
                  <defs>
                    <linearGradient id="energyGradL" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="20%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                    <filter id="beamGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  
                  <path d="M 0 50 Q 150 -20 300 50" fill="none" stroke="url(#energyGradL)" strokeWidth="6" filter="url(#beamGlow)" className="opacity-80 mix-blend-screen" />
                  <path d="M 0 50 Q 120 -40 300 50" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="10 15" filter="url(#beamGlow)" className="animate-[dash_0.5s_linear_infinite] mix-blend-screen" />
                  <path d="M 0 50 Q 180 10 300 50" fill="none" stroke="#60A5FA" strokeWidth="2" strokeDasharray="5 20" filter="url(#beamGlow)" className="animate-[dash_0.3s_linear_infinite] mix-blend-screen" />
                  
                  <circle cx="300" cy="50" r="15" fill="#38BDF8" filter="url(#beamGlow)" className="animate-pulse mix-blend-screen" />
                  <circle cx="300" cy="50" r="5" fill="#FFFFFF" />
                </motion.svg>
              )}
            </AnimatePresence>
          </div>

          <div className="relative z-20 w-[450px] lg:w-[550px]">
            <AnimatedChessboard fen={game.fen()} customArrows={[]} shockwave={shockwave} mouseX={smoothMouseX} mouseY={smoothMouseY} />
          </div>

          <div className="absolute right-0 lg:right-12 top-1/2 -translate-y-1/2 z-40 hidden md:block">
            <RightCyberHand phase={rightHandPhase} mouseX={smoothMouseX} mouseY={smoothMouseY} />
            
            <AnimatePresence>
              {(rightHandPhase === 'drag' || rightHandPhase === 'pinch') && (
                <motion.svg 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute top-1/2 right-3/4 w-[200px] h-[100px] pointer-events-none -translate-y-1/2 overflow-visible scale-x-[-1]"
                >
                  <defs>
                    <linearGradient id="energyGradR" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FFFFFF" />
                      <stop offset="20%" stopColor="#38BDF8" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  
                  <path d="M 0 50 Q 100 -40 200 50" fill="none" stroke="url(#energyGradR)" strokeWidth="6" filter="url(#beamGlow)" className="opacity-80 mix-blend-screen" />
                  <path d="M 0 50 Q 80 -60 200 50" fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="15 10" filter="url(#beamGlow)" className="animate-[dash_0.6s_linear_infinite] mix-blend-screen" />
                  <path d="M 0 50 Q 120 -10 200 50" fill="none" stroke="#60A5FA" strokeWidth="2" strokeDasharray="8 12" filter="url(#beamGlow)" className="animate-[dash_0.4s_linear_infinite] mix-blend-screen" />
                  
                  <circle cx="200" cy="50" r="15" fill="#38BDF8" filter="url(#beamGlow)" className="animate-pulse mix-blend-screen" />
                  <circle cx="200" cy="50" r="5" fill="#FFFFFF" />
                </motion.svg>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="absolute bottom-40 z-30 flex flex-col items-center">
          <button className="group relative flex items-center justify-center w-[260px] h-[56px] rounded-full bg-gradient-to-r from-[#3B82F6] to-[#0055FF] shadow-[0_0_30px_rgba(59,130,246,0.4)] hover:shadow-[0_0_50px_rgba(59,130,246,0.6)] transition-all duration-300 hover:scale-105">
            <span className="flex items-center gap-2 text-white font-bold text-lg">
              <Play className="w-5 h-5 fill-white" /> Start Playing
            </span>
            <div className="absolute inset-0 rounded-full border border-white/20" />
          </button>
          <div className="flex items-center gap-2 mt-4 text-slate-400 text-xs uppercase tracking-widest font-mono">
            <Camera className="w-3 h-3" />
            <span>Use your camera to control chess pieces</span>
          </div>
        </div>

        <div className="absolute bottom-6 w-full max-w-[1200px] px-8 z-30">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { icon: Hand, title: "Gesture Controlled", desc: "Play chess using natural hand gestures." },
              { icon: Camera, title: "AI Hand Tracking", desc: "Advanced AI detects your gestures in real time." },
              { icon: Zap, title: "Fast & Responsive", desc: "Optimized for smooth and instant responses." },
              { icon: Shield, title: "Secure & Private", desc: "Your data and gameplay are always protected." }
            ].map((feat, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 backdrop-blur-xl rounded-2xl p-5 flex items-center gap-4 hover:bg-white/[0.04] transition-colors group cursor-default">
                <div className="p-3 rounded-xl bg-[#3B82F6]/10 text-[#3B82F6] group-hover:text-[#38BDF8] transition-colors">
                  <feat.icon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">{feat.title}</h4>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: -24; }
        }
      `}</style>
    </div>
  );
};
