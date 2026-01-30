class AudioManager {
  private playSound(id: string) {
    // Placeholder logic for sound playing.
    // In the future, load real mp3 files and play them here.
    console.log(`[Audio] Playing sound: ${id}.mp3`);
  }

  capture() {
    this.playSound('capture');
  }

  promote() {
    this.playSound('promote_start');
  }

  promoteCharge() {
    this.playSound('promote_charge');
  }

  promoteBurst() {
    this.playSound('promote_burst');
  }
}

export const audio = new AudioManager();
