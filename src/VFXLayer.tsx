import { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { vfx } from './vfx-manager';

export type VFXHandle = {
  spawnCaptureParticles: (x: number, y: number, color?: string) => void;
  spawnPromotionGlow: (x: number, y: number) => void;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  color: string;
  type: 'shatter' | 'dust' | 'glow' | 'ember' | 'falling-dust';
};

function VFXLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const activeParticles: Particle[] = [];

      for (const p of particlesRef.current) {
        p.life -= dt;
        if (p.life <= 0) continue;

        // Physics
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.type === 'shatter' || p.type === 'ember') {
          p.vy += 800 * dt; // gravity
        } else if (p.type === 'dust' || p.type === 'glow') {
          p.vy -= 100 * dt; // float up
          p.x += Math.sin(p.life * 5) * 20 * dt; // sway
        } else if (p.type === 'falling-dust') {
          p.vy += 50 * dt; // gentle gravity
          p.x += Math.sin(p.life * 5) * 10 * dt; // slight sway
        }

        // Render
        const progress = p.life / p.maxLife;
        ctx.globalAlpha = Math.max(0, progress);
        ctx.fillStyle = p.color;

        if (p.type === 'glow') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * (1 + (1 - progress)), 0, Math.PI * 2);
          ctx.shadowBlur = 20;
          ctx.shadowColor = p.color;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        }

        activeParticles.push(p);
      }

      particlesRef.current = activeParticles;
      animationRef.current = requestAnimationFrame(render);
    };

    animationRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const spawnCaptureParticles = (x: number, y: number, color = '#ebecd0') => {
    const newParticles: Particle[] = [];
    const baseColor = color === 'black' ? '#4a4a4a' : '#f0d9b5';
    
    // Intense glowing core burst
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 400, // fast explosion
        vy: (Math.random() - 0.5) * 400,
        size: Math.random() * 8 + 4,
        life: 0.3 + Math.random() * 0.3,
        maxLife: 0.6,
        color: '#ff4d4d',
        type: 'glow'
      });
    }

    // Glowing embers shooting outwards and falling
    for (let i = 0; i < 30; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 300,
        vy: (Math.random() - 1) * 300, // biased upwards initially
        size: Math.random() * 4 + 2,
        life: 0.5 + Math.random() * 1.5,
        maxLife: 2.0,
        color: '#ff9933', // orange embers
        type: 'ember'
      });
    }

    // Scattered piece dust
    for (let i = 0; i < 15; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40,
        vx: (Math.random() - 0.5) * 150,
        vy: (Math.random() - 0.5) * 150 - 50,
        size: Math.random() * 5 + 2,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        color: baseColor,
        type: 'dust'
      });
    }
    particlesRef.current.push(...newParticles);
  };

  const spawnPromotionGlow = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    for (let i = 0; i < 40; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 50,
        y: y + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 200,
        vy: (Math.random() - 1.5) * 200,
        size: Math.random() * 15 + 5,
        life: 0.8 + Math.random() * 0.5,
        maxLife: 1.5,
        color: '#ffd700',
        type: 'glow'
      });
    }
    particlesRef.current.push(...newParticles);
  };

  const spawnClassicalDust = (x: number, y: number) => {
    const newParticles: Particle[] = [];
    const colors = ['#d4b886', '#e8dcc8', '#ffffff', '#a89472'];
    for (let i = 0; i < 25; i++) {
      newParticles.push({
        x: x + (Math.random() - 0.5) * 40,
        y: y + (Math.random() - 0.5) * 40 + 20, // Start slightly lower, like dust falling from sculpting
        vx: (Math.random() - 0.5) * 30, // Very slow horizontal drift
        vy: Math.random() * 40 + 10,    // Slow vertical drift downwards like heavy dust
        size: Math.random() * 3 + 1.5,
        life: 1.0 + Math.random() * 1.0,
        maxLife: 2.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'falling-dust'
      });
    }
    particlesRef.current.push(...newParticles);
  };

  useEffect(() => {
    return vfx.subscribe((type, x, y, color) => {
      if (type === 'capture') {
        spawnCaptureParticles(x, y, color);
      } else if (type === 'promotion') {
        spawnPromotionGlow(x, y);
      } else if (type === 'classicalDust') {
        spawnClassicalDust(x, y);
      }
    });
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0, left: 0,
        width: '100vw', height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}

export default VFXLayer;
