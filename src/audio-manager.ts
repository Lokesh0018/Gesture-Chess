class AudioManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = localStorage.getItem('chess_sound_enabled') !== 'false';
  public volume: number = parseFloat(localStorage.getItem('chess_volume') || '1.0');

  private initCtx() {
    if (!this.enabled) return;
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playThud() {
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    
    // Low frequency sine drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
    
    gain.gain.setValueAtTime(0.5 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, t + 0.15);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playCapture() {
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    
    // Sharp triangle hit
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    
    gain.gain.setValueAtTime(0.8 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, t + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.15);
  }

  playBassDrop() {
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(20, t + 2);
    
    gain.gain.setValueAtTime(1 * this.volume, t);
    gain.gain.linearRampToValueAtTime(0.8 * this.volume, t + 1);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, t + 3);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 3.1);
  }

  playHoverBlip() {
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    
    gain.gain.setValueAtTime(0.1 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, t + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playCheck() {
    this.initCtx();
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    
    // Low, dramatic bell tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 1);
    
    gain.gain.setValueAtTime(0.5 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01 * this.volume, t + 1.5);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 1.6);
  }

  // Backwards compatibility for existing code
  capture() { this.playCapture(); }
  promote() { this.playCapture(); }
  promoteCharge() { this.playHoverBlip(); }
  promoteBurst() { this.playThud(); }
  check() { this.playCheck(); }
}

export const audio = new AudioManager();
