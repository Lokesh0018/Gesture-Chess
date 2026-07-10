import { create } from 'zustand';

export type GestureType = 'Open_Palm' | 'Closed_Fist' | 'Thumb_Up' | 'Thumb_Down' | 'Pointing_Up' | 'None';

interface GestureState {
  isActive: boolean;
  cursorX: number;
  cursorY: number;
  isPinching: boolean;
  gesture: GestureType;
  confidence: number;
  
  // Custom Drag State
  hoveredSquare: string | null;
  selectedSquare: string | null;
  draggedPiece: string | null; // e.g. "wP", "bN"
  
  setIsActive: (active: boolean) => void;
  updateCursor: (x: number, y: number) => void;
  setPinching: (isPinching: boolean) => void;
  setGesture: (gesture: GestureType, confidence: number) => void;
  
  setHoveredSquare: (sq: string | null) => void;
  setSelectedSquare: (sq: string | null, piece: string | null) => void;
  clearDrag: () => void;
}

export const useGestureStore = create<GestureState>((set) => ({
  isActive: false,
  cursorX: 0.5,
  cursorY: 0.5,
  isPinching: false,
  gesture: 'None',
  confidence: 0,
  
  hoveredSquare: null,
  selectedSquare: null,
  draggedPiece: null,
  
  setIsActive: (active) => set({ isActive: active }),
  updateCursor: (x, y) => set({ cursorX: x, cursorY: y }),
  setPinching: (isPinching) => set({ isPinching }),
  setGesture: (gesture, confidence) => set({ gesture, confidence }),
  
  setHoveredSquare: (sq) => set({ hoveredSquare: sq }),
  setSelectedSquare: (sq, piece) => set({ selectedSquare: sq, draggedPiece: piece }),
  clearDrag: () => set({ selectedSquare: null, draggedPiece: null, isPinching: false })
}));
