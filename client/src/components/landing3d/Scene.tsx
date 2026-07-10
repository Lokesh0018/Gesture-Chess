import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraRig } from './CameraRig';
import { Lighting } from './Lighting';
import { PostEffects } from './PostEffects';
import { AnimatedScene } from './AnimatedScene';
import { Particles } from './Particles';
import { MobileFallback } from './MobileFallback';

// ─── Definitive GPU / WebGL check ─────────────────────────
// We REQUIRE WebGL2 (or WebGL1 with EXT_shader_texture_lod for PBR).
// Only falls back if the hardware genuinely cannot run it.
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');

    // Try WebGL2 first
    const gl2 = canvas.getContext('webgl2');
    if (gl2) return true;

    // Fallback check for WebGL1 — still viable with three.js
    const gl1 = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl1) return false;

    // Block only confirmed software renderers — never assume low-end without proof
    const dbg = (gl1 as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
    if (dbg) {
      const renderer = (gl1 as WebGLRenderingContext).getParameter(dbg.UNMASKED_RENDERER_WEBGL) as string;
      if (/swiftshader|llvmpipe|software rasterizer/i.test(renderer)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

function isMobileViewport(): boolean {
  return typeof window !== 'undefined' && window.innerWidth < 680;
}

// ─── Shimmer loading state ─────────────────────────────────
function LoadingPlaceholder() {
  return (
    <div className="absolute inset-0 bg-[#08111F] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-3 h-3 rounded-full bg-[#3B82F6] animate-ping" />
        <span className="text-slate-500 text-sm tracking-widest font-mono uppercase">
          Initialising WebGL
        </span>
      </div>
    </div>
  );
}

// ─── Root ──────────────────────────────────────────────────
export function Scene() {
  // Start assuming 3D — only downgrade after mount if we have proof it won't work
  const [mode, setMode] = useState<'3d' | '2d' | 'checking'>('checking');

  useEffect(() => {
    if (isMobileViewport() || !detectWebGL()) {
      setMode('2d');
    } else {
      setMode('3d');
    }
  }, []);

  if (mode === 'checking') return <LoadingPlaceholder />;
  if (mode === '2d')       return <MobileFallback />;

  return (
    <Suspense fallback={<LoadingPlaceholder />}>
      <Canvas
        style={{ position: 'absolute', inset: 0 }}
        gl={{
          antialias: true,
          alpha: false,            // solid background — no transparency compositing cost
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }}
        shadows="soft"
        dpr={[1, Math.min(window.devicePixelRatio, 1.5)]}
      >
        {/* Solid scene background */}
        <color attach="background" args={['#08111F']} />
        {/* Fog: starts at 20 to hide far edge of board, ends at 60 */}
        <fog attach="fog" args={['#08111F', 20, 60]} />

        <CameraRig />
        <Lighting />
        <AnimatedScene />
        <Particles />
        <PostEffects />
      </Canvas>
    </Suspense>
  );
}
