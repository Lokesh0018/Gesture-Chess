import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';
import { Trophy, Users, Play, Eye, Swords } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSocketStore } from '../store/useSocketStore';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import { useSettingsStore } from '../store/useSettingsStore';

export const TournamentLobby = () => {
  const { user, token } = useAuthStore();
  const { socket, connect } = useSocketStore();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { roomId: initialRoomId, players: initialPlayers, isHost: initialIsHost } = location.state || {};
  
  const [roomId] = useState(initialRoomId || '');
  const [isHost] = useState(initialIsHost || false);
  const [players, setPlayers] = useState<{ id: string, username: string }[]>(initialPlayers || []);
  
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
    if (!roomId) {
      navigate('/room-setup');
      return;
    }

    if (!token) return;
    if (!socket?.connected) connect();
    
    if (!socket) return;
    
    socket.on('players_update', (data) => {
      setPlayers(data.players);
    });
    
    socket.on('tournament_started', () => {
      toast.success('Room started!');
      setTournamentStatus('in_progress');
    });

    socket.on('round_started', (data) => {
      setTournamentStatus('in_progress');
      setRound(data.round);
      setMatches(data.matches);
      
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

    socket.on('move_made', (data) => {
      try {
        const gameCopy = new Chess(data.fen);
        setGame(gameCopy);
      } catch (e) {}
    });

    socket.on('sync_spectator', (data) => {
      setGame(new Chess(data.fen));
    });

    socket.on('match_finished', (data) => {
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

    socket.on('tournament_finished', (data) => {
      setTournamentStatus('finished');
      setWinner({ id: data.winnerId, name: data.winnerName });
    });
    
    socket.on('error', (msg) => {
      toast.error(msg);
    });
    
    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('players_update');
      socket.off('tournament_started');
      socket.off('round_started');
      socket.off('move_made');
      socket.off('sync_spectator');
      socket.off('match_finished');
      socket.off('tournament_finished');
      socket.off('error');
    };
  }, [token, socket]);

  const startTournament = () => {
    if (!socket || !roomId) return;
    socket.emit('start_tournament', { roomId });
  };
  


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
              id="TournamentBoard"
              position={game.fen()}
              onPieceDrop={handlePieceDrop as any}
              boardOrientation={isSpectating ? 'white' : (activeMatchColor === 'w' ? 'white' : 'black')}
              customDarkSquareStyle={{ backgroundColor: boardTheme === 'classic' ? '#779556' : '#2C3E50' }}
              customLightSquareStyle={{ backgroundColor: boardTheme === 'classic' ? '#EBECD0' : '#ECF0F1' }}
              {...{
                arePiecesDraggable: !isSpectating && game.turn() === activeMatchColor
              } as any}
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
          <h2 className="text-3xl font-bold text-white mb-2">Room Lobby</h2>
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
            <Play fill="currentColor" /> Start Room
          </button>
        )}
      </div>

      {tournamentStatus === 'finished' && winner && (
        <div className="bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border-2 border-yellow-500 rounded-2xl p-8 mb-8 text-center animate-in zoom-in duration-500 shadow-[0_0_50px_rgba(234,179,8,0.3)]">
          <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-4xl font-black text-white mb-2">Room Complete!</h2>
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
