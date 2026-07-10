import { motion } from 'framer-motion';

type FingerPose = {
  base: number;
  mid: number;
  tip: number;
};

type GesturePose = {
  wrist: number;
  palm: number;
  thumb: FingerPose;
  index: FingerPose;
  middle: FingerPose;
  ring: FingerPose;
  little: FingerPose;
};

type HandSide = 'left' | 'right';

type HolographicHandProps = {
  side: HandSide;
};

const leftGestures: GesturePose[] = [
  {
    wrist: -4,
    palm: -2,
    thumb: { base: -18, mid: 9, tip: 8 },
    index: { base: -6, mid: 6, tip: 4 },
    middle: { base: -2, mid: 5, tip: 4 },
    ring: { base: 3, mid: 8, tip: 5 },
    little: { base: 10, mid: 13, tip: 8 },
  },
  {
    wrist: 6,
    palm: 2,
    thumb: { base: -24, mid: 18, tip: 12 },
    index: { base: -8, mid: 3, tip: 2 },
    middle: { base: 28, mid: 31, tip: 18 },
    ring: { base: 38, mid: 34, tip: 20 },
    little: { base: 48, mid: 38, tip: 24 },
  },
  {
    wrist: 1,
    palm: -1,
    thumb: { base: -14, mid: 12, tip: 9 },
    index: { base: 8, mid: 14, tip: 8 },
    middle: { base: 7, mid: 14, tip: 9 },
    ring: { base: 11, mid: 17, tip: 10 },
    little: { base: 17, mid: 20, tip: 12 },
  },
  {
    wrist: 9,
    palm: 3,
    thumb: { base: -33, mid: 25, tip: 16 },
    index: { base: 21, mid: 29, tip: 14 },
    middle: { base: 13, mid: 24, tip: 12 },
    ring: { base: 24, mid: 31, tip: 16 },
    little: { base: 32, mid: 35, tip: 18 },
  },
  {
    wrist: -2,
    palm: 0,
    thumb: { base: -16, mid: 10, tip: 7 },
    index: { base: 2, mid: 8, tip: 5 },
    middle: { base: 1, mid: 8, tip: 5 },
    ring: { base: 7, mid: 11, tip: 7 },
    little: { base: 12, mid: 15, tip: 9 },
  },
];

const rightGestures: GesturePose[] = [
  {
    wrist: 8,
    palm: 1,
    thumb: { base: -39, mid: 32, tip: 17 },
    index: { base: 26, mid: 34, tip: 16 },
    middle: { base: 10, mid: 18, tip: 10 },
    ring: { base: 15, mid: 23, tip: 13 },
    little: { base: 23, mid: 28, tip: 16 },
  },
  {
    wrist: -6,
    palm: -2,
    thumb: { base: -27, mid: 20, tip: 12 },
    index: { base: 9, mid: 12, tip: 7 },
    middle: { base: 4, mid: 10, tip: 6 },
    ring: { base: 10, mid: 15, tip: 9 },
    little: { base: 16, mid: 19, tip: 12 },
  },
  {
    wrist: 3,
    palm: 2,
    thumb: { base: -18, mid: 12, tip: 8 },
    index: { base: -2, mid: 6, tip: 4 },
    middle: { base: 0, mid: 7, tip: 4 },
    ring: { base: 6, mid: 10, tip: 7 },
    little: { base: 12, mid: 15, tip: 10 },
  },
  {
    wrist: 0,
    palm: 0,
    thumb: { base: -20, mid: 13, tip: 8 },
    index: { base: 6, mid: 11, tip: 6 },
    middle: { base: 4, mid: 10, tip: 6 },
    ring: { base: 9, mid: 13, tip: 8 },
    little: { base: 15, mid: 18, tip: 11 },
  },
];

const fingerBases = {
  thumb: { x: 119, y: 160, angle: -54, lengths: [54, 38, 28], widths: [17, 14, 10] },
  index: { x: 158, y: 89, angle: -18, lengths: [72, 49, 34], widths: [16, 13, 10] },
  middle: { x: 198, y: 83, angle: -4, lengths: [82, 54, 37], widths: [17, 14, 10] },
  ring: { x: 236, y: 94, angle: 9, lengths: [73, 48, 33], widths: [15, 12, 9] },
  little: { x: 270, y: 117, angle: 20, lengths: [59, 39, 28], widths: [13, 10, 8] },
};

const spring = {
  duration: 9,
  repeat: Infinity,
  repeatType: 'mirror' as const,
  ease: 'easeInOut' as const,
};

function segmentPath(length: number, width: number) {
  const r = width / 2;
  return `M ${-r} 0 C ${-width} ${length * 0.26}, ${-width * 0.75} ${length * 0.74}, ${-r * 0.48} ${length}
    C ${r * 0.42} ${length + 3}, ${width * 0.78} ${length * 0.78}, ${width * 0.92} ${length * 0.34}
    C ${width * 0.78} ${length * 0.12}, ${r} 0, ${-r} 0 Z`;
}

function joint(cx: number, cy: number, r: number) {
  return (
    <g className="holo-joint" transform={`translate(${cx} ${cy})`}>
      <circle r={r + 3} className="holo-joint-halo" />
      <circle r={r} className="holo-joint-core" />
      <circle r={r * 0.46} className="holo-joint-light" />
    </g>
  );
}

function Finger({
  name,
  poses,
}: {
  name: keyof typeof fingerBases;
  poses: FingerPose[];
}) {
  const finger = fingerBases[name];
  const [baseLength, midLength, tipLength] = finger.lengths;
  const [baseWidth, midWidth, tipWidth] = finger.widths;
  const timings = name === 'index' ? 0 : name === 'middle' ? 0.3 : name === 'ring' ? 0.55 : name === 'little' ? 0.8 : 0.18;

  return (
    <motion.g
      className={`holo-finger holo-finger-${name}`}
      style={{ transformBox: 'fill-box', transformOrigin: '0px 0px' }}
      transform={`translate(${finger.x} ${finger.y}) rotate(${finger.angle})`}
      animate={{ rotate: poses.map((pose) => pose.base) }}
      transition={{ ...spring, delay: timings }}
    >
      <path className="holo-bone" d={segmentPath(baseLength, baseWidth)} />
      <path className="holo-circuit-line" d={`M 0 10 C 2 26, -2 42, 0 ${baseLength - 8}`} />
      {joint(0, 0, baseWidth * 0.55)}
      <motion.g
        transform={`translate(0 ${baseLength - 2})`}
        style={{ transformBox: 'fill-box', transformOrigin: '0px 0px' }}
        animate={{ rotate: poses.map((pose) => pose.mid) }}
        transition={{ ...spring, delay: timings + 0.15 }}
      >
        <path className="holo-bone" d={segmentPath(midLength, midWidth)} />
        <path className="holo-circuit-line" d={`M 0 8 C 1 20, -1 31, 0 ${midLength - 7}`} />
        {joint(0, 0, midWidth * 0.55)}
        <motion.g
          transform={`translate(0 ${midLength - 2})`}
          style={{ transformBox: 'fill-box', transformOrigin: '0px 0px' }}
          animate={{ rotate: poses.map((pose) => pose.tip) }}
          transition={{ ...spring, delay: timings + 0.3 }}
        >
          <path className="holo-bone holo-tip-bone" d={segmentPath(tipLength, tipWidth)} />
          <path className="holo-circuit-line" d={`M 0 7 C 1 17, 0 22, 0 ${tipLength - 6}`} />
          {joint(0, 0, tipWidth * 0.52)}
          <circle className="holo-fingertip" cx="0" cy={tipLength - 1} r={tipWidth * 0.82} />
        </motion.g>
      </motion.g>
    </motion.g>
  );
}

function HolographicHand({ side }: HolographicHandProps) {
  const gestures = side === 'left' ? leftGestures : rightGestures;
  const isRight = side === 'right';

  return (
    <div className={`holo-hand holo-hand-${side}`}>
      <motion.svg
        className="holo-hand-art"
        viewBox="0 0 390 330"
        role="img"
        aria-label={`${side} holographic gesture hand`}
        initial={{ opacity: 0, x: isRight ? 40 : -40 }}
        animate={{
          opacity: 1,
          x: [isRight ? 18 : -18, isRight ? 6 : -6, isRight ? 14 : -14],
          y: [0, -8, 0],
        }}
        transition={{ duration: 1.1, ease: 'easeOut' }}
      >
      <defs>
        <linearGradient id={`holo-skin-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(236, 253, 255, 0.72)" />
          <stop offset="42%" stopColor="rgba(125, 211, 252, 0.24)" />
          <stop offset="100%" stopColor="rgba(16, 185, 129, 0.13)" />
        </linearGradient>
        <linearGradient id={`holo-metal-${side}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="48%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#64748b" />
        </linearGradient>
        <filter id={`holo-glow-${side}`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="0 0 0 0 0.12 0 0 0 0 0.72 0 0 0 0 1 0 0 0 0.85 0"
          />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform={isRight ? 'translate(390 0) scale(-1 1)' : undefined}>
        <motion.g
          className="holo-armature"
          filter={`url(#holo-glow-${side})`}
          style={{ transformBox: 'fill-box', transformOrigin: '108px 205px' }}
          animate={{
            rotate: gestures.map((gesture) => gesture.wrist),
            scale: [1, 1.018, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        >
          <path
            className="holo-forearm"
            d="M 13 206 C 48 185, 85 184, 126 203 C 128 229, 117 249, 91 258 C 58 262, 31 248, 9 226 Z"
            fill={`url(#holo-skin-${side})`}
          />
          <path className="holo-forearm-line" d="M 20 219 C 51 205, 82 207, 115 224" />
          {joint(122, 216, 15)}

          <motion.g
            className="holo-palm-group"
            style={{ transformBox: 'fill-box', transformOrigin: '143px 205px' }}
            animate={{ rotate: gestures.map((gesture) => gesture.palm) }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          >
            <path
              className="holo-palm"
              d="M 119 177 C 123 126, 151 90, 199 85 C 249 80, 292 113, 301 164
                 C 310 214, 283 259, 234 276 C 191 291, 147 272, 128 235
                 C 119 217, 114 197, 119 177 Z"
              fill={`url(#holo-skin-${side})`}
            />
            <path
              className="holo-palm-edge"
              d="M 132 178 C 141 128, 166 102, 205 98 C 252 94, 286 129, 289 172
                 C 293 222, 260 263, 213 268 C 168 272, 136 239, 128 201"
            />
            <path className="holo-palm-circuit" d="M 151 208 C 180 190, 215 183, 263 191" />
            <path className="holo-palm-circuit short" d="M 164 235 C 193 221, 221 222, 251 238" />
            <circle className="holo-palm-core" cx="208" cy="191" r="31" />
            <circle className="holo-palm-core inner" cx="208" cy="191" r="12" />

            <Finger name="thumb" poses={gestures.map((gesture) => gesture.thumb)} />
            <Finger name="index" poses={gestures.map((gesture) => gesture.index)} />
            <Finger name="middle" poses={gestures.map((gesture) => gesture.middle)} />
            <Finger name="ring" poses={gestures.map((gesture) => gesture.ring)} />
            <Finger name="little" poses={gestures.map((gesture) => gesture.little)} />

            <motion.g
              className="holo-energy"
              animate={{ opacity: [0.24, 0.85, 0.32], pathLength: [0.2, 1, 0.2] }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <path d="M 122 217 C 155 206, 179 198, 208 191 C 235 184, 258 174, 291 145" />
              <path d="M 125 221 C 157 235, 190 236, 233 219 C 251 211, 271 198, 294 176" />
            </motion.g>
          </motion.g>
        </motion.g>
      </g>
      </motion.svg>
    </div>
  );
}

export default function HolographicHands() {
  return (
    <div className="holographic-hands" aria-hidden="true">
      <HolographicHand side="left" />
      <HolographicHand side="right" />
      <div className="gesture-particle particle-a" />
      <div className="gesture-particle particle-b" />
      <div className="gesture-particle particle-c" />
      <div className="gesture-particle particle-d" />
    </div>
  );
}
