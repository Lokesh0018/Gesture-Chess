export class StockfishService {
  private worker: Worker;
  private isReady: boolean = false;
  private resolveBestMove: ((move: string) => void) | null = null;
  private resolveReady: (() => void) | null = null;

  constructor() {
    // We copied stockfish.js to the public folder to bypass cross-origin worker restrictions.
    this.worker = new Worker('/stockfish.js');
    
    this.worker.onmessage = (event) => {
      const line = event.data;
      if (typeof line !== 'string') return;

      if (line === 'readyok') {
        this.isReady = true;
        if (this.resolveReady) {
          this.resolveReady();
          this.resolveReady = null;
        }
      } else if (line.startsWith('bestmove')) {
        const match = line.match(/^bestmove ([a-h][1-8][a-h][1-8][qrbn]?)/);
        if (match && this.resolveBestMove) {
          this.resolveBestMove(match[1]);
          this.resolveBestMove = null;
        }
      }
    };

    // Initialize UCI
    this.worker.postMessage('uci');
  }

  public async init(): Promise<void> {
    if (this.isReady) return;
    return new Promise((resolve) => {
      this.resolveReady = resolve;
      this.worker.postMessage('isready');
    });
  }

  public async getBestMove(fen: string, depth: number = 10, skillLevel: number = 20): Promise<string> {
    await this.init();

    return new Promise((resolve) => {
      this.resolveBestMove = resolve;
      
      // Configure skill level (0-20)
      this.worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
      
      // Set position and start calculation
      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${depth}`);
    });
  }

  public terminate() {
    this.worker.terminate();
  }
}

export const stockfishService = new StockfishService();
