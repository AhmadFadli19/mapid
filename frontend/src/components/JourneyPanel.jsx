import React, { useState } from 'react';
import {
  Train, MapPin, CheckCircle, Circle, ArrowRight,
  Zap, Navigation, Clock, ChevronRight
} from 'lucide-react';

const journeySteps = [
  {
    id: 1,
    label: 'KRL Line Bogor',
    sublabel: 'Dep. Manggarai 06:42',
    status: 'active',
    platform: 'Peron 3',
    color: 'emerald',
  },
  {
    id: 2,
    label: 'Transit Sudirman',
    sublabel: 'Tiba ±06:49 • 7 Menit',
    status: 'upcoming',
    platform: 'Exit B2',
    color: 'cyan',
  },
  {
    id: 3,
    label: 'Tujuan Akhir',
    sublabel: 'Jalan Blora No. 12',
    status: 'pending',
    platform: '~4 Mnt Jalan',
    color: 'slate',
  },
];

const trainCars = Array.from({ length: 12 }, (_, i) => i + 1);
const recommendedCars = [3, 4];

export default function JourneyPanel({ selectedStation }) {
  const [expandedStep, setExpandedStep] = useState(1);

  return (
    <div className="space-y-3 pb-4">

      {/* Journey Header */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg">
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-xs font-bold text-slate-200">Perjalanan Aktif</span>
          <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live
          </span>
        </div>

        {/* Vertical Timeline Stepper */}
        <div className="space-y-0">
          {journeySteps.map((step, idx) => (
            <div key={step.id} className="relative">
              {/* Connector line */}
              {idx < journeySteps.length - 1 && (
                <div className={`absolute left-[11px] top-8 w-0.5 h-8 ${
                  step.status === 'active' ? 'bg-emerald-500/60' : 'bg-slate-700'
                }`} />
              )}

              <div
                className={`flex items-start gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${
                  expandedStep === step.id ? 'bg-slate-700/40' : 'hover:bg-slate-700/20'
                }`}
                onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
              >
                {/* Step Indicator */}
                <div className="shrink-0 mt-0.5">
                  {step.status === 'active' ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                      <Train className="w-2.5 h-2.5 text-white" />
                    </div>
                  ) : step.status === 'upcoming' ? (
                    <div className="w-5 h-5 rounded-full bg-cyan-500/20 border-2 border-cyan-500 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full" />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-700 border-2 border-slate-600 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                    </div>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold truncate ${
                      step.status === 'active' ? 'text-emerald-300' :
                      step.status === 'upcoming' ? 'text-cyan-300' : 'text-slate-400'
                    }`}>{step.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      step.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' :
                      step.status === 'upcoming' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-700 text-slate-500'
                    }`}>{step.platform}</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{step.sublabel}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Boarding Recommendation Card */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg">
            <Train className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="text-xs font-bold text-slate-200">Rekomendasi Naik</span>
          <span className="ml-auto text-[10px] font-bold text-emerald-400">
            {selectedStation?.boarding_recommendation?.recommended_car || 'Gerbong 3/4'}
          </span>
        </div>

        {/* 12-Car Train Visualizer - Compact */}
        <div className="space-y-1.5">
          <p className="text-[10px] text-slate-400">
            {selectedStation?.boarding_recommendation?.reason
              || 'Posisi paling dekat eskalator & Exit B2 di stasiun tujuan'}
          </p>
          <div className="flex gap-1 overflow-x-auto pb-1">
            {trainCars.map((car) => {
              const isRec = recommendedCars.includes(car);
              return (
                <div
                  key={car}
                  className={`shrink-0 flex flex-col items-center gap-0.5 rounded-md p-1 transition-all duration-200 ${
                    isRec
                      ? 'bg-emerald-500 shadow-md shadow-emerald-500/40 scale-110'
                      : 'bg-slate-700/60 border border-slate-600/40'
                  }`}
                >
                  <div className={`w-6 h-4 rounded-sm flex items-center justify-center ${
                    isRec ? 'bg-emerald-400/30' : 'bg-slate-600/40'
                  }`}>
                    <span className={`text-[8px] font-bold ${isRec ? 'text-white' : 'text-slate-400'}`}>
                      {car}
                    </span>
                  </div>
                  {isRec && (
                    <span className="text-[7px] font-black text-emerald-100 leading-none">↑</span>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-2 py-1.5">
            <Zap className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="text-[10px] text-emerald-300 font-semibold">
              Naik di {selectedStation?.boarding_recommendation?.recommended_car || 'Gerbong 3 / 4'}
            </span>
          </div>
        </div>
      </div>

      {/* Exit Recommendation Card */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-cyan-500/20 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-xs font-bold text-slate-200">Rekomendasi Keluar</span>
        </div>

        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white">
              {selectedStation?.boarding_recommendation?.nearest_exit || 'Exit Gate B2'}
            </span>
            <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full font-semibold">Arah Keluar</span>
          </div>
          <p className="text-[10px] text-slate-400">
            {selectedStation?.name ? `${selectedStation.name}` : 'Jalan Blora'} • 40m dari peron
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold">
            <Clock className="w-3 h-3" />
            <span>
              Est. {selectedStation?.boarding_recommendation?.walking_time_seconds
                ? `~${selectedStation.boarding_recommendation.walking_time_seconds}s jalan kaki`
                : 'Menghemat ±2.5 Menit Jalan Kaki'}
            </span>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-1.5 bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-slate-300 text-xs font-semibold py-2 rounded-xl transition group">
          <Navigation className="w-3 h-3 text-cyan-400" />
          Lihat Arah ke Exit B2
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* ETA Summary */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-3 flex items-center gap-3">
        <div className="p-2 bg-amber-500/20 rounded-xl">
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400">
            ETA {selectedStation?.name || 'Stasiun Tujuan'}
          </p>
          <p className="text-sm font-black text-amber-400">~6 Menit</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-slate-400">Peron</p>
          <p className="text-xs font-bold text-white">3</p>
        </div>
      </div>
    </div>
  );
}
