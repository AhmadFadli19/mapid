import React from 'react';
import { ShieldCheck, Compass, Info, DoorOpen, Bell, Activity } from 'lucide-react';

export default function TransitIntelligencePanel({ station, routeInfo }) {
  if (!station && !routeInfo) {
    return (
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 text-slate-300 p-5 rounded-2xl">
        <div className="flex items-center gap-2 font-bold text-blue-400 mb-2">
          <Compass className="w-5 h-5" /> Transit Intelligence Engine
        </div>
        <p className="text-xs text-slate-400">
          Pilih stasiun atau rencanakan rute di atas untuk melihat rekomendasi posisi gerbong, reminder transit, dan status fasilitas real-time.
        </p>
      </div>
    );
  }

  const monitoring = routeInfo?.transit_intelligence?.journey_monitoring;
  const monitoringStatus = monitoring?.status || 'unavailable';
  const arrivalReminder = routeInfo?.transit_intelligence?.arrival_reminder;
  const transferAssistant = routeInfo?.transit_intelligence?.transfer_assistant;

  return (
    <div className="bg-slate-800/90 backdrop-blur border border-slate-700/80 text-slate-100 p-5 rounded-2xl space-y-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
        <div className="flex items-center gap-2.5 font-bold text-blue-400 text-sm">
          <Compass className="w-5 h-5" /> Transit Intelligence Recommendations
        </div>
        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${monitoringStatus === 'live' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-slate-700/60 text-slate-300 border border-slate-600'}`}>
          <Activity className={`w-3 h-3 ${monitoringStatus === 'live' ? 'animate-pulse' : ''}`} /> {monitoringStatus === 'live' ? 'Live' : monitoringStatus === 'stale' ? 'Stale' : 'Unavailable'}
        </span>
      </div>

      {/* Boarding Recommendation */}
      {station?.boarding_recommendation && (
        <div className="bg-blue-950/40 border border-blue-800/40 p-4 rounded-xl space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
              <DoorOpen className="w-4 h-4 text-blue-400" /> Rekomendasi Pintu / Gerbong Naik
            </span>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md font-bold">
              {station.boarding_recommendation.recommended_car}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            {station.boarding_recommendation.reason}
          </p>
          <div className="text-[11px] text-slate-400 pt-1 flex justify-between">
            <span>Pintu Keluar Terdekat: <strong>{station.boarding_recommendation.nearest_exit}</strong></span>
            <span>Est. Jalan: ~{station.boarding_recommendation.walking_time_seconds}s</span>
          </div>
        </div>
      )}

      {/* Route & Arrival Reminder */}
      {routeInfo?.transit_intelligence && (
        <div className="space-y-3">
          {/* Arrival Reminder */}
          <div className="bg-amber-950/30 border border-amber-800/40 p-3.5 rounded-xl flex items-start gap-3">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-300">Arrival Reminder</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                {arrivalReminder?.message || 'Arrival reminder unavailable karena data posisi realtime belum tersedia.'}
              </p>
            </div>
          </div>

          {/* Transfer Assistant */}
          <div className="bg-slate-900/60 border border-slate-700/60 p-3.5 rounded-xl space-y-2">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Transfer Assistant Steps
            </h4>
            <ul className="space-y-1.5 pl-1">
              {(transferAssistant?.instructions || []).map((step, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0"></span>
                  {step}
                </li>
              ))}
              {!transferAssistant?.instructions?.length && <li className="text-xs text-slate-400">Data transfer belum tersedia untuk rute ini.</li>}
            </ul>
          </div>
        </div>
      )}

      {/* Facilities & POI List */}
      {station?.facilities && station.facilities.length > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
            <Info className="w-4 h-4 text-blue-400" /> Facility Profile & Live Status
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {station.facilities.map((fac) => (
              <div key={fac.id} className="bg-slate-900/80 border border-slate-700/50 p-2.5 rounded-xl flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-slate-200">{fac.name}</h5>
                  <p className="text-[10px] text-slate-400">{fac.floor} • {fac.category}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  fac.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  fac.status === 'Maintenance' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                  'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {fac.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
