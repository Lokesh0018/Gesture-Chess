import React from 'react';
import { useGestureStore } from '../store/useGestureStore';
import { useSettingsStore } from '../store/useSettingsStore';

export const DebugPanel: React.FC = () => {
  const gestureState = useGestureStore();
  const settings = useSettingsStore();

  return (
    <div style={{
      position: 'fixed',
      left: 20,
      bottom: 20,
      width: 250,
      background: 'rgba(0, 0, 0, 0.85)',
      color: '#0f0',
      fontFamily: 'monospace',
      fontSize: 12,
      padding: 16,
      borderRadius: 8,
      border: '1px solid #333',
      zIndex: 10000,
      pointerEvents: 'none'
    }}>
      <h3 style={{ margin: '0 0 10px 0', color: '#fff', fontSize: 14 }}>Debug Info</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
        <span style={{ color: '#aaa' }}>Gesture:</span> <span>{gestureState.gesture}</span>
        <span style={{ color: '#aaa' }}>Confidence:</span> <span>{gestureState.confidence.toFixed(2)}</span>
        <span style={{ color: '#aaa' }}>Drag State:</span> <span style={{ color: gestureState.dragState === 'dragging' ? '#f00' : '#0f0' }}>{gestureState.dragState}</span>
        <span style={{ color: '#aaa' }}>Selected Sq:</span> <span>{gestureState.selectedSquare || '-'}</span>
        <span style={{ color: '#aaa' }}>Selected Pc:</span> <span>{gestureState.selectedPiece || '-'}</span>
        <span style={{ color: '#aaa' }}>Hovered Sq:</span> <span>{gestureState.hoveredSquare || '-'}</span>
      </div>

      <hr style={{ borderColor: '#333', margin: '10px 0' }} />
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, color: '#888' }}>
        <span>Pinch Thresh:</span> <span>{settings.pinchThreshold.toFixed(3)}</span>
        <span>Release Thresh:</span> <span>{settings.pinchReleaseThreshold.toFixed(3)}</span>
        <span>Smoothing:</span> <span>{settings.smoothing.toFixed(2)}</span>
      </div>
    </div>
  );
};
