import React, { useRef, useEffect } from 'react';
import { gestureService } from '../services/GestureService';
import { useGestureStore } from '../store/useGestureStore';
import { useSettingsStore } from '../store/useSettingsStore';

export const CameraPanel: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toggleActive, setGestureState, gesture, confidence } = useGestureStore();
  const { cameraEnabled, updateSettings } = useSettingsStore();
  const animationRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        await gestureService.initialize();
        
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480, facingMode: "user" } 
        });
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            toggleActive(true);
            predictWebcam();
          };
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    };

    const stopCamera = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      toggleActive(false);
    };

    const predictWebcam = () => {
      if (!videoRef.current || !cameraEnabled) return;
      
      const startTimeMs = performance.now();
      const state = gestureService.detect(videoRef.current, startTimeMs);
      
      setGestureState({
        gesture: state.gesture,
        cursorX: state.cursorX,
        cursorY: state.cursorY,
        isPinching: state.isPinching,
        confidence: state.confidence
      });
      
      animationRef.current = requestAnimationFrame(predictWebcam);
    };

    if (cameraEnabled) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [cameraEnabled, setGestureState, toggleActive]);

  return (
    <div style={{
      position: 'fixed',
      right: 20,
      bottom: 20,
      width: 240,
      background: 'rgba(20, 20, 25, 0.8)',
      borderRadius: 12,
      border: '1px solid rgba(255, 255, 255, 0.1)',
      overflow: 'hidden',
      boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
      zIndex: 1000
    }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '4/3', backgroundColor: '#000' }}>
        {cameraEnabled ? (
          <video 
            ref={videoRef}
            autoPlay 
            playsInline
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transform: 'scaleX(-1)' // Mirror video
            }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666' }}>
            Camera Off
          </div>
        )}
        <canvas 
          ref={canvasRef}
          style={{ 
            position: 'absolute', 
            top: 0, left: 0, 
            width: '100%', height: '100%', 
            pointerEvents: 'none' 
          }}
        />
      </div>
      
      <div style={{ padding: 12, color: 'white', fontSize: 12, fontFamily: 'sans-serif' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
          <span>Camera:</span>
          <button 
            onClick={() => updateSettings({ cameraEnabled: !cameraEnabled })}
            style={{
              background: cameraEnabled ? '#ef4444' : '#22c55e',
              border: 'none',
              borderRadius: 4,
              color: 'white',
              padding: '2px 8px',
              cursor: 'pointer'
            }}
          >
            {cameraEnabled ? 'Turn Off' : 'Turn On'}
          </button>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span>Gesture:</span>
          <span style={{ fontWeight: 'bold', color: '#4ade80' }}>{gesture}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Confidence:</span>
          <span>{Math.round(confidence * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
