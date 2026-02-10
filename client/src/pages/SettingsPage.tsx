import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Settings, Hand, Palette, Accessibility, Volume2, VolumeX, Eye } from 'lucide-react';
import { useSettingsStore } from '../store/useSettingsStore';
import './Settings.css';

const sectionVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, type: 'spring' as const, stiffness: 400, damping: 30 }
  })
};

export const SettingsPage = () => {
  const settings = useSettingsStore();

  return (
    <div className="settings-page">
      {/* Header */}
      <div className="settings-header">
        <div className="settings-header-row">
          <div className="settings-header-icon">
            <Settings size={22} />
          </div>
          <h1>App <span>Settings</span></h1>
        </div>
        <p className="settings-header-sub">Customize your experience</p>
      </div>

      {/* Scrollable content */}
      <div className="settings-scroll">
        <div className="settings-sections">

          {/* Gesture Controls */}
          <motion.div
            className="settings-section gesture"
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={0}
          >
            <div className="settings-section-header">
              <div className="settings-section-icon">
                <Hand size={18} />
              </div>
              <span className="settings-section-title">Gesture Controls</span>
            </div>

            <div className="settings-controls">
              <div className="settings-control">
                <div className="settings-label">
                  <span>Cursor Sensitivity</span>
                  <span className="settings-label-value">{settings.cursorSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="3"
                  step="0.1"
                  value={settings.cursorSensitivity}
                  onChange={(e) => settings.updateSettings({ cursorSensitivity: parseFloat(e.target.value) })}
                  className="settings-range"
                />
              </div>

              <div className="settings-control">
                <div className="settings-label">
                  <span>Pinch Threshold</span>
                  <span className="settings-label-value">{settings.pinchThreshold.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.01"
                  max="0.1"
                  step="0.01"
                  value={settings.pinchThreshold}
                  onChange={(e) => settings.updateSettings({ pinchThreshold: parseFloat(e.target.value) })}
                  className="settings-range"
                />
                <span className="settings-hint">Lower values require fingers to be closer together to register a pinch.</span>
              </div>

              <div className="settings-control">
                <div className="settings-label">
                  <span>Motion Smoothing</span>
                  <span className="settings-label-value">{settings.motionSmoothing.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={settings.motionSmoothing}
                  onChange={(e) => settings.updateSettings({ motionSmoothing: parseFloat(e.target.value) })}
                  className="settings-range"
                />
              </div>
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div
            className="settings-section appearance"
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={1}
          >
            <div className="settings-section-header">
              <div className="settings-section-icon">
                <Palette size={18} />
              </div>
              <span className="settings-section-title">Appearance</span>
            </div>

            <div className="settings-controls">
              <div className="settings-control-row">
                <div className="settings-control">
                  <div className="settings-label">
                    <span>Board Theme</span>
                  </div>
                  <select
                    className="settings-select"
                    value={settings.boardTheme}
                    onChange={(e) => settings.updateSettings({ boardTheme: e.target.value })}
                  >
                    <option value="classic">Classic (Wood)</option>
                    <option value="dark">Dark Mode</option>
                    <option value="ocean">Ocean Blue</option>
                  </select>
                </div>

                <div className="settings-control">
                  <div className="settings-label">
                    <span>Sound Volume</span>
                    <span className="settings-label-value">{Math.round(settings.soundVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={settings.soundVolume}
                    onChange={(e) => settings.updateSettings({ soundVolume: parseFloat(e.target.value) })}
                    className="settings-range"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Accessibility */}
          <motion.div
            className="settings-section accessibility"
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={2}
          >
            <div className="settings-section-header">
              <div className="settings-section-icon">
                <Accessibility size={18} />
              </div>
              <span className="settings-section-title">Accessibility & UI</span>
            </div>

            <div className="settings-controls">
              <div
                className="settings-toggle-row"
                onClick={() => settings.updateSettings({ highContrast: !settings.highContrast })}
              >
                <div className="settings-toggle-label">
                  <span className="settings-toggle-title">
                    <Eye size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
                    High Contrast Mode
                  </span>
                  <span className="settings-toggle-desc">Increase contrast for better visibility</span>
                </div>
                <label className="settings-toggle" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={settings.highContrast}
                    onChange={(e) => settings.updateSettings({ highContrast: e.target.checked })}
                  />
                  <div className="settings-toggle-track" />
                </label>
              </div>

              <div
                className="settings-toggle-row"
                onClick={() => settings.updateSettings({ soundEnabled: !settings.soundEnabled })}
              >
                <div className="settings-toggle-label">
                  <span className="settings-toggle-title">
                    {settings.soundEnabled
                      ? <Volume2 size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
                      : <VolumeX size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: '-2px' }} />
                    }
                    Sound Effects
                  </span>
                  <span className="settings-toggle-desc">Enable or disable in-game sound effects</span>
                </div>
                <label className="settings-toggle" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={settings.soundEnabled}
                    onChange={(e) => settings.updateSettings({ soundEnabled: e.target.checked })}
                  />
                  <div className="settings-toggle-track" />
                </label>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};
