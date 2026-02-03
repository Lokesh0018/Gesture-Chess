import { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { GestureService } from '../services/GestureService';
import { useGestureStore } from '../store/useGestureStore';

export const CameraPanel = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const { isActive, setIsActive, gesture, isPinching } = useGestureStore();

  useEffect(() => {
    GestureService.getInstance().initialize().then(() => {
      setIsReady(true);
    });
  }, []);

  const toggleCamera = async () => {
    if (isActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setIsActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsActive(true);
        }
      } catch (err) {
        console.error('Camera permission denied or unavailable.', err);
      }
    }
  };

  useEffect(() => {
    let animationFrame: number;
    const renderLoop = () => {
      if (isActive && videoRef.current && videoRef.current.readyState >= 2) {
        GestureService.getInstance().processVideoFrame(videoRef.current);
      }
      animationFrame = requestAnimationFrame(renderLoop);
    };
    if (isActive) {
      renderLoop();
    }
    return () => cancelAnimationFrame(animationFrame);
  }, [isActive]);

  return (
    <div className="card camera-card">
      <div className="camera-header">
        <div className="camera-title">
          <Camera style={{ width: '20px', height: '20px', color: 'var(--color-accent)' }} />
          Camera
        </div>
        <button
          onClick={toggleCamera}
          disabled={!isReady}
          className={`camera-btn ${isActive ? 'active' : 'inactive'}`}
        >
          {isActive ? <CameraOff style={{ width: '16px', height: '16px' }} /> : <Camera style={{ width: '16px', height: '16px' }} />}
        </button>
      </div>

      <div className="camera-body">
        <div className={`camera-video-wrapper ${isActive ? 'active' : ''}`}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="camera-video"
            style={{ display: isActive ? 'block' : 'none' }}
          />
          {!isActive && (
            <div className="camera-offline">
              <CameraOff style={{ width: '32px', height: '32px', opacity: 0.5 }} />
              <span style={{ fontSize: '12px' }}>Offline</span>
            </div>
          )}
        </div>

        <div className="camera-stats">
          <div className="camera-stat-box">
            <span className="camera-stat-label">Status</span>
            <span className={`camera-stat-value ${isActive ? 'success' : ''}`}>
              {isActive ? 'Tracking' : 'Stopped'}
            </span>
          </div>
          <div className="camera-stat-box">
            <span className="camera-stat-label">Gesture</span>
            <span className="camera-stat-value accent">
              {gesture.replace('_', ' ')}
            </span>
          </div>
          <div className="camera-stat-box row" style={{ marginTop: isActive ? 'auto' : '0' }}>
            <span className="camera-stat-label" style={{ marginBottom: 0 }}>Pinch</span>
            <div style={{
              width: '12px', height: '12px', borderRadius: '50%',
              backgroundColor: isPinching ? 'var(--color-accent)' : '#334155',
              animation: isPinching ? 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' : 'none'
            }} />
          </div>
        </div>
      </div>
    </div>
  );
};
