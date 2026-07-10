import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Timer, Play, Loader2 } from 'lucide-react';
import { useSocketStore } from '../store/useSocketStore';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import './LocalGameSetup.css';

const TIME_CONTROLS = [
  { id: 'bullet', label: '1+0', time: 60, inc: 0, sub: 'Bullet' },
  { id: 'blitz-3', label: '3+2', time: 180, inc: 2, sub: 'Blitz' },
  { id: 'blitz-5', label: '5+3', time: 300, inc: 3, sub: 'Blitz' },
  { id: 'rapid', label: '10+5', time: 600, inc: 5, sub: 'Rapid' },
];

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

export const OnlineGameSetup = () => {
  const navigate = useNavigate();
  const { socket, connect } = useSocketStore();
  const { token } = useAuthStore();
  const [selectedTimeId, setSelectedTimeId] = useState('rapid');
  const [isSearching, setIsSearching] = useState(false);
  const [timeControl, setTimeControl] = useState('10|5');

  useEffect(() => {
    if (!token) return;
    connect();
    
    if (!socket) return;

    const handleMatchFound = (data: { roomId: string, color: 'w' | 'b', opponent: string }) => {
      setIsSearching(false);
      toast.success(`Match found against ${data.opponent}!`);
      navigate('/online-game', { state: data });
    };

    socket.on('match_found', handleMatchFound);

    return () => {
      socket.off('match_found', handleMatchFound);
    };
  }, [socket, token, navigate]);

  const handleTimeSelect = (id: string, time: number, inc: number) => {
    if (isSearching) return;
    setSelectedTimeId(id);
    setTimeControl(`${time/60}|${inc}`);
  };

  const handlePlay = () => {
    if (!socket) {
      toast.error('Not connected to server');
      return;
    }

    if (isSearching) {
      socket.emit('cancel_match');
      setIsSearching(false);
      toast('Matchmaking cancelled.', { icon: '🛑' });
    } else {
      socket.emit('find_match', { timeControl });
      setIsSearching(true);
      toast('Searching for opponent...', { icon: '🔍' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="setup-container"
      style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '40px' }}
    >
      <motion.div
        key="setup"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        style={{ width: '100%' }}
      >
        <h1 className="setup-title" style={{ textAlign: 'center' }}>Play Online</h1>
        <p className="setup-subtitle" style={{ textAlign: 'center', marginBottom: '40px' }}>Join the matchmaking queue and face players globally.</p>

        <div className="setup-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '500px', margin: '0 auto' }}>
          {/* Time Control Card */}
          <div className="setup-card">
            <div className="setup-card-title">
              <Timer size={20} color="#FBBF24" />
              Time Control
            </div>

            <motion.div className="setup-time-grid" variants={containerVariants} initial="hidden" animate="show">
              {TIME_CONTROLS.map(tc => (
                <motion.button
                  key={tc.id}
                  variants={itemVariants}
                  className={`setup-time-btn ${selectedTimeId === tc.id ? 'active' : ''}`}
                  onClick={() => handleTimeSelect(tc.id, tc.time, tc.inc)}
                  disabled={isSearching}
                  style={{ opacity: isSearching && selectedTimeId !== tc.id ? 0.5 : 1 }}
                >
                  <span className="setup-time-label">{tc.label}</span>
                  <span className="setup-time-sub">{tc.sub}</span>
                </motion.button>
              ))}
            </motion.div>
          </div>
        </div>

        <div style={{ maxWidth: '500px', margin: '32px auto 0' }}>
          <motion.button
            className="setup-start-btn"
            onClick={handlePlay}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            animate={isSearching ? {
              boxShadow: ['0 0 0px rgba(74, 222, 128, 0)', '0 0 20px rgba(74, 222, 128, 0.6)', '0 0 0px rgba(74, 222, 128, 0)']
            } : {
              boxShadow: ['0 0 0px rgba(37,99,235,0)', '0 0 20px rgba(37,99,235,0.4)', '0 0 0px rgba(37,99,235,0)']
            }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ 
              background: isSearching ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
              borderColor: isSearching ? 'rgba(239, 68, 68, 0.3)' : 'rgba(59, 130, 246, 0.3)',
              color: isSearching ? '#F87171' : '#60A5FA'
            }}
          >
            {isSearching ? (
              <>
                <Loader2 className="animate-spin" size={24} />
                Cancel Search
              </>
            ) : (
              <>
                <Play fill="currentColor" size={24} />
                Play
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};
