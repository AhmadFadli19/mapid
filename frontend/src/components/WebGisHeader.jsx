import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Train, Search, Bell, MapPin, ChevronDown, Menu, X,
  Map, Navigation, Building2, TrainTrack, MessageSquarePlus, Compass,
  User, ShieldAlert, Sparkles, CheckCircle
} from 'lucide-react';
import CommunityReportModal from './CommunityReportModal';

export const PRD_PERSONAS = [
  {
    id: 'raka',
    name: 'Raka (19th)',
    role: 'First-timer / Pengguna Baru',
    desc: 'Takut salah gerbong/jalur, butuh alur Smart Route & Boarding yang jelas.',
    presetOrigin: 142, // Stasiun Bundaran HI
    presetDest: 143,   // Stasiun Dukuh Atas BNI
  },
  {
    id: 'andi',
    name: 'Andi (24th)',
    role: 'Komuter Rutin Harian',
    desc: 'Efisiensi maksimal, posisi gerbong strategis dekat tangga/skybridge transit.',
    presetOrigin: 146, // Stasiun Manggarai
    presetDest: 143,   // Stasiun Dukuh Atas BNI
  },
  {
    id: 'nadia',
    name: 'Nadia (22th)',
    role: 'Wisatawan',
    desc: 'Tidak hafal geografi Jabodetabek, butuh Arrival Reminder & Exit Gate jelas.',
    presetOrigin: 147, // Halte Harmoni Central
    presetDest: 142,   // Stasiun Bundaran HI
  },
  {
    id: 'putri',
    name: 'Putri (35th)',
    role: 'Pengguna Aksesibilitas',
    desc: 'Memerlukan lift & guiding block yang berfungsi. Tampilkan alternatif jika rusak.',
    presetOrigin: 143, // Stasiun Dukuh Atas BNI
    presetDest: 144,   // Stasiun Blok M BCA
    filterAccessibility: true,
  },
  {
    id: 'citra',
    name: 'Citra (24th)',
    role: 'Kontributor Komunitas',
    desc: 'Aktif melaporkan fasilitas rusak / kendala lapangan untuk diverifikasi.',
    openReportModal: true,
  }
];

export default function WebGisHeader({ user, onLogout, activePersona, onSelectPersona, stations = [] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [personaDropdownOpen, setPersonaDropdownOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const navItems = [
    { to: '/webgis-dashboard', label: 'WebGIS Timeline Hub', icon: Map },
    { to: '/route-planner', label: 'Smart Route Overview', icon: Navigation },
    { to: '/station-profile', label: 'Station Info & POI', icon: Building2 },
    { to: '/boarding-recommendation', label: 'Boarding Guide', icon: TrainTrack },
    { to: '/arrival-reminder', label: 'Arrival Reminder', icon: Bell },
    { to: '/community-reports', label: 'Community Report', icon: MessageSquarePlus },
    { to: '/dashboard', label: 'Peta Multi-Moda', icon: Compass },
  ];

  const handlePersonaClick = (persona) => {
    setPersonaDropdownOpen(false);
    if (persona.openReportModal) {
      setReportModalOpen(true);
    }
    if (onSelectPersona) {
      onSelectPersona(persona);
    }
  };

  return (
    <>
      <header className="bg-slate-900/95 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-40 shadow-2xl shadow-slate-950/60 font-sans">
        <div className="max-w-screen-2xl mx-auto px-4 py-2.5">
          <div className="flex items-center gap-3">

            {/* Brand Logo */}
            <NavLink to="/webgis-dashboard" className="flex items-center gap-2.5 shrink-0 group">
              <div className="relative p-2 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-xl shadow-lg shadow-emerald-500/25 group-hover:shadow-emerald-500/40 transition-all duration-300">
                <Train className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse border border-slate-900" />
              </div>
              <div>
                <h1 className="text-sm font-black text-white tracking-tight leading-none flex items-center gap-1.5">
                  Pandu<span className="text-emerald-400">Yuk</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-bold px-1.5 py-0.5 rounded border border-emerald-500/30">
                    MVP
                  </span>
                </h1>
                <p className="text-[9px] text-slate-400 leading-none mt-1">WebGIS Transit Companion Jabodetabek</p>
              </div>
            </NavLink>

            {/* Persona Preset Switcher (PRD Section 4) */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setPersonaDropdownOpen(!personaDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-800/90 border border-slate-700/80 rounded-xl text-xs text-slate-200 hover:border-emerald-500/60 hover:text-white transition shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-bold text-[11px]">
                  Persona: <span className="text-emerald-300 font-semibold">{activePersona?.name || 'Pilih Persona'}</span>
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {personaDropdownOpen && (
                <div className="absolute top-full mt-1.5 left-0 w-80 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  <div className="p-2 border-b border-slate-800">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PRD User Personas</p>
                    <p className="text-[9px] text-slate-500">Klik untuk mensimulasikan skenario pengguna PRD</p>
                  </div>
                  {PRD_PERSONAS.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handlePersonaClick(p)}
                      className={`p-2.5 rounded-xl cursor-pointer transition ${
                        activePersona?.id === p.id
                          ? 'bg-emerald-950/60 border border-emerald-500/40 text-white'
                          : 'hover:bg-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300">{p.name}</span>
                        <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-medium">
                          {p.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{p.desc}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 ml-2 overflow-x-auto scrollbar-none">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `px-2.5 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                          : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200 border border-transparent'
                      }`
                    }
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>

            {/* Right Action Section */}
            <div className="flex items-center gap-2 ml-auto shrink-0">
              {/* Lapor Kendala Button (PRD Community Report trigger anywhere) */}
              <button
                onClick={() => setReportModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white rounded-xl text-[11px] font-bold transition shadow-md shadow-purple-600/20 cursor-pointer"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-purple-200" />
                <span className="hidden sm:inline">Lapor Kendala</span>
              </button>

              {/* MAPID API Live Indicator */}
              <div className="hidden md:flex items-center gap-1.5 bg-slate-800/90 border border-emerald-500/30 px-2.5 py-1.5 rounded-xl text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-300 font-bold">MAPID API Active</span>
                <span className="text-slate-400 font-mono text-[9px] hidden 2xl:inline">f776...ff8d</span>
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Mobile Nav Dropdown */}
          {mobileMenuOpen && (
            <nav className="lg:hidden mt-3 pb-2 flex flex-col gap-1 border-t border-slate-800 pt-2.5 animate-fade-in">
              <div className="p-2 bg-slate-800/60 rounded-xl mb-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Simulasi Persona PRD:</p>
                <div className="grid grid-cols-2 gap-1 mt-1">
                  {PRD_PERSONAS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handlePersonaClick(p)}
                      className={`text-left p-1.5 rounded-lg text-[10px] font-semibold ${
                        activePersona?.id === p.id ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-300'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>

              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-slate-800/80 text-slate-300 hover:text-white'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 text-emerald-400" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Global Community Report Modal */}
      <CommunityReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        stations={stations}
      />
    </>
  );
}
