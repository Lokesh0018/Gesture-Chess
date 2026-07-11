import { useSettingsStore } from '../store/useSettingsStore';

export function playMoveSound(type: 'move' | 'capture' | 'check' | 'invalid' | 'success'): void {
  try {
    const { soundEnabled, soundVolume } = useSettingsStore.getState();
    if (!soundEnabled || soundVolume <= 0) return;

    const ctx = new window.AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === 'success') {
      const t = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const oscNote = ctx.createOscillator();
        const gainNote = ctx.createGain();
        oscNote.type = 'sine';
        oscNote.frequency.value = freq;
        const noteTime = t + i * 0.1;
        gainNote.gain.setValueAtTime(0, noteTime);
        gainNote.gain.linearRampToValueAtTime(soundVolume * 0.4, noteTime + 0.05);
        gainNote.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.3);
        oscNote.connect(gainNote);
        gainNote.connect(ctx.destination);
        oscNote.start(noteTime);
        oscNote.stop(noteTime + 0.3);
      });
      return;
    }

    if (type === 'invalid') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.2);
      gain.gain.setValueAtTime(soundVolume * 0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
      return;
    }

    if (type === 'check') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(soundVolume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
      return;
    }

    osc.type = type === 'capture' ? 'square' : 'triangle';
    osc.frequency.value = type === 'capture' ? 240 : 430;
    gain.gain.setValueAtTime(soundVolume * 0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch {
    // No-op
  }
}
