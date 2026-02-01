import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { staggerChildren: 0.1, duration: 0.3, ease: 'easeOut' }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'match' | 'prefs'>('match');

  // Match settings state
  const [timing, setTiming] = useState(localStorage.getItem('match_timing') || '10');
  const [orientation, setOrientation] = useState(localStorage.getItem('match_orientation') || 'auto');
  const [color, setColor] = useState(localStorage.getItem('match_color') || 'random');

  // App preferences state
  const [soundEnabled, setSoundEnabled] = useState(localStorage.getItem('chess_sound_enabled') !== 'false');
  const [volume, setVolume] = useState(parseFloat(localStorage.getItem('chess_volume') || '1.0'));
  const [vfxEnabled, setVfxEnabled] = useState(localStorage.getItem('chess_vfx_enabled') !== 'false');
  const [drag3d, setDrag3d] = useState(localStorage.getItem('chess_3d_drag') !== 'false');
  const [playerAvatar, setPlayerAvatar] = useState(localStorage.getItem('chess_player_avatar') || '/asserts/user.png');

  const themes = [
    { id: 'midnight', name: 'Midnight Glass', color: '#0f172a' },
    { id: 'wood', name: 'Tournament Wood', color: '#3e2723' },
    { id: 'chesscom', name: 'Classic Green', color: '#312e2b' },
    { id: 'cyber', name: 'Cyber Neon', color: '#050014' },
  ];

  const handleSaveMatch = () => {
    localStorage.setItem('match_timing', timing);
    localStorage.setItem('match_orientation', orientation);
    localStorage.setItem('match_color', color);
  };

  const handleSoundChange = (val: boolean) => {
    setSoundEnabled(val);
    localStorage.setItem('chess_sound_enabled', String(val));
    import('./audio-manager').then(m => m.audio.enabled = val);
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    localStorage.setItem('chess_volume', String(val));
    import('./audio-manager').then(m => m.audio.volume = val);
  };

  const handleVfxChange = (val: boolean) => {
    setVfxEnabled(val);
    localStorage.setItem('chess_vfx_enabled', String(val));
    import('./vfx-manager').then(m => m.vfx.enabled = val);
  };

  const handleDrag3dChange = (val: boolean) => {
    setDrag3d(val);
    localStorage.setItem('chess_3d_drag', String(val));
  };

  const handleAvatarSelect = (avatar: string) => {
    setPlayerAvatar(avatar);
    localStorage.setItem('chess_player_avatar', avatar);
  };

  const availableAvatars = [
    '/asserts/user.png',
    '/asserts/user1.png',
    '/asserts/user2.png',
    '/asserts/user3.png',
    '/asserts/user4.png'
  ];

  return (
    <>
      <Link to="/lobby" className="back-btn" onClick={handleSaveMatch}>◀ Back</Link>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: '0 auto', width: '100%' }}>
        <motion.div className="menu-container glass-panel" style={{ padding: '0', alignItems: 'stretch', borderRadius: '16px', maxWidth: '800px', width: '90%', display: 'flex', overflow: 'hidden' }} variants={containerVariants} initial="hidden" animate="show">
          
          {/* Sidebar */}
          <div style={{ background: 'rgba(0,0,0,0.3)', width: '250px', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--glass-border)' }}>
            <div style={{ padding: '30px 20px' }}>
              <h2 style={{ margin: 0, color: 'var(--accent)' }}>Settings</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', padding: '10px' }}>
              <button 
                onClick={() => setActiveTab('match')}
                style={{ padding: '15px 20px', textAlign: 'left', background: activeTab === 'match' ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', color: activeTab === 'match' ? 'white' : 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                Match Settings
              </button>
              <button 
                onClick={() => setActiveTab('prefs')}
                style={{ padding: '15px 20px', textAlign: 'left', background: activeTab === 'prefs' ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', color: activeTab === 'prefs' ? 'white' : 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}>
                Preferences
              </button>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '40px', flex: 1 }}>
            
            {activeTab === 'match' && (
              <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div>
                  <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>Game Timing</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {['1', '3', '5', '10', '30'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setTiming(t)}
                        style={{ padding: '15px', background: timing === t ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                        {t} min
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>Board Rotation</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['auto', 'white', 'black'].map(o => (
                      <button 
                        key={o}
                        onClick={() => setOrientation(o)}
                        style={{ flex: 1, padding: '15px', background: orientation === o ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>Preferred Color (AI / Online)</h3>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {['random', 'white', 'black'].map(c => (
                      <button 
                        key={c}
                        onClick={() => setColor(c)}
                        style={{ flex: 1, padding: '15px', background: color === c ? 'var(--accent)' : 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'capitalize' }}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'prefs' && (
              <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                <div>
                  <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>Player Avatar</h3>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    {availableAvatars.map(av => (
                      <img 
                        key={av} 
                        src={av} 
                        onClick={() => handleAvatarSelect(av)}
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                        style={{
                          width: '60px', height: '60px', borderRadius: '50%', cursor: 'pointer',
                          border: playerAvatar === av ? '3px solid var(--accent)' : '2px solid transparent',
                          opacity: playerAvatar === av ? 1 : 0.6,
                          transition: 'all 0.2s', backgroundColor: '#262522'
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>Audio & VFX</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', background: 'rgba(255,255,255,0.03)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'white', fontWeight: 'bold' }}>Sound Effects</span>
                      <input type="checkbox" checked={soundEnabled} onChange={(e) => handleSoundChange(e.target.checked)} style={{ transform: 'scale(1.5)' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <span style={{ color: 'white', fontWeight: 'bold' }}>Volume</span>
                      <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => handleVolumeChange(parseFloat(e.target.value))} style={{ accentColor: 'var(--accent)', width: '100%' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'white', fontWeight: 'bold' }}>Particle Effects (VFX)</span>
                      <input type="checkbox" checked={vfxEnabled} onChange={(e) => handleVfxChange(e.target.checked)} style={{ transform: 'scale(1.5)' }} />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: 'white', fontWeight: 'bold' }}>3D Drag Physics</span>
                      <input type="checkbox" checked={drag3d} onChange={(e) => handleDrag3dChange(e.target.checked)} style={{ transform: 'scale(1.5)' }} />
                    </div>

                  </div>
                </div>

                <div>
                  <h3 style={{ margin: '0 0 15px 0', color: 'white' }}>Theme</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
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
                        <div style={{ fontWeight: 'bold', color: 'white' }}>{t.name}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}

          </div>

        </motion.div>
      </div>
    </>
  );
}
