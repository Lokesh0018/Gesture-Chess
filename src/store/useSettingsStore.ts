import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GestureSettings {
  cursorSensitivity: number; // 0.2 to 3.0
  cursorSpeed: number; // 0.1 to 1.0 (EMA alpha)
  smoothing: number; // 0 to 1
  deadZone: number; // 0 to 0.05
  pinchThreshold: number; // 0.02 to 0.08
  pinchReleaseThreshold: number; // 0.04 to 0.12
  confidenceThreshold: number; // 0.3 to 0.9
  cameraEnabled: boolean;
}

interface SettingsStore extends GestureSettings {
  updateSettings: (settings: Partial<GestureSettings>) => void;
  resetToDefault: () => void;
}

const defaultSettings: GestureSettings = {
  cursorSensitivity: 1.5,
  cursorSpeed: 0.6,
  smoothing: 0.7,
  deadZone: 0.005,
  pinchThreshold: 0.05,
  pinchReleaseThreshold: 0.07,
  confidenceThreshold: 0.6,
  cameraEnabled: true,
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...defaultSettings,
      updateSettings: (newSettings) => set((state) => ({ ...state, ...newSettings })),
      resetToDefault: () => set(defaultSettings),
    }),
    {
      name: 'gesture-settings',
    }
  )
);
