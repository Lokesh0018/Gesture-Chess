import React from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export const SettingsPage = () => {
  const settings = useSettingsStore();

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-white mb-6">Settings</h2>
      
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 space-y-6">
        <h3 className="text-xl font-semibold text-primary-400 border-b border-gray-700 pb-2">Gesture Controls</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Cursor Sensitivity: {settings.cursorSensitivity.toFixed(1)}x
            </label>
            <input 
              type="range" min="0.1" max="3" step="0.1" 
              value={settings.cursorSensitivity}
              onChange={(e) => settings.updateSettings({ cursorSensitivity: parseFloat(e.target.value) })}
              className="w-full accent-primary-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Pinch Threshold: {settings.pinchThreshold.toFixed(2)}
            </label>
            <input 
              type="range" min="0.01" max="0.1" step="0.01" 
              value={settings.pinchThreshold}
              onChange={(e) => settings.updateSettings({ pinchThreshold: parseFloat(e.target.value) })}
              className="w-full accent-primary-500"
            />
            <p className="text-xs text-gray-500 mt-1">Lower values require fingers to be closer together to register a pinch.</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Motion Smoothing: {settings.motionSmoothing.toFixed(2)}
            </label>
            <input 
              type="range" min="0.1" max="0.9" step="0.1" 
              value={settings.motionSmoothing}
              onChange={(e) => settings.updateSettings({ motionSmoothing: parseFloat(e.target.value) })}
              className="w-full accent-primary-500"
            />
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700 space-y-6">
        <h3 className="text-xl font-semibold text-primary-400 border-b border-gray-700 pb-2">Appearance</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Board Theme</label>
            <select 
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2 text-white outline-none focus:border-primary-500"
              value={settings.boardTheme}
              onChange={(e) => settings.updateSettings({ boardTheme: e.target.value })}
            >
              <option value="classic">Classic (Wood)</option>
              <option value="dark">Dark Mode</option>
              <option value="ocean">Ocean Blue</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sound Volume: {Math.round(settings.soundVolume * 100)}%</label>
            <input 
              type="range" min="0" max="1" step="0.1" 
              value={settings.soundVolume}
              onChange={(e) => settings.updateSettings({ soundVolume: parseFloat(e.target.value) })}
              className="w-full accent-primary-500 mt-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
