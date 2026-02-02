import React from 'react';
import { Swords, Users, Trophy, Hand } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Home = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2 text-white">Welcome back, Grandmaster</h1>
          <p className="text-gray-400">Ready to play some gesture-controlled chess?</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link to="/local" className="group p-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-primary-500/50 rounded-2xl transition-all cursor-pointer">
          <div className="w-12 h-12 bg-primary-500/10 text-primary-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Local Play</h3>
          <p className="text-gray-400 text-sm">Play against a friend on the same device using gestures or mouse.</p>
        </Link>
        
        <Link to="/online" className="group p-6 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 hover:border-success-500/50 rounded-2xl transition-all cursor-pointer">
          <div className="w-12 h-12 bg-success-500/10 text-success-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Swords className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Online Match</h3>
          <p className="text-gray-400 text-sm">Find an opponent online and climb the global leaderboard.</p>
        </Link>
        
        <div className="group p-6 bg-gray-800/50 border border-gray-700 rounded-2xl">
          <div className="w-12 h-12 bg-yellow-500/10 text-yellow-500 rounded-xl flex items-center justify-center mb-4">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Your Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Rating</span>
              <span className="font-bold text-white">1200</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Win Rate</span>
              <span className="font-bold text-white">52%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
