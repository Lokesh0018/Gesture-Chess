import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAuthStore } from './useAuthStore';
import { getApiUrl } from '../lib/api';

interface SettingsState {
  cursorSensitivity: number;
  gestureSensitivity: number;
  pinchThreshold: number;
  motionSmoothing: number;
  theme: string;
  boardTheme: string;
  pieceTheme: string;
  soundVolume: number;
  highContrast: boolean;
  soundEnabled: boolean;
  updateSettings: (settings: Partial<SettingsState>) => void;
  fetchSettings: () => Promise<void>;
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
      highContrast: false,
      soundEnabled: true,
      updateSettings: async (newSettings) => {
        // Optimistic UI update
        set((state) => ({ ...state, ...newSettings }));
        
        // Sync with server if logged in
        const token = useAuthStore.getState().token;
        if (token) {
          try {
            await fetch(getApiUrl('/api/user/settings'), {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify(newSettings)
            });
          } catch (e) {
            console.error('Failed to sync settings with server', e);
          }
        }
      },
      fetchSettings: async () => {
        const token = useAuthStore.getState().token;
        if (token) {
          try {
            const res = await fetch(getApiUrl('/api/user/settings'), {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              if (data.settings) {
                set((state) => ({ ...state, ...data.settings }));
              }
            }
          } catch (e) {
            console.error('Failed to fetch settings from server', e);
          }
        }
      }
    }),
    {
      name: 'gesture-chess-settings',
    }
  )
);
