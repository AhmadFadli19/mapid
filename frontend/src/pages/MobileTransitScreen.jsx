import React, { useState } from 'react';
import {
  Train, MapPin, ChevronDown, Wifi, Toilet,
  Wind, Coffee, Plus, AlertTriangle, Clock, Navigation,
  Activity, X
} from 'lucide-react';

const facilityQuickActions = [
  { icon: Toilet, label: 'Toilet', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30', sublabel: '20m' },
  { icon: Wifi, label: 'Wi-Fi', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', sublabel: 'Gratis' },
  { icon: Wind, label: 'Lift', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30', sublabel: 'Lt. 1-2' },
  { icon: Coffee, label: 'Tenant', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/30', sublabel: 'Area B' },
];

// Simulated Map Background (Mobile-optimized dark vector)
const MobileMapBackground = () => (
  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800/90 to-slate-900">
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
      {/* Grid */}
      <defs>
        <pattern id="mgrid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#mgrid)" />
      {/* Roads */}
      <path d="M 0 280 Q 150 270 300 285 Q 450 300 600 290" fill="none" stroke="#334155" strokeWidth="8" opacity="0.8" />
      <path d="M 195 0 Q 200 200 205 400 Q 210 600 195 844" fill="none" stroke="#334155" strokeWidth="7" opacity="0.8" />
      <path d="M 0 150 Q 200 140 390 155" fill="none" stroke="#1e293b" strokeWidth="5" opacity="0.7" />
      <path d="M 0 420 Q 180 410 390 425" fill="none" stroke="#1e293b" strokeWidth="5" opacity="0.7" />
      {/* Transit Line */}
      <path d="M 0 260 Q 100 250 200 248 Q 280 246 390 244" fill="none" stroke="#10b981" strokeWidth="4" opacity="0.6" />
      {/* Blocks */}
      <rect x="50" y="80" width="70" height="45" rx="6" fill="#1e293b" opacity="0.6" />
      <rect x="240" y="90" width="80" height="40" rx="6" fill="#1e293b" opacity="0.5" />
      <rect x="60" y="330" width="75" height="50" rx="6" fill="#1e293b" opacity="0.6" />
      <rect x="240" y="320" width="85" height="55" rx="6" fill="#1e293b" opacity="0.5" />
      <rect x="310" y="150" width="60" height="70" rx="6" fill="#1e293b" opacity="0.5" />
      {/* Exit route dotted line */}
      <path d="M 200 248 L 220 230 L 240 215" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="5 3" opacity="0.9" />
    </svg>

    {/* Station Pin - Sudirman */}
    <div className="absolute" style={{ left: '51%', top: '28%', transform: 'translate(-50%, -50%)' }}>
      <div className="relative">
        <div className="absolute -inset-4 bg-emerald-500/10 rounded-full animate-ping" />
        <div className="absolute -inset-2 bg-emerald-500/10 rounded-full animate-pulse" />
        <div className="relative bg-emerald-500 text-white text-[9px] font-black px-2 py-1 rounded-xl shadow-xl shadow-emerald-500/50 flex items-center gap-1 whitespace-nowrap border border-emerald-400">
          <Train className="w-2.5 h-2.5" />
          Sudirman
        </div>
      </div>
    </div>

    {/* Train Moving Indicator */}
    <div className="absolute" style={{ left: '25%', top: '31%', transform: 'translate(-50%, -50%)' }}>
      <div className="bg-amber-500/90 text-white text-[8px] font-black px-1.5 py-0.5 rounded-lg shadow-lg border border-amber-400 flex items-center gap-1">
        <Train className="w-2 h-2 animate-pulse" />
        KRL
      </div>
    </div>

    {/* Exit B2 Marker */}
    <div className="absolute" style={{ left: '62%', top: '25%', transform: 'translate(-50%, -50%)' }}>
      <div className="bg-cyan-500/80 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-lg border border-cyan-400 shadow-md">
        Exit B2
      </div>
    </div>
  </div>
);

export default function MobileTransitScreen() {
  const [sheetState, setSheetState] = useState('half'); // 'collapsed' | 'half' | 'expanded'
  const [showLapor, setShowLapor] = useState(false);

  const sheetHeights = {
    collapsed: 'h-24',
    half: 'h-96',
    expanded: 'h-[85%]',
  };

  const cycleSheet = () => {
    const cycle = { collapsed: 'half', half: 'expanded', expanded: 'collapsed' };
    setSheetState(cycle[sheetState]);
  };

  return (
    <div className="relative w-full h-[calc(100vh-60px)] overflow-hidden bg-slate-900 -mx-4 -mb-4 md:-mx-6 md:-mb-6">

      {/* Full-screen Map Background */}
      <MobileMapBackground />

      {/* TOP STATUS BAR */}
      <div className="absolute top-3 left-0 right-0 px-4 z-20 space-y-1.5">
        {/* ETA Card */}
        <div className="flex justify-center">
          <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-700/60 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-black text-white">📍 ETA Stasiun Sudirman: <span className="text-amber-400">6 Menit</span></p>
            </div>
          </div>
        </div>

        {/* Live Status Ticker */}
        <div className="flex justify-center">
          <div className="bg-slate-900/80 backdrop-blur border border-emerald-500/30 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-300 font-semibold">Kereta berjalan lancar (GTFS Realtime)</span>
          </div>
        </div>
      </div>

      {/* BOTTOM SHEET */}
      <div
        className={`absolute bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/40 rounded-t-3xl shadow-2xl shadow-slate-950 transition-all duration-500 ease-out overflow-hidden ${sheetHeights[sheetState]}`}
      >
        {/* Drag Handle */}
        <div
          className="flex flex-col items-center py-3 cursor-grab active:cursor-grabbing"
          onClick={cycleSheet}
        >
          <div className="w-12 h-1 bg-slate-600 rounded-full" />
        </div>

        {/* Sheet Content */}
        <div className="px-4 overflow-y-auto h-full pb-24">
          {/* Station Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-base font-black text-white">Stasiun Sudirman</h2>
              <p className="text-[10px] text-slate-400 mt-0.5">Transit Station • KRL & MRT Jakarta</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-1.5 py-0.5 rounded-full">KRL</span>
              <span className="text-[9px] font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded-full">MRT</span>
            </div>
          </div>

          {/* Primary Recommendation Pill */}
          <div className="bg-gradient-to-r from-emerald-500/15 to-cyan-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3 mb-3 flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shrink-0" />
            <p className="text-xs font-bold text-emerald-300">
              🟢 Naik di Gerbong 3/4{' '}
              <span className="text-slate-300">→</span>{' '}
              <span className="text-cyan-300">Keluar via Exit B2</span>
            </p>
            <ChevronDown className="w-4 h-4 text-slate-500 ml-auto shrink-0" />
          </div>

          {/* Facility Grid - 4 Quick Actions */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {facilityQuickActions.map((fac) => {
              const Icon = fac.icon;
              return (
                <button
                  key={fac.label}
                  className={`flex flex-col items-center gap-1.5 p-3 ${fac.bg} border ${fac.border} rounded-2xl hover:opacity-80 active:scale-95 transition-all duration-200`}
                >
                  <Icon className={`w-5 h-5 ${fac.color}`} />
                  <span className={`text-[9px] font-bold ${fac.color}`}>{fac.label}</span>
                  <span className="text-[8px] text-slate-500">{fac.sublabel}</span>
                </button>
              );
            })}
          </div>

          {/* Live Community Ticker */}
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl px-3 py-2.5 mb-3 flex items-start gap-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-amber-200 font-semibold leading-relaxed">
                Eskalator B2 sedang dalam perbaikan
              </p>
              <div className="flex items-center gap-1.5 mt-1 text-[9px] text-slate-500">
                <Clock className="w-2.5 h-2.5" />
                <span>10 mnt lalu</span>
                <span>•</span>
                <span>@RajaKRL</span>
                <span>•</span>
                <span className="text-amber-500 font-bold">↑ 24</span>
              </div>
            </div>
          </div>

          {/* Expanded Content - only in full mode */}
          {sheetState === 'expanded' && (
            <div className="space-y-3 mt-2">
              {/* Journey Steps */}
              <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-3 space-y-2">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Rute Perjalanan</p>
                {[
                  { step: '1', label: 'Manggarai', sub: 'Dep. 06:42 • Peron 3', active: true },
                  { step: '2', label: 'Sudirman', sub: 'Tiba ±06:49 • Exit B2', active: false },
                  { step: '3', label: 'Tujuan', sub: 'Jl. Blora • ~4 Mnt', active: false },
                ].map((s) => (
                  <div key={s.step} className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-black shrink-0 ${
                      s.active ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-400'
                    }`}>{s.step}</div>
                    <div>
                      <p className={`text-[11px] font-bold ${s.active ? 'text-emerald-300' : 'text-slate-300'}`}>{s.label}</p>
                      <p className="text-[9px] text-slate-500">{s.sub}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Button */}
              <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-xs font-bold py-3 rounded-2xl shadow-lg shadow-emerald-500/20">
                <Navigation className="w-4 h-4" />
                Mulai Navigasi
              </button>
            </div>
          )}
        </div>

        {/* Floating Action Button — absolute inside sheet */}
        <div className="absolute bottom-5 right-4">
          <button
            onClick={() => setShowLapor(!showLapor)}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-xl shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Lapor Fasilitas
          </button>
        </div>
      </div>

      {/* Report Modal */}
      {showLapor && (
        <div className="absolute inset-0 z-50 flex items-end bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full bg-slate-800 border-t border-slate-700 rounded-t-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">📝 Laporkan Kondisi</h3>
              <button onClick={() => setShowLapor(false)} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition">
                <X className="w-4 h-4" />
              </button>
            </div>
            <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-sm text-slate-200 outline-none focus:border-emerald-500">
              <option>Pilih jenis laporan...</option>
              <option>Eskalator / Lift Rusak</option>
              <option>Toilet Kotor</option>
              <option>Kepadatan Peron</option>
              <option>Keterlambatan Kereta</option>
            </select>
            <textarea
              rows={3}
              placeholder="Ceritakan kondisi yang Anda temukan..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-3 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-emerald-500 resize-none"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowLapor(false)} className="flex-1 py-3 rounded-xl bg-slate-700 text-sm font-bold text-slate-300">Batal</button>
              <button onClick={() => setShowLapor(false)} className="flex-1 py-3 rounded-xl bg-emerald-500 text-sm font-bold text-white">Kirim</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
