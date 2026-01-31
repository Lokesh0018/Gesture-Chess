import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Piece from './Piece';

export type MoveHistory = {
  white: string;
  black: string;
};

type GameLayoutProps = {
  children: ReactNode;
  topPlayerName: string;
  topPlayerElo?: string;
  topPlayerFlag?: string;
  bottomPlayerName: string;
  topPlayerClock: string;
  bottomPlayerClock: string;
  bottomPlayerElo?: string;
  bottomPlayerFlag?: string;
  turnIndicator: string;
  evalPercentage: number;
  topCaptures: string[];
  bottomCaptures: string[];
  moveHistory: MoveHistory[];
  onDraw?: () => void;
  onResign?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  onMoveClick?: (index: number) => void;
  prevLabel?: string;
  nextLabel?: string;
  moveScrubber?: React.ReactNode;
  hideSidebar?: boolean;
  hideChat?: boolean;
  activeTurn?: 'top' | 'bottom' | null;
  isGameOver?: boolean;
  
  // Chat props
  chatMessages?: {sender: string, text: string}[];
  chatInput?: string;
  setChatInput?: (v: string) => void;
  chatUnread?: number;
  setChatUnread?: (v: number) => void;
  onSendChat?: () => void;
};

export default function GameLayout({
  children,
  topPlayerName,
  topPlayerClock,
  topPlayerElo = "1850",
  topPlayerFlag = "🇯🇵",
  bottomPlayerName,
  bottomPlayerClock,
  bottomPlayerElo = "1920",
  bottomPlayerFlag = "🇺🇸",
  turnIndicator,
  evalPercentage,
  topCaptures,
  bottomCaptures,
  moveHistory,
  onDraw,
  onResign,
  onPrev,
  onNext,
  onMoveClick,
  prevLabel = "◀ Prev",
  nextLabel = "Next ▶",
  moveScrubber,
  hideSidebar,
  hideChat = false,
  activeTurn = null,
  isGameOver = false,
  chatMessages = [],
  chatInput = '',
  setChatInput,
  chatUnread = 0,
  setChatUnread,
  onSendChat
}: GameLayoutProps) {
  const [activeTab, setActiveTab] = useState<'moves' | 'chat'>('moves');
  const [showThemeDrawer, setShowThemeDrawer] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeTab === 'chat' && setChatUnread) {
      setChatUnread(0);
    }
  }, [activeTab, chatMessages, setChatUnread]);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, activeTab]);

  const themes = [
    { id: 'midnight', name: 'Midnight Glass', color: '#0f172a' },
    { id: 'wood', name: 'Tournament Wood', color: '#3e2723' },
    { id: 'chesscom', name: 'Classic Green', color: '#312e2b' },
    { id: 'cyber', name: 'Cyber Neon', color: '#050014' },
  ];

  return (
    <div className="layout-wrapper" style={hideSidebar ? { gridTemplateColumns: '180px auto 180px' } : {}}>
      
      {/* Left Column: Top Player Captures */}
      <div className="capture-panel glass-panel left-captured" style={{ gridArea: 'leftCaptured', height: '100%', minHeight: '500px' }}>
        <div className="side-captures">
          {topCaptures.map((p, i) => (
            <div key={i} style={{ width: '35px', height: '35px', opacity: 0.9, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Piece color={p[0] as 'w'|'b'} type={p[1].toUpperCase() as 'P'|'N'|'B'|'R'|'Q'|'K'} squareWidth={31} />
            </div>
          ))}
        </div>
      </div>

      {/* Center Column: Game Area */}
      <div className="board-area" style={{ gridArea: 'board', display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '75vh', justifySelf: 'center' }}>
        
        <div className="player-info" style={{ width: '100%', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
            <div className={`player-avatar ${activeTurn === 'top' ? 'active-avatar-ring' : ''}`} style={{ backgroundColor: '#7b4f3b', backgroundImage: "url('https://images.chesscomfiles.com/uploads/v1/user/103289066.b68ed511.50x50o.c6d040715cf4.png')" }}>
              <div className="live-dot" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="player-name" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {topPlayerFlag} {topPlayerName} <span className="player-elo">({topPlayerElo})</span>
              </div>
            </div>
          </div>
          <div className="player-clock clock-dark">{topPlayerClock}</div>
        </div>

        <div className={isGameOver ? "game-over-banner" : "glass-panel"} style={!isGameOver ? { textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: 'var(--text-main)', margin: '5px 0 10px 0', padding: '10px', borderRadius: '8px', width: '100%', boxSizing: 'border-box' } : {}}>
          {turnIndicator}
        </div>

        <div className="board-row" style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: '10px', width: '100%', justifyContent: 'center' }}>
          
          <div className="eval-bar-wrapper">
            <div id="eval-fill" className={evalPercentage > 80 || evalPercentage < 20 ? 'eval-glow' : ''} style={{ height: `${evalPercentage}%`, transition: 'height 0.4s ease-in-out' }}></div>
          </div>
          
          <div className="react-board-wrapper" style={{ flex: 1, minWidth: '300px', aspectRatio: '1 / 1', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)', borderRadius: '4px', position: 'relative' }}>
            {children}
          </div>

        </div>

        <div className="player-info" style={{ width: '100%', marginTop: '10px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
            <div className={`player-avatar ${activeTurn === 'bottom' ? 'active-avatar-ring' : ''}`} style={{ backgroundColor: '#aaa', backgroundImage: "url('https://images.chesscomfiles.com/uploads/v1/user/103289066.b68ed511.50x50o.c6d040715cf4.png')" }}>
              <div className="live-dot" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="player-name" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                {bottomPlayerFlag} {bottomPlayerName} <span className="player-elo">({bottomPlayerElo})</span>
              </div>
            </div>
          </div>
          <div className="player-clock">{bottomPlayerClock}</div>
        </div>

      </div>

      {/* Right Column: Bottom Player Captures */}
      <div className="capture-panel glass-panel right-captured" style={{ gridArea: 'rightCaptured', height: '100%', minHeight: '500px' }}>
        <div className="side-captures">
          {bottomCaptures.map((p, i) => (
            <div key={i} style={{ width: '35px', height: '35px', opacity: 0.9, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '4px', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Piece color={p[0] as 'w'|'b'} type={p[1].toUpperCase() as 'P'|'N'|'B'|'R'|'Q'|'K'} squareWidth={31} />
            </div>
          ))}
        </div>
      </div>

      {/* Far Right Column: Sidebar */}
      {!hideSidebar && (
        <div className="right-sidebar glass-panel" style={{ gridArea: 'moveHistory', display: 'flex', flexDirection: 'column', margin: '0', width: '100%', height: '100%', position: 'relative' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.2)' }}>
            <button 
              onClick={() => setActiveTab('moves')}
              style={{ flex: 1, padding: '16px', background: activeTab === 'moves' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'moves' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s', borderBottom: activeTab === 'moves' ? '2px solid var(--accent)' : '2px solid transparent' }}>
              Moves
            </button>
            {!hideChat && (
              <button 
                onClick={() => setActiveTab('chat')}
                style={{ flex: 1, padding: '16px', background: activeTab === 'chat' ? 'rgba(255,255,255,0.05)' : 'transparent', color: activeTab === 'chat' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: 'bold', position: 'relative', transition: 'all 0.2s', borderBottom: activeTab === 'chat' ? '2px solid var(--accent)' : '2px solid transparent' }}>
                Chat
                {chatUnread > 0 && activeTab !== 'chat' && (
                  <span style={{ position: 'absolute', top: 12, right: 12, background: '#f04e30', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', boxShadow: '0 0 10px rgba(240, 78, 48, 0.5)' }}>{chatUnread}</span>
                )}
              </button>
            )}
            <button 
              onClick={() => setShowThemeDrawer(true)}
              style={{ padding: '16px', background: 'transparent', color: 'var(--text-muted)', border: 'none', cursor: 'pointer', transition: 'all 0.2s', borderBottom: '2px solid transparent' }}
              title="Settings & Themes"
            >
              ⚙️
            </button>
          </div>

          <div className="controls-bar" style={{ display: activeTab === 'moves' ? 'flex' : 'none' }}>
            <div className="action-buttons">
              <button className="action-btn" onClick={onDraw}>½ Draw</button>
              <button className="action-btn" onClick={onResign}>🏳 Resign</button>
            </div>
            <div className="action-buttons">
              {onPrev && <button className="action-btn" onClick={onPrev}>{prevLabel}</button>}
              {onNext && <button className="action-btn" onClick={onNext}>{nextLabel}</button>}
            </div>
            {moveScrubber && (
              <div style={{ marginTop: '15px', padding: '0 5px' }}>
                {moveScrubber}
              </div>
            )}
          </div>
          
          <div className="moves-container" style={{ display: activeTab === 'moves' ? 'flex' : 'none' }}>
            {moveHistory.map((m, idx) => (
              <div key={idx} className="move-row">
                <span className="move-number">{idx + 1}.</span>
                <span className="move-white" style={{ flex: 1, padding: '6px 15px', color: '#fff', cursor: 'pointer' }} onClick={() => onMoveClick?.(idx * 2)}>{m.white}</span>
                <span className="move-black" style={{ flex: 1, padding: '6px 15px', color: '#fff', cursor: 'pointer' }} onClick={() => onMoveClick?.(idx * 2 + 1)}>{m.black}</span>
              </div>
            ))}
          </div>

          {/* Chat Container */}
          {!hideChat && (
            <div style={{ display: activeTab === 'chat' ? 'flex' : 'none', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.sender === bottomPlayerName ? 'flex-end' : 'flex-start', background: msg.sender === bottomPlayerName ? 'var(--accent)' : 'rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '12px', maxWidth: '85%', wordBreak: 'break-word', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', color: msg.sender === bottomPlayerName ? '#fff' : 'var(--text-main)' }}>
                  <div style={{ fontSize: '11px', color: msg.sender === bottomPlayerName ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>{msg.sender}</div>
                  <div style={{ lineHeight: '1.4' }}>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '12px', background: 'rgba(0,0,0,0.3)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '8px' }}>
              <input 
                type="text" 
                value={chatInput} 
                onChange={(e) => setChatInput && setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSendChat && onSendChat()}
                placeholder="Message..."
                style={{ flex: 1, padding: '12px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
              <button 
                onClick={onSendChat}
                className="menu-btn"
                style={{ padding: '0 20px', borderRadius: '8px', boxShadow: 'none' }}>
                Send
              </button>
            </div>
          </div>
          )}

          {/* Theme Drawer */}
          <AnimatePresence>
            {showThemeDrawer && (
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)',
                  zIndex: 100, display: 'flex', flexDirection: 'column',
                  borderLeft: '1px solid var(--glass-border)'
                }}
              >
                <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Themes</h3>
                  <button onClick={() => setShowThemeDrawer(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
                </div>
                <div style={{ padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {themes.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => document.body.setAttribute('data-theme', t.id)}
                      style={{
                        padding: '15px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '15px', transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    >
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: t.color, border: '2px solid rgba(255,255,255,0.2)' }} />
                      <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{t.name}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      )}
      
    </div>
  );
}
