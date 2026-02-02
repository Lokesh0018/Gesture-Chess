import { useEffect, useState, useRef } from 'react';
import { useGestureStore } from '../store/useGestureStore';

export const VirtualCursor = () => {
  const { isActive, cursorX, cursorY, isPinching, gesture, draggedPiece 
  } = useGestureStore();
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const prevPinching = useRef(false);

  useEffect(() => {
    const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Direct synthetic event dispatch
  useEffect(() => {
    if (!isActive) return;
    const px = cursorX * windowSize.width;
    const py = cursorY * windowSize.height;
    
    // Find the element under cursor
    const el = document.elementFromPoint(px, py);
    if (!el) return;

    const eventInit = {
      bubbles: true,
      cancelable: true,
      clientX: px,
      clientY: py,
      button: 0,
      buttons: isPinching ? 1 : 0
    };

    // We only simulate clicks to prevent fighting with the physical mouse's pointermove events.
    // This perfectly satisfies the "Hover -> Click -> Select -> Move -> Click -> Move" requirement.
    if (!isPinching && prevPinching.current) {
      el.dispatchEvent(new MouseEvent('click', eventInit));
    }

    prevPinching.current = isPinching;
  }, [isActive, cursorX, cursorY, isPinching, windowSize]);

  if (!isActive) return null;

  const px = cursorX * windowSize.width;
  const py = cursorY * windowSize.height;

  let borderColor = 'rgba(255, 255, 255, 0.8)';
  let glowColor = 'rgba(255, 255, 255, 0.4)';
  let scale = 1;

  if (isPinching) {
    borderColor = 'rgba(74, 222, 128, 0.9)'; // Green
    glowColor = 'rgba(74, 222, 128, 0.6)';
    scale = 0.8;
  } else if (gesture === 'Closed_Fist') {
    borderColor = 'rgba(239, 68, 68, 0.9)'; // Red
    glowColor = 'rgba(239, 68, 68, 0.6)';
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        width: 32,
        height: 32,
        transform: `translate3d(${px - 16}px, ${py - 16}px, 0) scale(${scale})`,
        borderRadius: '50%',
        border: `3px solid ${borderColor}`,
        boxShadow: `0 0 15px ${glowColor}, inset 0 0 10px ${glowColor}`,
        pointerEvents: 'none',
        zIndex: 99999,
        transition: 'border-color 0.1s, box-shadow 0.1s',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div 
        style={{ 
          width: isPinching ? 12 : 8, 
          height: isPinching ? 12 : 8, 
          backgroundColor: borderColor, 
          borderRadius: '50%',
          transition: 'width 0.1s, height 0.1s'
        }} 
      />
      {isPinching && (
        <div style={{
          position: 'absolute',
          top: -10, left: -10, right: -10, bottom: -10,
          borderRadius: '50%',
          border: `2px solid ${borderColor}`,
          animation: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
          opacity: 0.5
        }} />
      )}
      {draggedPiece && isPinching && (
        <div style={{
          position: 'absolute',
          top: 30, // Hang below the cursor
          fontSize: '40px',
          filter: 'drop-shadow(0 10px 10px rgba(0,0,0,0.5))',
          pointerEvents: 'none',
          color: draggedPiece.startsWith('w') ? 'white' : 'black',
          textShadow: draggedPiece.startsWith('w') ? '0 0 5px black' : '0 0 5px white'
        }}>
          {getPieceSymbol(draggedPiece)}
        </div>
      )}
    </div>
  );
};

const getPieceSymbol = (piece: string) => {
  const map: Record<string, string> = {
    'wP': '♙', 'wN': '♘', 'wB': '♗', 'wR': '♖', 'wQ': '♕', 'wK': '♔',
    'bP': '♟', 'bN': '♞', 'bB': '♝', 'bR': '♜', 'bQ': '♛', 'bK': '♚'
  };
  return map[piece] || '';
}
