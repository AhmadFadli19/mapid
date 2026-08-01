import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Train, Search, Bell, MapPin, ChevronDown, Menu, X,
  Map, Navigation, Building2, TrainTrack, MessageSquarePlus, Compass
} from 'lucide-react';

export default function WebGisHeader({ user, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const navItems = [
    { to: '/webgis-dashboard', label: 'WebGIS Dashboard', icon: Map },
    { to: '/dashboard', label: 'Peta Multi-Moda', icon: Compass },
    { to: '/route-planner', label: 'Smart Route', icon: Navigation },
    { to: '/station-profile', label: 'Station Profile', icon: Building2 },
    { to: '/boarding-recommendation', label: 'Boarding Guide', icon: TrainTrack },
    { to: '/community-reports', label: 'Komunitas', icon: MessageSquarePlus },
    { to: '/mobile', label: 'Mobile View', icon: Train },
  ];

  return (
    <header className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/60 sticky top-0 z-50 shadow-2xl shadow-slate-950/50">
      <div className="max-w-screen-2xl mx-auto px-4 py-2.5">
        <div className="flex items-center gap-3">

          {/* Brand Logo */}
          <NavLink to="/webgis-dashboard" className="flex items-center gap-2.5 shrink-0 group">
            <div className="relative p-2 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all duration-300">
              <Train className="w-5 h-5 text-white" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse border border-slate-900" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black text-white tracking-tight leading-none">
                Pandu<span className="text-emerald-400">Yuk</span>
              </h1>
              <p className="text-[9px] text-slate-400 leading-none mt-0.5">WebGIS Transit Companion</p>
            </div>
          </NavLink>

          {/* Search Bar */}
          <div className={`relative flex-1 max-w-md transition-all duration-300 ${searchFocused ? 'max-w-xl' : ''}`}>
            <div className={`flex items-center gap-2 bg-slate-800/80 border rounded-xl px-3 py-2 transition-all duration-300 ${
              searchFocused ? 'border-emerald-500/60 shadow-lg shadow-emerald-500/10' : 'border-slate-700/60'
            }`}>
              <Search className={`w-3.5 h-3.5 shrink-0 transition-colors ${searchFocused ? 'text-emerald-400' : 'text-slate-500'}`} />
              <input
                type="text"
                placeholder="Cari Stasiun / Transit Companion..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="bg-transparent text-xs text-slate-200 placeholder:text-slate-500 outline-none w-full"
              />
            </div>
            {searchFocused && (
              <div className="absolute top-full mt-1.5 left-0 right-0 bg-slate-800 border border-slate-700/60 rounded-xl shadow-2xl p-2 z-50">
                {['Stasiun Manggarai', 'Stasiun Sudirman', 'Stasiun Dukuh Atas', 'Stasiun Gambir'].map((s) => (
                  <div key={s} className="flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-700/60 cursor-pointer transition">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-xs text-slate-200">{s}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nav Items (Desktop) */}
          <nav className="hidden xl:flex items-center gap-0.5 flex-1 overflow-x-auto scrollbar-none">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `px-2.5 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-2 ml-auto shrink-0">
            {/* Location Badge */}
            <div className="hidden md:flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1.5 rounded-lg">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span className="text-[10px] font-semibold text-emerald-300 whitespace-nowrap">Posisi: Stasiun Manggarai</span>
            </div>

            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">2</span>
            </button>

            {/* More nav on smaller screens */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <nav className="xl:hidden mt-2 pb-1 flex flex-wrap gap-1 border-t border-slate-700/50 pt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-1.5 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 transition-all duration-200 ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50 hover:text-slate-200'
                    }`
                  }
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
