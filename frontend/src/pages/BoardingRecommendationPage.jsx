import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { TrainTrack, DoorOpen, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

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
      <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-600/20 text-amber-400 rounded-2xl border border-amber-500/30">
            <TrainTrack className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Boarding Recommendation Assistant</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Rekomendasi posisi naik / gerbong kereta terbaik untuk menghemat waktu jalan kaki menuju lift, eskalator, dan pintu keluar.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Station Selector */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Pilih Stasiun Tujuan Transit
          </h2>
          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
            {stations.map((st) => (
              <div
                key={st.id}
                onClick={() => setSelectedStation(st)}
                className={`p-4 rounded-2xl border cursor-pointer transition ${
                  selectedStation?.id === st.id
                    ? 'bg-amber-600/20 border-amber-500 text-amber-300'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <h3 className="font-bold text-sm text-white">{st.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">{st.operator}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Boarding Intelligence View */}
        <div className="lg:col-span-8 space-y-6">
          {selectedStation && (
            <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700/70 pb-4">
                <div>
                  <span className="text-xs font-bold px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full">
                    Stasiun: {selectedStation.name}
                  </span>
                  <h3 className="text-xl font-black text-white mt-2">Rekomendasi Posisi Naik Kereta</h3>
                </div>
                <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-2xl">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              {selectedStation.boarding_recommendation ? (
                <div className="space-y-5">
                  <div className="bg-amber-950/40 border border-amber-800/50 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
                        <DoorOpen className="w-5 h-5" /> Posisi Naik Direkomendasikan
                      </span>
                      <span className="text-xs font-black bg-amber-500 text-slate-950 px-3 py-1 rounded-xl">
                        {selectedStation.boarding_recommendation.recommended_car}
                      </span>
                    </div>

                    <p className="text-sm text-slate-200 leading-relaxed">
                      {selectedStation.boarding_recommendation.reason}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-amber-800/40">
                      <span>Pintu Keluar Terdekat: <strong className="text-slate-200">{selectedStation.boarding_recommendation.nearest_exit}</strong></span>
                      <span>Est. Jalan Kaki: <strong className="text-slate-200">~{selectedStation.boarding_recommendation.walking_time_seconds} detik</strong></span>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/60 space-y-2">
                    <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mengapa Mengikuti Rekomendasi Ini?
                    </h4>
                    <ul className="text-xs text-slate-400 space-y-1.5 pl-2">
                      <li>• Langsung sejajar dengan tangga & eskalator utama saat pintu kereta terbuka.</li>
                      <li>• Meminimalkan penumpukan penumpang saat jam sibuk di lantai peron.</li>
                      <li>• Menghemat waktu transit hingga 2 - 4 menit berjalan di stasiun besar.</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400 border border-slate-700/50 rounded-2xl">
                  Belum ada rekomendasi gerbong spesifik untuk stasiun ini.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
