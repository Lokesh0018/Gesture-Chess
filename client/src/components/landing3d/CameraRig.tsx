import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';

// Camera sits back far enough to frame the board (8 units wide) + both hands
// fov 38 at z=18 → ~13 unit field at board depth — tight, cinematic
const CAM_Z   = 17;
const CAM_Y   = 3.5;
const LOOK_AT = new THREE.Vector3(0, 0.5, 0);

export function CameraRig() {
  const camRef = useRef<THREE.PerspectiveCamera>(null);

  useFrame(({ pointer }) => {
    if (!camRef.current) return;

    // Parallax: camera shifts ~±0.4 units opposite cursor — subtle "display case" feel
    const targetX = -pointer.x * 0.4;
    const targetY =  CAM_Y + pointer.y * 0.22;

    camRef.current.position.x = THREE.MathUtils.lerp(camRef.current.position.x, targetX, 0.04);
    camRef.current.position.y = THREE.MathUtils.lerp(camRef.current.position.y, targetY, 0.04);
    camRef.current.lookAt(LOOK_AT);
  });

  return (
    <PerspectiveCamera
      ref={camRef}
      makeDefault
      fov={38}
      position={[0, CAM_Y, CAM_Z]}
      near={0.1}
      far={120}
    />
  );
}
