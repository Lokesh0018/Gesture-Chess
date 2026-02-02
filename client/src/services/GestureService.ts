import { FilesetResolver, GestureRecognizer } from '@mediapipe/tasks-vision';
import { useGestureStore } from '../store/useGestureStore';

export class GestureService {
  private static instance: GestureService;
  private recognizer: GestureRecognizer | null = null;
  private isInitialized = false;
  private lastVideoTime = -1;

  private constructor() {}

  static getInstance() {
    if (!GestureService.instance) {
      GestureService.instance = new GestureService();
    }
    return GestureService.instance;
  }

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
      );
      
      this.recognizer = await GestureRecognizer.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1,
      });
      
      this.isInitialized = true;
      console.log('Gesture Recognizer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gesture Recognizer:', error);
    }
  }

  processVideoFrame(video: HTMLVideoElement) {
    if (!this.recognizer || !this.isInitialized) return;
    
    // Only process new frames
    if (video.currentTime === this.lastVideoTime) return;
    this.lastVideoTime = video.currentTime;

    const results = this.recognizer.recognizeForVideo(video, performance.now());
    
    if (results.landmarks && results.landmarks.length > 0) {
      const hand = results.landmarks[0]; // We only process one hand
      
      // Calculate Pinch
      const thumbTip = hand[4];
      const indexTip = hand[8];
      
      const dx = thumbTip.x - indexTip.x;
      const dy = thumbTip.y - indexTip.y;
      const dz = thumbTip.z - indexTip.z;
      const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      const isPinching = distance < 0.05; // Pinch threshold
      
      // Cursor Position (use index finger tip)
      // Note: we mirror the X axis because the camera is mirrored
      const cursorX = 1 - indexTip.x; 
      const cursorY = indexTip.y;

      const store = useGestureStore.getState();
      
      // Apply exponential moving average smoothing
      const smoothing = 0.6; // 0 = no smoothing, 1 = no movement
      const smoothedX = store.cursorX * smoothing + cursorX * (1 - smoothing);
      const smoothedY = store.cursorY * smoothing + cursorY * (1 - smoothing);

      store.updateCursor(smoothedX, smoothedY);
      
      // We add a tiny bit of hysteresis so it doesn't flicker
      if (isPinching && !store.isPinching) {
        store.setPinching(true);
      } else if (distance > 0.07 && store.isPinching) {
        store.setPinching(false);
      }

      // Gesture Recognition
      if (results.gestures && results.gestures.length > 0) {
        const primaryGesture = results.gestures[0][0];
        store.setGesture(primaryGesture.categoryName as any, primaryGesture.score);
      } else {
        store.setGesture('None', 0);
      }
    } else {
      // Hand lost
      const store = useGestureStore.getState();
      if (store.isPinching) store.setPinching(false);
      if (store.gesture !== 'None') store.setGesture('None', 0);
    }
  }
}
