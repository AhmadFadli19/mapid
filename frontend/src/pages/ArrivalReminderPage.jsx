import React, { useState } from 'react';
import { Bell, Volume2, Smartphone, ShieldAlert, Check } from 'lucide-react';

export default function ArrivalReminderPage() {
  const [stationName, setStationName] = useState('Stasiun Bundaran HI');
  const [distance, setDistance] = useState(500);
  const [active, setActive] = useState(false);
  const [notifyType, setNotifyType] = useState('both');

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex items-center gap-4">
        <div className="p-3 bg-red-600/20 text-red-400 rounded-2xl border border-red-500/30">
          <Bell className="w-6 h-6 animate-bounce" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Arrival Reminder & Alert System</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Sistem pengingat cerdas agar Anda tidak terlewat stasiun tujuan saat tertidur atau sibuk di dalam transportasi umum.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto bg-slate-800/90 border border-slate-700/80 p-8 rounded-3xl shadow-xl space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">Stasiun Tujuan Pengingat</label>
            <input
              type="text"
              value={stationName}
              onChange={(e) => setStationName(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Jarak Pemicu Pengingat (Trigger Distance): <span className="text-red-400 font-mono font-bold">{distance} Meter</span>
            </label>
            <input
              type="range"
              min="200"
              max="1500"
              step="100"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full accent-red-500 bg-slate-900 rounded-lg cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">Mode Notifikasi</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNotifyType('both')}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  notifyType === 'both'
                    ? 'bg-red-600/20 border-red-500 text-red-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <Volume2 className="w-4 h-4" /> Suara & Getar
              </button>
              <button
                type="button"
                onClick={() => setNotifyType('vibrate')}
                className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                  notifyType === 'vibrate'
                    ? 'bg-red-600/20 border-red-500 text-red-300'
                    : 'bg-slate-900 border-slate-700 text-slate-400'
                }`}
              >
                <Smartphone className="w-4 h-4" /> Getar Saja (Quiet)
              </button>
            </div>
          </div>

          <button
            onClick={() => setActive(!active)}
            className={`w-full font-bold py-3.5 rounded-2xl text-xs transition shadow-lg flex items-center justify-center gap-2 ${
              active
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/30'
            }`}
          >
            {active ? (
              <><Check className="w-4 h-4" /> Arrival Reminder Aktif! (Klik untuk Mematikan)</>
            ) : (
              <><Bell className="w-4 h-4" /> Aktifkan Alarm Pengingat Kedatangan</>
            )}
          </button>
        </div>

        {active && (
          <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-2xl text-center space-y-2 animate-pulse">
            <h4 className="text-sm font-bold text-red-400">Pengingat Kedatangan Sedang Memantau GPS</h4>
            <p className="text-xs text-slate-300">
              Notifikasi akan berbunyi otomatis saat jarak kendaraan ke <strong>{stationName}</strong> kurang dari {distance}m.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
