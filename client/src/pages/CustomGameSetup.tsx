import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, ChevronRight, ChevronDown, 
  Play, MousePointer2, PaintBucket, Eraser, MapPin, Target, Zap, LayoutGrid, RotateCcw, 
  RotateCw, Copy, ClipboardPaste, ZoomIn, ZoomOut, Maximize, Undo2, Redo2, 
  Layout, Hash
} from 'lucide-react';
import { Chessboard } from 'react-chessboard';
import './CustomGameSetup.css';

const PIECE_ASSET_MAP: Record<string, string> = {
  wK: 'whiteKing.svg',
  wQ: 'whiteQueen.svg',
  wR: 'whiteRook.svg',
  wB: 'whiteBishop.svg',
  wN: 'whiteHorse.svg',
  wP: 'whitePawn.svg',
  bK: 'blackKing.svg',
  bQ: 'blackQueen.svg',
  bR: 'bllackRook.svg',
  bB: 'blackBishop.svg',
  bN: 'blackHorse.svg',
  bP: 'blackPawn.svg'
};

const DEFAULT_STANDARD_POS = {
  a1: 'wR', b1: 'wN', c1: 'wB', d1: 'wQ', e1: 'wK', f1: 'wB', g1: 'wN', h1: 'wR',
  a2: 'wP', b2: 'wP', c2: 'wP', d2: 'wP', e2: 'wP', f2: 'wP', g2: 'wP', h2: 'wP',
  a8: 'bR', b8: 'bN', c8: 'bB', d8: 'bQ', e8: 'bK', f8: 'bB', g8: 'bN', h8: 'bR',
  a7: 'bP', b7: 'bP', c7: 'bP', d7: 'bP', e7: 'bP', f7: 'bP', g7: 'bP', h7: 'bP',
};

function positionToFen(pos: Record<string, string>): string {
  const pieceMap: Record<string, string> = {
    wK: 'K', wQ: 'Q', wR: 'R', wB: 'B', wN: 'N', wP: 'P',
    bK: 'k', bQ: 'q', bR: 'r', bB: 'b', bN: 'n', bP: 'p',
  };
  const files = 'abcdefgh';
  let fen = '';
  for (let rank = 8; rank >= 1; rank--) {
    let empty = 0;
    for (let f = 0; f < 8; f++) {
      const sq = files[f] + rank;
      const piece = pos[sq];
      if (piece && pieceMap[piece]) {
        if (empty > 0) { fen += empty; empty = 0; }
        fen += pieceMap[piece];
      } else {
        empty++;
      }
    }
    if (empty > 0) fen += empty;
    if (rank > 1) fen += '/';
  }
  return fen + ' w - - 0 1';
}

export const CustomGameSetup = () => {
  const navigate = useNavigate();
  
  // Layout State
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // Left Sidebar Expand/Collapse Sections
  const [openSections, setOpenSections] = useState({
    project: true,
    tools: true,
    rules: false,
    scripts: false
  });

  const toggleSection = (sec: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Tools State
  const [currentTool, setCurrentTool] = useState('Select');

  // Game Engine State
  const [designerPosition, setDesignerPosition] = useState<Record<string, string>>(DEFAULT_STANDARD_POS);
  const [winCondition, setWinCondition] = useState<'elimination' | 'sandbox'>('elimination');

  // Castling
  const [castleWK, setCastleWK] = useState(true);
  const [castleWQ, setCastleWQ] = useState(true);
  const [castleBK, setCastleBK] = useState(true);
  const [castleBQ, setCastleBQ] = useState(true);



  const onDesignerPieceDrop = (args: any) => {
    const { sourceSquare, targetSquare, piece } = args;
    const newPos = { ...designerPosition };

    if (!targetSquare) {
      delete newPos[sourceSquare];
    } else {
      if (sourceSquare !== 'spare') {
        delete newPos[sourceSquare];
      }
      newPos[targetSquare] = piece;
    }
    
    setDesignerPosition(newPos);
    return true;
  };

  const isBoardValid = useMemo(() => {
    const pieces = Object.values(designerPosition);
    const hasWhiteKing = pieces.includes('wK');
    const hasBlackKing = pieces.includes('bK');
    return hasWhiteKing && hasBlackKing;
  }, [designerPosition]);

  const handlePlayTest = () => {
    if (!isBoardValid) return;
    navigate('/custom-game', { 
      state: { 
        whiteTime: 600, blackTime: 600, increment: 5,
        whiteName: 'Player 1', blackName: 'Player 2',
        customPosition: designerPosition,
        winCondition,
        castling: { wK: castleWK, wQ: castleWQ, bK: castleBK, bQ: castleBQ }
      } 
    });
  };

  const designerFen = Object.keys(designerPosition).length === 0 ? '8/8/8/8/8/8/8/8 w - - 0 1' : positionToFen(designerPosition);

  const customPieces = useMemo(() => {
    const custom: Record<string, any> = {};
    Object.keys(PIECE_ASSET_MAP).forEach(p => {
      custom[p] = ({ squareWidth }: { squareWidth: number }) => (
        <div style={{ width: squareWidth, height: squareWidth, backgroundImage: `url(/assets/pieces/${PIECE_ASSET_MAP[p]})`, backgroundSize: '100%', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }} />
      );
    });
    return custom;
  }, []);

  return (
    <div className="ae-layout">
      
      <div className="ae-main">
        {/* Floating Collapse Left */}
        <div className={`ae-collapse-btn left ${leftCollapsed ? 'collapsed' : ''}`} onClick={() => setLeftCollapsed(!leftCollapsed)}>
          {leftCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </div>

        {/* Left Sidebar */}
        <aside className={`ae-sidebar ae-sidebar-left ${leftCollapsed ? 'collapsed' : ''}`}>
          <div className="ae-scroll-area">
            
            <div className="ae-sidebar-section">
              <div className="ae-section-header" onClick={() => toggleSection('project')}>
                <div className="ae-section-title"><Layout size={14} /> Project Settings</div>
                <ChevronDown size={14} style={{ transform: openSections.project ? 'rotate(0deg)' : 'rotate(180deg)' }} />
              </div>
              {openSections.project && (
                <div className="ae-section-content">
                  <div className="ae-input-group">
                    <label className="ae-label">Board Size</label>
                    <select className="ae-input"><option>8 x 8 (Standard)</option><option>10 x 10</option></select>
                  </div>
                  <label className="ae-checkbox-label">
                    <input type="checkbox" defaultChecked />
                    Show Coordinates
                  </label>
                </div>
              )}
            </div>

            <div className="ae-sidebar-section">
              <div className="ae-section-header" onClick={() => toggleSection('tools')}>
                <div className="ae-section-title"><MousePointer2 size={14} /> Editing Tools</div>
                <ChevronDown size={14} style={{ transform: openSections.tools ? 'rotate(0deg)' : 'rotate(180deg)' }} />
              </div>
              {openSections.tools && (
                <div className="ae-section-content" style={{ gap: '4px', padding: '8px' }}>
                  <div className={`ae-tool-item ${currentTool === 'Select' ? 'active' : ''}`} onClick={() => setCurrentTool('Select')}><MousePointer2 size={16}/> Select</div>
                  <div className={`ae-tool-item ${currentTool === 'Paint' ? 'active' : ''}`} onClick={() => setCurrentTool('Paint')}><PaintBucket size={16}/> Paint Tiles</div>
                  <div className={`ae-tool-item ${currentTool === 'Eraser' ? 'active' : ''}`} onClick={() => setCurrentTool('Eraser')}><Eraser size={16}/> Eraser</div>
                  <div className={`ae-tool-item ${currentTool === 'Zones' ? 'active' : ''}`} onClick={() => setCurrentTool('Zones')}><MapPin size={16}/> Zones & Spawn</div>
                  <div className={`ae-tool-item ${currentTool === 'Events' ? 'active' : ''}`} onClick={() => setCurrentTool('Events')}><Zap size={16}/> Trigger Events</div>
                </div>
              )}
            </div>

            <div className="ae-sidebar-section">
              <div className="ae-section-header" onClick={() => toggleSection('rules')}>
                <div className="ae-section-title"><Target size={14} /> Game Rules</div>
                <ChevronDown size={14} style={{ transform: openSections.rules ? 'rotate(0deg)' : 'rotate(180deg)' }} />
              </div>
              {openSections.rules && (
                <div className="ae-section-content">
                  <div className="ae-input-group">
                    <label className="ae-label">Win Condition</label>
                    <select className="ae-input" value={winCondition} onChange={e => setWinCondition(e.target.value as any)}>
                      <option value="elimination">Elimination (Capture All)</option>
                      <option value="sandbox">Sandbox</option>
                    </select>
                  </div>
                  <label className="ae-label" style={{ marginTop: '8px' }}>Castling Rights</label>
                  <label className="ae-checkbox-label"><input type="checkbox" checked={castleWK} onChange={e => setCastleWK(e.target.checked)}/> W. Kingside</label>
                  <label className="ae-checkbox-label"><input type="checkbox" checked={castleWQ} onChange={e => setCastleWQ(e.target.checked)}/> W. Queenside</label>
                  <label className="ae-checkbox-label"><input type="checkbox" checked={castleBK} onChange={e => setCastleBK(e.target.checked)}/> B. Kingside</label>
                  <label className="ae-checkbox-label"><input type="checkbox" checked={castleBQ} onChange={e => setCastleBQ(e.target.checked)}/> B. Queenside</label>
                </div>
              )}
            </div>
            
          </div>
          
          <div style={{ padding: '16px', borderTop: '1px solid var(--ae-border)' }}>
            <button className="ae-btn ae-btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={handlePlayTest}>
              <Play size={16} fill="currentColor" /> PLAY TEST
            </button>
          </div>
        </aside>

        {/* Center Workspace */}
        <main className="ae-workspace">
          <div className="ae-toolbar">
            <div className="ae-toolbar-group">
              <button className="ae-icon-btn"><Undo2 size={16} /></button>
              <button className="ae-icon-btn"><Redo2 size={16} /></button>
            </div>
            <div className="ae-toolbar-group">
              <button className="ae-icon-btn"><Copy size={16} /></button>
              <button className="ae-icon-btn"><ClipboardPaste size={16} /></button>
            </div>
            <div className="ae-toolbar-group">
              <button className="ae-icon-btn"><ZoomOut size={16} /></button>
              <span style={{ fontSize: '12px', fontWeight: 'bold', width: '40px', textAlign: 'center' }}>100%</span>
              <button className="ae-icon-btn"><ZoomIn size={16} /></button>
              <button className="ae-icon-btn"><Maximize size={16} /></button>
            </div>
            <div className="ae-toolbar-group">
              <button className="ae-icon-btn"><RotateCcw size={16} /></button>
              <button className="ae-icon-btn"><RotateCw size={16} /></button>
              <button className="ae-icon-btn"><LayoutGrid size={16} /></button>
              <button className="ae-icon-btn"><Hash size={16} /></button>
            </div>
          </div>

          <div className="ae-canvas">
            <div className="ae-board-wrapper">
              <div className="ae-board-inner">
                <Chessboard
                  options={{
                    id: "AdvancedEditorBoard",
                    position: designerFen,
                    onPieceDrop: onDesignerPieceDrop,
                    sparePieces: true,
                    dropOffBoardAction: 'trash',
                    boardOrientation: "white",
                    darkSquareStyle: { backgroundColor: '#475569' },
                    lightSquareStyle: { backgroundColor: '#cbd5e1' },
                    pieces: customPieces
                  } as any}
                />
              </div>
            </div>
          </div>

          <div className="ae-statusbar">
            <div className="ae-status-group">
              <div className="ae-status-item">
                <div className={`ae-status-dot ${isBoardValid ? '' : 'invalid'}`} style={{ background: isBoardValid ? 'var(--ae-success)' : 'var(--ae-danger)' }}></div>
                {isBoardValid ? 'Ready' : 'Invalid Setup'}
              </div>
              <div className="ae-status-item"><MousePointer2 size={12}/> {currentTool}</div>
            </div>
            <div className="ae-status-group">
              <div className="ae-status-item">X: 12 Y: 4</div>
              <div className="ae-status-item">Zoom: 100%</div>
              <div className="ae-status-item">Size: 8x8</div>
            </div>
          </div>
        </main>

        {/* Floating Collapse Right */}
        <div className={`ae-collapse-btn right ${rightCollapsed ? 'collapsed' : ''}`} onClick={() => setRightCollapsed(!rightCollapsed)}>
          {rightCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </div>

        {/* Right Sidebar */}
        <aside className={`ae-sidebar ae-sidebar-right ${rightCollapsed ? 'collapsed' : ''}`}>
          <div className="ae-scroll-area" style={{ padding: '16px' }}>
            <div className="ae-section-title" style={{ marginBottom: '16px' }}>Component Library</div>
            
            <div className="ae-assets-grid">
              {Object.keys(PIECE_ASSET_MAP).map(p => (
                <div key={p} className="ae-asset-card" title={p}>
                  <div style={{ width: '80%', height: '80%', backgroundImage: `url(/assets/pieces/${PIECE_ASSET_MAP[p]})`, backgroundSize: '100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}></div>
                </div>
              ))}
            </div>
            
            <div style={{ marginTop: '24px', fontSize: '12px', color: 'var(--ae-text-secondary)', textAlign: 'center' }}>
              Drag pieces from the spare rows above and below the board to place them. This library shows available pieces.
            </div>
          </div>
        </aside>
        
      </div>
    </div>
  );
};
