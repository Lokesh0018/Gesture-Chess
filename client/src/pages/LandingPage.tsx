import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useMotionValue, useMotionTemplate, animate, useInView } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Hand, Camera, Zap, Shield, Play, Menu, X, ChevronRight, CheckCircle2, Globe, Cpu, Lock, Code, MessageCircle, Mail, ArrowRight, ChessQueen } from 'lucide-react';
import { AuroraBackground } from '../components/AuroraBackground';
import './LandingPage.css';

// ─── Preloader ──────────────────────────────────────────

const LOADING_TEXTS = [
  "Initializing GestureChess",
  "Loading AI Hand Tracking...",
  "Calibrating Chess Engine...",
  "Preparing Gesture Detection...",
  "Almost Ready..."
];

function Preloader({ onComplete }: { onComplete: () => void }) {
  const [textIndex, setTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex(prev => (prev + 1) % LOADING_TEXTS.length);
    }, 800);

    const timer = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="lp-preloader"
    >
      {/* Subtle floating particles in background */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="lp-preloader-particle-1" />
        <div className="lp-preloader-particle-2" />
        <div className="lp-preloader-particle-3" />
        <div className="lp-preloader-particle-4" />
      </div>

      {/* Centerpiece Container */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative z-10 w-40 h-40 flex flex-col items-center justify-center"
      >
        {/* SVG Chess King with Tracing Outline */}
        <div className="lp-loader-container">
          {/* Ambient glow perfectly centered behind the king */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.4, 0.15] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="lp-loader-glow"
          />

          {/* Base shape */}
          <ChessQueen
            className="lp-loader-icon-base"
            strokeWidth={1.5}
            style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.3))" }}
          />

          {/* Glowing outline trace (Mega-path for single continuous line traversal) */}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lp-loader-icon-trace single-trace"
            style={{ filter: "drop-shadow(0 0 12px #60A5FA) drop-shadow(0 0 24px #3B82F6)" }}
          >
            <path
              pathLength={1}
              d="M4 20a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v1a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z M12.474 5.943 l 1.567 5.34 a 1 1 0 0 0 1.75 0.328 l 2.616 -3.402 M20 9 l -3 9 M5.594 8.209 l 2.615 3.403 a 1 1 0 0 0 1.75 -0.329 l 1.567 -5.34 M7 18 L4 9 M 10 4 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 18 7 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0 M 2 7 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0"
            />
          </svg>
        </div>
      </motion.div>

      {/* Cycling Loading Text */}
      <div className="mt-12 h-6 flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={textIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="text-[#60A5FA] font-medium tracking-wider text-[13px] uppercase"
          >
            {LOADING_TEXTS[textIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      <style>{`
        .single-trace path {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: drawPath 3s ease-in-out infinite;
        }
        @keyframes drawPath {
          0% { stroke-dashoffset: 1; opacity: 0; }
          10% { opacity: 1; }
          80% { stroke-dashoffset: 0; opacity: 1; }
          100% { stroke-dashoffset: 0; opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}

// ─── Navigation ─────────────────────────────────────────

function Navigation({ scrollContainerRef }: { scrollContainerRef?: React.RefObject<HTMLDivElement | null> }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const container = scrollContainerRef?.current || window;
    const handleScroll = () => {
      const sections = ['home', 'features', 'how-it-works', 'about', 'contact'];
      let current = 'home';
      for (const section of [...sections].reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2.5) {
            current = section;
            break;
          }
        }
      }
      setActiveSection(current);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Init
    return () => container.removeEventListener('scroll', handleScroll);
  }, [scrollContainerRef]);

  return (
    <header className="nav-header">
      {/* Glass background */}
      <div className="nav-glass-bg" />

      <div className="nav-container">
        {/* Logo */}
        <Link to="/" className="nav-logo-link" id="landing-logo">
          <div className="nav-logo-icon-wrapper">
            <ChessQueen className="nav-logo-icon" />
            {/* Emissive pulse */}
            <div className="nav-logo-pulse" />
          </div>
          <span className="nav-logo-text">
            Gesture<span className="nav-logo-text-highlight">Chess</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <nav className="nav-desktop-menu" id="landing-nav">
          {['Home', 'Features', 'How It Works', 'About', 'Contact'].map((item) => {
            const id = item.toLowerCase().replace(/\s+/g, '-');
            const isActive = activeSection === id;
            return (
              <a
                key={item}
                href={`#${id}`}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {item}
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="nav-link-indicator"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="nav-actions">
          <Link
            to="/login"
            className="hidden sm:inline-flex nav-btn-login"
            id="landing-login"
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="hidden sm:inline-flex nav-btn-signup"
            id="landing-signup"
          >
            Sign Up
          </Link>

          {/* Mobile hamburger */}
          <button
            className="nav-mobile-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            id="landing-mobile-menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="nav-mobile-menu"
        >
          {['Home', 'Features', 'How It Works', 'About', 'Contact'].map((item) => (
            <a key={item} href="#" className="nav-mobile-link">
              {item}
            </a>
          ))}
          <div className="nav-mobile-actions">
            <Link to="/login" className="nav-mobile-login">
              Login
            </Link>
            <Link to="/register" className="nav-mobile-signup">
              Sign Up
            </Link>
          </div>
        </motion.div>
      )}
    </header>
  );
}




// ─── Hero Text ──────────────────────────────────────────

function HeroText() {
  return (
    <div className="hero-text-container">
      <motion.h1
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="hero-title"
        id="landing-hero-title"
      >
        <span className="hero-title-main">Play Chess</span>
        <br />
        <span className="hero-title-gradient">
          With Your Gestures
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="hero-subtitle"
        id="landing-hero-subtitle"
      >
        Control every move using natural hand gestures.
        <br />
        Experience AI-powered recognition in real time.
      </motion.p>
    </div>
  );
}

// ─── CTA Button ─────────────────────────────────────────

function CTAButton() {
  const [ripple, setRipple] = useState(false);
  const buttonRef = useRef<HTMLAnchorElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleClick = () => {
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (buttonRef.current) {
      const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      // Pull button slightly towards cursor (magnetic effect)
      setPosition({ x: distanceX * 0.15, y: distanceY * 0.15 });
    }
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="cta-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        style={{ perspective: 1000 }}
      >
        <motion.div
          animate={{ x: position.x, y: position.y }}
          transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.5 }}
        >
          <Link
            to="/local"
            ref={buttonRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
            className="cta-link"
            id="landing-cta"
          >
            {/* Outer glow ring */}
            <div className="cta-glow-ring" />

            {/* Ripple burst on click */}
            {ripple && (
              <motion.div
                initial={{ opacity: 0.4, scale: 0 }}
                animate={{ opacity: 0, scale: 2.5 }}
                transition={{ duration: 0.6 }}
                className="cta-ripple"
              />
            )}

            <Play className="cta-icon" />
            <span>Start Playing</span>
            <ChevronRight className="cta-arrow" />
          </Link>
        </motion.div>
      </motion.div>

      {/* Infinite Social Proof Marquee */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="marquee-container"
      >
        <div className="marquee-content">
          {Array.from({ length: 2 }).map((_, i) => (
            <React.Fragment key={i}>
              <span className="marquee-item"><Zap className="marquee-icon" /> Zero Latency</span>
              <span className="marquee-dot" />
              <span className="marquee-item"><Shield className="marquee-icon" /> 100% Private</span>
              <span className="marquee-dot" />
              <span className="marquee-item"><Camera className="marquee-icon" /> AI Hand Tracking</span>
              <span className="marquee-dot" />
              <span className="marquee-item"><Globe className="marquee-icon" /> Browser Based</span>
              <span className="marquee-dot" />
            </React.Fragment>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Feature Cards ──────────────────────────────────────

const FEATURES = [
  {
    icon: Hand,
    title: 'Gesture Controlled',
    desc: 'Move pieces naturally using your hands. No mouse or keyboard required.',
  },
  {
    icon: Camera,
    title: 'AI Hand Tracking',
    desc: 'Advanced on-device AI recognizes your gestures in real time with pinpoint accuracy.',
  },
  {
    icon: Zap,
    title: 'Zero Latency',
    desc: 'Edge-computing provides instantaneous feedback for seamless, fast-paced gameplay.',
  },
  {
    icon: Shield,
    title: '100% Private',
    desc: 'All camera processing happens locally in your browser. Video never leaves your device.',
  },
  {
    icon: Globe,
    title: 'Browser Based',
    desc: 'Play instantly from any modern web browser without downloading bulky applications.',
  },
  {
    icon: Cpu,
    title: 'Efficient Engine',
    desc: 'Optimized neural networks ensure smooth tracking even on standard laptop webcams.',
  }
];

function FeatureCard({ feat, i }: { feat: typeof FEATURES[0], i: number }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      onMouseMove={handleMouseMove}
      className="feature-card group"
    >
      {/* Spotlight Hover Effect */}
      <motion.div
        className="feature-spotlight"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              400px circle at ${mouseX}px ${mouseY}px,
              rgba(59,130,246,0.12),
              transparent 80%
            )
          `,
        }}
      />

      {/* Circular Icon Container */}
      <div className="feature-icon-wrapper">
        <feat.icon className="feature-icon" />
      </div>

      {/* Text Content */}
      <div className="feature-content">
        <h4 className="feature-title">{feat.title}</h4>
        <p className="feature-desc">{feat.desc}</p>

        {/* Learn More link */}
        <div className="feature-link">
          Learn More
          <ArrowRight className="feature-arrow" />
        </div>
      </div>
    </motion.div>
  );
}

function FeatureCards() {
  return (
    <section className="features-section" id="features">
      {/* Background Layer 2 (Gradient Overlay) & Layer 3 (Radial Glow) */}
      <div className="features-bg-gradient" />
      <div className="features-radial-container">
        <div className="features-radial-glow" />
      </div>

      <div className="features-container">
        {/* Section Header */}
        <div className="features-header">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="features-badge"
          >
            <div className="features-badge-dot" />
            <span className="features-badge-text">Features</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="features-title"
          >
            Built for Modern Chess Players
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="features-subtitle"
          >
            Everything runs directly in your browser using AI-powered hand tracking with no downloads or extra hardware.
          </motion.p>
        </div>

        {/* CSS Grid */}
        <div className="features-grid" id="landing-features">
          {FEATURES.map((feat, i) => (
            <FeatureCard key={feat.title} feat={feat} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ───────────────────────────────────────

function HowItWorks() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  const steps = [
    {
      title: "Grant Camera Access",
      desc: "Click start and securely allow your browser to use the webcam. Your video stream is analyzed locally and never sent to a server.",
      icon: Lock
    },
    {
      title: "Make a Pinch Gesture",
      desc: "Hold your hand up. Pinch your index finger and thumb together to 'grab' a piece, then drag it to your desired square and release.",
      icon: Hand
    },
    {
      title: "Outsmart Your Opponent",
      desc: "Play against a powerful AI or a friend locally. Focus entirely on the board and let your gestures do the moving.",
      icon: CheckCircle2
    }
  ];

  return (
    <section className="how-section" id="how-it-works">
      <div className="how-container" ref={containerRef}>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="how-title"
        >
          Three Steps to <span className="how-title-highlight">Mastery</span>
        </motion.h2>

        <div className="how-steps-wrapper">
          {/* Vertical connecting line (Background) */}
          <div className="how-line-bg" />
          
          {/* Vertical connecting line (Scroll Animated) */}
          <motion.div 
            style={{ height: lineHeight }}
            className="how-line-active"
          />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              viewport={{ once: false, margin: "-20%" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className={`how-step ${i % 2 !== 0 ? 'reverse' : ''}`}
            >
              {/* Marker */}
              <div className="how-marker">
                <span className="how-marker-text">{i + 1}</span>
              </div>

              <div className="how-card">
                <div className="how-card-header">
                  {i % 2 !== 0 && <step.icon className="how-icon" />}
                  <h3 className="how-card-title">{step.title}</h3>
                  {i % 2 === 0 && <step.icon className="how-icon" />}
                </div>
                <p className="how-card-desc">{step.desc}</p>
              </div>
              <div className="how-spacer" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About ──────────────────────────────────────────────

function StatCard({ stat, i }: { stat: any, i: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const count = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (isInView) {
      const controls = animate(count, stat.value, {
        duration: 2,
        ease: "easeOut",
        onUpdate: (v) => setDisplay(Math.round(v))
      });
      return controls.stop;
    }
  }, [isInView, stat.value, count]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 + (i * 0.1), duration: 0.5 }}
      className="stat-card group"
    >
      <stat.icon className="stat-icon" />
      <div className="stat-value">
        {display}{stat.suffix}
      </div>
      <div className="stat-label">{stat.label}</div>
    </motion.div>
  );
}

function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-container">

        {/* Left Side: Text */}
        <div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="about-title"
          >
            Powered by <br />
            <span className="about-title-highlight">Edge AI</span>
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="about-text-container"
          >
            <p>
              GestureChess is built on the philosophy that advanced AI should be accessible, private, and instantaneous.
              By utilizing WebGL and modern browser APIs, we run complex neural networks directly on your device's GPU.
            </p>
            <p>
              This means zero server roundtrips for image processing, ensuring a flawless 60 FPS hand-tracking experience
              while guaranteeing that your camera feed never leaves your room.
            </p>
          </motion.div>
        </div>

        {/* Right Side: Stats/Grid */}
        <div className="about-stats-grid">
          {[
            { value: 60, suffix: "", label: "Frames Per Second", icon: Zap },
            { value: 0, suffix: "ms", label: "Server Latency", icon: Globe },
            { value: 100, suffix: "%", label: "Local Privacy", icon: Shield },
            { value: 21, suffix: "", label: "Hand Landmarks", icon: Hand }
          ].map((stat, i) => (
            <StatCard key={stat.label} stat={stat} i={i} />
          ))}
        </div>

      </div>
    </section>
  );
}

// ─── Contact / Footer ───────────────────────────────────

function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">

        <div className="flex flex-col items-center justify-center text-center w-full mb-24">
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="contact-banner"
          >
            <div className="contact-banner-glow" />

            <h2 className="contact-title">
              Ready to Make <br className="hidden md:block" /> Your Move?
            </h2>
            <p className="contact-subtitle">
              Join thousands of players experiencing the future of digital board games. No hardware required.
            </p>

            <div className="contact-actions">
              <Link to="/register" className="contact-btn-primary">
                <div className="contact-btn-primary-shine" />
                Play Now Free
                <ArrowRight className="feature-arrow" />
              </Link>
            </div>

            <div className="contact-divider" />

            <div className="contact-newsletter">
              <h3 className="contact-newsletter-title">Stay Updated</h3>
              <p className="contact-newsletter-desc">Subscribe for new features, AI updates, and tournaments.</p>
              <form className="contact-form" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="you@example.com" className="contact-input" />
                <button type="submit" className="contact-submit group">
                  Subscribe <ArrowRight className="feature-arrow" />
                </button>
              </form>
            </div>
          </motion.div>
        </div>

      </div>

      {/* ─── Footer ─── */}
      <footer className="site-footer">
        <div className="footer-inner">

          {/* Top: brand + nav columns */}
          <div className="footer-top">

            {/* Brand */}
            <div className="footer-brand">
              <Link to="/" className="footer-brand-logo">
                <ChessQueen className="w-6 h-6 text-[#3B82F6]" />
                <span>Gesture<span className="text-[#60A5FA]">Chess</span></span>
              </Link>
              <p className="footer-brand-tagline">
                Play chess with your hands. No controllers, no mouse — just gestures.
              </p>
              <div className="footer-social-row">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                  className="footer-social-btn" aria-label="GitHub">
                  <Code className="w-4 h-4" />
                </a>
                <a href="https://discord.com" target="_blank" rel="noopener noreferrer"
                  className="footer-social-btn" aria-label="Discord">
                  <MessageCircle className="w-4 h-4" />
                </a>
                <a href="mailto:hello@gesturechess.com"
                  className="footer-social-btn" aria-label="Email">
                  <Mail className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Nav columns */}
            <div className="footer-nav-columns">
              <div className="footer-nav-col">
                <h5 className="footer-nav-heading">Product</h5>
                <ul className="footer-nav-list">
                  <li><a href="#features"     className="footer-nav-link">Features</a></li>
                  <li><a href="#how-it-works" className="footer-nav-link">How It Works</a></li>
                  <li><Link to="/local"       className="footer-nav-link">Local Game</Link></li>
                  <li><Link to="/register"    className="footer-nav-link">Sign Up Free</Link></li>
                </ul>
              </div>
              <div className="footer-nav-col">
                <h5 className="footer-nav-heading">Company</h5>
                <ul className="footer-nav-list">
                  <li><a href="#about"   className="footer-nav-link">About</a></li>
                  <li><a href="#contact" className="footer-nav-link">Contact</a></li>
                  <li><a href="#"        className="footer-nav-link">Privacy Policy</a></li>
                  <li><a href="#"        className="footer-nav-link">Terms of Service</a></li>
                </ul>
              </div>
              <div className="footer-nav-col">
                <h5 className="footer-nav-heading">Resources</h5>
                <ul className="footer-nav-list">
                  <li><a href="#" className="footer-nav-link">Documentation</a></li>
                  <li><a href="#" className="footer-nav-link">Open Source</a></li>
                  <li><a href="#" className="footer-nav-link">Changelog</a></li>
                  <li><a href="#" className="footer-nav-link">Status</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="footer-bottom-bar">
            <p className="footer-copy">
              &copy; {new Date().getFullYear()} GestureChess. All rights reserved.
            </p>
            <div className="footer-legal-links">
              <a href="#" className="footer-legal-link">Privacy</a>
              <span className="footer-legal-sep" />
              <a href="#" className="footer-legal-link">Terms</a>
              <span className="footer-legal-sep" />
              <a href="#" className="footer-legal-link">Cookies</a>
            </div>
          </div>

        </div>
      </footer>
    </section>
  );
}

// ─── Global Background Sequence ─────────────────────────

const FRAME_COUNT = 210;

function BackgroundSequence({ scrollContainerRef }: { scrollContainerRef: React.RefObject<HTMLDivElement | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Preload sequence frames
  useEffect(() => {
    let loaded = 0;
    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const num = i.toString().padStart(3, '0');
      img.src = `/assets/sequence/ezgif-frame-${num}.jpg`;
      img.onload = () => {
        loaded++;
        if (loaded === 1) {
          drawFrame(0);
        }
      };
      imagesRef.current[i - 1] = img;
    }
  }, []);

  const { scrollYProgress } = useScroll({
    container: scrollContainerRef,
    offset: ["start start", "end end"]
  });

  const frameIndex = useTransform(scrollYProgress, [0, 1], [0, FRAME_COUNT - 1]);

  const drawFrame = (index: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imagesRef.current[Math.round(index)];
    if (img && img.complete) {
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const x = (canvas.width / 2) - (img.width / 2) * scale;
      const y = (canvas.height / 2) - (img.height / 2) * scale;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
    }
  };

  useEffect(() => {
    return frameIndex.on("change", (latest) => {
      drawFrame(latest);
    });
  }, [frameIndex]);

  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
        drawFrame(frameIndex.get());
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [frameIndex]);

  return (
    <div className="lp-bg-sequence">
      <canvas ref={canvasRef} className="lp-bg-canvas" />
      <div className="lp-bg-overlay-1" />
      <div className="lp-bg-overlay-2" />
    </div>
  );
}

// ─── Landing Page ───────────────────────────────────────

export const LandingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={scrollContainerRef} className="lp-root">

      <AnimatePresence>
        {isLoading && <Preloader onComplete={() => setIsLoading(false)} />}
      </AnimatePresence>

      {!isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="landing-page-root"
        >
          {/* Global Background Sequence */}
          <BackgroundSequence scrollContainerRef={scrollContainerRef} />

          {/* Foreground Content Layer */}
          <div className="landing-foreground-content">
            <Navigation scrollContainerRef={scrollContainerRef} />

            {/* Hero Section */}
            <section className="landing-hero-section" id="home">
              <AuroraBackground />
              <HeroText />
              <CTAButton />
            </section>

            {/* Other Sections */}
            <div className="landing-other-sections">
              <FeatureCards />
              <HowItWorks />
              <About />
              <Contact />
            </div>
          </div>
        </motion.div>
      )}

      {/* Shimmer keyframe for loading placeholder */}
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};
