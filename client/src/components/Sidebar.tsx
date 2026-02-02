import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Swords, Users, Trophy, Settings } from 'lucide-react';
import { CameraPanel } from './CameraPanel';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Local Play', path: '/local', icon: Users },
  { name: 'Online Match', path: '/online', icon: Swords },
  { name: 'Leaderboard', path: '/leaderboard', icon: Trophy },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 border-r border-gray-800 bg-gray-900/50 backdrop-blur-md hidden md:flex flex-col h-[calc(100vh-4rem)] p-4">
      <div className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                  ? 'bg-primary-600/10 text-primary-500 border border-primary-500/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="pt-4 border-t border-gray-800">
        {/* <CameraPanel /> Disabled for STEP 10 */}
      </div>
    </aside>
  );
};
