import React, { useState, useEffect } from 'react';
import api from '../services/api';
import BoardingGuideWidget from '../components/BoardingGuideWidget';
import { TrainTrack, Sparkles, ChevronDown } from 'lucide-react';

export default function BoardingRecommendationPage() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      if (res.data?.data?.length > 0) {
        setStations(res.data.data);
        setSelectedStation(res.data.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <TrainTrack className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Boarding & Exit Guide</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Rekomendasi posisi naik gerbong & pintu keluar terbaik untuk menghemat waktu transit Anda.
            </p>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-2 rounded-xl">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-300">AI Powered</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Station Selector */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pilih Stasiun Tujuan Transit
          </h2>
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {stations.map((st) => (
              <div
                key={st.id}
                onClick={() => setSelectedStation(st)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  selectedStation?.id === st.id
                    ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">{st.name}</h3>
                  {st.boarding_recommendation && (
                    <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-bold">
                      AI Ready
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{st.operator}</p>
                {selectedStation?.id === st.id && st.boarding_recommendation && (
                  <div className="mt-2 text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                    <span>→</span>
                    <span>{st.boarding_recommendation.recommended_car}</span>
                  </div>
                )}
              </div>
            ))}
            {stations.length === 0 && (
              <div className="p-6 text-center text-xs text-slate-500 border border-slate-700/50 rounded-2xl">
                Memuat daftar stasiun...
              </div>
            )}
          </div>
        </div>

        {/* Right - Boarding Guide */}
        <div className="lg:col-span-8 space-y-6">
          {/* Full-featured Boarding Guide Widget (always shown as demo) */}
          <BoardingGuideWidget />

          {/* API-driven data below if available */}
          {selectedStation?.boarding_recommendation && (
            <div className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <TrainTrack className="w-4 h-4 text-emerald-400" />
                Data Live: {selectedStation.name}
              </h3>

              <div className="bg-emerald-950/40 border border-emerald-800/50 p-4 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400">Rekomendasi Gerbong</span>
                  <span className="text-xs font-black bg-emerald-500 text-white px-3 py-1 rounded-xl">
                    {selectedStation.boarding_recommendation.recommended_car}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed">
                  {selectedStation.boarding_recommendation.reason}
                </p>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-emerald-800/40">
                  <span>Pintu Keluar: <strong className="text-slate-200">{selectedStation.boarding_recommendation.nearest_exit}</strong></span>
                  <span>Est. Jalan: <strong className="text-slate-200">~{selectedStation.boarding_recommendation.walking_time_seconds}s</strong></span>
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  ✅ Mengapa mengikuti rekomendasi ini?
                </h4>
                <ul className="text-xs text-slate-400 space-y-1.5 pl-2">
                  <li>• Langsung sejajar dengan tangga & eskalator utama saat pintu kereta terbuka.</li>
                  <li>• Meminimalkan penumpukan penumpang saat jam sibuk di lantai peron.</li>
                  <li>• Menghemat waktu transit hingga 2–4 menit berjalan di stasiun besar.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
