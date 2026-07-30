import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Map, 
  Search, 
  Compass, 
  Building2, 
  TrainTrack, 
  Bell, 
  LogOut, 
  User as UserIcon,
  MessageSquarePlus,
  Navigation
} from 'lucide-react';

export default function Navbar({ user, onLogout }) {
  const navItems = [
    { to: '/dashboard', label: 'WebGIS Peta Utama', icon: Map },
    { to: '/search', label: 'MapID Search', icon: Search },
    { to: '/route-planner', label: 'Smart Route', icon: Navigation },
    { to: '/station-profile', label: 'Station Profile', icon: Building2 },
    { to: '/boarding-recommendation', label: 'Boarding Assistant', icon: TrainTrack },
    { to: '/arrival-reminder', label: 'Arrival Reminder', icon: Bell },
    { to: '/community-reports', label: 'Laporan Komunitas', icon: MessageSquarePlus },
  ];

  return (
    <header className="bg-slate-800/90 backdrop-blur border-b border-slate-700/80 sticky top-0 z-40 px-4 py-2.5 shadow-lg">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Brand & Logo */}
        <div className="flex items-center justify-between">
          <NavLink to="/dashboard" className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-600/30">
              <Compass className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
                MAPID <span className="text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-full font-semibold">Transit Intelligence</span>
              </h1>
              <p className="text-[10px] text-slate-400">WebGIS Public Transportation Companion</p>
            </div>
          </NavLink>

          {/* User Mobile Info */}
          {user && (
            <div className="md:hidden flex items-center gap-2 text-xs text-slate-300">
              <span className="font-semibold text-blue-400">{user.name}</span>
              <button onClick={onLogout} className="p-1 text-red-400 hover:text-red-300">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 whitespace-nowrap transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* User Info & Logout (Desktop) */}
        {user && (
          <div className="hidden md:flex items-center gap-3 bg-slate-900 border border-slate-700/80 px-3 py-1.5 rounded-xl shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <UserIcon className="w-3.5 h-3.5 text-blue-400" /> {user.name}
            </div>
            <button
              onClick={onLogout}
              className="p-1 text-slate-400 hover:text-red-400 transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </header>
  );
}
