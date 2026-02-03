import { useMemo } from 'react';
import * as THREE from 'three';
import { SQUARE_SIZE, BOARD_EXTENT, BOARD_THICKNESS } from './ChessBoard';

// ─── Shared PBR materials ──────────────────────────────────
// White pieces: warm ivory with strong specular hit
const WHITE_MAT = new THREE.MeshPhysicalMaterial({
  color: '#EDE0C8',
  metalness: 0.75,
  roughness: 0.22,
  clearcoat: 0.7,
  clearcoatRoughness: 0.08,
  reflectivity: 0.9,
});

// Black pieces: deep obsidian with cool blue-tinted gloss
const BLACK_MAT = new THREE.MeshPhysicalMaterial({
  color: '#14151f',
  metalness: 0.85,
  roughness: 0.18,
  clearcoat: 0.8,
  clearcoatRoughness: 0.05,
  reflectivity: 1.0,
});

// ─── Lathe geometry helpers ────────────────────────────────
// All radius/height values are in world-units now.
// Pieces sit on the board surface (y=0 at base), reach up visually.
// Target: pawn ~1.0 tall, king ~1.8 tall to be clearly legible at camera distance.

function lathe(pts: [number, number][], segments = 24): THREE.LatheGeometry {
  return new THREE.LatheGeometry(
    pts.map(([r, h]) => new THREE.Vector2(r, h)),
    segments
  );
}

function makePawn() {
  return lathe([
    [0,    0],
    [0.22, 0],      // base rim
    [0.24, 0.02],
    [0.20, 0.06],
    [0.09, 0.18],   // stem waist
    [0.08, 0.34],
    [0.11, 0.38],   // collar
    [0.11, 0.42],
    [0.08, 0.46],
    [0.13, 0.52],   // head ball start
    [0.16, 0.60],
    [0.16, 0.72],
    [0.12, 0.82],
    [0.04, 0.90],
    [0,    0.92],
  ]);
}

function makeRook() {
  return lathe([
    [0,    0],
    [0.25, 0],
    [0.27, 0.02],
    [0.22, 0.07],
    [0.13, 0.20],
    [0.12, 0.55],
    [0.17, 0.60],
    [0.23, 0.62],
    [0.23, 0.80],
    [0.19, 0.80],
    [0.19, 0.88],
    [0.23, 0.88],
    [0.23, 1.00],
    [0.14, 1.00],
    [0.14, 0.88],
    [0,    0.88],
  ]);
}

function makeBishop() {
  return lathe([
    [0,    0],
    [0.24, 0],
    [0.26, 0.02],
    [0.21, 0.07],
    [0.10, 0.20],
    [0.09, 0.46],
    [0.13, 0.50],
    [0.13, 0.54],
    [0.09, 0.58],
    [0.12, 0.70],
    [0.12, 0.90],
    [0.07, 1.08],
    [0.03, 1.18],
    [0.05, 1.20],
    [0.04, 1.22],
    [0,    1.24],
  ]);
}

function makeKnight() {
  // Stylised — distinct from bishop by wider flared top
  return lathe([
    [0,    0],
    [0.24, 0],
    [0.26, 0.02],
    [0.21, 0.07],
    [0.11, 0.20],
    [0.10, 0.42],
    [0.14, 0.48],
    [0.16, 0.58],
    [0.18, 0.72],
    [0.17, 0.90],
    [0.12, 1.04],
    [0.06, 1.12],
    [0,    1.14],
  ], 20);
}

function makeQueen() {
  return lathe([
    [0,    0],
    [0.27, 0],
    [0.29, 0.02],
    [0.24, 0.08],
    [0.11, 0.22],
    [0.10, 0.50],
    [0.14, 0.54],
    [0.14, 0.58],
    [0.10, 0.62],
    [0.18, 0.78],
    [0.22, 0.94],
    [0.18, 1.10],
    [0.10, 1.24],
    [0.05, 1.32],
    [0.06, 1.34],
    [0.06, 1.38],
    [0.03, 1.40],
    [0,    1.42],
  ], 28);
}

function makeKing() {
  return lathe([
    [0,    0],
    [0.29, 0],
    [0.31, 0.02],
    [0.26, 0.08],
    [0.12, 0.24],
    [0.11, 0.54],
    [0.15, 0.58],
    [0.15, 0.62],
    [0.11, 0.66],
    [0.18, 0.84],
    [0.20, 1.02],
    [0.15, 1.18],
    [0.08, 1.28],
    [0.03, 1.34],
    // cross
    [0.03, 1.38],
    [0.07, 1.38],
    [0.07, 1.44],
    [0.03, 1.44],
    [0.03, 1.54],
    [0.07, 1.54],
    [0.07, 1.60],
    [0.03, 1.60],
    [0.03, 1.68],
    [0,    1.68],
  ], 28);
}

// ─── Cached geometries (singletons) ───────────────────────
const GEO_CACHE: Record<string, THREE.LatheGeometry> = {};
function getGeo(type: string): THREE.LatheGeometry {
  if (!GEO_CACHE[type]) {
    const makers: Record<string, () => THREE.LatheGeometry> = {
      pawn: makePawn, rook: makeRook, knight: makeKnight,
      bishop: makeBishop, queen: makeQueen, king: makeKing,
    };
    GEO_CACHE[type] = makers[type]();
  }
  return GEO_CACHE[type];
}

// ─── Single piece ──────────────────────────────────────────
interface PieceProps {
  type: string;
  color: 'white' | 'black';
  position: [number, number, number];
  liftY?: number;    // extra Y for animation
}

export function ChessPiece({ type, color, position, liftY = 0 }: PieceProps) {
  const geo = useMemo(() => getGeo(type), [type]);
  const mat = color === 'white' ? WHITE_MAT : BLACK_MAT;
  const [px, py, pz] = position;

  return (
    <mesh
      geometry={geo}
      material={mat}
      position={[px, py + liftY, pz]}
      castShadow
    />
  );
}

// ─── Board population ──────────────────────────────────────
export interface PieceData {
  id: string;
  type: string;
  color: 'white' | 'black';
  row: number;
  col: number;
}

function piecePos(row: number, col: number): [number, number, number] {
  const x = col * SQUARE_SIZE - BOARD_EXTENT + SQUARE_SIZE / 2;
  const z = row * SQUARE_SIZE - BOARD_EXTENT + SQUARE_SIZE / 2;
  return [x, BOARD_THICKNESS / 2, z];
}

export const INITIAL_PIECES: PieceData[] = [
  // White back rank
  { id:'wR1', type:'rook',   color:'white', row:0, col:0 },
  { id:'wN1', type:'knight', color:'white', row:0, col:1 },
  { id:'wB1', type:'bishop', color:'white', row:0, col:2 },
  { id:'wQ',  type:'queen',  color:'white', row:0, col:3 },
  { id:'wK',  type:'king',   color:'white', row:0, col:4 },
  { id:'wB2', type:'bishop', color:'white', row:0, col:5 },
  { id:'wN2', type:'knight', color:'white', row:0, col:6 },
  { id:'wR2', type:'rook',   color:'white', row:0, col:7 },
  // White pawns
  ...Array.from({length:8},(_,i)=>({ id:`wP${i}`, type:'pawn', color:'white' as const, row:1, col:i })),
  // Black pawns
  ...Array.from({length:8},(_,i)=>({ id:`bP${i}`, type:'pawn', color:'black' as const, row:6, col:i })),
  // Black back rank
  { id:'bR1', type:'rook',   color:'black', row:7, col:0 },
  { id:'bN1', type:'knight', color:'black', row:7, col:1 },
  { id:'bB1', type:'bishop', color:'black', row:7, col:2 },
  { id:'bQ',  type:'queen',  color:'black', row:7, col:3 },
  { id:'bK',  type:'king',   color:'black', row:7, col:4 },
  { id:'bB2', type:'bishop', color:'black', row:7, col:5 },
  { id:'bN2', type:'knight', color:'black', row:7, col:6 },
  { id:'bR2', type:'rook',   color:'black', row:7, col:7 },
];

export function ChessPieces() {
  return (
    <group>
      {INITIAL_PIECES.map(p => (
        <ChessPiece
          key={p.id}
          type={p.type}
          color={p.color}
          position={piecePos(p.row, p.col)}
        />
      ))}
    </group>
  );
}

export { piecePos };
