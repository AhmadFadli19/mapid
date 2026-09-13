import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Navigation, Clock, CreditCard, ArrowRight, DoorOpen, Bell, ShieldCheck, Footprints, Zap } from 'lucide-react';

export default function RoutePlannerPage() {
  const [stations, setStations] = useState([]);
  const [originId, setOriginId] = useState('');
  const [destId, setDestId] = useState('');
  const [routeData, setRouteData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      const data = res.data?.data || [];
      if (data.length > 0) {
        setStations(data);
      }
    } catch (err) {
      console.error('Fetch stations failed:', err);
    }
  };

  const handlePlanRoute = async (e) => {
    if (e) e.preventDefault();
    if (!originId || !destId) return;

    setLoading(true);
    try {
      const res = await api.get(`/v1/route/plan?origin_id=${originId}&destination_id=${destId}`);
      if (res.data) {
        setRouteData(res.data);
      }
    } catch (err) {
      console.error('Route plan failed:', err);
    } finally {
      setLoading(false);
    }
  };

  // Safely extract routeObj and transitIntel
  const routeObj = routeData?.data?.route || routeData?.route;
  const transitIntel = routeData?.data?.transit_intelligence || routeData?.transit_intelligence;
  const boardingRec = transitIntel?.boarding_recommendation;

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-12 text-slate-100 font-sans">

      {/* Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex items-center gap-4">
        <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
          <Navigation className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Smart Route Planning & Overview</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Fitur perencanaan perjalanan cerdas lengkap dengan estimasi tarif, waktu tempuh, dan urutan tahapan transit.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Selector */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" /> Pilih Asal & Tujuan Rute
          </h2>

          <form onSubmit={handlePlanRoute} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1.5">📍 Stasiun / Halte Asal</label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="">Pilih stasiun asal...</option>
                {stations.map((st) => (
                  <option key={`orig-${st.id}`} value={st.id}>{st.name} ({st.operator})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-cyan-400 mb-1.5">🎯 Stasiun / Halte Tujuan</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-cyan-500 font-semibold"
              >
                <option value="">Pilih stasiun tujuan...</option>
                {stations.map((st) => (
                  <option key={`dest-${st.id}`} value={st.id}>{st.name} ({st.operator})</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 font-bold text-white py-3.5 rounded-2xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Menghitung Rute Cerdas...' : <><Navigation className="w-4 h-4" /> Hitung Rute Cerdas</>}
            </button>
          </form>
        </div>

        {/* Route Details Output */}
        <div className="lg:col-span-7 space-y-6">
          {routeObj ? (
            <>
              {/* Trip Summary Card */}
              <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/70 pb-4">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-base text-white">{routeObj.origin?.name || 'Halte Asal'}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                    <span className="font-black text-base text-white">{routeObj.destination?.name || 'Halte Tujuan'}</span>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold border border-emerald-500/30">
                    Rekomendasi Terbaik
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-700/50 flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Jarak Spasial</p>
                      <p className="text-xs font-bold text-slate-100">{routeObj.distance_km != null ? `${routeObj.distance_km} km` : 'Unavailable'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-700/50 flex items-center gap-2.5">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Estimasi Waktu</p>
                      <p className="text-xs font-bold text-slate-100">{routeObj.estimated_duration_minutes != null ? `${routeObj.estimated_duration_minutes} Menit` : 'Unavailable'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-700/50 flex items-center gap-2.5">
                    <div className="p-2 bg-cyan-500/20 text-cyan-400 rounded-xl">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Estimasi Tarif</p>
                      <p className="text-xs font-bold text-slate-100">{routeObj.total_fare != null ? `Rp ${Number(routeObj.total_fare).toLocaleString('id-ID')}` : 'Unavailable'}</p>
                    </div>
                  </div>
                </div>

                {boardingRec && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl flex items-center gap-3">
                    <div className="p-2 bg-emerald-500 text-white rounded-xl font-black text-xs">
                      🚆 Boarding
                    </div>
                    <div>
                      <p className="text-xs font-bold text-emerald-300">Posisi: {boardingRec.recommended_car}</p>
                      <p className="text-[10px] text-slate-300">{boardingRec.reason}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 9-Stage User Journey Stepper */}
              <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-emerald-400" /> 9-Stage User Journey Stepper
                </h3>

                <div className="space-y-4 border-l-2 border-slate-700 pl-4 ml-2">
                  {routeObj.stepper_timeline?.map((stepItem, idx) => (
                    <div key={idx} className="relative">
                      <span className={`absolute -left-[23px] top-1 w-3 h-3 rounded-full ${
                        idx === 0 ? 'bg-blue-500' : idx === 3 ? 'bg-amber-500' : idx === 8 ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}></span>
                      <h4 className="text-xs font-bold text-slate-200">{stepItem.title}</h4>
                      <p className="text-[11px] text-slate-400">{stepItem.instruction}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/60 p-8 rounded-3xl text-center text-xs text-slate-400 space-y-2">
              <Navigation className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
              <p className="font-bold text-slate-300">Belum ada rute dihitung.</p>
              <p>Pilih stasiun asal dan tujuan di sebelah kiri lalu klik "Hitung Rute Cerdas".</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
