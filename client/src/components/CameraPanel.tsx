import React, { useEffect, useRef, useState } from 'react';
import { Camera, CameraOff } from 'lucide-react';
import { GestureService } from '../services/GestureService';
import { useGestureStore } from '../store/useGestureStore';

export const CameraPanel = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
          setError(null);
        }
      } catch (err) {
        setError('Camera permission denied or unavailable.');
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
    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 flex flex-col space-y-4 shadow-xl">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-200">Camera Panel</h3>
        <button 
          onClick={toggleCamera}
          disabled={!isReady}
          className={`p-2 rounded-lg transition-colors ${
            isActive ? 'bg-danger-500/20 text-danger-500 hover:bg-danger-500/30' : 'bg-primary-600 hover:bg-primary-500 text-white'
          } ${!isReady ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isActive ? <CameraOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative aspect-video bg-black rounded-lg overflow-hidden border border-gray-600 flex items-center justify-center">
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover -scale-x-100"
          style={{ display: isActive ? 'block' : 'none' }}
        />
        {!isActive && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-500 flex-col space-y-2">
            <CameraOff className="w-8 h-8 opacity-50" />
            <span className="text-sm">Camera Offline</span>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-danger-500">{error}</p>}

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-900 p-2 rounded-lg">
          <span className="text-gray-400 block">Status</span>
          <span className={`font-semibold ${isActive ? 'text-success-500' : 'text-gray-500'}`}>
            {isActive ? 'Tracking' : 'Stopped'}
          </span>
        </div>
        <div className="bg-gray-900 p-2 rounded-lg">
          <span className="text-gray-400 block">Gesture</span>
          <span className="font-semibold text-primary-400">{gesture.replace('_', ' ')}</span>
        </div>
        <div className="bg-gray-900 p-2 rounded-lg col-span-2 flex justify-between items-center">
          <span className="text-gray-400">Pinch</span>
          <div className={`w-3 h-3 rounded-full ${isPinching ? 'bg-primary-500' : 'bg-gray-700'}`} />
        </div>
      </div>
    </div>
  );
};
