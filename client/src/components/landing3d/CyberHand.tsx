import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Shared PBR plating material (singleton) ─────────────
const PLATING_MAT = new THREE.MeshPhysicalMaterial({
  color: '#1c2330',
  metalness: 0.90,
  roughness: 0.32,
  clearcoat: 0.65,
  clearcoatRoughness: 0.12,
  envMapIntensity: 1.2,
});

const SEAM_MAT = new THREE.MeshStandardMaterial({
  color: '#05080c',
  roughness: 0.65,
  metalness: 0.45,
});

const GLASS_MAT = new THREE.MeshPhysicalMaterial({
  color: '#1a3a6e',
  metalness: 0.05,
  roughness: 0.08,
  transmission: 0.72,
  thickness: 0.6,
  transparent: true,
  opacity: 0.55,
});

// Joint material instance — we pulse emissiveIntensity per-frame via refs
function makeJointMat() {
  return new THREE.MeshStandardMaterial({
    color: '#60A5FA',
    emissive: '#60A5FA',
    emissiveIntensity: 0.9,
    metalness: 0.35,
    roughness: 0.38,
  });
}

// ─── Geometry helpers ──────────────────────────────────────
function cylinderGeo(rTop: number, rBot: number, h: number, segs = 10) {
  return new THREE.CylinderGeometry(rTop, rBot, h, segs);
}

// ─── Glowing joint sphere ──────────────────────────────────
interface JointProps {
  r?: number;
  timeOffset?: number;
}
function Joint({ r = 0.11, timeOffset = 0 }: JointProps) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (matRef.current)
      matRef.current.emissiveIntensity = 0.6 + Math.sin(clock.getElapsedTime() * 2.2 + timeOffset) * 0.5;
  });
  const mat = useMemo(makeJointMat, []);
  matRef.current = mat; // keep ref in sync

  return (
    <mesh material={mat} castShadow>
      <sphereGeometry args={[r, 12, 12]} />
    </mesh>
  );
}

// ─── One phalanx segment ──────────────────────────────────
interface PhalanxProps {
  length: number;
  rTop?: number;
  rBot?: number;
}
function Phalanx({ length, rTop = 0.072, rBot = 0.085 }: PhalanxProps) {
  const geo = useMemo(() => cylinderGeo(rTop, rBot, length), [length, rTop, rBot]);
  return (
    <group>
      <mesh geometry={geo} material={PLATING_MAT} position={[0, length / 2, 0]} castShadow />
      {/* Panel seam */}
      <mesh position={[0, length / 2, rBot + 0.001]} material={SEAM_MAT}>
        <boxGeometry args={[0.01, length * 0.7, 0.004]} />
      </mesh>
    </group>
  );
}

// ─── 3-bone finger chain ───────────────────────────────────
interface FingerProps {
  proxL: number; midL: number; distL: number;
  baseAngle?: number;
  spreadZ?: number;
  curl: number;         // 0=straight, 1=full pinch
  timeOffset?: number;
}
function Finger({ proxL, midL, distL, baseAngle = -0.08, spreadZ = 0, curl, timeOffset = 0 }: FingerProps) {
  const proxCurl = curl * -1.22;   // ~70° at full curl
  const midCurl  = curl * -1.40;   // ~80°
  const distCurl = curl * -0.87;   // ~50°

  return (
    <group rotation-z={spreadZ}>
      {/* Proximal */}
      <group rotation-x={baseAngle + proxCurl}>
        <Joint r={0.092} timeOffset={timeOffset} />
        <Phalanx length={proxL} rBot={0.085} rTop={0.074} />

        {/* Middle */}
        <group position={[0, proxL, 0]} rotation-x={midCurl}>
          <Joint r={0.078} timeOffset={timeOffset + 0.4} />
          <Phalanx length={midL} rBot={0.074} rTop={0.062} />

          {/* Distal */}
          <group position={[0, midL, 0]} rotation-x={distCurl}>
            <Joint r={0.065} timeOffset={timeOffset + 0.8} />
            <Phalanx length={distL} rBot={0.062} rTop={0.044} />

            {/* Fingertip emissive */}
            <mesh position={[0, distL, 0]}>
              <sphereGeometry args={[0.055, 10, 10]} />
              <meshStandardMaterial color="#60A5FA" emissive="#60A5FA"
                emissiveIntensity={1.4} transparent opacity={0.85} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
}

// ─── 2-bone thumb ─────────────────────────────────────────
function Thumb({ curl }: { curl: number }) {
  const proxL = 0.30;
  const distL = 0.22;
  const proxCurl = curl * -0.87;
  const distCurl = curl * -0.70;

  return (
    <group position={[-0.25, 0.04, 0.07]} rotation-z={-0.75} rotation-y={0.35}>
      <group rotation-x={proxCurl}>
        <Joint r={0.098} />
        <Phalanx length={proxL} rBot={0.088} rTop={0.076} />
        <group position={[0, proxL, 0]} rotation-x={distCurl}>
          <Joint r={0.082} />
          <Phalanx length={distL} rBot={0.076} rTop={0.055} />
          <mesh position={[0, distL, 0]}>
            <sphereGeometry args={[0.062, 10, 10]} />
            <meshStandardMaterial color="#60A5FA" emissive="#60A5FA"
              emissiveIntensity={1.4} transparent opacity={0.85} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

// ─── Palm chassis ──────────────────────────────────────────
function Palm() {
  return (
    <group>
      {/* Main block */}
      <mesh material={PLATING_MAT} castShadow>
        <boxGeometry args={[0.58, 0.16, 0.42]} />
      </mesh>
      {/* Horizontal seam */}
      <mesh position={[0, 0.081, 0]} material={SEAM_MAT}>
        <boxGeometry args={[0.52, 0.006, 0.006]} />
      </mesh>
      {/* Vertical seam */}
      <mesh position={[0, 0.081, 0]} rotation-y={Math.PI / 2} material={SEAM_MAT}>
        <boxGeometry args={[0.36, 0.006, 0.006]} />
      </mesh>
      {/* Bolt studs */}
      {([[-0.2, 0.082, 0.12],[0.2, 0.082, 0.12],[-0.2, 0.082,-0.12],[0.2, 0.082,-0.12]] as [number,number,number][]).map((p, i) => (
        <mesh key={i} position={p}>
          <cylinderGeometry args={[0.018, 0.018, 0.010, 8]} />
          <meshStandardMaterial color="#3a4055" metalness={0.85} roughness={0.28} />
        </mesh>
      ))}
    </group>
  );
}

// ─── Forearm ───────────────────────────────────────────────
function Forearm() {
  const circuitMatRef = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (circuitMatRef.current) {
      circuitMatRef.current.emissiveIntensity = 0.5 + Math.sin(clock.getElapsedTime() * 3) * 0.3;
    }
  });

  return (
    <group>
      {/* Main cylinder */}
      <mesh material={PLATING_MAT} position={[0, -0.6, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.20, 1.0, 14]} />
      </mesh>

      {/* Glass strip */}
      <mesh position={[0, -0.6, 0.18]} material={GLASS_MAT}>
        <boxGeometry args={[0.065, 0.72, 0.030]} />
      </mesh>

      {/* Circuit trace */}
      <mesh position={[0, -0.6, 0.196]}>
        <boxGeometry args={[0.010, 0.62, 0.010]} />
        <meshStandardMaterial ref={circuitMatRef}
          color="#38BDF8" emissive="#38BDF8" emissiveIntensity={0.5}
          transparent opacity={0.75} />
      </mesh>

      {/* Wrist actuator ring */}
      <mesh position={[0, -0.08, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.185, 0.030, 10, 28]} />
        <meshPhysicalMaterial color="#1e2838" metalness={0.92} roughness={0.22} clearcoat={0.55} />
      </mesh>

      {/* Hydraulic strut L */}
      <mesh position={[0.13, -0.30, 0.10]} rotation-z={0.18}>
        <cylinderGeometry args={[0.016, 0.024, 0.42, 8]} />
        <meshStandardMaterial color="#2e3848" metalness={0.88} roughness={0.28} />
      </mesh>
      {/* Hydraulic strut R */}
      <mesh position={[-0.13, -0.30, 0.10]} rotation-z={-0.18}>
        <cylinderGeometry args={[0.016, 0.024, 0.42, 8]} />
        <meshStandardMaterial color="#2e3848" metalness={0.88} roughness={0.28} />
      </mesh>
    </group>
  );
}

// ─── Full articulated hand ─────────────────────────────────
interface CyberHandProps {
  side: 'left' | 'right';
  curlAmount?: number;
  wristRotation?: number;
}

export function CyberHand({ side, curlAmount = 0, wristRotation = 0 }: CyberHandProps) {
  const groupRef = useRef<THREE.Group>(null);
  const isRight = side === 'right';

  // Staggered per-digit curl
  const thumbCurl  = Math.min(1, curlAmount * 1.25);
  const indexCurl  = curlAmount;
  const middleCurl = Math.max(0, curlAmount - 0.04);
  const ringCurl   = Math.max(0, curlAmount - 0.08);
  const pinkyCurl  = Math.max(0, curlAmount - 0.12);

  // Idle breathing (additive, small amplitude)
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const phase = isRight ? 0.6 : 0;
    groupRef.current.position.y = (isRight ? -1.8 : -1.8) + Math.sin((t + phase) * 0.75) * 0.06;
  });

  // Hands anchor at bottom-left / bottom-right, angle diagonally toward board center
  const posX = isRight ?  5.2 : -5.2;
  const posZ = 4.8;
  const rotY = isRight ? -0.42 : 0.42;
  const rotZ = isRight ?  0.28 : -0.28;
  const scaleX = isRight ? -1 : 1;

  return (
    <group
      ref={groupRef}
      position={[posX, -1.8, posZ]}
      rotation={[0.35, rotY, rotZ]}
      scale={[scaleX * 3.4, 3.4, 3.4]}
    >
      <group rotation-x={wristRotation}>
        <Forearm />

        {/* Palm sits above forearm top */}
        <group position={[0, 0.09, 0]}>
          <Palm />

          {/* Finger attachment points along palm top-front edge */}
          {/* Index */}
          <group position={[0.16, 0.085, -0.17]}>
            <Finger proxL={0.34} midL={0.25} distL={0.17}
              baseAngle={-0.10} spreadZ={-0.08}
              curl={indexCurl} timeOffset={0} />
          </group>

          {/* Middle */}
          <group position={[0.06, 0.085, -0.19]}>
            <Finger proxL={0.37} midL={0.27} distL={0.19}
              baseAngle={-0.06}
              curl={middleCurl} timeOffset={0.18} />
          </group>

          {/* Ring */}
          <group position={[-0.06, 0.085, -0.17]}>
            <Finger proxL={0.33} midL={0.23} distL={0.16}
              baseAngle={-0.06} spreadZ={0.08}
              curl={ringCurl} timeOffset={0.32} />
          </group>

          {/* Pinky */}
          <group position={[-0.16, 0.085, -0.13]}>
            <Finger proxL={0.25} midL={0.18} distL={0.13}
              baseAngle={-0.06} spreadZ={0.16}
              curl={pinkyCurl} timeOffset={0.46} />
          </group>

          {/* Thumb */}
          <Thumb curl={thumbCurl} />
        </group>
      </group>
    </group>
  );
}
