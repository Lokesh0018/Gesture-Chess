import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Globe, Lock, Crown } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSocketStore } from '../store/useSocketStore';
import { useAuthStore } from '../store/useAuthStore';
import './LocalGameSetup.css';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

const TIME_CONTROLS = [
  { id: 'bullet', label: '1+0', time: '1|0', sub: 'Bullet' },
  { id: 'blitz-3', label: '3+0', time: '3|0', sub: 'Blitz' },
  { id: 'blitz-5', label: '5+0', time: '5|0', sub: 'Blitz' },
  { id: 'rapid', label: '10+0', time: '10|0', sub: 'Rapid' },
];

export const TournamentSetup = () => {
  const navigate = useNavigate();
  const { socket, connect } = useSocketStore();
  const { token } = useAuthStore();
  
  const [timeControl, setTimeControl] = useState('5|0');
  const [maxPlayers, setMaxPlayers] = useState<number>(16);
  const [isPrivate, setIsPrivate] = useState<boolean>(true);
  const [joinCode, setJoinCode] = useState('');

  useEffect(() => {
    if (!token) return;
    connect();
    
    if (!socket) return;
    
    const handleRoomCreated = (data: { roomId: string }) => {
      toast.success('Room created!');
      navigate('/room', { state: { roomId: data.roomId, isHost: true } });
    };

    const handleRoomJoined = (data: { roomId: string, players: any[] }) => {
      toast.success('Joined Room!');
      navigate('/room', { state: { roomId: data.roomId, players: data.players, isHost: false } });
    };

    const handleError = (msg: string) => {
      toast.error(msg);
    };

    socket.on('room_created', handleRoomCreated);
    socket.on('room_joined', handleRoomJoined);
    socket.on('error', handleError);
    
    return () => {
      socket.off('room_created', handleRoomCreated);
      socket.off('room_joined', handleRoomJoined);
      socket.off('error', handleError);
    };
  }, [token, socket, navigate, connect]);

  const createRoom = () => {
    if (!socket) return;
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.emit('create_tournament', { roomId: newRoomId, timeControl, maxPlayers, isPrivate });
  };
  
  const joinRoom = () => {
    if (!socket || !joinCode) return;
    socket.emit('join_tournament', { roomId: joinCode.toUpperCase() });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="setup-container"
      style={{ maxWidth: '1000px', margin: '0 auto', paddingTop: '20px', paddingBottom: '0' }}
    >
      <motion.div
        key="setup"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        style={{ width: '100%' }}
      >
        <h1 className="setup-title" style={{ textAlign: 'center' }}>Rooms</h1>
        <p className="setup-subtitle" style={{ textAlign: 'center', marginBottom: '20px' }}>
          Create a customized room and invite friends to play a series of matches, or jump into an existing one.
        </p>
        
        <div className="setup-grid">
          {/* Create Room */}
          <div className="setup-card">
            <div className="setup-card-title">
              <Crown size={20} color="#FBBF24" />
              Host a Room
            </div>
            
            <motion.div className="setup-input-group" style={{ gap: '12px', marginTop: '8px' }} variants={containerVariants} initial="hidden" animate="show">
              {/* Time Control */}
              <motion.div variants={itemVariants}>
                <label className="setup-input-label" style={{ marginBottom: '8px', display: 'block' }}>Time Control</label>
                <div className="setup-time-grid">
                  {TIME_CONTROLS.map(tc => (
                    <button
                      key={tc.id}
                      className={`setup-time-btn ${timeControl === tc.time ? 'active' : ''}`}
                      onClick={() => setTimeControl(tc.time)}
                    >
                      <span className="setup-time-label">{tc.label}</span>
                      <span className="setup-time-sub">{tc.sub}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Max Players */}
              <motion.div variants={itemVariants}>
                <label className="setup-input-label" style={{ marginBottom: '8px', display: 'block' }}>Capacity</label>
                <div className="setup-time-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                  {[2, 4, 8, 16].map((num) => (
                    <button
                      key={num}
                      className={`setup-time-btn ${maxPlayers === num ? 'active' : ''}`}
                      onClick={() => setMaxPlayers(num)}
                    >
                      <span className="setup-time-label" style={{ fontSize: '18px' }}>{num}</span>
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Privacy Toggle */}
              <motion.div variants={itemVariants}>
                <label className="setup-input-label" style={{ marginBottom: '8px', display: 'block' }}>Visibility</label>
                <div className="setup-time-grid">
                  <button
                    className={`setup-time-btn ${!isPrivate ? 'active' : ''}`}
                    onClick={() => setIsPrivate(false)}
                  >
                    <Globe size={18} style={{ marginBottom: '4px' }} />
                    <span className="setup-time-label">Public</span>
                  </button>
                  <button
                    className={`setup-time-btn ${isPrivate ? 'active' : ''}`}
                    onClick={() => setIsPrivate(true)}
                    style={isPrivate ? { background: '#FBBF24', borderColor: '#FBBF24', color: '#000' } : {}}
                  >
                    <Lock size={18} style={{ marginBottom: '4px' }} />
                    <span className="setup-time-label">Private</span>
                  </button>
                </div>
              </motion.div>
            </motion.div>
            
            <div style={{ marginTop: 'auto' }}>
              <motion.button 
                className="setup-start-btn"
                onClick={createRoom}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.3)', color: '#FCD34D', border: '1px solid' }}
              >
                Create Room
              </motion.button>
            </div>
          </div>
          
          {/* Join Room */}
          <div className="setup-card" style={{ height: 'fit-content' }}>
            <div className="setup-card-title">
              <Shield size={20} color="#10B981" />
              Join a Room
            </div>
            
            <motion.div className="setup-input-group" style={{ gap: '12px', marginTop: '8px', marginBottom: '24px' }} variants={containerVariants} initial="hidden" animate="show">
              <motion.div variants={itemVariants}>
                <label className="setup-input-label" style={{ marginBottom: '8px', display: 'block' }}>Room Code</label>
                <input 
                  type="text" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="e.g. A1B2C3"
                  className="setup-input"
                  style={{ width: '100%', textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontFamily: 'monospace' }}
                  maxLength={6}
                />
              </motion.div>
            </motion.div>
            
            <motion.button 
              className="setup-start-btn"
              onClick={joinRoom}
              whileHover={{ scale: joinCode.length === 6 ? 1.02 : 1 }}
              whileTap={{ scale: joinCode.length === 6 ? 0.98 : 1 }}
              style={{ 
                background: joinCode.length === 6 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                borderColor: joinCode.length === 6 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)', 
                color: joinCode.length === 6 ? '#34D399' : '#94A3B8',
                border: '1px solid',
                cursor: joinCode.length < 6 ? 'not-allowed' : 'pointer'
              }}
              disabled={joinCode.length < 6}
            >
              Enter Room
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
