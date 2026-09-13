import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  TrainTrack, Sparkles, ChevronDown, Train,
  DoorOpen, Clock, ShieldCheck, MapPin, Info,
  Compass, HelpCircle, Layers
} from 'lucide-react';

const trainCars = Array.from({ length: 12 }, (_, i) => i + 1);

function isRecForCar(car, recommendation) {
  return Boolean(recommendation?.recommended_car && String(recommendation.recommended_car).includes(String(car)));
}

export default function BoardingRecommendationPage() {
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [activeCar, setActiveCar] = useState(null);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      if (res.data?.data?.length > 0) {
        setStations(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const boardingRec = selectedStation?.boarding_recommendation || null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-16 text-slate-100 font-sans">

      {/* Header */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
            <TrainTrack className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Boarding Recommendation Guide</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Rekomendasi posisi naik gerbong berdasarkan <em>Spatial Relationship Analysis</em> terhadap pintu keluar & titik transit.
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-2 rounded-xl">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-300">Rule-Based Spatial Analysis</span>
        </div>
      </div>

      {/* Explainability Callout */}
      <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-4 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-xs text-emerald-200 leading-relaxed space-y-1">
          <p className="font-bold">Prinsip Desain PRD #4 (Rule-Based, Bukan Machine Learning):</p>
          <p className="text-[11px] text-emerald-300/90">
            PanduYuk memprioritaskan <strong>explainability</strong>. Setiap rekomendasi gerbong dapat dilacak ke hubungan geometri spasial antara posisi peron, letak tangga transit, dan pintu keluar tujuan Anda — tanpa menebak.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT: STASIUN SELECTOR ───────────────────────── */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-wider">
            Pilih Stasiun Kedatangan Transit
          </h2>
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {stations.map((st) => (
              <div
                key={st.id}
                onClick={() => setSelectedStation(st)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  selectedStation?.id === st.id
                    ? 'bg-emerald-600/20 border-emerald-500 text-white shadow-md shadow-emerald-500/15'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">{st.name}</h3>
                  <span className="text-[9px] bg-slate-900 px-2 py-0.5 rounded text-slate-400 font-bold border border-slate-700">
                    {st.operator}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Gerbong Rekomendasi: <strong className="text-emerald-300">{st.boarding_recommendation?.recommended_car || 'Unavailable'}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT: BOARDING VISUALIZER & EXPLAINABILITY ───── */}
        <div className="lg:col-span-8 space-y-5">

          {/* Active Station Recommendation Card */}
          <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  Analisis Spasial Gerbong
                </span>
                <h3 className="text-base font-black text-white">{selectedStation?.name || 'Pilih stasiun'}</h3>
              </div>
              <span className="text-xs font-black bg-emerald-500 text-white px-3.5 py-1.5 rounded-xl shadow-md shadow-emerald-500/30">
                {boardingRec?.recommended_car || 'Unavailable'}
              </span>
            </div>

            {/* Explainable Reasoning */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-800/50 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                💡 Alasan Rekomendasi (Explainability First):
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {boardingRec?.reason || 'Rekomendasi boarding belum tersedia untuk stasiun ini.'}
              </p>
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-800/30 text-[10px] text-slate-400">
                <div>Pintu Keluar Terdekat: <strong className="text-white">{boardingRec?.nearest_exit || 'Unavailable'}</strong></div>
                <div>Estimasi Jalan Kaki: <strong className="text-white">{boardingRec?.walking_time_seconds != null ? `~${boardingRec.walking_time_seconds} detik` : 'Unavailable'}</strong></div>
              </div>
            </div>

            {/* 12-Car Train Visualizer */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span className="font-bold flex items-center gap-1.5">
                  <Train className="w-4 h-4 text-emerald-400" /> Formasi Kereta (Pilih Gerbong):
                </span>
                <span className="text-[10px] text-slate-500">Arah Laju Kereta &rarr;</span>
              </div>

              <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 pt-1">
                {trainCars.map((car) => {
                  const isRec = Boolean(boardingRec?.recommended_car && String(boardingRec.recommended_car).includes(String(car)));
                  const isSelected = activeCar === car;

                  return (
                    <button
                      key={car}
                      type="button"
                      onClick={() => setActiveCar(car)}
                      className={`p-2 rounded-xl border flex flex-col items-center justify-center transition cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-500 text-white border-emerald-300 shadow-lg shadow-emerald-500/40 scale-105'
                          : isRec
                          ? 'bg-emerald-950/60 border-emerald-500/60 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-black">{car}</span>
                      <span className="text-[7px] block font-semibold mt-0.5">
                        {isRec ? 'TOP' : 'STD'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Car Analysis Detail */}
            <div className="p-4 bg-slate-900/80 border border-slate-700/60 rounded-2xl space-y-1.5">
              <h4 className="text-xs font-bold text-white">
                Analisis Posisi Gerbong {activeCar}:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {activeCar && isRecForCar(activeCar, boardingRec)
                  ? `Gerbong ${activeCar} ditandai oleh rekomendasi data stasiun.`
                  : activeCar
                  ? 'Tidak ada analisis posisi tambahan untuk gerbong ini.'
                  : 'Pilih gerbong untuk melihat status rekomendasi data.'}
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
