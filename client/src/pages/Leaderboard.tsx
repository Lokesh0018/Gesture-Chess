import { useEffect, useState } from 'react';
import { Trophy } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  username: string;
  rating: number;
  wins: number;
  losses: number;
  gamesPlayed: number;
}

export const Leaderboard = () => {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/api/leaderboard')
      .then(res => res.json())
      .then(data => {
        setUsers(data.leaderboard || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-6">
        <Trophy className="w-10 h-10 text-yellow-500" />
        <h2 className="text-3xl font-bold text-white">Global Leaderboard</h2>
      </div>

      <div className="bg-gray-800 rounded-2xl border border-gray-700 overflow-hidden shadow-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-900/50 border-b border-gray-700 text-gray-400 text-sm uppercase tracking-wider">
              <th className="p-4 font-semibold">Rank</th>
              <th className="p-4 font-semibold">Player</th>
              <th className="p-4 font-semibold text-center">Rating</th>
              <th className="p-4 font-semibold text-center">Games</th>
              <th className="p-4 font-semibold text-center">Win Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">Loading...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">No players found.</td>
              </tr>
            ) : (
              users.map((user, index) => {
                const winRate = user.gamesPlayed > 0 
                  ? Math.round((user.wins / user.gamesPlayed) * 100) 
                  : 0;

                return (
                  <tr key={user.id} className="hover:bg-gray-700/50 transition-colors">
                    <td className="p-4 font-bold text-gray-400">#{index + 1}</td>
                    <td className="p-4 font-semibold text-white">{user.username}</td>
                    <td className="p-4 text-center font-bold text-primary-400">{user.rating}</td>
                    <td className="p-4 text-center text-gray-300">{user.gamesPlayed}</td>
                    <td className="p-4 text-center text-gray-300">
                      <div className="flex items-center justify-center space-x-2">
                        <span>{winRate}%</span>
                        <div className="w-16 h-2 bg-gray-900 rounded-full overflow-hidden">
                          <div className="h-full bg-success-500" style={{ width: `${winRate}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
