import { create } from 'zustand';
import { GestureType } from '../services/GestureService';

export type DragState = 'idle' | 'hover' | 'dragging';

interface GestureStore {
  gesture: GestureType;
  cursorX: number;
  cursorY: number;
  confidence: number;
  isPinching: boolean;
  isActive: boolean;
  
  // Drag State Machine
  dragState: DragState;
  hoveredSquare: string | null;
  selectedSquare: string | null;
  selectedPiece: string | null;
  
  setGestureState: (state: Partial<GestureStore>) => void;
  toggleActive: (active: boolean) => void;
  setDragState: (state: DragState, hovered?: string | null, selectedSq?: string | null, piece?: string | null) => void;
}

export const useGestureStore = create<GestureStore>((set) => ({
  gesture: 'None',
  cursorX: 0.5,
  cursorY: 0.5,
  confidence: 0,
  isPinching: false,
  isActive: false,
  
  dragState: 'idle',
  hoveredSquare: null,
  selectedSquare: null,
  selectedPiece: null,
  
  setGestureState: (newState) => set((state) => ({ ...state, ...newState })),
  toggleActive: (active) => set({ isActive: active }),
  setDragState: (state, hovered = null, selectedSq = null, piece = null) => 
    set({ 
      dragState: state, 
      ...(hovered !== null && { hoveredSquare: hovered }),
      ...(selectedSq !== null && { selectedSquare: selectedSq }),
      ...(piece !== null && { selectedPiece: piece })
    }),
}));
