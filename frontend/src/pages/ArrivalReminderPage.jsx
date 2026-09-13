import React, { useEffect, useState } from 'react';
import { Bell, CircleAlert, MapPin, Radio, RefreshCw } from 'lucide-react';
import api from '../services/api';

function unwrap(payload) {
  return payload?.data?.data || payload?.data || payload;
}

export default function ArrivalReminderPage() {
  const [journey, setJourney] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const loadJourney = async () => {
    const journeyId = window.localStorage.getItem('pandu_journey_id') || window.sessionStorage.getItem('pandu_journey_id');
    if (!journeyId) {
      setJourney(null);
      setError('Belum ada perjalanan tersimpan. Buat rute terlebih dahulu untuk mengaktifkan pemantauan.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/v1/journeys/${journeyId}`);
      setJourney(unwrap(response.data));
      setError('');
    } catch (requestError) {
      setError(requestError?.response?.data?.message || 'Data perjalanan belum dapat dimuat.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJourney();
    const interval = window.setInterval(loadJourney, 15000);
    return () => window.clearInterval(interval);
  }, []);

  const monitoring = journey?.transit_intelligence?.journey_monitoring;
  const reminder = journey?.transit_intelligence?.arrival_reminder;
  const isLive = monitoring?.status === 'live';
  const distance = reminder?.distance_meters;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 md:p-6 pb-16 text-slate-100 font-sans">
      <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-rose-600/20 text-rose-400 rounded-2xl border border-rose-500/30">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Arrival Reminder</h1>
            <p className="text-xs text-slate-400 mt-0.5">Pemantauan tujuan berdasarkan posisi armada GTFS Realtime yang tersedia.</p>
          </div>
        </div>
        <span className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${isLive ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' : 'bg-slate-900 border border-slate-700 text-slate-400'}`}>
          <Radio className="w-3.5 h-3.5" /> {isLive ? 'Live' : monitoring?.status || 'Unavailable'}
        </span>
      </div>

      <div className="bg-rose-950/20 border border-rose-800/40 rounded-2xl p-4 flex items-start gap-3">
        <CircleAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div className="text-xs text-rose-200 leading-relaxed">
          <p className="font-bold">Status data perjalanan</p>
          <p className="text-[11px] text-rose-300/90 mt-1">{error || monitoring?.status_label || 'Belum ada status monitoring.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2"><MapPin className="w-4 h-4 text-rose-400" /> Perjalanan aktif</h2>
            <button type="button" onClick={loadJourney} disabled={loading} className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white disabled:opacity-50" aria-label="Muat ulang">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Rute</p>
            <p className="text-sm font-bold text-white mt-1">{journey?.route?.origin?.name || 'Asal unavailable'} → {journey?.route?.destination?.name || 'Tujuan unavailable'}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3"><span className="text-slate-500 block">Status</span><strong className="text-slate-200">{journey?.status || 'Unavailable'}</strong></div>
            <div className="bg-slate-900 border border-slate-700 rounded-xl p-3"><span className="text-slate-500 block">Sumber</span><strong className="text-slate-200">{journey?.data_source || 'Unavailable'}</strong></div>
          </div>
        </section>

        <section className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-xs font-black text-white uppercase tracking-wider border-b border-slate-700/70 pb-3">Arrival signal</h2>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-center">
            <p className="text-[10px] text-slate-500 uppercase">Jarak armada ke tujuan</p>
            <p className="text-3xl font-mono font-black text-white mt-2">{distance != null ? `${distance}m` : '—'}</p>
            <p className="text-xs text-slate-400 mt-2">{reminder?.message || 'Data posisi armada belum tersedia.'}</p>
          </div>
          <p className="text-[10px] text-slate-500">{reminder?.data_source || 'GTFS_RT_UNAVAILABLE'} · {journey?.last_synced_at || 'timestamp unavailable'}</p>
        </section>
      </div>
    </div>
  );
}
