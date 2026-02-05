import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { Trophy, Clock, Users, Play, Eye, Swords } from 'lucide-react';
import toast from 'react-hot-toast';
import io, { Socket } from 'socket.io-client';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useSettingsStore } from '../store/useSettingsStore';

export const TournamentLobby = () => {
  const { user, token } = useAuthStore();
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const [inRoom, setInRoom] = useState(false);
  const [roomId, setRoomId] = useState('');
  const [joinCode, setJoinCode] = useState('');
  
  // Room state
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<{ id: string, username: string }[]>([]);
  const [timeControl, setTimeControl] = useState('5|0');
  
  // Tournament State
  const [tournamentStatus, setTournamentStatus] = useState<'waiting' | 'in_progress' | 'finished'>('waiting');
  const [round, setRound] = useState(0);
  const [matches, setMatches] = useState<any[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [activeMatchColor, setActiveMatchColor] = useState<'w' | 'b' | null>(null);
  const [isSpectating, setIsSpectating] = useState(false);
  
  // Game State
  const [game, setGame] = useState(new Chess());
  const { boardTheme } = useSettingsStore();
  const [winner, setWinner] = useState<{ id: string, name: string } | null>(null);
  
  useEffect(() => {
    if (!token) return;
    
    const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      auth: { token }
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to socket', newSocket.id);
    });
    
    newSocket.on('room_created', (data) => {
      setRoomId(data.roomId);
      setInRoom(true);
      setIsHost(true);
      toast.success('Tournament Room created!');
    });
    
    newSocket.on('room_joined', (data) => {
      setRoomId(data.roomId);
      setInRoom(true);
      setPlayers(data.players);
      toast.success('Joined Tournament Room!');
    });
    
    newSocket.on('players_update', (data) => {
      setPlayers(data.players);
    });
    
    newSocket.on('tournament_started', () => {
      toast.success('Tournament started!');
    });

    newSocket.on('round_started', (data) => {
      setTournamentStatus('in_progress');
      setRound(data.round);
      setMatches(data.matches);
      
      // Check if we are playing
      const myMatch = data.matches.find((m: any) => m.white.id === user?.id || m.black.id === user?.id);
      if (myMatch) {
        setActiveMatchId(myMatch.matchId);
        setActiveMatchColor(myMatch.white.id === user?.id ? 'w' : 'b');
        setIsSpectating(false);
        setGame(new Chess());
        toast('Your match is starting!', { icon: '⚔️' });
      } else {
        setActiveMatchId(null);
        setActiveMatchColor(null);
        if (data.spectator === user?.id) {
          toast.success('You have a BYE this round. You can spectate!');
        }
      }
    });

    newSocket.on('move_made', (data) => {
      try {
        const gameCopy = new Chess(data.fen);
        setGame(gameCopy);
      } catch (e) {}
    });

    newSocket.on('sync_spectator', (data) => {
      setGame(new Chess(data.fen));
    });

    newSocket.on('match_finished', (data) => {
      if (activeMatchId) {
        toast(data.winnerId === user?.id ? 'You won!' : 'You lost!', {
          icon: data.winnerId === user?.id ? '🏆' : '💀'
        });
        setTimeout(() => {
          setActiveMatchId(null);
          setGame(new Chess());
        }, 3000);
      }
    });

    newSocket.on('tournament_finished', (data) => {
      setTournamentStatus('finished');
      setWinner({ id: data.winnerId, name: data.winnerName });
    });
    
    newSocket.on('error', (msg) => {
      toast.error(msg);
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [token]);
  
  const createRoom = () => {
    if (!socket) return;
    const newRoomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    socket.emit('create_tournament', { roomId: newRoomId, timeControl });
  };
  
  const joinRoom = () => {
    if (!socket || !joinCode) return;
    socket.emit('join_tournament', { roomId: joinCode.toUpperCase() });
  };
  
  const startTournament = () => {
    if (!socket || !roomId) return;
    socket.emit('start_tournament', { roomId });
  };

  if (!inRoom) {
    return (
      <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">Tournaments</h2>
          <p className="text-gray-400 text-lg">Create a room and invite up to 16 players to a knockout tournament.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Create Room */}
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="text-yellow-500" /> Host a Tournament
            </h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Time Control</label>
                <select 
                  value={timeControl}
                  onChange={(e) => setTimeControl(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-primary-500 outline-none"
                >
                  <option value="1|0">1 min (Bullet)</option>
                  <option value="3|0">3 min (Blitz)</option>
                  <option value="5|0">5 min (Blitz)</option>
                  <option value="10|0">10 min (Rapid)</option>
                </select>
              </div>
            </div>
            
            <button 
              onClick={createRoom}
              className="w-full bg-primary-600 hover:bg-primary-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-[0_0_15px_rgba(59,130,246,0.3)]"
            >
              Create Room
            </button>
          </div>
          
          {/* Join Room */}
          <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 shadow-xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Users className="text-green-500" /> Join a Tournament
            </h3>
            
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Room Code</label>
                <input 
                  type="text" 
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  placeholder="e.g. A1B2C3"
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 outline-none uppercase font-mono"
                />
              </div>
            </div>
            
            <button 
              onClick={joinRoom}
              disabled={!joinCode}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-6 rounded-xl transition shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50 disabled:shadow-none"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handlePieceDrop = (sourceSquare: string, targetSquare: string, piece: string) => {
    if (isSpectating || !activeMatchId || game.turn() !== activeMatchColor) return false;
    
    try {
      const gameCopy = new Chess(game.fen());
      const move = gameCopy.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: piece[1].toLowerCase() ?? 'q'
      });
      
      if (move) {
        setGame(gameCopy);
        socket?.emit('make_move', { matchId: activeMatchId, move, fen: gameCopy.fen() });
        
        if (gameCopy.isGameOver()) {
          socket?.emit('match_end', { matchId: activeMatchId, winnerId: gameCopy.isCheckmate() ? user?.id : null });
        }
        return true;
      }
    } catch {
      return false;
    }
    return false;
  };

  const spectateMatch = (matchId: string) => {
    setActiveMatchId(matchId);
    setIsSpectating(true);
    socket?.emit('join_spectator', { matchId });
  };

  if (activeMatchId) {
    const currentMatch = matches.find(m => m.matchId === activeMatchId);
    return (
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-start animate-in fade-in duration-500">
        <div className="w-full max-w-[600px] flex-1">
          <div className="bg-gray-800 p-4 rounded-t-xl flex justify-between items-center mb-4">
            <span className="font-bold text-white text-lg flex items-center gap-2"><Swords className="text-primary-500"/> Round {round}</span>
            {isSpectating && <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm font-bold animate-pulse flex items-center gap-1"><Eye className="w-4 h-4"/> SPECTATING</span>}
          </div>
          
          <div className="bg-gray-900 rounded-xl overflow-hidden shadow-2xl ring-4 ring-gray-800 relative aspect-square">
            <Chessboard 
              options={{
                id: "TournamentBoard",
                position: game.fen(),
                onPieceDrop: handlePieceDrop as any,
                boardOrientation: isSpectating ? 'white' : (activeMatchColor === 'w' ? 'white' : 'black'),
                arePiecesDraggable: !isSpectating && game.turn() === activeMatchColor,
                darkSquareStyle: { backgroundColor: boardTheme === 'classic' ? '#779556' : '#2C3E50' },
                lightSquareStyle: { backgroundColor: boardTheme === 'classic' ? '#EBECD0' : '#ECF0F1' }
              }}
            />
          </div>
        </div>
        
        <div className="w-full md:w-80 space-y-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-xl">
             <h3 className="text-xl font-bold text-white mb-4">Players</h3>
             {currentMatch && (
               <div className="space-y-4">
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-gray-200 border border-gray-400"></div>
                   <span className="text-white font-bold">{currentMatch.white.username}</span>
                 </div>
                 <div className="text-center font-bold text-gray-500 text-sm">VS</div>
                 <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded bg-black border border-gray-600"></div>
                   <span className="text-white font-bold">{currentMatch.black.username}</span>
                 </div>
               </div>
             )}
          </div>
          
          {isSpectating && (
            <button onClick={() => { setActiveMatchId(null); setIsSpectating(false); }} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition">
              Back to Lobby
            </button>
          )}
        </div>
      </div>
    );
  }

  // Inside Room View (Lobby / Waiting / Finished)
  return (
    <div className="max-w-5xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Tournament Lobby</h2>
          <p className="text-gray-400 flex items-center gap-2">
            Room Code: <span className="font-mono text-white bg-gray-800 px-2 py-1 rounded text-lg tracking-wider">{roomId}</span>
          </p>
        </div>
        
        {tournamentStatus === 'waiting' && isHost && (
          <button 
            onClick={startTournament}
            disabled={players.length < 2}
            className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-8 rounded-xl transition flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.4)] disabled:opacity-50"
          >
            <Play fill="currentColor" /> Start Tournament
          </button>
        )}
      </div>

      {tournamentStatus === 'finished' && winner && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500 rounded-2xl p-8 mb-8 text-center animate-in zoom-in duration-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-4xl font-black text-white mb-2">Tournament Complete!</h2>
          <p className="text-2xl text-yellow-400 font-bold">{winner.name} is the Champion!</p>
        </div>
      )}
      
      {tournamentStatus === 'in_progress' && (
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 md:p-8 mb-8 shadow-xl">
           <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             <Swords className="text-primary-400" /> Round {round} Matches
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
             {matches.map(m => (
               <div key={m.matchId} className="bg-gray-900 border border-gray-700 rounded-xl p-4 flex flex-col justify-between hover:border-primary-500/50 transition">
                 <div className="flex justify-between items-center mb-4">
                   <span className="text-white font-bold truncate max-w-[100px]">{m.white.username}</span>
                   <span className="text-gray-500 font-bold text-sm">VS</span>
                   <span className="text-white font-bold truncate max-w-[100px]">{m.black.username}</span>
                 </div>
                 <button onClick={() => spectateMatch(m.matchId)} className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 font-bold py-2 rounded-lg flex justify-center items-center gap-2 transition">
                   <Eye className="w-4 h-4" /> Spectate
                 </button>
               </div>
             ))}
           </div>
        </div>
      )}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="text-primary-400" /> Players ({players.length}/16)
          </h3>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <Clock className="w-4 h-4" /> Time Control: {timeControl}
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {players.map((p, i) => (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-gray-900 border border-gray-700 p-4 rounded-xl flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-primary-900 text-primary-400 font-bold rounded-full flex items-center justify-center">
                {p.username.charAt(0).toUpperCase()}
              </div>
              <span className="text-white font-medium truncate">{p.username}</span>
            </motion.div>
          ))}
          
          {/* Empty slots placeholders */}
          {Array.from({ length: Math.max(0, 16 - players.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="bg-gray-900/50 border border-gray-800 border-dashed p-4 rounded-xl flex items-center justify-center">
              <span className="text-gray-600 font-medium">Waiting...</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
