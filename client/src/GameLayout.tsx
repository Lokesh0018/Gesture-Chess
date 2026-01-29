import { ReactNode, useState, useEffect, useRef } from 'react';

export type MoveHistory = {
  white: string;
  black: string;
};

type GameLayoutProps = {
  children: ReactNode;
  topPlayerName: string;
  bottomPlayerName: string;
  topPlayerClock: string;
  bottomPlayerClock: string;
  turnIndicator: string;
  evalPercentage: number;
  whiteCaptures: string[];
  blackCaptures: string[];
  moveHistory: MoveHistory[];
  onDraw?: () => void;
  onResign?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  prevLabel?: string;
  nextLabel?: string;
  hideSidebar?: boolean;
  hideChat?: boolean;
  
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
  bottomPlayerName,
  topPlayerClock,
  bottomPlayerClock,
  turnIndicator,
  evalPercentage,
  whiteCaptures,
  blackCaptures,
  moveHistory,
  onDraw,
  onResign,
  onPrev,
  onNext,
  prevLabel = "◀ Prev",
  nextLabel = "Next ▶",
  hideSidebar,
  hideChat = false,
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
    <div className="layout-wrapper" style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-start', gap: '20px', width: '100%', padding: '20px', boxSizing: 'border-box', height: '100%' }}>
      
      <div className="main-game-area" style={{ flex: 1, maxWidth: '75vh' }}>
        <div className="player-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
            <div className="player-avatar" style={{ backgroundColor: '#7b4f3b', backgroundImage: "url('https://images.chesscomfiles.com/uploads/v1/user/103289066.b68ed511.50x50o.c6d040715cf4.png')" }}></div>
            <div className="player-name">{topPlayerName}</div>
          </div>
          <div className="player-clock clock-dark">{topPlayerClock}</div>
        </div>

        <div style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', color: '#ebecd0', margin: '10px 0', padding: '10px', background: '#2b2927', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
          {turnIndicator}
        </div>

        <div className="board-row" style={{ display: 'flex', flexDirection: 'row', alignItems: 'stretch', gap: '10px' }}>
          
          <div className="eval-bar-wrapper">
            <div id="eval-fill" style={{ height: `${evalPercentage}%`, transition: 'height 0.4s ease-in-out' }}></div>
          </div>
          
          <div className="capture-panel">
            <div className="side-captures">
              {blackCaptures.map((p, i) => <img key={i} src={`https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${p.toLowerCase()}.png`} style={{ width: '35px', height: '35px', margin: '2px', opacity: 0.9, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '4px', padding: '2px' }} />)}
            </div>
          </div>

          <div className="react-board-wrapper" style={{ flex: 1, minWidth: '50vh', maxWidth: '75vh', aspectRatio: '1 / 1', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)', borderRadius: '4px', position: 'relative' }}>
            {children}
          </div>

          <div className="capture-panel">
            <div className="side-captures">
              {whiteCaptures.map((p, i) => <img key={i} src={`https://images.chesscomfiles.com/chess-themes/pieces/neo/150/${p.toLowerCase()}.png`} style={{ width: '35px', height: '35px', margin: '2px', opacity: 0.9, backgroundColor: 'rgba(255, 255, 255, 0.3)', borderRadius: '4px', padding: '2px' }} />)}
            </div>
          </div>
          
        </div>

        <div className="player-info">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
            <div className="player-avatar" style={{ backgroundColor: '#aaa', backgroundImage: "url('https://images.chesscomfiles.com/uploads/v1/user/103289066.b68ed511.50x50o.c6d040715cf4.png')" }}></div>
            <div className="player-name">{bottomPlayerName}</div>
          </div>
          <div className="player-clock">{bottomPlayerClock}</div>
        </div>
      </div>

      {!hideSidebar && (
        <div className="right-sidebar" style={{ display: 'flex', flexDirection: 'column' }}>
          
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid #403d39' }}>
            <button 
              onClick={() => setActiveTab('moves')}
              style={{ flex: 1, padding: '15px', background: activeTab === 'moves' ? '#403d39' : 'transparent', color: activeTab === 'moves' ? '#fff' : '#a7a6a2', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
              Moves
            </button>
            {!hideChat && (
              <button 
                onClick={() => setActiveTab('chat')}
                style={{ flex: 1, padding: '15px', background: activeTab === 'chat' ? '#403d39' : 'transparent', color: activeTab === 'chat' ? '#fff' : '#a7a6a2', border: 'none', cursor: 'pointer', fontWeight: 'bold', position: 'relative' }}>
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
          </div>
          
          <div className="moves-container" style={{ display: activeTab === 'moves' ? 'flex' : 'none' }}>
            {moveHistory.map((m, idx) => (
              <div key={idx} className="move-row">
                <span className="move-number">{idx + 1}.</span>
                <span className="move-white" style={{ flex: 1, padding: '6px 15px', color: '#fff', cursor: 'pointer' }}>{m.white}</span>
                <span className="move-black" style={{ flex: 1, padding: '6px 15px', color: '#fff', cursor: 'pointer' }}>{m.black}</span>
              </div>
            ))}
          </div>

          {/* Chat Container */}
          {!hideChat && (
            <div style={{ display: activeTab === 'chat' ? 'flex' : 'none', flexDirection: 'column', flex: 1, height: '100%', overflow: 'hidden' }}>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {chatMessages.map((msg, i) => (
                <div key={i} style={{ alignSelf: msg.sender === bottomPlayerName ? 'flex-end' : 'flex-start', background: msg.sender === bottomPlayerName ? '#739552' : '#403d39', padding: '8px 12px', borderRadius: '8px', maxWidth: '85%', wordBreak: 'break-word' }}>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginBottom: '2px' }}>{msg.sender}</div>
                  <div>{msg.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: '10px', background: '#262522', borderTop: '1px solid #403d39', display: 'flex', gap: '5px' }}>
              <input 
                type="text" 
                value={chatInput} 
                onChange={(e) => setChatInput && setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSendChat && onSendChat()}
                placeholder="Message..."
                style={{ flex: 1, padding: '10px', borderRadius: '4px', border: '1px solid #5c5852', background: '#302e2b', color: 'white' }}
              />
              <button 
                onClick={onSendChat}
                style={{ background: '#739552', border: 'none', color: 'white', padding: '0 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
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
