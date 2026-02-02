import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  cursorSensitivity: number;
  gestureSensitivity: number;
  pinchThreshold: number;
  motionSmoothing: number;
  theme: string;
  boardTheme: string;
  pieceTheme: string;
  soundVolume: number;
  updateSettings: (settings: Partial<SettingsState>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      cursorSensitivity: 1.0,
      gestureSensitivity: 1.0,
      pinchThreshold: 0.5,
      motionSmoothing: 0.2,
      theme: 'dark',
      boardTheme: 'classic',
      pieceTheme: 'classic',
      soundVolume: 0.8,
      updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
    }),
    {
      name: 'gesture-chess-settings',
    }
  )
);
