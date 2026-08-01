import React, { useState } from 'react';
import {
  Building2, Wifi, Wind, Toilet, Coffee, MapPin,
  ThumbsUp, ThumbsDown, Plus, AlertTriangle, CheckCircle,
  XCircle, Clock, MessageSquare, ChevronRight
} from 'lucide-react';

const facilities = [
  { id: 1, name: 'Lift / Elevator', location: 'Lantai 1 - 2', status: 'working', statusLabel: 'Berfungsi' },
  { id: 2, name: 'Eskalator Naik', location: 'Pintu A, Lantai 1', status: 'repair', statusLabel: 'Dalam Perbaikan' },
  { id: 3, name: 'Eskalator Turun', location: 'Pintu B, Lantai 1', status: 'working', statusLabel: 'Berfungsi' },
  { id: 4, name: 'Toilet Umum', location: 'Peron Lt. 2', status: 'working', statusLabel: 'Berfungsi' },
  { id: 5, name: 'Musholla', location: 'Lantai 2', status: 'working', statusLabel: 'Berfungsi' },
  { id: 6, name: 'Wi-Fi Gratis', location: 'Seluruh Area', status: 'working', statusLabel: 'Aktif' },
];

const nearbyFacilities = [
  { id: 1, icon: '🚻', name: 'Toilet Umum', distance: '20m', floor: 'Lt. 1', dir: 'Dekat Peron 3' },
  { id: 2, icon: '🙏', name: 'Musholla / Prayer Room', distance: '35m', floor: 'Lt. 2', dir: 'Tangga A' },
  { id: 3, icon: '☕', name: 'Kopi Kenangan', distance: '45m', floor: 'Lt. 1', dir: 'Area Konkon' },
  { id: 4, icon: '🏧', name: 'ATM BCA', distance: '60m', floor: 'Lt. 1', dir: 'Pintu Exit A' },
];

const communityReports = [
  {
    id: 1,
    type: 'warning',
    message: 'Eskalator B2 sedang dalam perbaikan sejak tadi pagi, gunakan lift atau tangga manual.',
    user: 'RajaKRL',
    time: '10 mnt lalu',
    upvotes: 24,
    downvotes: 1,
    userUpvoted: false,
  },
  {
    id: 2,
    type: 'info',
    message: 'Peron 3 agak padat, disarankan masuk lewat gerbong paling depan (Gerbong 1-2) untuk menghindari kerumunan.',
    user: 'CommuterHero',
    time: '23 mnt lalu',
    upvotes: 18,
    downvotes: 3,
    userUpvoted: true,
  },
  {
    id: 3,
    type: 'ok',
    message: 'Toilet lantai 2 sudah bersih dan terawat. Antrian normal.',
    user: 'KRLPejuang',
    time: '1 jam lalu',
    upvotes: 9,
    downvotes: 0,
    userUpvoted: false,
  },
];

const StatusIcon = ({ status }) => {
  if (status === 'working') return <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />;
  if (status === 'repair') return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
  return <XCircle className="w-3.5 h-3.5 text-red-400" />;
};

export default function StationContextPanel({
  selectedStation,
  stationRoutes,
  loadingRoutes,
  selectedRouteId,
  onSelectRoute
}) {
  const [reports, setReports] = useState(communityReports);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleVote = (id, type) => {
    setReports(prev => prev.map(r => {
      if (r.id !== id) return r;
      if (type === 'up') {
        return { ...r, upvotes: r.userUpvoted ? r.upvotes - 1 : r.upvotes + 1, userUpvoted: !r.userUpvoted };
      }
      return r;
    }));
  };

  const reportTypeColor = (type) => {
    if (type === 'warning') return 'border-l-amber-500 bg-amber-500/5';
    if (type === 'ok') return 'border-l-emerald-500 bg-emerald-500/5';
    return 'border-l-cyan-500 bg-cyan-500/5';
  };

  const reportTypeIcon = (type) => {
    if (type === 'warning') return '⚠️';
    if (type === 'ok') return '✅';
    return 'ℹ️';
  };

  // Use real station data if available, fallback to demo
  const stationName = selectedStation?.name || 'Stasiun Sudirman';
  const stationCode = selectedStation?.code || 'SDR';
  const stationOperator = selectedStation?.operator || 'KRL Commuter Line';
  const stationAddress = selectedStation?.address || 'Jl. Jend. Sudirman';
  const apiFacilities = selectedStation?.facilities;

  return (
    <div className="space-y-3 pb-4">

      {/* Station Profile Card */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-full border"
                style={{
                  background: `${selectedStation?.line_color || '#0891b2'}22`,
                  color: selectedStation?.line_color || '#06b6d4',
                  borderColor: `${selectedStation?.line_color || '#0891b2'}55`,
                }}
              >
                {stationOperator}
              </span>
            </div>
            <h2 className="text-sm font-black text-white">{stationName}</h2>
            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-red-400" />
              {stationAddress}
            </p>
          </div>
          <div className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-2 text-center shrink-0">
            <p className="text-[8px] text-slate-500">Kode</p>
            <p className="text-sm font-mono font-black text-emerald-400">{stationCode}</p>
          </div>
        </div>

        {/* Facility Status List — real API data OR fallback demo */}
        <div className="space-y-1.5">
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Status Fasilitas</p>
          {(apiFacilities && apiFacilities.length > 0 ? apiFacilities.map(fac => ({
            id: fac.id,
            name: fac.name,
            location: `${fac.floor} • ${fac.category}`,
            status: fac.status === 'Available' ? 'working' : fac.status === 'Maintenance' ? 'repair' : 'down',
            statusLabel: fac.status === 'Available' ? 'Berfungsi' : fac.status === 'Maintenance' ? 'Perbaikan' : 'Tidak Aktif',
          })) : facilities).map((fac) => (
            <div key={fac.id} className="flex items-center justify-between py-1.5 border-b border-slate-700/30 last:border-0">
              <div className="flex items-center gap-2">
                <StatusIcon status={fac.status} />
                <div>
                  <p className="text-[10px] font-semibold text-slate-200">{fac.name}</p>
                  <p className="text-[9px] text-slate-500">{fac.location}</p>
                </div>
              </div>
              <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                fac.status === 'working' ? 'bg-emerald-500/15 text-emerald-400' :
                fac.status === 'repair' ? 'bg-amber-500/15 text-amber-400' :
                'bg-red-500/15 text-red-400'
              }`}>
                {fac.statusLabel}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* TransJakarta Routes Passing Card */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">🚌</span>
            <div>
              <h3 className="text-xs font-bold text-slate-200">Rute TJ Melintas</h3>
              <p className="text-[9px] text-slate-400">Rute bus & mikrotrans di halte ini</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
            {loadingRoutes ? '...' : `${stationRoutes?.routes?.length || 0} Rute`}
          </span>
        </div>

        {/* Selected Route filter reset button */}
        {selectedRouteId && (
          <div className="flex items-center justify-between bg-orange-950/40 border border-orange-500/40 rounded-xl px-2.5 py-1.5 text-[10px]">
            <span className="text-orange-300 font-semibold">Difilter: Rute {selectedRouteId}</span>
            <button
              onClick={() => onSelectRoute && onSelectRoute(null)}
              className="text-orange-400 font-bold hover:underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

        {loadingRoutes ? (
          <div className="py-4 text-center text-xs text-slate-500 animate-pulse">
            Memuat rute melintas...
          </div>
        ) : stationRoutes?.routes && stationRoutes.routes.length > 0 ? (
          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {stationRoutes.routes.map((r) => {
              const isSelected = selectedRouteId === r.route_id;
              const routeColor = r.route_color || '#ea580c';
              return (
                <div
                  key={r.route_id}
                  onClick={() => onSelectRoute && onSelectRoute(isSelected ? null : r.route_id)}
                  className={`flex items-center justify-between p-2 rounded-xl border transition cursor-pointer ${
                    isSelected
                      ? 'bg-slate-700/80 border-orange-500 shadow-md ring-1 ring-orange-500/50'
                      : 'bg-slate-900/60 border-slate-700/40 hover:bg-slate-700/40'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="text-[10px] font-black px-2 py-0.5 rounded-lg shrink-0"
                      style={{
                        backgroundColor: routeColor,
                        color: r.route_text_color || '#ffffff',
                      }}
                    >
                      {r.route_short_name || r.route_id}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] font-bold text-slate-200 truncate">
                        {r.route_long_name}
                      </p>
                      <p className="text-[8px] text-slate-400">
                        {r.agency_id || 'TransJakarta'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className={`w-3.5 h-3.5 shrink-0 transition ${isSelected ? 'text-orange-400 rotate-90' : 'text-slate-600'}`} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-3 text-center text-[10px] text-slate-500">
            Tidak ada data rute TJ langsung di stasiun ini.
          </div>
        )}
      </div>


      {/* Nearby Facilities */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 space-y-2.5">
        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fasilitas Terdekat</p>
        <div className="space-y-1.5">
          {nearbyFacilities.map((fac) => (
            <div key={fac.id} className="flex items-center gap-2.5 py-1.5 hover:bg-slate-700/30 rounded-lg px-1 cursor-pointer transition group">
              <span className="text-base leading-none">{fac.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-semibold text-slate-200 truncate">{fac.name}</p>
                <p className="text-[9px] text-slate-500">{fac.floor} • {fac.dir}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] font-bold text-cyan-400">{fac.distance}</span>
                <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition mt-0.5 ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Community Reports Feed */}
      <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            <p className="text-xs font-bold text-slate-200">Laporan Komunitas</p>
          </div>
          <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live
          </span>
        </div>

        <div className="space-y-2.5">
          {reports.map((report) => (
            <div
              key={report.id}
              className={`border border-slate-700/40 border-l-2 rounded-r-xl rounded-bl-xl p-3 space-y-2 ${reportTypeColor(report.type)}`}
            >
              <div className="flex items-start gap-2">
                <span className="text-sm leading-none shrink-0">{reportTypeIcon(report.type)}</span>
                <p className="text-[10px] text-slate-300 leading-relaxed">{report.message}</p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500">
                  <span className="font-semibold text-slate-400">@{report.user}</span>
                  <span>•</span>
                  <Clock className="w-2.5 h-2.5" />
                  <span>{report.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleVote(report.id, 'up')}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded-lg transition text-[9px] font-bold ${
                      report.userUpvoted ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-500 hover:text-emerald-400 hover:bg-emerald-500/10'
                    }`}
                  >
                    <ThumbsUp className="w-2.5 h-2.5" />
                    {report.upvotes}
                  </button>
                  <button
                    onClick={() => handleVote(report.id, 'down')}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition text-[9px] font-bold"
                  >
                    <ThumbsDown className="w-2.5 h-2.5" />
                    {report.downvotes}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Primary CTA */}
      <button
        onClick={() => setShowReportModal(true)}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white text-xs font-bold py-3 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-0.5 group"
      >
        <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        Laporkan Kondisi Fasilitas
      </button>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in fade-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-white">📝 Laporkan Kondisi Fasilitas</h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition"
              >
                ✕
              </button>
            </div>
            <select className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none focus:border-emerald-500">
              <option>Pilih Jenis Laporan...</option>
              <option>Lift / Eskalator Rusak</option>
              <option>Toilet Kotor</option>
              <option>Kepadatan Peron</option>
              <option>Keterlambatan Kereta</option>
              <option>Lainnya</option>
            </select>
            <textarea
              rows={3}
              placeholder="Deskripsi kondisi yang Anda temukan..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-emerald-500 resize-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-600 transition"
              >
                Batal
              </button>
              <button
                onClick={() => setShowReportModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-xs font-bold text-white hover:bg-emerald-400 transition"
              >
                Kirim Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
