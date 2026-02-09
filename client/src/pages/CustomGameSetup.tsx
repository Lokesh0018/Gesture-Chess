import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Undo2, Redo2,
  Trash2, AlertTriangle, CheckCircle2, Save,
  PaintBucket, CopyX, ArrowRightLeft,
  FlipVertical
} from 'lucide-react';
import { CustomBoard } from '../components/CustomBoard';
import { PIECE_ASSET_MAP } from '../utils/pieces';
import './CustomGameSetup.css';

const CLASSIC_POS = {
  a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR',
  a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
  a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR',
  a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
};

type Tool = 'select' | 'place' | 'erase' | 'fill';
type WinCondition = 'capture_all' | 'capture_king' | 'checkmate' | 'last_standing' | 'custom';

export const CustomGameSetup = () => {
  useEffect(() => {
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    const dashboardScroll = document.querySelector('.dashboard-content-scroll') as HTMLElement;
    
    if (mainContent) mainContent.style.overflow = 'hidden';
    if (dashboardScroll) dashboardScroll.style.overflow = 'hidden';
    
    return () => {
      if (mainContent) mainContent.style.overflow = '';
      if (dashboardScroll) dashboardScroll.style.overflow = '';
    };
  }, []);

  const navigate = useNavigate();

  const [designerPosition, setDesignerPosition] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<Record<string, string>[]>([{}]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [activeTool, setActiveTool] = useState<Tool>('select');
  const [selectedPiece, setSelectedPiece] = useState<string | null>(null);

  const [startingSide, setStartingSide] = useState<'w' | 'b'>('w');
  const [winCondition, setWinCondition] = useState<WinCondition>('capture_all');

  const castleWK = true;
  const castleWQ = true;
  const castleBK = true;
  const castleBQ = true;
  const enPassant = false;
  const pawnPromotion = true;

  const [validationPopover, setValidationPopover] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  const [qbSide, setQbSide] = useState<'w' | 'b'>('w');
  const [qbPiece, setQbPiece] = useState<string>('R');
  const [qbCount, setQbCount] = useState<number>(32);


  const [confirmModal, setConfirmModal] = useState<{ action: string, title: string, message: string } | null>(null);

  const pushHistory = (newPos: Record<string, string>) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newPos);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setDesignerPosition(newPos);
  };

  const updatePosition = (newPos: Record<string, string>) => {
    pushHistory(newPos);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setDesignerPosition(history[historyIndex - 1]);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setDesignerPosition(history[historyIndex + 1]);
    }
  };

  const clearBoard = () => {
    setConfirmModal({ action: 'clear', title: 'Clear Board', message: 'Are you sure you want to clear the entire board?' });
  };

  const processConfirm = (accepted: boolean) => {
    if (accepted && confirmModal?.action === 'clear') {
      const empty = {};
      pushHistory(empty);
      setDesignerPosition(empty);
    }
    setConfirmModal(null);
  };

  const swapSides = () => {
    const newPos: Record<string, string> = {};
    Object.keys(designerPosition).forEach(sq => {
      const piece = designerPosition[sq];
      const color = piece[0];
      const type = piece[1];
      const newPiece = (color === 'w' ? 'b' : 'w') + type;
      // Mirror vertically
      const file = sq[0];
      const rank = parseInt(sq[1]);
      const newRank = 9 - rank;
      newPos[file + newRank] = newPiece;
    });
    updatePosition(newPos);
  };

  const mirrorSetup = () => {
    const newPos = { ...designerPosition };
    Object.keys(designerPosition).forEach(sq => {
      const piece = designerPosition[sq];
      const color = piece[0];
      const type = piece[1];
      const file = sq[0];
      const rank = parseInt(sq[1]);

      const newRank = 9 - rank;
      const targetSq = file + newRank;

      if (!newPos[targetSq]) {
        const newPiece = (color === 'w' ? 'b' : 'w') + type;
        newPos[targetSq] = newPiece;
      }
    });
    updatePosition(newPos);
  };

  const autoPlace = () => {
    const piece = qbSide + qbPiece;
    let placed = 0;
    const newPos = { ...designerPosition };
    const files = 'abcdefgh';

    // Determine priority ranks based on side
    const ranks = qbSide === 'w' ? [1, 2, 3, 4, 5, 6, 7, 8] : [8, 7, 6, 5, 4, 3, 2, 1];

    for (const r of ranks) {
      for (let f = 0; f < 8; f++) {
        if (placed >= qbCount) break;
        const sq = files[f] + r;
        if (!newPos[sq]) {
          newPos[sq] = piece;
          placed++;
        }
      }
      if (placed >= qbCount) break;
    }

    if (placed < qbCount) {
      setConfirmModal({ action: 'alert', title: 'Board Full', message: `Could only place ${placed} pieces. The board is full!` });
    }
    updatePosition(newPos);
  };

  const setPreset = (type: string) => {
    let newPos: Record<string, string> = {};
    if (type === 'empty') newPos = {};
    else if (type === 'classic') newPos = CLASSIC_POS;
    else if (type === '32v32') {
      const files = 'abcdefgh';
      for (let r = 1; r <= 4; r++) {
        for (let f = 0; f < 8; f++) newPos[files[f] + r] = 'wR';
      }
      for (let r = 5; r <= 8; r++) {
        for (let f = 0; f < 8; f++) newPos[files[f] + r] = 'bQ';
      }
    } else if (type === 'knights_bishops') {
      const files = 'abcdefgh';
      for (let r = 1; r <= 2; r++) {
        for (let f = 0; f < 8; f++) newPos[files[f] + r] = 'wN';
      }
      for (let r = 7; r <= 8; r++) {
        for (let f = 0; f < 8; f++) newPos[files[f] + r] = 'bB';
      }
    } else if (type === 'queen_pawns') {
      newPos['e1'] = 'wQ';
      const files = 'abcdefgh';
      for (let r = 6; r <= 8; r++) {
        for (let f = 0; f < 8; f++) {
          if (Object.keys(newPos).length < 21) newPos[files[f] + r] = 'bP';
        }
      }
    } else if (type === 'random') {
      const files = 'abcdefgh';
      const pieces = ['K', 'Q', 'R', 'B', 'N', 'P'];
      for (let r = 1; r <= 8; r++) {
        for (let f = 0; f < 8; f++) {
          if (Math.random() > 0.5) {
            const side = Math.random() > 0.5 ? 'w' : 'b';
            const piece = pieces[Math.floor(Math.random() * pieces.length)];
            newPos[files[f] + r] = side + piece;
          }
        }
      }
    }
    updatePosition(newPos);
  };

  const onSquareClick = (square: string) => {
    if (activeTool === 'place' && selectedPiece) {
      const newPos = { ...designerPosition };
      newPos[square] = selectedPiece;
      updatePosition(newPos);
    } else if (activeTool === 'erase') {
      if (designerPosition[square]) {
        const newPos = { ...designerPosition };
        delete newPos[square];
        updatePosition(newPos);
      }
    } else if (activeTool === 'fill' && selectedPiece) {
      const newPos = { ...designerPosition };
      const rank = square[1];
      const files = 'abcdefgh';
      for (let f = 0; f < 8; f++) {
        newPos[files[f] + rank] = selectedPiece;
      }
      updatePosition(newPos);
    }
  };

  const onPieceDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
    const newPos = { ...designerPosition };
    if (!targetSquare) {
      delete newPos[sourceSquare];
    } else {
      if (sourceSquare !== 'spare') {
        delete newPos[sourceSquare];
      }
      newPos[targetSquare] = piece;
    }
    updatePosition(newPos);
    return true;
  };

  const validation = useMemo(() => {
    const pieces = Object.values(designerPosition);
    let wK = 0, bK = 0, wTotal = 0, bTotal = 0;
    pieces.forEach(p => {
      if (p === 'wK') wK++;
      if (p === 'bK') bK++;
      if (p.startsWith('w')) wTotal++;
      if (p.startsWith('b')) bTotal++;
    });

    const errors: string[] = [];
    const warnings: string[] = [];
    let isValid = true;

    if (wTotal === 0) { errors.push("White army is completely empty."); isValid = false; }
    if (bTotal === 0) { errors.push("Black army is completely empty."); isValid = false; }

    if (winCondition === 'checkmate' || winCondition === 'capture_king') {
      if (wK === 0) { errors.push("Checkmate requires at least one King per side."); isValid = false; }
      if (bK === 0) { errors.push("Checkmate requires at least one King per side."); isValid = false; }
    } else {
      if (wK === 0 && wTotal > 0) warnings.push("White has no king (Allowed in this mode).");
      if (bK === 0 && bTotal > 0) warnings.push("Black has no king (Allowed in this mode).");
    }

    if (wTotal > 32) warnings.push("White has a massive army (>32 pieces).");
    if (bTotal > 32) warnings.push("Black has a massive army (>32 pieces).");

    return { isValid, errors, warnings, wTotal, bTotal };
  }, [designerPosition, winCondition]);

  const handlePlayTest = () => {
    if (!validation.isValid) {
      setValidationPopover(true);
      return;
    }
    navigate('/custom-game', {
      state: {
        whiteTime: 600, blackTime: 600, increment: 5,
        whiteName: 'White Army', blackName: 'Black Army',
        customPosition: designerPosition, startingSide: startingSide,
        winCondition: winCondition === 'custom' ? 'elimination' : winCondition === 'last_standing' ? 'elimination' : winCondition === 'capture_all' ? 'elimination' : 'sandbox',
        castling: { wK: castleWK, wQ: castleWQ, bK: castleBK, bQ: castleBQ }
      }
    });
  };

  const saveDraft = () => {
    const draft = { designerPosition, startingSide, winCondition, castleWK, castleWQ, castleBK, castleBQ, enPassant, pawnPromotion };
    localStorage.setItem('gestureChessDraft', JSON.stringify(draft));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const getPieceCount = (piece: string) => {
    return Object.values(designerPosition).filter(p => p === piece).length;
  };

  const pieceNames: Record<string, string> = {
    'K': 'King', 'Q': 'Queen', 'R': 'Rook', 'B': 'Bishop', 'N': 'Knight', 'P': 'Pawn'
  };

  return (
    <div className="ae-layout">
      {/* Ambient Glows */}
      <div className="ae-ambient-glow ae-glow-blue"></div>
      <div className="ae-ambient-glow ae-glow-purple"></div>

      <div className="ae-main-columns">

        {/* Left Panel: Battle Setup */}
        <aside className="ae-panel ae-panel-left">
          <div className="ae-scroll-area">
            <h3 className="ae-section-heading" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ae-text-secondary)', marginBottom: '16px' }}>BATTLE SETTINGS</h3>
            <div className="ae-panel-section">
              <div className="ae-input-group" style={{ marginBottom: '20px' }}>
                <label className="ae-label" style={{ marginBottom: '8px' }}>Starting Side</label>
                <div className="ae-segmented">
                  <div className={`ae-segment ${startingSide === 'w' ? 'active' : ''}`} onClick={() => setStartingSide('w')}>White</div>
                  <div className={`ae-segment ${startingSide === 'b' ? 'active' : ''}`} onClick={() => setStartingSide('b')}>Black</div>
                </div>
              </div>

              <div className="ae-panel-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span className="ae-label">Victory Condition</span>
                </div>
                <div className="ae-segmented-control" style={{ marginBottom: '0' }}>
                  <select className="ae-dropdown" value={winCondition} onChange={(e) => setWinCondition(e.target.value as WinCondition)}>
                    <option value="capture_all">Capture All Enemy Pieces</option>
                    <option value="capture_king">Capture the King</option>
                    <option value="checkmate">Checkmate</option>
                    <option value="last_standing">Last Army Standing</option>
                    <option value="custom">Custom Elimination Target</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="ae-panel-section" style={{ marginTop: '32px' }}>
              <h3 className="ae-section-heading" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ae-text-secondary)', marginBottom: '16px' }}>QUICK PRESETS</h3>
              <div className="ae-presets-grid">
                <button className="ae-btn-small" onClick={() => setPreset('classic')}>Classic Setup</button>
                <button className="ae-btn-small" onClick={() => setPreset('32v32')}>32 Rooks vs 32 Queens</button>
                <button className="ae-btn-small" onClick={() => setPreset('knights_bishops')}>Knights vs Bishops</button>
                <button className="ae-btn-small" onClick={() => setPreset('random')}>Random Armies</button>
              </div>
            </div>

            <div className="ae-panel-section" style={{ marginTop: '32px' }}>
              <h3 className="ae-section-heading" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ae-text-secondary)', marginBottom: '16px' }}>QUICK ARMY BUILDER</h3>
              <div className="ae-qb-form">
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <label className="ae-label" style={{ marginBottom: '8px', fontSize: '12px' }}>Side</label>
                    <select className="ae-dropdown" value={qbSide} onChange={(e) => setQbSide(e.target.value as 'w' | 'b')}>
                      <option value="w">White</option>
                      <option value="b">Black</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label className="ae-label" style={{ marginBottom: '8px', fontSize: '12px' }}>Piece</label>
                    <select className="ae-dropdown" value={qbPiece} onChange={(e) => setQbPiece(e.target.value)}>
                      <option value="K">King</option>
                      <option value="Q">Queen</option>
                      <option value="R">Rook</option>
                      <option value="B">Bishop</option>
                      <option value="N">Knight</option>
                      <option value="P">Pawn</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 1 }}>
                    <label className="ae-label" style={{ marginBottom: '8px', fontSize: '12px' }}>Count</label>
                    <input type="number" min="1" max="64" className="ae-dropdown" value={qbCount} onChange={(e) => setQbCount(parseInt(e.target.value) || 1)} style={{ width: '100%' }} />
                  </div>
                  <button className="ae-btn ae-btn-primary" onClick={autoPlace} style={{ flex: 1, padding: '10px 16px', fontSize: '13px' }}>
                    Generate
                  </button>
                </div>
              </div>
            </div>



          </div>
        </aside>

        {/* Center Workspace */}
        <main className="ae-workspace">
          
          <header className="ae-editor-header" style={{ marginBottom: '16px' }}>
            <div className="ae-header-info">
              <h1 className="ae-title">Custom Battle Sandbox</h1>
              <p className="ae-subtitle">Build any army. Create any battle.</p>
            </div>
          </header>

          <div className="ae-toolbar">
            <div className="ae-toolbar-group">
              <button className={`ae-tool-btn ${activeTool === 'fill' ? 'active' : ''}`} onClick={() => setActiveTool('fill')} title="Fill Row/Empty"><PaintBucket size={16} /> <span>Fill</span></button>
              <button className={`ae-tool-btn ${activeTool === 'erase' ? 'active' : ''}`} onClick={() => setActiveTool('erase')} title="Erase Piece"><Trash2 size={16} /> <span>Erase</span></button>
            </div>
            <div className="ae-toolbar-group">
              <button className="ae-tool-btn" onClick={undo} disabled={historyIndex === 0} title="Undo"><Undo2 size={16} /> <span>Undo</span></button>
              <button className="ae-tool-btn" onClick={redo} disabled={historyIndex === history.length - 1} title="Redo"><Redo2 size={16} /> <span>Redo</span></button>
            </div>
            <div className="ae-toolbar-group">
              <button className="ae-tool-btn" onClick={mirrorSetup} title="Mirror Setup"><FlipVertical size={16} /> <span>Mirror</span></button>
              <button className="ae-tool-btn" onClick={swapSides} title="Swap Sides"><ArrowRightLeft size={16} /> <span>Swap</span></button>
              <button className="ae-tool-btn danger" onClick={clearBoard} title="Clear Board"><CopyX size={16} /> <span>Clear</span></button>
            </div>
          </div>

          <div className="ae-canvas" style={{ flexDirection: 'column', gap: '8px', marginTop: '-20px' }}>
            <span style={{ fontSize: '12px', color: 'var(--ae-text-secondary)', fontWeight: 600 }}>{Object.keys(designerPosition).length === 0 ? 'Board: Empty · 0 pieces' : `Board: ${Object.keys(designerPosition).length} pieces`}</span>
            <div className="ae-board-wrapper">
              <div className="ae-board-inner" onContextMenu={(e) => e.preventDefault()}>
                <CustomBoard
                  position={designerPosition}
                  onPieceDrop={onPieceDrop as any}
                  onSquareClick={onSquareClick}
                  onSquareRightClick={(sq) => {
                    const newPos = { ...designerPosition };
                    delete newPos[sq];
                    updatePosition(newPos);
                  }}
                  orientation="white"
                  customDarkSquareStyle={{ backgroundColor: '#475569' }}
                  customLightSquareStyle={{ backgroundColor: '#cbd5e1' }}
                />
              </div>
            </div>
          </div>
        </main>

        
        {/* Right Panel: Piece Arsenal */}
        <aside className="ae-panel ae-panel-right">
          <div className="ae-scroll-area" style={{ padding: '16px' }}>
            <h3 className="ae-section-heading" style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--ae-text-secondary)', marginBottom: '16px' }}>PIECE ARSENAL</h3>

            <div className="ae-arsenal-section" style={{ marginBottom: '24px' }}>
              <h4 style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>WHITE</h4>
              <div className="ae-arsenal-grid">
                {['wK', 'wQ', 'wR', 'wB', 'wN', 'wP'].map(p => (
                  <div
                    key={p}
                    className={`ae-arsenal-card ${selectedPiece === p ? 'active' : ''}`}
                    onClick={() => { setSelectedPiece(p); setActiveTool('place'); }}
                    style={{ padding: '12px 8px' }}
                  >
                    <img src={`/assets/pieces/${PIECE_ASSET_MAP[p]}`} alt={p} className="ae-arsenal-img" draggable={false} style={{ width: '40px', height: '40px' }} />
                    <div className="ae-arsenal-info">
                      <span className="ae-arsenal-name">{pieceNames[p[1]]}</span>
                      <span className="ae-arsenal-count" title="Currently placed on board">×{getPieceCount(p)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ae-arsenal-section">
              <h4 style={{ fontSize: '11px', color: '#94A3B8', marginBottom: '12px', fontWeight: 600, letterSpacing: '0.05em' }}>BLACK</h4>
              <div className="ae-arsenal-grid">
                {['bK', 'bQ', 'bR', 'bB', 'bN', 'bP'].map(p => (
                  <div
                    key={p}
                    className={`ae-arsenal-card ${selectedPiece === p ? 'active' : ''}`}
                    onClick={() => { setSelectedPiece(p); setActiveTool('place'); }}
                    style={{ padding: '12px 8px' }}
                  >
                    <img src={`/assets/pieces/${PIECE_ASSET_MAP[p]}`} alt={p} className="ae-arsenal-img" draggable={false} style={{ width: '40px', height: '40px' }} />
                    <div className="ae-arsenal-info">
                      <span className="ae-arsenal-name">{pieceNames[p[1]]}</span>
                      <span className="ae-arsenal-count" title="Currently placed on board">×{getPieceCount(p)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </aside>

      </div>

      {/* Sticky Bottom Footer */}
      <div className="ae-layout-footer">
        <div 
          className="ae-validation-container" 
          onClick={() => setValidationPopover(!validationPopover)} 
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          title={validation.isValid ? (validation.warnings.length > 0 ? 'Setup has warnings (Click to view)' : 'Valid setup') : 'Invalid setup (Click to view errors)'}
        >
          <div className={`ae-validation-badge ${validation.isValid ? (validation.warnings.length > 0 ? 'warning' : 'valid') : 'invalid'}`} style={{ margin: 0, border: 'none', background: 'transparent', padding: 0 }}>
            {validation.isValid ? (validation.warnings.length > 0 ? <AlertTriangle size={20} color="#F59E0B" /> : <CheckCircle2 size={20} color="#10B981" />) : <AlertTriangle size={20} color="#EF4444" />}
          </div>
        </div>

        {validationPopover && (
          <div className="ae-validation-popover" style={{ bottom: '100%', left: '24px', top: 'auto', marginBottom: '16px' }}>
            <h4>Validation Status</h4>
            <ul className="ae-validation-list">
              <li className="success">✓ Starting player selected</li>
              <li className="success">✓ Victory condition configured</li>
              {validation.errors.map((err, i) => <li key={`err-${i}`} className="error">✗ {err}</li>)}
              {validation.warnings.map((warn, i) => <li key={`warn-${i}`} className="warning">⚠ {warn}</li>)}
              {validation.isValid && validation.warnings.length === 0 && <li className="success">✓ Both armies contain pieces</li>}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="ae-btn ae-btn-ghost" onClick={saveDraft} style={{ color: 'var(--ae-text-secondary)' }}>
            <Save size={16} /> {draftSaved ? 'Saved just now' : 'Save Draft'}
          </button>
          <button
              className="ae-btn ae-btn-primary"
              style={{ padding: '8px 24px', fontSize: '14px', fontWeight: 'bold', opacity: validation.isValid ? 1 : 0.5, pointerEvents: validation.isValid ? 'auto' : 'none' }}
              onClick={handlePlayTest}
              disabled={!validation.isValid}
            >
              <Play size={16} fill="currentColor" /> Start Battle
          </button>
        </div>
      </div>

      <AnimatePresence>
        {confirmModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60 }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: '#1E293B', padding: '40px', borderRadius: '24px', textAlign: 'center', minWidth: '400px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              <h2 style={{ fontSize: '24px', color: '#fff', marginBottom: '12px' }}>{confirmModal.title}</h2>
              <p style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '32px' }}>{confirmModal.message}</p>
              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                {confirmModal.action === 'alert' ? (
                  <button onClick={() => setConfirmModal(null)} style={{ padding: '12px 24px', background: '#3B82F6', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>OK</button>
                ) : (
                  <>
                    <button onClick={() => processConfirm(false)} style={{ padding: '12px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                    <button onClick={() => processConfirm(true)} style={{ padding: '12px 24px', background: '#EF4444', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>Confirm</button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
