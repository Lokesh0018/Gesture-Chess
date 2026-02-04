import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import * as THREE from 'three';

export function Lighting() {
  const rimLRef = useRef<THREE.PointLight>(null);
  const rimRRef = useRef<THREE.PointLight>(null);
  const fillRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    const pulse = 3.5 + Math.sin(t * 0.7) * 0.8;
    if (rimLRef.current) rimLRef.current.intensity = pulse;
    if (rimRRef.current) rimRRef.current.intensity = pulse + 0.3;
    if (fillRef.current)
      fillRef.current.intensity = 1.0 + Math.sin(t * 0.4) * 0.3;
  });

  return (
    <>
      {/* Near-black ambient — prevents total shadow loss */}
      <ambientLight color="#080e1c" intensity={0.12} />

      {/* Key: cool blue-white spot from top-front, soft shadows */}
      <spotLight
        color="#dce8ff"
        intensity={4.5}
        position={[0, 14, 10]}
        angle={Math.PI / 5}
        penumbra={0.7}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.00008}
      />

      {/* Secondary key fill from slightly left so pieces get left-face shading */}
      <directionalLight color="#a8c8ff" intensity={0.6} position={[-6, 8, 6]} />

      {/* Rim LEFT — blue to silhouette left hand fingers from behind */}
      <pointLight
        ref={rimLRef}
        color="#2563EB"
        intensity={3.5}
        position={[-9, 2.5, -5]}
        distance={28}
        decay={2}
      />

      {/* Rim RIGHT */}
      <pointLight
        ref={rimRRef}
        color="#3B82F6"
        intensity={3.8}
        position={[9, 2.5, -5]}
        distance={28}
        decay={2}
      />

      {/* Under-board blue uplighter — makes the board glow disc believable */}
      <pointLight
        ref={fillRef}
        color="#60A5FA"
        intensity={1.0}
        position={[0, -3.5, 0]}
        distance={14}
        decay={2}
      />

      {/* Dark studio HDRI — essential for metalness reflections to look real */}
      <Environment preset="studio" environmentIntensity={0.18} />
    </>
  );
}
