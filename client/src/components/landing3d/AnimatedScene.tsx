import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { ChessBoard, type SquareHighlight, SQUARE_SIZE, BOARD_EXTENT, BOARD_THICKNESS } from './ChessBoard';
import { ChessPieces } from './ChessPieces';
import { CyberHand } from './CyberHand';
import { GestureBeam } from './GestureBeam';

// ─── Pre-scripted demo moves ───────────────────────────────
// from/to as [row, col], 0-indexed, white at row 0
const DEMO_MOVES = [
  { from: [1, 4], to: [3, 4] },   // e2–e4
  { from: [6, 4], to: [4, 4] },   // e7–e5
  { from: [0, 6], to: [2, 5] },   // Nf3
  { from: [7, 1], to: [5, 2] },   // Nc6
];

// Board-position → 3D world coords
function squareWorld(row: number, col: number): [number, number, number] {
  return [
    col * SQUARE_SIZE - BOARD_EXTENT + SQUARE_SIZE / 2,
    BOARD_THICKNESS / 2 + 0.05,
    row * SQUARE_SIZE - BOARD_EXTENT + SQUARE_SIZE / 2,
  ];
}

// Left-hand fingertip world position (matched to hand scale 3.4 at x=-5.2, z=4.8)
const LEFT_TIP: [number, number, number] = [-4.2, 0.8, 4.0];

export function AnimatedScene() {
  const [moveIndex, setMoveIndex]     = useState(0);
  const [highlights, setHighlights]   = useState<SquareHighlight[]>([]);
  const [beamVisible, setBeamVisible] = useState(false);

  // Continuous animated values as refs — no per-frame setState
  const anim = useRef({ leftCurl: 0, rightCurl: 0, leftWrist: 0, rightWrist: 0 });

  // What the hand components actually read each render
  const [leftCurl,   setLeftCurl]   = useState(0);
  const [rightCurl,  setRightCurl]  = useState(0);
  const [leftWrist,  setLeftWrist]  = useState(0);
  const [rightWrist, setRightWrist] = useState(0);

  const tlRef    = useRef<gsap.core.Timeline | null>(null);
  const delayRef = useRef<gsap.core.Tween    | null>(null);

  // Sync GSAP proxy → display state every 2 frames
  const frameCount = useRef(0);
  useFrame(() => {
    frameCount.current++;
    if (frameCount.current % 2 !== 0) return;
    const a = anim.current;
    setLeftCurl(a.leftCurl);
    setRightCurl(a.rightCurl);
    setLeftWrist(a.leftWrist);
    setRightWrist(a.rightWrist);
  });

  useEffect(() => {
    const a = anim.current;
    const move = DEMO_MOVES[moveIndex];

    const runCycle = () => {
      const tl = gsap.timeline({
        onComplete: () => {
          setMoveIndex(prev => (prev + 1) % DEMO_MOVES.length);
          delayRef.current = gsap.delayedCall(1.8, runCycle);
        },
      });
      tlRef.current = tl;

      // ① Left hand wrist lifts toward board, then index/pinch curl
      tl.to(a, {
        leftWrist: 0.18, duration: 0.85, ease: 'power2.inOut',
        onStart: () => {
          setHighlights([{ row: move.from[0], col: move.from[1], type: 'source' }]);
        },
      })
      // ② Beam fires + fingers curl to ~70%
      .to(a, {
        leftCurl: 0.72, duration: 1.05, ease: 'power2.inOut',
        onStart: () => setBeamVisible(true),
      }, '+=0.15')
      // ③ Grip tightens (piece lifts)
      .to(a, {
        leftCurl: 0.92, duration: 0.48, ease: 'power2.out',
      }, '+=0.25')
      // ④ Drag — wrist pulls back, partial uncurl as hand "carries"
      .to(a, {
        leftWrist: -0.12, leftCurl: 0.58, duration: 1.6, ease: 'power2.inOut',
        onStart: () => {
          setHighlights([
            { row: move.from[0], col: move.from[1], type: 'source' },
            { row: move.to[0],   col: move.to[1],   type: 'destination' },
          ]);
        },
      })
      // ⑤ Right hand rotates in to receive
      .to(a, {
        rightWrist: 0.22, rightCurl: 0.82, duration: 0.85, ease: 'power2.inOut',
      }, '+=0.18')
      // ⑥ Right releases piece: fingers open
      .to(a, {
        rightCurl: 0.28, rightWrist: 0.06, duration: 0.55, ease: 'power2.out',
        onStart: () => setBeamVisible(false),
      }, '+=0.28')
      // ⑦ Both hands settle back to idle
      .to(a, {
        leftCurl: 0, leftWrist: 0, rightCurl: 0, rightWrist: 0,
        duration: 1.1, ease: 'power2.inOut',
        onComplete: () => setHighlights([]),
      });
    };

    delayRef.current = gsap.delayedCall(1.2, runCycle);

    return () => {
      delayRef.current?.kill();
      tlRef.current?.kill();
      // Reset proxy
      a.leftCurl = 0; a.rightCurl = 0; a.leftWrist = 0; a.rightWrist = 0;
    };
  }, [moveIndex]);

  const move = DEMO_MOVES[moveIndex];
  const beamEnd = squareWorld(move.from[0], move.from[1]);

  return (
    <group>
      <ChessBoard highlights={highlights} />
      <ChessPieces />

      <CyberHand side="left"  curlAmount={leftCurl}  wristRotation={leftWrist}  />
      <CyberHand side="right" curlAmount={rightCurl} wristRotation={rightWrist} />

      <GestureBeam start={LEFT_TIP} end={beamEnd} visible={beamVisible} />
    </group>
  );
}
