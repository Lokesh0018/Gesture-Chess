import { ReactNode, useState, useEffect, useRef } from 'react';
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
        <div className="right-sidebar glass-panel" style={{ gridArea: 'moveHistory', display: 'flex', flexDirection: 'column', margin: '0', width: '100%', height: '100%' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #403d39' }}>
            <button 
              onClick={() => setActiveTab('moves')}
              style={{ flex: 1, padding: '15px', background: activeTab === 'moves' ? 'rgba(0,0,0,0.2)' : 'transparent', color: activeTab === 'moves' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'background 0.2s' }}>
              Moves
            </button>
            {!hideChat && (
              <button 
                onClick={() => setActiveTab('chat')}
                style={{ flex: 1, padding: '15px', background: activeTab === 'chat' ? 'rgba(0,0,0,0.2)' : 'transparent', color: activeTab === 'chat' ? 'var(--text-main)' : 'var(--text-muted)', border: 'none', cursor: 'pointer', fontWeight: 'bold', position: 'relative', transition: 'background 0.2s' }}>
                Chat
                {chatUnread > 0 && activeTab !== 'chat' && (
                  <span style={{ position: 'absolute', top: 8, right: 10, background: '#f04e30', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px' }}>{chatUnread}</span>
                )}
              </button>
            )}
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
            <div style={{ marginTop: '10px' }}>
              <select 
                className="theme-selector"
                onChange={(e) => document.body.setAttribute('data-theme', e.target.value)}
              >
                <option value="midnight">Theme: Midnight Glass</option>
                <option value="wood">Theme: Tournament Wood</option>
                <option value="chesscom">Theme: Chess.com Green</option>
                <option value="cyber">Theme: Cyber Neon</option>
              </select>
            </div>
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
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.sender === bottomPlayerName ? 'flex-end' : 'flex-start', background: msg.sender === bottomPlayerName ? 'var(--accent)' : 'rgba(255,255,255,0.1)', padding: '8px 12px', borderRadius: '8px', maxWidth: '85%', wordBreak: 'break-word', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>{msg.sender}</div>
                  <div>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid var(--glass-border)', display: 'flex', gap: '5px' }}>
              <input 
                type="text" 
                value={chatInput} 
                onChange={(e) => setChatInput && setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSendChat && onSendChat()}
                placeholder="Message..."
                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.05)', color: 'white' }}
              />
              <button 
                onClick={onSendChat}
                className="menu-btn"
                style={{ padding: '0 15px', borderRadius: '4px' }}>
                Send
              </button>
            </div>
          </div>
          )}
        </div>
      )}
      
    </div>
  );
}
