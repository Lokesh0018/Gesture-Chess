import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Sparse, depth-cued particles — NOT random scattered dots.
// 28 particles, positioned in a volume that flanks the board but stays behind it
// so they never compete with the hero. Size varies 0.03–0.09 to imply depth.

const COUNT = 28;

interface ParticleState {
  pos: THREE.Vector3;
  vel: THREE.Vector3;
  size: number;
  phase: number;
  depth: number; // 0=near, 1=far — drives size/opacity falloff
}

export function Particles() {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy   = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo<ParticleState[]>(() =>
    Array.from({ length: COUNT }, () => {
      const depth = Math.random();
      return {
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 22,
          (Math.random() - 0.5) * 10 + 1,
          -2 - depth * 14               // all behind the board (negative Z)
        ),
        vel: new THREE.Vector3(
          (Math.random() - 0.5) * 0.004,
          Math.random() * 0.007 + 0.003,
          0
        ),
        size:  0.03 + (1 - depth) * 0.06,   // nearer = bigger
        phase: Math.random() * Math.PI * 2,
        depth,
      };
    }), []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      p.pos.add(p.vel);
      p.pos.x += Math.sin(t * 0.4 + p.phase) * 0.003;

      // Wrap vertically
      if (p.pos.y > 7) {
        p.pos.y = -4;
        p.pos.x = (Math.random() - 0.5) * 22;
      }

      const s = p.size * (0.85 + Math.sin(t * 1.8 + p.phase) * 0.15);
      dummy.position.copy(p.pos);
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial
        color="#60A5FA" emissive="#60A5FA" emissiveIntensity={1.5}
        transparent opacity={0.35} depthWrite={false}
      />
    </instancedMesh>
  );
}
