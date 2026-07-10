import {
  EffectComposer,
  Bloom,
  Vignette,
  ChromaticAberration,
} from '@react-three/postprocessing';
import { BlendFunction, KernelSize } from 'postprocessing';
import { Vector2 } from 'three';

const CA_OFFSET = new Vector2(0.0003, 0.0003);

export function PostEffects() {
  return (
    <EffectComposer multisampling={4}>
      {/* Bloom: low threshold so emissive joints/fingertips/edge-strip all bloom */}
      <Bloom
        luminanceThreshold={0.28}
        luminanceSmoothing={0.5}
        intensity={1.4}
        kernelSize={KernelSize.LARGE}
        mipmapBlur
      />
      {/* Subtle lens chromatic aberration */}
      <ChromaticAberration
        offset={CA_OFFSET}
        radialModulation={false}
        modulationOffset={0}
      />
      {/* Dark vignette to push focus to center */}
      <Vignette
        offset={0.28}
        darkness={0.62}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
