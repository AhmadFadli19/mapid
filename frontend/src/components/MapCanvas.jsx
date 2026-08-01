import React, { useState } from 'react';
import { Plus, Minus, Crosshair, Layers, Train, MapPin, Wifi, Coffee, Wind } from 'lucide-react';

// Simulated map markers data
const mapMarkers = [
  { id: 'train', type: 'train', x: 52, y: 48, label: 'KRL Bogor', color: '#10b981', pulse: true },
  { id: 'sudirman', type: 'station', x: 58, y: 42, label: 'Sudirman', color: '#06b6d4' },
  { id: 'manggarai', type: 'station', x: 46, y: 56, label: 'Manggarai', color: '#f59e0b' },
  { id: 'dukuh', type: 'station', x: 63, y: 38, label: 'Dukuh Atas', color: '#06b6d4' },
  { id: 'restroom', type: 'poi', x: 60, y: 44, label: '🚻 Toilet', color: '#64748b' },
  { id: 'exitB2', type: 'exit', x: 56, y: 40, label: 'Exit B2', color: '#10b981' },
  { id: 'exitB1', type: 'exit', x: 60, y: 43, label: 'Exit B1', color: '#94a3b8' },
];

// Grid pattern dots for map background
const GridPattern = () => (
  <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#94a3b8" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

// Road lines for simulated map
const RoadLines = () => (
  <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
    {/* Transit line - KRL */}
    <path d="M 200 380 Q 320 340 430 290 Q 500 260 580 220 Q 660 180 750 140" 
      fill="none" stroke="#10b981" strokeWidth="3" strokeDasharray="none" opacity="0.7" />
    {/* MRT Line */}
    <path d="M 250 120 L 350 200 L 450 280 L 550 360 L 620 420" 
      fill="none" stroke="#06b6d4" strokeWidth="2.5" opacity="0.5" />
    {/* Roads */}
    <path d="M 0 300 Q 200 290 400 310 Q 600 330 800 320" 
      fill="none" stroke="#334155" strokeWidth="6" opacity="0.6" />
    <path d="M 300 0 Q 310 200 320 400 Q 330 500 340 700" 
      fill="none" stroke="#334155" strokeWidth="5" opacity="0.5" />
    <path d="M 100 150 Q 300 170 500 160 Q 650 150 800 180" 
      fill="none" stroke="#1e293b" strokeWidth="4" opacity="0.6" />
    <path d="M 0 450 Q 250 440 450 460 Q 700 480 800 470" 
      fill="none" stroke="#1e293b" strokeWidth="4" opacity="0.5" />
    {/* Blocks */}
    <rect x="120" y="180" width="60" height="40" rx="4" fill="#1e293b" opacity="0.5" />
    <rect x="220" y="220" width="80" height="50" rx="4" fill="#1e293b" opacity="0.4" />
    <rect x="400" y="130" width="55" height="45" rx="4" fill="#1e293b" opacity="0.5" />
    <rect x="480" y="200" width="70" height="40" rx="4" fill="#1e293b" opacity="0.4" />
    <rect x="560" y="150" width="60" height="55" rx="4" fill="#1e293b" opacity="0.5" />
    <rect x="150" y="350" width="90" height="45" rx="4" fill="#1e293b" opacity="0.4" />
    <rect x="350" y="330" width="75" height="60" rx="4" fill="#1e293b" opacity="0.5" />
    <rect x="600" y="280" width="65" height="50" rx="4" fill="#1e293b" opacity="0.4" />
    {/* Exit route highlight */}
    <path d="M 445 254 L 460 240 L 475 230" 
      fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="4 2" opacity="0.8" />
  </svg>
);

export default function MapCanvas() {
  const [zoom, setZoom] = useState(13);
  const [activeLayer, setActiveLayer] = useState('transit');

  const layers = [
    { id: 'transit', label: 'Transit' },
    { id: 'facilities', label: 'Fasilitas' },
    { id: 'heatmap', label: 'Kepadatan' },
  ];

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-2xl overflow-hidden select-none">

      {/* Map Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

      {/* Grid Pattern */}
      <GridPattern />

      {/* Road/Transit Lines SVG */}
      <RoadLines />

      {/* Map Markers */}
      <div className="absolute inset-0">
        {mapMarkers.map((marker) => {
          const left = `${marker.x}%`;
          const top = `${marker.y}%`;

          if (marker.type === 'train') {
            return (
              <div key={marker.id} className="absolute transform -translate-x-1/2 -translate-y-1/2" style={{ left, top }}>
                {/* Pulse rings */}
                <div className="absolute inset-0 -m-4 rounded-full bg-emerald-500/10 animate-ping" />
                <div className="absolute inset-0 -m-2 rounded-full bg-emerald-500/15 animate-pulse" />
                <div className="relative z-10 flex items-center gap-1.5 bg-emerald-500 text-white text-[10px] font-black px-2.5 py-1.5 rounded-xl shadow-xl shadow-emerald-500/50 whitespace-nowrap border border-emerald-400">
                  <Train className="w-3 h-3" />
                  <span>{marker.label}</span>
                </div>
              </div>
            );
          }

          if (marker.type === 'station') {
            return (
              <div key={marker.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer" style={{ left, top }}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full border-2 border-white shadow-lg group-hover:scale-125 transition-transform"
                    style={{ backgroundColor: marker.color }}
                  />
                  <span className="text-[9px] font-bold text-white bg-slate-800/90 px-1.5 py-0.5 rounded-md whitespace-nowrap border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-opacity">
                    {marker.label}
                  </span>
                </div>
                {/* Always show label for key stations */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-slate-800/80 px-1.5 py-0.5 rounded whitespace-nowrap border border-slate-700/40">
                  {marker.label}
                </div>
              </div>
            );
          }

          if (marker.type === 'exit') {
            return (
              <div key={marker.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group" style={{ left, top }}>
                <div className="flex items-center gap-1 bg-slate-800/90 border border-emerald-500/40 text-[9px] font-bold px-1.5 py-0.5 rounded-lg whitespace-nowrap group-hover:bg-emerald-500/20 transition" style={{ color: marker.color }}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: marker.color }} />
                  {marker.label}
                </div>
              </div>
            );
          }

          if (marker.type === 'poi') {
            return (
              <div key={marker.id} className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer" style={{ left, top }}>
                <div className="bg-slate-700/80 border border-slate-600/60 text-[9px] px-1.5 py-0.5 rounded-lg text-slate-300 whitespace-nowrap hover:bg-slate-600 transition">
                  {marker.label}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Map Attribution */}
      <div className="absolute bottom-2 right-2 text-[8px] text-slate-600 font-mono">
        © MAPID WebGIS • Simulated Map View
      </div>

      {/* Floating Map Controls */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-2">
        {/* Zoom In */}
        <button
          onClick={() => setZoom(z => Math.min(z + 1, 20))}
          className="w-9 h-9 bg-slate-800/90 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl flex items-center justify-center transition shadow-lg backdrop-blur"
        >
          <Plus className="w-4 h-4" />
        </button>
        {/* Zoom Level */}
        <div className="w-9 h-7 bg-slate-900/80 border border-slate-700/50 rounded-lg flex items-center justify-center">
          <span className="text-[9px] font-mono text-slate-400">{zoom}</span>
        </div>
        {/* Zoom Out */}
        <button
          onClick={() => setZoom(z => Math.max(z - 1, 5))}
          className="w-9 h-9 bg-slate-800/90 border border-slate-700/60 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl flex items-center justify-center transition shadow-lg backdrop-blur"
        >
          <Minus className="w-4 h-4" />
        </button>

        <div className="my-1 border-t border-slate-700/50" />

        {/* Recenter */}
        <button className="w-9 h-9 bg-slate-800/90 border border-slate-700/60 text-emerald-400 hover:bg-emerald-500/20 rounded-xl flex items-center justify-center transition shadow-lg backdrop-blur">
          <Crosshair className="w-4 h-4" />
        </button>
        {/* Layer Toggle */}
        <button className="w-9 h-9 bg-slate-800/90 border border-slate-700/60 text-cyan-400 hover:bg-cyan-500/20 rounded-xl flex items-center justify-center transition shadow-lg backdrop-blur">
          <Layers className="w-4 h-4" />
        </button>
      </div>

      {/* Layer Selector Top-Left */}
      <div className="absolute top-3 left-3 flex items-center gap-1.5">
        {layers.map((layer) => (
          <button
            key={layer.id}
            onClick={() => setActiveLayer(layer.id)}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all duration-200 backdrop-blur ${
              activeLayer === layer.id
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 hover:text-slate-200'
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>

      {/* Live Status Overlay - Bottom left */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-slate-900/90 backdrop-blur border border-slate-700/60 px-3 py-2 rounded-xl">
        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        <span className="text-[10px] font-semibold text-emerald-300">Kereta berjalan lancar</span>
        <span className="text-[9px] text-slate-500">(GTFS Realtime)</span>
      </div>

      {/* Map Compass */}
      <div className="absolute top-3 right-3">
        <div className="w-8 h-8 bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-full flex items-center justify-center">
          <span className="text-[9px] font-black text-red-400">N</span>
        </div>
      </div>
    </div>
  );
}
