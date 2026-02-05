export class StockfishService {
  private worker: Worker;
  private isReady: boolean = false;
  private resolveBestMove: ((move: string) => void) | null = null;
  private resolveReady: (() => void) | null = null;
  private onEvalUpdate: ((evaluation: { score: number; isMate: boolean, bestMove?: string }) => void) | null = null;

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
      } else if (line.startsWith('info') && this.onEvalUpdate) {
        // Parse evaluation score: "info depth 10 ... score cp 120 ..." or "score mate -3"
        const cpMatch = line.match(/score cp (-?\d+)/);
        const mateMatch = line.match(/score mate (-?\d+)/);
        const pvMatch = line.match(/ pv ([a-h][1-8][a-h][1-8][qrbn]?)/);
        const bestMove = pvMatch ? pvMatch[1] : undefined;
        
        if (mateMatch) {
          this.onEvalUpdate({ score: parseInt(mateMatch[1], 10), isMate: true, bestMove });
        } else if (cpMatch) {
          this.onEvalUpdate({ score: parseInt(cpMatch[1], 10) / 100, isMate: false, bestMove }); // Convert centipawns to pawns
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
      this.onEvalUpdate = null; // Disable streaming eval for bestMove requests
      
      // Configure skill level (0-20)
      this.worker.postMessage(`setoption name Skill Level value ${skillLevel}`);
      
      // Set position and start calculation
      this.worker.postMessage(`position fen ${fen}`);
      this.worker.postMessage(`go depth ${depth}`);
    });
  }

  public async startEvaluation(fen: string, callback: (evaluation: { score: number; isMate: boolean, bestMove?: string }) => void): Promise<void> {
    await this.init();
    this.worker.postMessage('stop'); // Stop any ongoing calculations
    this.onEvalUpdate = callback;
    this.worker.postMessage('setoption name Skill Level value 20'); // Max skill for analysis
    this.worker.postMessage(`position fen ${fen}`);
    this.worker.postMessage('go infinite'); // Evaluate indefinitely until stopped
  }

  public stopEvaluation() {
    this.worker.postMessage('stop');
    this.onEvalUpdate = null;
  }

  public terminate() {
    this.worker.terminate();
  }
}

export const stockfishService = new StockfishService();
