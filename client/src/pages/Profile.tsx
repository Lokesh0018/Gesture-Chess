import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { Target, Trophy, Clock, XCircle, MinusCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

export const Profile = () => {
  const { user: authUser, token } = useAuthStore();
  const [profileData, setProfileData] = useState<any>(null);
  const [recentGames, setRecentGames] = useState<any[]>([]);
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok) {
          setProfileData(data.user);
          setUsername(data.user.username);
          setRecentGames(data.recentGames || []);
        } else {
          toast.error(data.error || 'Failed to load profile');
        }
      } catch (err) {
        toast.error('Network error loading profile');
      } finally {
        setIsLoading(false);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  if (!authUser || isLoading) return <div className="text-white text-center mt-20">Loading profile...</div>;
  if (!profileData) return <div className="text-white text-center mt-20">Failed to load profile data.</div>;

  const handleUpdate = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ username })
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Profile updated successfully!');
        setProfileData(data.user);
      } else {
        toast.error(data.error || 'Update failed');
      }
    } catch (err) {
      toast.error('Network error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h2 className="text-3xl font-bold text-white mb-6">Your Profile</h2>

      <div className="bg-gray-800 p-8 rounded-2xl border border-gray-700 flex flex-col md:flex-row gap-8 items-center md:items-start">
        <div className="w-32 h-32 bg-gray-700 rounded-full flex items-center justify-center text-4xl text-gray-400 font-bold border-4 border-primary-500 shadow-lg">
          {profileData.username.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1 space-y-6 w-full">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg p-3 text-white outline-none focus:border-primary-500" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
            <input 
              type="text" 
              disabled
              value={profileData.email}
              className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-lg p-3 text-gray-500 cursor-not-allowed" 
            />
          </div>
          <button 
            onClick={handleUpdate}
            disabled={isSaving || username === profileData.username}
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-6 rounded-lg transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col items-center text-center">
          <div className="p-3 bg-yellow-500/10 text-yellow-500 rounded-xl mb-3">
            <Target className="w-6 h-6" />
          </div>
          <p className="text-gray-400 text-sm font-semibold">Rating</p>
          <p className="text-white font-bold text-2xl">{profileData.rating}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col items-center text-center">
          <div className="p-3 bg-green-500/10 text-green-500 rounded-xl mb-3">
            <Trophy className="w-6 h-6" />
          </div>
          <p className="text-gray-400 text-sm font-semibold">Wins</p>
          <p className="text-white font-bold text-2xl">{profileData.wins}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col items-center text-center">
          <div className="p-3 bg-red-500/10 text-red-500 rounded-xl mb-3">
            <XCircle className="w-6 h-6" />
          </div>
          <p className="text-gray-400 text-sm font-semibold">Losses</p>
          <p className="text-white font-bold text-2xl">{profileData.losses}</p>
        </div>
        
        <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 flex flex-col items-center text-center">
          <div className="p-3 bg-gray-500/10 text-gray-400 rounded-xl mb-3">
            <MinusCircle className="w-6 h-6" />
          </div>
          <p className="text-gray-400 text-sm font-semibold">Draws</p>
          <p className="text-white font-bold text-2xl">{profileData.draws}</p>
        </div>
      </div>

      {/* Match History */}
      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden">
        <div className="p-6 border-b border-gray-700 bg-gray-800/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary-400" />
            Recent Matches
          </h3>
        </div>
        
        {recentGames.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            No matches played yet. Go play a game!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/50 text-gray-400 text-sm">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Result</th>
                  <th className="p-4 font-semibold">Moves</th>
                  <th className="p-4 font-semibold">Analysis</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {recentGames.map((game, i) => (
                  <tr key={game.id || i} className="hover:bg-gray-700/30 transition">
                    <td className="p-4 text-gray-300">
                      {format(new Date(game.createdAt), 'MMM d, yyyy h:mm a')}
                    </td>
                    <td className="p-4">
                      {game.winnerId === profileData.id ? (
                        <span className="inline-flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded-md text-sm font-medium">
                          <CheckCircle2 className="w-4 h-4" /> Won
                        </span>
                      ) : game.winnerId ? (
                        <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded-md text-sm font-medium">
                          <XCircle className="w-4 h-4" /> Lost
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-gray-400 bg-gray-400/10 px-2 py-1 rounded-md text-sm font-medium">
                          <MinusCircle className="w-4 h-4" /> Draw
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400">
                      {/* Calculate roughly how many moves from PGN */}
                      {game.pgn ? Math.ceil(game.pgn.split(' ').length / 3) : '?'} moves
                    </td>
                    <td className="p-4">
                      <button 
                        onClick={() => {
                          // Could copy to clipboard, or route to analysis page
                          navigator.clipboard.writeText(game.pgn);
                          toast.success('PGN copied to clipboard');
                        }}
                        className="text-primary-400 hover:text-primary-300 text-sm font-medium"
                      >
                        Copy PGN
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
