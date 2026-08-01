import React, { useState } from 'react';
import { Train, MapPin, Zap, Clock, Navigation, ArrowRight, ChevronRight } from 'lucide-react';

const trainCars = Array.from({ length: 12 }, (_, i) => i + 1);
const recommendedCars = [3, 4];

export default function BoardingGuideWidget() {
  const [hoveredCar, setHoveredCar] = useState(null);

  return (
    <div className="bg-slate-800/90 border border-slate-700/60 rounded-3xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700/80 border-b border-slate-700/60 px-5 py-4 flex items-center gap-3">
        <div className="p-2 bg-emerald-500/20 border border-emerald-500/30 rounded-xl">
          <Train className="w-5 h-5 text-emerald-400" />
        </div>
        <div>
          <h2 className="text-sm font-black text-white">💡 Boarding & Exit Guide</h2>
          <p className="text-[10px] text-slate-400 mt-0.5">Panduan naik & keluar optimal untuk Stasiun Sudirman</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-full">
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
          AI Powered
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Section A - Boarding Recommendation */}
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-emerald-400">A</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Rekomendasi Posisi Naik: Gerbong 3 atau 4</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                Posisi paling dekat dengan eskalator & Exit B2 di Stasiun Sudirman.
              </p>
            </div>
          </div>

          {/* 12-Car Train Visualizer */}
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4 space-y-3">
            {/* Train header */}
            <div className="flex items-center justify-between text-[9px] text-slate-500">
              <span className="font-semibold">← Kepala Kereta</span>
              <span className="font-semibold">Ekor Kereta →</span>
            </div>

            {/* Train body */}
            <div className="relative">
              {/* Train roof/body */}
              <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-thin">
                {/* Locomotive head */}
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div className="w-8 h-12 bg-slate-700 rounded-l-2xl border border-slate-600 flex items-center justify-center">
                    <span className="text-[8px] text-slate-400 rotate-90 font-bold">KRL</span>
                  </div>
                </div>

                {/* Cars */}
                {trainCars.map((car) => {
                  const isRec = recommendedCars.includes(car);
                  const isHovered = hoveredCar === car;
                  return (
                    <div
                      key={car}
                      className="shrink-0 flex flex-col items-center gap-1 cursor-pointer"
                      onMouseEnter={() => setHoveredCar(car)}
                      onMouseLeave={() => setHoveredCar(null)}
                    >
                      {/* Car body */}
                      <div
                        className={`relative w-10 h-12 rounded-md border-2 flex flex-col items-center justify-between py-1.5 transition-all duration-200 ${
                          isRec
                            ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/50 scale-110'
                            : isHovered
                            ? 'bg-slate-600 border-slate-500 scale-105'
                            : 'bg-slate-700/80 border-slate-600/60'
                        }`}
                      >
                        {/* Windows */}
                        <div className="flex gap-1">
                          <div className={`w-2 h-1.5 rounded-sm ${isRec ? 'bg-emerald-300/50' : 'bg-slate-500/50'}`} />
                          <div className={`w-2 h-1.5 rounded-sm ${isRec ? 'bg-emerald-300/50' : 'bg-slate-500/50'}`} />
                        </div>
                        {/* Car number */}
                        <span className={`text-[9px] font-black ${isRec ? 'text-white' : 'text-slate-400'}`}>
                          {car}
                        </span>
                        {/* Door indicator */}
                        <div className={`w-4 h-0.5 rounded-full ${isRec ? 'bg-emerald-300' : 'bg-slate-600'}`} />
                        {/* Wheels */}
                        <div className="absolute -bottom-1 flex gap-1.5">
                          <div className={`w-2 h-2 rounded-full border ${isRec ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-700 border-slate-600'}`} />
                          <div className={`w-2 h-2 rounded-full border ${isRec ? 'bg-emerald-600 border-emerald-400' : 'bg-slate-700 border-slate-600'}`} />
                        </div>
                      </div>

                      {/* "Naik di Sini" badge below recommended cars */}
                      {isRec && (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="w-0 h-0 border-l-4 border-r-4 border-b-4 border-l-transparent border-r-transparent border-b-emerald-500" />
                          <span className="text-[8px] font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1 py-0.5 rounded whitespace-nowrap">
                            Naik di Sini
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Tail */}
                <div className="shrink-0 flex flex-col items-center gap-1">
                  <div className="w-6 h-12 bg-slate-700 rounded-r-2xl border border-slate-600" />
                </div>
              </div>

              {/* Rail tracks */}
              <div className="mt-2 mx-4 h-1 bg-slate-700 rounded-full relative">
                <div className="absolute inset-0 flex items-center justify-around">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-0.5 h-3 bg-slate-600 rounded-full" />
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[9px]">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-slate-400">Gerbong Direkomendasikan</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-slate-700 border border-slate-600" />
                <span className="text-slate-400">Gerbong Netral</span>
              </div>
            </div>
          </div>

          {/* Recommendation Badge */}
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl px-4 py-3">
            <div className="p-2 bg-emerald-500/20 rounded-xl">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <p className="text-xs font-black text-emerald-300">Naik di Gerbong 3 atau 4</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Lebih dekat ke eskalator & Exit B2 Sudirman</p>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-700/50" />

        {/* Section B - Exit Recommendation */}
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <span className="text-[10px] font-black text-cyan-400">B</span>
            </div>
            <div>
              <h3 className="text-xs font-bold text-white">Pintu Keluar Disarankan: Exit Gate B2 (Arah Blora)</h3>
              <p className="text-[10px] text-slate-400 mt-0.5">Keluar via B2 untuk akses tercepat menuju Jalan Blora & Kuningan.</p>
            </div>
          </div>

          {/* Time Saved Badge */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-[10px] font-bold text-emerald-300">Menghemat 2.5 Menit Jalan Kaki</span>
            </div>
            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[10px] font-bold text-cyan-300">40m dari peron</span>
            </div>
          </div>

          {/* Route Visual */}
          <div className="bg-slate-900/60 border border-slate-700/40 rounded-2xl p-4">
            <div className="flex items-center gap-2 text-[10px]">
              {/* Route steps */}
              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Train className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-slate-400 text-center leading-tight">Peron<br/>Gerbong 4</span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-slate-500 w-full">
                  <div className="flex-1 border-t-2 border-dashed border-slate-600" />
                  <ArrowRight className="w-3 h-3 text-emerald-400 shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-600" />
                </div>
                <span className="text-emerald-400 font-bold">~25m</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <Navigation className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-slate-400 text-center leading-tight">Eskalator<br/>ke Exit B2</span>
              </div>

              <div className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-center gap-1 text-slate-500 w-full">
                  <div className="flex-1 border-t-2 border-dashed border-slate-600" />
                  <ArrowRight className="w-3 h-3 text-cyan-400 shrink-0" />
                  <div className="flex-1 border-t-2 border-dashed border-slate-600" />
                </div>
                <span className="text-cyan-400 font-bold">~15m</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-slate-400 text-center leading-tight">Exit B2<br/>Jl. Blora</span>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-700/40">
              <div className="flex items-center justify-between text-[10px]">
                <span className="text-slate-400">Total jarak berjalan</span>
                <span className="font-bold text-white">~40 meter</span>
              </div>
              <div className="flex items-center justify-between text-[10px] mt-1">
                <span className="text-slate-400">Est. waktu berjalan</span>
                <span className="font-bold text-emerald-400">~30 detik</span>
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold py-3 rounded-2xl transition-all duration-300 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 group">
            <Navigation className="w-4 h-4" />
            Mulai Navigasi ke Exit B2
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
