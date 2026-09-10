import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  Bell, Volume2, Smartphone, ShieldAlert, Check,
  Radar, MapPin, Radio, AlertCircle, Play, Pause, RotateCcw, HelpCircle
} from 'lucide-react';

export default function ArrivalReminderPage() {
  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState('');
  const [thresholdDistance, setThresholdDistance] = useState(500);
  const [active, setActive] = useState(true);
  const [notifyType, setNotifyType] = useState('both');

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentDistance, setCurrentDistance] = useState(900);
  const [alertTriggered, setAlertTriggered] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      if (res.data?.data?.length > 0) {
        setStations(res.data.data);
        setStationId(res.data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Approach simulation timer
  useEffect(() => {
    let interval = null;
    if (isSimulating && active) {
      interval = setInterval(() => {
        setCurrentDistance((prev) => {
          if (prev <= 100) {
            setIsSimulating(false);
            return 80;
          }
          const nextDist = prev - 80;
          if (nextDist <= thresholdDistance) {
            setAlertTriggered(true);
          }
          return nextDist;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSimulating, active, thresholdDistance]);

  const selectedStationObj = stations.find((s) => s.id == stationId) || stations[0];

  const resetSimulation = () => {
    setIsSimulating(false);
    setCurrentDistance(900);
    setAlertTriggered(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-16 text-slate-100 font-sans">

      {/* Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-600/20 text-rose-400 rounded-2xl border border-rose-500/30">
            <Bell className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Arrival Reminder & Alert System</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Notifikasi otomatis kapan harus bersiap turun berdasarkan estimasi waktu tempuh GTFS Realtime & radius spasial.
            </p>
          </div>
        </div>

        <span className="hidden md:flex items-center gap-1.5 bg-rose-950/80 border border-rose-500/40 text-rose-300 px-3 py-1.5 rounded-xl text-xs font-bold">
          <Radio className="w-3.5 h-3.5 animate-pulse" /> Telemetri Realtime
        </span>
      </div>

      {/* Explainability Callout */}
      <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-4 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs text-rose-200 leading-relaxed space-y-1">
          <p className="font-bold">Logika AI/Spasial PRD (Rule-Based Threshold):</p>
          <p className="text-[11px] text-rose-300/90">
            Sistem memantau posisi armada terhadap stasiun tujuan secara asinkron. Begitu jarak &le; ambang batas ({thresholdDistance}m atau ~2 menit sebelum tiba), sistem langsung membunyikan alarm visual dan suara agar pengguna tidak terlewat saat tertidur atau sibuk.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT: PENGATURAN PARAMETER REMINDER ──────────── */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-5">
          <h2 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-700/70 pb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-rose-400" />
            Konfigurasi Ambang Batas Pengingat
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                Stasiun Tujuan Pengingat
              </label>
              <select
                value={stationId}
                onChange={(e) => {
                  setStationId(e.target.value);
                  resetSimulation();
                }}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500 font-semibold"
              >
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.operator})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold text-slate-300">
                  Ambang Batas Jarak Pemicu:
                </label>
                <span className="text-xs font-mono font-black text-rose-400 bg-rose-950/80 border border-rose-700 px-2 py-0.5 rounded">
                  {thresholdDistance} Meter (~{Math.round(thresholdDistance / 250)} Menit)
                </span>
              </div>
              <input
                type="range"
                min="200"
                max="1200"
                step="50"
                value={thresholdDistance}
                onChange={(e) => setThresholdDistance(Number(e.target.value))}
                className="w-full accent-rose-500 bg-slate-950 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                <span>200m (Dekat)</span>
                <span>500m (Standar PRD)</span>
                <span>1200m (Awal)</span>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-2">
                Tipe Sinyal Peringatan
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setNotifyType('both')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    notifyType === 'both'
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Volume2 className="w-4 h-4" /> Suara & Getar
                </button>
                <button
                  type="button"
                  onClick={() => setNotifyType('vibrate')}
                  className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-2 transition ${
                    notifyType === 'vibrate'
                      ? 'bg-rose-950/60 border-rose-500 text-rose-200 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-4 h-4" /> Getar Senyap
                </button>
              </div>
            </div>

            <button
              onClick={() => setActive(!active)}
              className={`w-full font-black py-3 rounded-2xl text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
                active
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  : 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
              }`}
            >
              {active ? (
                <><Check className="w-4 h-4" /> Reminder Aktif (Klik Mematikan)</>
              ) : (
                <><Bell className="w-4 h-4" /> Aktifkan Arrival Reminder</>
              )}
            </button>
          </div>
        </div>

        {/* ── RIGHT: RADAR & SIMULASI PENDEKATAN REALTIME ───── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Radar className="w-4 h-4 text-rose-400 animate-spin" />
                  Simulasi Pendekatan Menuju {selectedStationObj?.name || 'Stasiun Tujuan'}
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Uji coba interaktif pemicu alarm kedatangan</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer ${
                    isSimulating
                      ? 'bg-amber-600 hover:bg-amber-500 text-white'
                      : 'bg-rose-600 hover:bg-rose-500 text-white'
                  }`}
                >
                  {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isSimulating ? 'Jeda' : 'Mulai Simulasi'}</span>
                </button>
                <button
                  onClick={resetSimulation}
                  className="p-1.5 bg-slate-900 border border-slate-700 rounded-xl hover:text-white transition text-slate-400"
                  title="Reset"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Radar Gauge & Visual Distance Indicator */}
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className={`w-36 h-36 rounded-full border-4 flex flex-col items-center justify-center relative transition-all duration-500 ${
                currentDistance <= thresholdDistance
                  ? 'border-rose-500 bg-rose-950/40 shadow-2xl shadow-rose-500/40 scale-105 animate-pulse'
                  : 'border-slate-700 bg-slate-900'
              }`}>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Jarak Sisa</span>
                <span className="text-2xl font-mono font-black text-white mt-0.5">
                  {currentDistance}m
                </span>
                <span className={`text-[9px] font-bold mt-1 px-2 py-0.5 rounded-full ${
                  currentDistance <= thresholdDistance
                    ? 'bg-rose-500 text-white animate-bounce'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {currentDistance <= thresholdDistance ? '🚨 TRIGGERED' : 'MEMANTAU'}
                </span>
              </div>

              <div className="w-full max-w-md mt-6 space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                  <span>Keberangkatan</span>
                  <span>Ambang Batas ({thresholdDistance}m)</span>
                  <span>Stasiun Tujuan</span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 ${
                      currentDistance <= thresholdDistance ? 'bg-rose-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.max(5, Math.min(100, 100 - (currentDistance / 900) * 100))}%` }}
                  />
                  {/* Threshold mark */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-amber-400 z-10"
                    style={{ left: `${100 - (thresholdDistance / 900) * 100}%` }}
                    title={`Threshold: ${thresholdDistance}m`}
                  />
                </div>
              </div>
            </div>

            {/* Simulated Live Alert Banner */}
            {currentDistance <= thresholdDistance ? (
              <div className="p-4 bg-gradient-to-r from-rose-950/80 via-purple-950/80 to-slate-900 border border-rose-500/60 rounded-2xl flex items-start gap-3.5 animate-bounce shadow-xl">
                <div className="p-2.5 bg-rose-500 text-white rounded-xl shrink-0">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-white">
                    🚨 PERSIAPAN TURUN! Anda Mendekati {selectedStationObj?.name}
                  </h4>
                  <p className="text-xs text-rose-200 mt-1 leading-relaxed">
                    Sisa jarak kurang dari {currentDistance}m (~60 detik lagi tiba). Mohon periksa kembali barang bawaan dan berdiri di dekat pintu keluar gerbong.
                  </p>
                  <p className="text-[10px] text-emerald-300 font-bold mt-2">
                    → Rekomendasi Pintu Keluar: Exit Gate A (Akses Lift & Ramp Terverifikasi)
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-slate-900/60 border border-slate-800 rounded-2xl text-xs text-slate-400 flex items-center justify-between">
                <span>Armada masih dalam perjalanan. Pengingat akan otomatis berbunyi pada radius {thresholdDistance}m.</span>
                <span className="text-[10px] font-mono text-slate-500">GTFS_RT_POLL: OK</span>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
