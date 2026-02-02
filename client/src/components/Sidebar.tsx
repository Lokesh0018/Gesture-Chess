import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Swords, Users, Trophy, Settings } from 'lucide-react';

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
    <aside className="w-[260px] border-r border-[rgba(255,255,255,0.06)] bg-[#111827] hidden md:flex flex-col h-full py-6 px-4 shrink-0">
      <div className="space-y-2 flex-1">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`group flex items-center space-x-3 px-4 py-3 rounded-[12px] transition-all duration-150 ${
                isActive
                  ? 'bg-[rgba(59,130,246,0.1)] text-[#3B82F6] shadow-[inset_4px_0_0_0_#3B82F6]'
                  : 'text-[#94A3B8] hover:bg-[rgba(255,255,255,0.03)] hover:text-white'
              }`}
            >
              <Icon className="w-[18px] h-[18px]" />
              <span className="text-[15px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto pt-4 border-t border-[rgba(255,255,255,0.06)] text-[13px] text-[#94A3B8] text-center">
        GestureChess v1.0.0<br/>© 2024 All rights reserved
      </div>
    </aside>
  );
};
