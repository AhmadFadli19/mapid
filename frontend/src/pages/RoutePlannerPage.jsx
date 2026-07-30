import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Navigation, Clock, CreditCard, ArrowRight, DoorOpen, Bell, ShieldCheck, Footprints } from 'lucide-react';

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
      if (res.data?.data) {
        setStations(res.data.data);
        if (res.data.data.length > 1) {
          setOriginId(res.data.data[0].id);
          setDestId(res.data.data[1].id);
        }
      }
    } catch (err) {
      console.error('Fetch stations failed:', err);
    }
  };

  const handlePlanRoute = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.get(`/route/plan?origin_id=${originId}&destination_id=${destId}`);
      setRouteData(res.data);
    } catch (err) {
      console.error('Route plan failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex items-center gap-4">
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
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Pilih Asal & Tujuan
          </h2>

          <form onSubmit={handlePlanRoute} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Stasiun / Halte Asal</label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {stations.map((st) => (
                  <option key={`orig-${st.id}`} value={st.id}>{st.name} ({st.operator})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Stasiun / Halte Tujuan</label>
              <select
                value={destId}
                onChange={(e) => setDestId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {stations.map((st) => (
                  <option key={`dest-${st.id}`} value={st.id}>{st.name} ({st.operator})</option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-500 font-bold text-white py-3 rounded-2xl text-xs transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
            >
              {loading ? 'Menghitung Rute...' : <><Navigation className="w-4 h-4" /> Hitung Rute Cerdas</>}
            </button>
          </form>
        </div>

        {/* Route Details Output */}
        <div className="lg:col-span-7 space-y-6">
          {routeData ? (
            <>
              {/* Trip Summary Card */}
              <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-700/70 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-base text-white">{routeData.route.origin?.name}</span>
                    <ArrowRight className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-base text-white">{routeData.route.destination?.name}</span>
                  </div>
                  <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full font-bold border border-emerald-500/30">
                    Rekomendasi Terbaik
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/50 flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Estimasi Waktu</p>
                      <p className="text-sm font-bold text-slate-100">{routeData.route.estimated_duration_minutes} Menit</p>
                    </div>
                  </div>

                  <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-700/50 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400">Estimasi Tarif</p>
                      <p className="text-sm font-bold text-slate-100">Rp {routeData.route.total_fare.toLocaleString('id-ID')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Journey Timeline */}
              <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Footprints className="w-4 h-4 text-blue-400" /> Journey Overview Steps
                </h3>

                <div className="space-y-4 border-l-2 border-slate-700 pl-4 ml-2">
                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-blue-500"></span>
                    <h4 className="text-xs font-bold text-slate-200">Masuk Stasiun Asal: {routeData.route.origin?.name}</h4>
                    <p className="text-[11px] text-slate-400">Operator: {routeData.route.origin?.operator}</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-amber-500"></span>
                    <h4 className="text-xs font-bold text-slate-200">Naik Kereta (Boarding Recommendation)</h4>
                    <p className="text-[11px] text-slate-300 mt-0.5">
                      Gunakan: <strong className="text-amber-400">{routeData.transit_intelligence.boarding_recommendation.recommended_car}</strong>
                    </p>
                    <p className="text-[10px] text-slate-400">{routeData.transit_intelligence.boarding_recommendation.reason}</p>
                  </div>

                  <div className="relative">
                    <span className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-emerald-500"></span>
                    <h4 className="text-xs font-bold text-slate-200">Tiba di Tujuan: {routeData.route.destination?.name}</h4>
                    <p className="text-[11px] text-emerald-400">{routeData.transit_intelligence.arrival_reminder.message}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/60 p-8 rounded-3xl text-center text-xs text-slate-400">
              Pilih stasiun asal dan tujuan di sebelah kiri lalu klik "Hitung Rute Cerdas".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
