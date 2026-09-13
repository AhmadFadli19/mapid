import React, { useState, useEffect } from 'react';
import {
  Train, MapPin, CheckCircle, Circle, ArrowRight,
  Zap, Navigation, Clock, ChevronRight, Bell, Volume2,
  ShieldCheck, Compass, CreditCard, Activity, AlertTriangle,
  Info, CloudSun, DoorOpen, Radio, Sparkles, ExternalLink
} from 'lucide-react';
import api from '../services/api';

export const JOURNEY_STAGES = [
  {
    id: 1,
    key: 'pre_boarding',
    title: '1. Sebelum Naik',
    subtitle: 'Stasiun Asal & Peron',
    activeWidget: 'BOARDING_REC',
    badge: 'Boarding Guide',
    color: 'emerald'
  },
  {
    id: 2,
    key: 'onboard',
    title: '2. Di Kendaraan',
    subtitle: 'Dalam Perjalanan Aktif',
    activeWidget: 'MONITORING',
    badge: 'Journey Monitoring',
    color: 'sky'
  },
  {
    id: 3,
    key: 'transfer',
    title: '3. Berpindah Moda',
    subtitle: 'Transit Interkoneksi',
    activeWidget: 'TRANSFER_GUIDE',
    badge: 'Transfer Assist',
    color: 'amber'
  },
  {
    id: 4,
    key: 'arriving',
    title: '4. Mendekati Tujuan',
    subtitle: 'Persiapan Turun & Keluar',
    activeWidget: 'ARRIVAL_EXIT',
    badge: 'Arrival & Exit',
    color: 'purple'
  },
];

const trainCars = Array.from({ length: 12 }, (_, i) => i + 1);

export default function JourneyPanel({
  stations = [],
  selectedStation,
  onSelectStation,
  activePersona
}) {
  const [originId, setOriginId] = useState('');
  const [destId, setDestId] = useState('');
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [calculatedRoute, setCalculatedRoute] = useState(null);
  const [currentStageId, setCurrentStageId] = useState(1);
  const [reminderActive, setReminderActive] = useState(true);

  // Sync initial dropdown selections
  useEffect(() => {
    if (originId && !stations.some((station) => String(station.id) === String(originId))) setOriginId('');
    if (destId && !stations.some((station) => String(station.id) === String(destId))) setDestId('');
  }, [stations]);

  // Sync persona presets
  useEffect(() => {
    if (activePersona) {
      if (activePersona.presetOrigin) setOriginId(activePersona.presetOrigin);
      if (activePersona.presetDest) setDestId(activePersona.presetDest);
      // Auto trigger route calculation for persona
      calculateRoute(activePersona.presetOrigin, activePersona.presetDest);
    }
  }, [activePersona]);

  const calculateRoute = async (oId = originId, dId = destId) => {
    if (!oId || !dId) return;
    setLoadingRoute(true);
    try {
      const res = await api.get(`/v1/route/plan?origin_id=${oId}&destination_id=${dId}`);
      if (res.data?.data) {
        setCalculatedRoute(res.data.data);
        const destStation = res.data.data.route?.destination;
        if (destStation && onSelectStation) {
          onSelectStation(destStation);
        }
      }
    } catch (err) {
      console.error('Failed calculating route:', err);
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleCalculateRoute = (e) => {
    if (e) e.preventDefault();
    calculateRoute();
  };

  const currentStage = JOURNEY_STAGES.find((s) => s.id === currentStageId) || JOURNEY_STAGES[0];

  // Route & Intelligence variables
  const routeObj = calculatedRoute?.route;
  const intelObj = calculatedRoute?.transit_intelligence;
  const boardingRec = intelObj?.boarding_recommendation;
  const exitRec = intelObj?.exit_recommendation;
  const arrivalRem = intelObj?.arrival_reminder;
  const monitoring = intelObj?.journey_monitoring;

  const durationMin = routeObj?.estimated_duration_minutes;
  const totalFare = routeObj?.total_fare;
  const distanceKm = routeObj?.distance_km;

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700 text-slate-100 font-sans">

      {/* ── 1. Smart Route Input Card ─────────────────────── */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Navigation className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-black text-white">Smart Route Overview</h3>
              <p className="text-[9px] text-slate-400">Rute Transit Multi-Moda Jabodetabek</p>
            </div>
          </div>
          <span className="text-[9px] bg-slate-900 border border-slate-700 text-slate-300 font-bold px-2 py-0.5 rounded-lg">
            GTFS Ready
          </span>
        </div>

        <form onSubmit={handleCalculateRoute} className="space-y-2.5">
          <div>
            <label className="block text-[10px] font-bold text-emerald-400 mb-1">
              📍 Titik Asal Perjalanan
            </label>
            <select
              value={originId}
              onChange={(e) => setOriginId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-emerald-500 font-semibold truncate transition"
            >
              <option value="">Pilih stasiun asal...</option>
              {stations.map((st) => (
                <option key={`orig-${st.id}`} value={st.id}>
                  {st.name} ({st.operator})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-cyan-400 mb-1">
              🎯 Titik Tujuan Akhir
            </label>
            <select
              value={destId}
              onChange={(e) => setDestId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500 font-semibold truncate transition"
            >
              <option value="">Pilih stasiun tujuan...</option>
              {stations.map((st) => (
                <option key={`dest-${st.id}`} value={st.id}>
                  {st.name} ({st.operator})
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loadingRoute}
            className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 font-black text-white py-2 rounded-xl text-xs transition shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {loadingRoute ? (
              <span>Menghitung Rute Spasial...</span>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Hitung Rekomendasi Rute</span>
              </>
            )}
          </button>
        </form>

        {/* Trip Metrics */}
        <div className="grid grid-cols-3 gap-1.5 pt-1 text-center">
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/50">
            <span className="text-[8px] text-slate-400 block font-bold uppercase">Jarak</span>
            <span className="text-xs font-black text-emerald-400 font-mono">{distanceKm != null ? `${distanceKm} km` : '—'}</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/50">
            <span className="text-[8px] text-slate-400 block font-bold uppercase">Waktu</span>
            <span className="text-xs font-black text-amber-400 font-mono">{durationMin != null ? `~${durationMin} mnt` : '—'}</span>
          </div>
          <div className="bg-slate-900/80 p-2 rounded-xl border border-slate-700/50">
            <span className="text-[8px] text-slate-400 block font-bold uppercase">Tarif</span>
            <span className="text-xs font-black text-cyan-400 font-mono">{totalFare != null ? `Rp ${Number(totalFare).toLocaleString('id-ID')}` : '—'}</span>
          </div>
        </div>
      </div>

      {/* ── 2. Journey Timeline (Central Hub PRD) ──────────── */}
      <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-3.5 space-y-2.5 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-indigo-500/20 text-indigo-400 rounded-lg">
              <Compass className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white">Journey Timeline Hub</h4>
              <p className="text-[9px] text-slate-400">Pengendali Konteks & Widget Aktif</p>
            </div>
          </div>
          <span className="text-[9px] font-bold text-indigo-300 bg-indigo-950/80 border border-indigo-500/30 px-2 py-0.5 rounded-lg">
            Tahap {currentStageId} dari 4
          </span>
        </div>

        {/* 4-Stage Interactive Selector */}
        <div className="grid grid-cols-2 gap-1.5">
          {JOURNEY_STAGES.map((st) => {
            const isActive = st.id === currentStageId;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setCurrentStageId(st.id)}
                className={`p-2 rounded-xl border text-left transition flex flex-col justify-between ${
                  isActive
                    ? 'bg-gradient-to-br from-indigo-950/90 to-slate-900 border-indigo-500 text-white shadow-md shadow-indigo-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <span className={`text-[10px] font-black ${isActive ? 'text-indigo-300' : 'text-slate-300'}`}>
                    {st.title}
                  </span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />}
                </div>
                <span className="text-[8px] text-slate-500">{st.subtitle}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. DYNAMIC ACTIVE WIDGET (Contextual Based on Stage) ── */}

      {/* WIDGET 1: BOARDING RECOMMENDATION (Tahap 1: Sebelum Naik) */}
      {currentStageId === 1 && (
        <div className="bg-slate-800/90 border border-emerald-500/40 rounded-2xl p-3.5 space-y-3 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-emerald-500/20 text-emerald-400 rounded-lg">
                <Train className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-white">Boarding Recommendation</span>
            </div>
            <span className="text-[10px] font-black text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 rounded-lg">
              {boardingRec?.recommended_car || 'Data unavailable'}
            </span>
          </div>

          <div className="p-2.5 bg-emerald-950/40 border border-emerald-800/40 rounded-xl space-y-1.5">
            <p className="text-[11px] text-emerald-200 font-semibold leading-relaxed">
              💡 <strong>Rekomendasi Cerdas:</strong> {boardingRec?.reason || 'Rekomendasi boarding belum tersedia untuk rute ini.'}
            </p>
            <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-emerald-800/30">
              <span>Metode: <strong>{boardingRec?.analysis_method || 'Unavailable'}</strong></span>
              <span>Waktu Jalan: <strong>{boardingRec?.walking_time_seconds != null ? `~${boardingRec.walking_time_seconds} detik` : '—'}</strong></span>
            </div>
          </div>

          {/* 12-Car Visualizer with Tooltip */}
          <div>
            <div className="flex items-center justify-between text-[9px] text-slate-400 mb-1.5">
              <span>Rangkaian Kereta (12 Gerbong)</span>
              <span className="text-emerald-400 font-bold">{boardingRec?.recommended_car ? 'Rekomendasi tersedia' : 'Belum ada rekomendasi'}</span>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
              {trainCars.map((car) => {
                const isRec = Boolean(boardingRec?.recommended_car && String(boardingRec.recommended_car).includes(String(car)));
                return (
                  <div
                    key={car}
                    className={`shrink-0 flex flex-col items-center justify-center w-6 h-8 rounded-lg text-center transition ${
                      isRec
                        ? 'bg-emerald-500 text-white font-black shadow-md shadow-emerald-500/40 scale-105 border border-emerald-300'
                        : 'bg-slate-900/90 border border-slate-700 text-slate-400 text-[9px]'
                    }`}
                  >
                    <span className="text-[9px] leading-none">{car}</span>
                    {isRec && <span className="text-[6px] block font-bold leading-none mt-0.5">TOP</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* WIDGET 2: JOURNEY MONITORING (Tahap 2: Di Kendaraan) */}
      {currentStageId === 2 && (
        <div className="bg-slate-800/90 border border-sky-500/40 rounded-2xl p-3.5 space-y-3 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-sky-500/20 text-sky-400 rounded-lg">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <span className="text-xs font-black text-white">Journey Monitoring</span>
            </div>
            <span className="text-[9px] bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded-lg font-bold">
              {monitoring?.status || 'unavailable'}
            </span>
          </div>

          <div className="space-y-2">
            <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] text-slate-400">Status Operasional Jalur</p>
                <p className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                  <span className={`w-2 h-2 rounded-full inline-block ${monitoring?.status === 'live' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  {monitoring?.status_label || 'Realtime unavailable'}
                </p>
              </div>
              <span className="text-[9px] text-slate-500">{monitoring?.delay_seconds != null ? `${monitoring.delay_seconds}s` : 'Delay unavailable'}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl">
                <p className="text-[9px] text-slate-400 flex items-center gap-1">
                  <CloudSun className="w-3 h-3 text-amber-400" /> Cuaca BMKG
                </p>
                <p className="text-xs font-bold text-slate-200 mt-0.5">Data cuaca unavailable</p>
              </div>
              <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl">
                <p className="text-[9px] text-slate-400">Kepadatan Gerbong</p>
                <p className="text-xs font-bold text-slate-400 mt-0.5">Data occupancy unavailable</p>
              </div>
            </div>

            {/* Explainable note */}
            <p className="text-[9px] text-slate-400 italic">
              {monitoring?.last_synced_at ? `Sinkron terakhir ${monitoring.last_synced_at}.` : 'GTFS Realtime belum terhubung; tidak ada angka simulasi yang ditampilkan.'}
            </p>
          </div>
        </div>
      )}

      {/* WIDGET 3: TRANSFER ASSISTANT (Tahap 3: Berpindah Moda) */}
      {currentStageId === 3 && (
        <div className="bg-slate-800/90 border border-amber-500/40 rounded-2xl p-3.5 space-y-3 shadow-xl animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-amber-500/20 text-amber-400 rounded-lg">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-black text-white">Transit Inter-Moda Assistant</span>
            </div>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-lg font-bold">
              {intelObj?.transfer_assistant?.status || 'unavailable'}
            </span>
          </div>

          <div className="space-y-2">
            {intelObj?.transfer_assistant?.instructions?.length ? intelObj.transfer_assistant.instructions.map((instruction, index) => (
              <div key={`${instruction}-${index}`} className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl flex items-start gap-2">
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center text-[9px] font-black shrink-0">{index + 1}</span>
                <span className="text-[10px] text-slate-300">{instruction}</span>
              </div>
            )) : (
              <p className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-[10px] text-slate-400">
                Data transfer antarmoda belum tersedia untuk rute ini.
              </p>
            )}
          </div>
        </div>
      )}

      {/* WIDGET 4: ARRIVAL REMINDER & EXIT REC (Tahap 4: Mendekati Tujuan) */}
      {currentStageId === 4 && (
        <div className="space-y-3 animate-fade-in">
          {/* Arrival Reminder Alert Card */}
          <div className="bg-gradient-to-r from-red-950/70 via-purple-950/70 to-slate-900 border border-red-500/50 rounded-2xl p-3.5 space-y-2 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-red-500 text-white rounded-xl animate-bounce">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Arrival Reminder</h4>
                  <p className="text-[9px] text-red-200">{arrivalRem?.status || 'unavailable'}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-black text-red-400 bg-red-950 px-2 py-0.5 rounded border border-red-700">
                {arrivalRem?.distance_meters != null ? `${arrivalRem.distance_meters}m` : '—'}
              </span>
            </div>

            <p className="text-[11px] text-slate-200 font-medium leading-tight">
              🔔 <strong>{arrivalRem?.message || 'Data posisi kendaraan belum tersedia.'}</strong>
            </p>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[9px] text-slate-400">{arrivalRem?.data_source || 'GTFS_RT_UNAVAILABLE'}</span>
              <button
                type="button"
                onClick={() => setReminderActive(!reminderActive)}
                className={`text-[9px] font-black px-2 py-0.5 rounded transition cursor-pointer ${
                  reminderActive ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {reminderActive ? 'ALARM HIDUP' : 'DIMATIKAN'}
              </button>
            </div>
          </div>

          {/* Exit Recommendation Card */}
          <div className="bg-slate-800/90 border border-purple-500/40 rounded-2xl p-3.5 space-y-2.5 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1 bg-purple-500/20 text-purple-400 rounded-lg">
                  <DoorOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-black text-white">Exit Gate Recommendation</span>
              </div>
              <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2 py-0.5 rounded-lg font-bold">
                {exitRec?.recommended_exit || 'Exit unavailable'}
              </span>
            </div>

            <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  {exitRec?.target_street || 'Target coordinates unavailable'}
                </span>
                <span className="text-[8px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold border border-emerald-500/30">
                  {exitRec?.is_accessible ? '♿ Aksesibel' : 'Aksesibilitas unavailable'}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-relaxed">
                {exitRec?.reason || 'Sistem belum dapat menghitung rekomendasi exit tanpa target koordinat dan data pintu keluar.'}
              </p>
              <div className="text-[9px] text-slate-400 pt-1 border-t border-slate-800 flex justify-between">
                <span>Metode: {exitRec?.analysis_method || 'Unavailable'}</span>
                <span>Akses: {exitRec?.is_accessible == null ? 'Unavailable' : (exitRec.is_accessible ? 'Accessible' : 'Not accessible')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 4. Explainability First Card (PRD Principle 1) ──── */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400">
          <Sparkles className="w-3 h-3" />
          <span>Explainability & Provenance Data</span>
        </div>
        <p className="text-[9px] text-slate-400 leading-relaxed">
          Semua rekomendasi dihitung oleh <strong>Transit Intelligence Engine</strong> menggunakan <em>Rule-Based Spatial Analysis</em> (Proximity, Nearest Facility, Spatial Relationship, Network Analysis). Data bersumber dari <strong>GEO MAPID, GTFS Realtime, & Community Reports</strong>.
        </p>
        <div className="text-[8px] text-slate-500 pt-0.5 flex items-center justify-between">
          <span>Pembaruan Terakhir: {routeObj?.last_updated || 'Unavailable'}</span>
          <span>Bukan LLM / Chatbot (100% Explainable)</span>
        </div>
      </div>

    </div>
  );
}
