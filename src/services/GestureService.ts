import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { useSettingsStore } from "../store/useSettingsStore";

export type GestureType = 
  | "Open_Palm"
  | "Closed_Fist"
  | "Pinch"
  | "Victory"
  | "Thumb_Up"
  | "Thumb_Down"
  | "None";

export interface GestureState {
  gesture: GestureType;
  cursorX: number;
  cursorY: number;
  confidence: number;
  isPinching: boolean;
}

class GestureService {
  private handLandmarker: HandLandmarker | null = null;
  private isInitialized = false;

  // Smoothing state
  private smoothedX = 0.5;
  private smoothedY = 0.5;

  // Pinch Hysteresis & Hold buffer
  private currentPinchState = false;
  private lastSeenTime = 0;
  private readonly HOLD_BUFFER_MS = 300; // ms to maintain pinch if tracking is lost

  async initialize() {
    if (this.isInitialized) return;

    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.12/wasm"
      );

      this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
          delegate: "GPU"
        },
        runningMode: "VIDEO",
        numHands: 1,
        minHandDetectionConfidence: 0.5, // Lowered to allow recovery
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.isInitialized = true;
      console.log("GestureService initialized with smoothing");
    } catch (error) {
      console.error("Failed to initialize GestureService:", error);
    }
  }

  detect(videoElement: HTMLVideoElement, timestamp: number): GestureState {
    const settings = useSettingsStore.getState();
    const defaultState = this.defaultState();

    if (!this.handLandmarker || !this.isInitialized) {
      return defaultState;
    }

    const results = this.handLandmarker.detectForVideo(videoElement, timestamp);
    
    if (results.landmarks && results.landmarks.length > 0) {
      const landmarks = results.landmarks[0];
      const handConfidence = 1.0; // MediaPipe JS API doesn't expose confidence per frame easily without hacking, assuming 1.0 if detected
      
      this.lastSeenTime = timestamp;

      // Calculate raw cursor position (Index Tip)
      const rawX = landmarks[8].x;
      const rawY = landmarks[8].y;
      
      // Apply Exponential Moving Average (EMA) Smoothing
      // alpha = 1.0 - smoothing (if smoothing is 0.8, alpha is 0.2)
      const alpha = 1.0 - settings.smoothing;
      this.smoothedX = (alpha * rawX) + ((1 - alpha) * this.smoothedX);
      this.smoothedY = (alpha * rawY) + ((1 - alpha) * this.smoothedY);

      // Dead Zone Logic (Ignore movements smaller than deadZone)
      // (Optional advanced logic could freeze the cursor if dx, dy < deadzone)

      // Calculate pinch distance (Thumb tip to Index tip)
      const thumbTip = landmarks[4];
      const indexTip = landmarks[8];
      const pinchDist = Math.sqrt(
        Math.pow(indexTip.x - thumbTip.x, 2) + 
        Math.pow(indexTip.y - thumbTip.y, 2) + 
        Math.pow(indexTip.z - thumbTip.z, 2)
      );
      
      // Hysteresis for Pinch State
      if (!this.currentPinchState && pinchDist < settings.pinchThreshold) {
        this.currentPinchState = true;
      } else if (this.currentPinchState && pinchDist > settings.pinchReleaseThreshold) {
        this.currentPinchState = false;
      }

      return {
        gesture: this.currentPinchState ? "Pinch" : "Open_Palm",
        cursorX: this.smoothedX,
        cursorY: this.smoothedY,
        confidence: handConfidence,
        isPinching: this.currentPinchState
      };
    }

    // Tracking Lost - Check Hold Buffer
    const timeSinceLost = timestamp - this.lastSeenTime;
    if (timeSinceLost < this.HOLD_BUFFER_MS && this.currentPinchState) {
      // Maintain pinch and last known position to prevent accidental drop
      return {
        gesture: "Pinch",
        cursorX: this.smoothedX,
        cursorY: this.smoothedY,
        confidence: 0.5,
        isPinching: true
      };
    }

    // Completely lost and buffer expired
    this.currentPinchState = false;
    return defaultState;
  }

  private defaultState(): GestureState {
    return {
      gesture: "None",
      cursorX: this.smoothedX || 0.5,
      cursorY: this.smoothedY || 0.5,
      confidence: 0,
      isPinching: false
    };
  }
}

export const gestureService = new GestureService();
