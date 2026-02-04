import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GestureBeamProps {
  start: [number, number, number];
  end:   [number, number, number];
  visible: boolean;
  color?: string;
}

export function GestureBeam({ start, end, visible, color = '#60A5FA' }: GestureBeamProps) {
  const coreRef  = useRef<THREE.Mesh>(null);
  const glowRef  = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Bezier arc geometry — rebuilt when endpoints change
  const [coreGeo, glowGeo] = useMemo(() => {
    const s = new THREE.Vector3(...start);
    const e = new THREE.Vector3(...end);
    const mid = new THREE.Vector3(
      (s.x + e.x) / 2,
      Math.max(s.y, e.y) + 2.5,   // arc peak scaled up
      (s.z + e.z) / 2
    );
    const curve = new THREE.QuadraticBezierCurve3(s, mid, e);
    return [
      new THREE.TubeGeometry(curve, 40, 0.030, 8, false),
      new THREE.TubeGeometry(curve, 40, 0.090, 8, false),
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...start, ...end]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    groupRef.current.visible = visible;
    if (!visible) return;
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      const m = coreRef.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = 1.8 + Math.sin(t * 7) * 0.6;
      m.opacity = 0.85 + Math.sin(t * 5) * 0.12;
    }
    if (glowRef.current) {
      const m = glowRef.current.material as THREE.MeshStandardMaterial;
      m.opacity = 0.22 + Math.sin(t * 3.5) * 0.10;
    }
  });

  return (
    <group ref={groupRef} visible={visible}>
      {/* Bright core */}
      <mesh ref={coreRef} geometry={coreGeo}>
        <meshStandardMaterial color="#ffffff" emissive={color}
          emissiveIntensity={1.8} transparent opacity={0.9} />
      </mesh>
      {/* Soft glow halo */}
      <mesh ref={glowRef} geometry={glowGeo}>
        <meshStandardMaterial color={color} emissive={color}
          emissiveIntensity={0.9} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      {/* Source orb */}
      <mesh position={start}>
        <sphereGeometry args={[0.10, 12, 12]} />
        <meshStandardMaterial color="#ffffff" emissive={color}
          emissiveIntensity={3.0} transparent opacity={0.9} />
      </mesh>
      {/* Destination orb */}
      <mesh position={end}>
        <sphereGeometry args={[0.13, 12, 12]} />
        <meshStandardMaterial color={color} emissive={color}
          emissiveIntensity={2.2} transparent opacity={0.8} depthWrite={false} />
      </mesh>
    </group>
  );
}
