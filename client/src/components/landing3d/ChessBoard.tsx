import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

// ─── Board constants (exported for piece/hand placement) ─
// Board is now 8×8 = 8 world units wide — big enough to dominate the hero
export const SQUARE_SIZE = 1.0;
export const BOARD_SIZE  = 8;
export const BOARD_EXTENT  = (BOARD_SIZE * SQUARE_SIZE) / 2;   // 4.0
export const BOARD_THICKNESS = 0.22;
export const FRAME_INSET  = 0.3;   // frame lip width

const LIGHT_SQUARE = '#D4A96A';  // warm gold-ivory
const DARK_SQUARE  = '#3A2010';  // deep walnut
const FRAME_COLOR  = '#0d1220';
const EDGE_GLOW    = '#60A5FA';

// ─── 64 squares via InstancedMesh ─────────────────────────
function BoardSquares() {
  const lightRef = useRef<THREE.InstancedMesh>(null);
  const darkRef  = useRef<THREE.InstancedMesh>(null);
  const dummy    = useMemo(() => new THREE.Object3D(), []);

  const lightMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: LIGHT_SQUARE,
    roughness: 0.45,
    metalness: 0.08,
    clearcoat: 0.2,
    clearcoatRoughness: 0.3,
  }), []);

  const darkMat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: DARK_SQUARE,
    roughness: 0.55,
    metalness: 0.12,
    clearcoat: 0.15,
  }), []);

  const squareGeo = useMemo(() =>
    new THREE.BoxGeometry(SQUARE_SIZE - 0.02, 0.04, SQUARE_SIZE - 0.02), []);

  // Pre-compute matrices once
  const [lightMatrices, darkMatrices] = useMemo(() => {
    const light: THREE.Matrix4[] = [];
    const dark:  THREE.Matrix4[] = [];
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const x = col * SQUARE_SIZE - BOARD_EXTENT + SQUARE_SIZE / 2;
        const z = row * SQUARE_SIZE - BOARD_EXTENT + SQUARE_SIZE / 2;
        dummy.position.set(x, BOARD_THICKNESS / 2 + 0.001, z);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        const m = dummy.matrix.clone();
        if ((row + col) % 2 === 0) light.push(m);
        else dark.push(m);
      }
    }
    return [light, dark];
  }, []);

  useMemo(() => {
    if (lightRef.current) {
      lightMatrices.forEach((m, i) => lightRef.current!.setMatrixAt(i, m));
      lightRef.current.instanceMatrix.needsUpdate = true;
    }
    if (darkRef.current) {
      darkMatrices.forEach((m, i) => darkRef.current!.setMatrixAt(i, m));
      darkRef.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group>
      <instancedMesh ref={lightRef} args={[squareGeo, lightMat, 32]} receiveShadow />
      <instancedMesh ref={darkRef}  args={[squareGeo, darkMat,  32]} receiveShadow />
    </group>
  );
}

// ─── Board frame (bevelled RoundedBox) ────────────────────
function BoardFrame() {
  const mat = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: FRAME_COLOR,
    metalness: 0.75,
    roughness: 0.28,
    clearcoat: 0.5,
    clearcoatRoughness: 0.1,
  }), []);

  const totalW = BOARD_SIZE * SQUARE_SIZE + FRAME_INSET * 2;
  return (
    <RoundedBox args={[totalW, BOARD_THICKNESS, totalW]} radius={0.07} smoothness={4}
      castShadow receiveShadow>
      <primitive object={mat} attach="material" />
    </RoundedBox>
  );
}

// ─── Emissive bevel edge ring ──────────────────────────────
function EdgeGlowStrip() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.emissiveIntensity = 0.7 + Math.sin(clock.getElapsedTime() * 1.4) * 0.5;
  });

  const totalW = BOARD_SIZE * SQUARE_SIZE + FRAME_INSET * 2;
  const hw = totalW / 2;
  const inset = 0.045;

  const geo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-hw, -hw);
    shape.lineTo( hw, -hw);
    shape.lineTo( hw,  hw);
    shape.lineTo(-hw,  hw);
    shape.closePath();
    const hole = new THREE.Path();
    hole.moveTo(-hw + inset, -hw + inset);
    hole.lineTo( hw - inset, -hw + inset);
    hole.lineTo( hw - inset,  hw - inset);
    hole.lineTo(-hw + inset,  hw - inset);
    hole.closePath();
    shape.holes.push(hole);
    return new THREE.ExtrudeGeometry(shape, { depth: 0.025, bevelEnabled: false });
  }, []);

  return (
    <mesh geometry={geo} rotation-x={-Math.PI / 2} position-y={BOARD_THICKNESS / 2 + 0.001}>
      <meshStandardMaterial
        ref={matRef}
        color={EDGE_GLOW}
        emissive={EDGE_GLOW}
        emissiveIntensity={0.7}
        transparent opacity={0.95}
      />
    </mesh>
  );
}

// ─── Soft radial glow disc (AO substitute) ─────────────────
function GlowDisc() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.opacity = 0.18 + Math.sin(clock.getElapsedTime() * 0.6) * 0.06;
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={-0.6}>
      <circleGeometry args={[6.5, 80]} />
      <meshStandardMaterial
        ref={matRef}
        color={EDGE_GLOW} emissive={EDGE_GLOW} emissiveIntensity={0.3}
        transparent opacity={0.18} side={THREE.DoubleSide} depthWrite={false}
      />
    </mesh>
  );
}

// ─── Square highlight rings ────────────────────────────────
export interface SquareHighlight { row: number; col: number; type: 'source' | 'destination'; }

function HighlightRing({ row, col, type }: SquareHighlight) {
  const ref = useRef<THREE.Mesh>(null);
  const x = col * SQUARE_SIZE - BOARD_EXTENT + SQUARE_SIZE / 2;
  const z = row * SQUARE_SIZE - BOARD_EXTENT + SQUARE_SIZE / 2;
  const color = type === 'source' ? '#60A5FA' : '#38BDF8';

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    const s = 0.8 + Math.sin(t * 4) * 0.18;
    ref.current.scale.set(s, s, s);
    (ref.current.material as THREE.MeshStandardMaterial).opacity = 0.55 + Math.sin(t * 4) * 0.3;
  });

  return (
    <mesh ref={ref} position={[x, BOARD_THICKNESS / 2 + 0.03, z]} rotation-x={-Math.PI / 2}>
      <ringGeometry args={[0.3, 0.44, 40]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.5}
        transparent opacity={0.7} side={THREE.DoubleSide} depthWrite={false} />
    </mesh>
  );
}

// ─── Main export ───────────────────────────────────────────
interface ChessBoardProps { highlights?: SquareHighlight[]; }

export function ChessBoard({ highlights = [] }: ChessBoardProps) {
  const boardRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (!boardRef.current) return;
    const t = clock.getElapsedTime();
    boardRef.current.position.y = Math.sin((t * Math.PI * 2) / 6) * 0.12;
    boardRef.current.rotation.y = Math.sin(t * 0.14) * (1.5 * Math.PI / 180);
  });

  return (
    <group ref={boardRef} rotation-x={-0.12}>
      <GlowDisc />
      <BoardFrame />
      <BoardSquares />
      <EdgeGlowStrip />
      {highlights.map((h, i) => (
        <HighlightRing key={`${h.row}-${h.col}-${i}`} {...h} />
      ))}
    </group>
  );
}
