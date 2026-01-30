// Single-path SVG silhouettes for chess pieces on a 100x100 viewport.
// These are carefully designed to be topologically continuous (a single closed loop) 
// to ensure flawless morphing with flubber during promotion cinematics.

export const piecePaths: Record<string, string> = {
  // Pawn: Flawless single continuous loop
  P: "M 20 85 L 80 85 C 75 60 65 45 60 40 C 70 30 65 15 50 15 C 35 15 30 30 40 40 C 35 45 25 60 20 85 Z",
  // Rook: Base, straight walls, battlements (single loop)
  R: "M 20 85 L 80 85 L 75 40 L 85 40 L 85 15 L 70 15 L 70 25 L 60 25 L 60 15 L 40 15 L 40 25 L 30 25 L 30 15 L 15 15 L 15 40 L 25 40 Z",
  // Bishop: Single continuous loop
  B: "M 20 85 L 80 85 C 75 75 65 65 60 60 C 70 40 55 25 50 10 C 45 25 30 40 40 60 C 35 65 25 75 20 85 Z",
  // Knight: Single continuous loop
  N: "M 20 85 L 80 85 C 75 60 85 45 80 30 C 75 20 65 15 50 20 C 40 15 30 25 25 40 C 35 40 45 35 45 50 C 35 55 25 60 25 70 Z",
  // Queen: Single continuous loop
  Q: "M 20 85 L 80 85 C 75 60 65 50 60 40 C 70 30 85 15 85 15 C 80 25 75 35 70 40 C 60 20 65 10 65 10 C 60 20 55 30 55 40 C 50 15 50 5 50 5 C 50 15 45 30 45 40 C 40 20 35 10 35 10 C 35 20 40 30 30 40 C 25 35 20 25 15 15 C 15 15 30 30 40 40 C 35 50 25 60 20 85 Z",
  // King: Single continuous loop
  K: "M 20 85 L 80 85 C 75 60 65 50 65 40 C 75 30 70 20 60 25 L 60 15 L 65 15 L 65 10 L 60 10 L 60 5 L 55 5 L 55 10 L 50 10 L 50 15 L 55 15 L 55 25 C 45 20 40 30 50 40 C 50 50 40 60 20 85 Z"
};

export type SVGElementDef = {
  tag: 'ellipse' | 'path' | 'circle' | 'polygon';
  attrs: any;
  fillMode?: 'base' | 'trim' | 'dark' | 'shadow' | 'stroke';
};

// Extremely detailed multi-layered pieces mimicking 3D Staunton luxury sets.
export const pieceLayers: Record<string, SVGElementDef[]> = {
  P: [
    { tag: 'ellipse', attrs: { cx: 50, cy: 93, rx: 28, ry: 4 }, fillMode: 'shadow' },
    { tag: 'rect', attrs: { x: 25, y: 85, width: 50, height: 6, rx: 1, ry: 1 }, fillMode: 'base' },
    { tag: 'path', attrs: { d: 'M 30 85 C 45 75 43 55 43 45 L 57 45 C 57 55 55 75 70 85 Z' }, fillMode: 'base' },
    { tag: 'rect', attrs: { x: 33, y: 39, width: 34, height: 6, rx: 3, ry: 3 }, fillMode: 'trim' },
    { tag: 'circle', attrs: { cx: 50, cy: 23, r: 14 }, fillMode: 'base' }
  ],
  R: [
    { tag: 'ellipse', attrs: { cx: 50, cy: 93, rx: 28, ry: 4 }, fillMode: 'shadow' },
    { tag: 'rect', attrs: { x: 25, y: 85, width: 50, height: 6, rx: 1, ry: 1 }, fillMode: 'base' },
    { tag: 'path', attrs: { d: 'M 28 85 C 35 70 35 45 35 30 L 65 30 C 65 45 65 70 72 85 Z' }, fillMode: 'base' },
    { tag: 'rect', attrs: { x: 30, y: 24, width: 40, height: 6, rx: 3, ry: 3 }, fillMode: 'trim' },
    { tag: 'rect', attrs: { x: 28, y: 10, width: 44, height: 14, rx: 1, ry: 1 }, fillMode: 'base' },
    { tag: 'rect', attrs: { x: 34, y: 10, width: 8, height: 6, rx: 1, ry: 1 }, fillMode: 'dark' },
    { tag: 'rect', attrs: { x: 58, y: 10, width: 8, height: 6, rx: 1, ry: 1 }, fillMode: 'dark' }
  ],
  B: [
    { tag: 'ellipse', attrs: { cx: 50, cy: 93, rx: 28, ry: 4 }, fillMode: 'shadow' },
    { tag: 'rect', attrs: { x: 25, y: 85, width: 50, height: 6, rx: 1, ry: 1 }, fillMode: 'base' },
    { tag: 'path', attrs: { d: 'M 30 85 C 45 70 42 45 42 38 L 58 38 C 58 45 55 70 70 85 Z' }, fillMode: 'base' },
    { tag: 'rect', attrs: { x: 35, y: 32, width: 30, height: 6, rx: 3, ry: 3 }, fillMode: 'trim' },
    { tag: 'path', attrs: { d: 'M 40 32 C 30 20 40 5 50 5 C 60 5 70 20 60 32 Z' }, fillMode: 'base' },
    { tag: 'polygon', attrs: { points: '50,22 42,10 45,8 53,20' }, fillMode: 'dark' },
    { tag: 'circle', attrs: { cx: 50, cy: 3, r: 2.5 }, fillMode: 'trim' }
  ],
  N: [
    { tag: 'ellipse', attrs: { cx: 50, cy: 93, rx: 28, ry: 4 }, fillMode: 'shadow' },
    { tag: 'rect', attrs: { x: 25, y: 85, width: 50, height: 6, rx: 1, ry: 1 }, fillMode: 'base' },
    { tag: 'path', attrs: { d: 'M 25 85 C 25 55 12 40 15 30 C 18 20 30 22 35 25 L 45 15 C 52 10 58 18 55 25 C 68 35 75 55 75 85 Z' }, fillMode: 'base' },
    { tag: 'path', attrs: { d: 'M 55 25 C 68 35 75 55 75 85 L 82 85 C 82 50 70 30 55 25 Z' }, fillMode: 'trim' },
    { tag: 'circle', attrs: { cx: 38, cy: 28, r: 2.5 }, fillMode: 'dark' }
  ],
  Q: [
    { tag: 'ellipse', attrs: { cx: 50, cy: 96, rx: 35, ry: 4 }, fillMode: 'shadow' },
    { tag: 'rect', attrs: { x: 20, y: 88, width: 60, height: 6, rx: 1, ry: 1 }, fillMode: 'base' },
    { tag: 'rect', attrs: { x: 25, y: 82, width: 50, height: 6, rx: 1, ry: 1 }, fillMode: 'base' },
    { tag: 'path', attrs: { d: 'M 30 82 C 45 65 40 45 40 38 L 60 38 C 60 45 55 65 70 82 Z' }, fillMode: 'base' },
    { tag: 'rect', attrs: { x: 30, y: 32, width: 40, height: 6, rx: 3, ry: 3 }, fillMode: 'base' },
    { tag: 'rect', attrs: { x: 35, y: 28, width: 30, height: 4, rx: 2, ry: 2 }, fillMode: 'trim' },
    { tag: 'path', attrs: { d: 'M 30 28 L 25 10 L 40 18 L 50 5 L 60 18 L 75 10 L 70 28 Z' }, fillMode: 'base' },
    { tag: 'circle', attrs: { cx: 50, cy: 2, r: 3 }, fillMode: 'trim' }
  ],
  K: [
    { tag: 'ellipse', attrs: { cx: 50, cy: 96, rx: 35, ry: 4 }, fillMode: 'shadow' },
    { tag: 'rect', attrs: { x: 20, y: 88, width: 60, height: 6, rx: 1, ry: 1 }, fillMode: 'base' },
    { tag: 'rect', attrs: { x: 25, y: 82, width: 50, height: 6, rx: 1, ry: 1 }, fillMode: 'base' },
    { tag: 'path', attrs: { d: 'M 30 82 C 45 65 40 45 40 38 L 60 38 C 60 45 55 65 70 82 Z' }, fillMode: 'base' },
    { tag: 'rect', attrs: { x: 30, y: 32, width: 40, height: 6, rx: 3, ry: 3 }, fillMode: 'base' },
    { tag: 'rect', attrs: { x: 35, y: 28, width: 30, height: 4, rx: 2, ry: 2 }, fillMode: 'trim' },
    { tag: 'path', attrs: { d: 'M 35 28 L 35 20 C 35 5 65 5 65 20 L 65 28 Z' }, fillMode: 'base' },
    { tag: 'rect', attrs: { x: 48, y: 2, width: 4, height: 12, rx: 1, ry: 1 }, fillMode: 'trim' },
    { tag: 'rect', attrs: { x: 44, y: 5, width: 12, height: 4, rx: 1, ry: 1 }, fillMode: 'trim' }
  ]
};