type VFXListener = (type: 'capture' | 'promotion' | 'classicalDust' | 'trail', x: number, y: number, color?: string, pieceType?: string) => void;

class VFXManager {
  private listeners: VFXListener[] = [];
  public enabled: boolean = localStorage.getItem('chess_vfx_enabled') !== 'false';

  subscribe(listener: VFXListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  emit(type: 'capture' | 'promotion' | 'classicalDust' | 'trail', x: number, y: number, color?: string, pieceType?: string) {
    if (!this.enabled) return;
    for (const listener of this.listeners) {
      listener(type, x, y, color, pieceType);
    }
  }

  // Helper to calculate screen coordinates from a chess square (e.g. 'e4')
  triggerFromSquare(type: 'capture' | 'promotion' | 'classicalDust' | 'trail', square: string, boardOrientation: 'white' | 'black', boardElement: HTMLElement | null, color?: string, pieceType?: string) {
    if (!boardElement) return;
    
    const rect = boardElement.getBoundingClientRect();
    const squareSize = rect.width / 8;
    
    const file = square.charCodeAt(0) - 97; // 'a' is 0
    const rank = parseInt(square[1]) - 1;   // '1' is 0
    
    let xIndex = file;
    let yIndex = 7 - rank;
    
    if (boardOrientation === 'black') {
      xIndex = 7 - file;
      yIndex = rank;
    }
    
    const x = rect.left + (xIndex * squareSize) + (squareSize / 2);
    const y = rect.top + (yIndex * squareSize) + (squareSize / 2);
    
    this.emit(type, x, y, color, pieceType);
  }
}

export const vfx = new VFXManager();
