import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MessageSquarePlus, Send, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function CommunityReportsPage() {
  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState('');
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [reports, setReports] = useState([
    {
      id: 1,
      station_name: 'Stasiun Bundaran HI',
      issue: 'Lift Utilitis Maintenance',
      description: 'Lift prioritas menuju peron utara sedang perbaikan rutin jam 14:00 - 16:00.',
      status: 'Verified',
      created_at: 'Baru saja'
    },
    {
      id: 2,
      station_name: 'Halte Harmoni',
      issue: 'Toilet Pintu B Ditutup',
      description: 'Pintu toilet wanita sedang ada pembersihan area.',
      status: 'Verified',
      created_at: '10 menit lalu'
    }
  ]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      await api.post('/community-report', {
        station_id: stationId,
        issue,
        description,
      });

      const selectedSt = stations.find(s => s.id == stationId);
      setReports([
        {
          id: Date.now(),
          station_name: selectedSt?.name || 'Stasiun MAPID',
          issue,
          description,
          status: 'Verified',
          created_at: 'Baru saja'
        },
        ...reports
      ]);

      setMessage('Laporan komunitas berhasil dikirim!');
      setIssue('');
      setDescription('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim laporan. Pastikan Anda sudah login.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex items-center gap-4">
        <div className="p-3 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
          <MessageSquarePlus className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Community Report & Live Condition Feed</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Laporkan kendala fasilitas stasiun/halte (lift rusak, toilet ditutup) untuk membantu sesama pengguna transportasi umum.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Send Report */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-4">
          <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Kirim Laporan Komunitas Baru
          </h2>

          {message && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {message}
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Stasiun / Halte</label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              >
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>{st.name} ({st.operator})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Judul Kendala / Laporan</label>
              <input
                type="text"
                required
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Contoh: Lift Maintenance / Toilet Rusak / Exit B Ditutup"
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Keterangan Detail</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan kondisi detail lokasi dan waktu penemuan..."
                className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-500 font-bold text-white py-3 rounded-2xl text-xs transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" /> Kirim Laporan Real-Time
            </button>
          </form>
        </div>

        {/* Live Feed List */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Live Feed Laporan Terkini ({reports.length})
          </h2>

          <div className="space-y-3">
            {reports.map((rep) => (
              <div key={rep.id} className="bg-slate-800/90 border border-slate-700/80 p-5 rounded-3xl space-y-2 shadow-lg">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400">{rep.station_name}</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> {rep.status}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-white">{rep.issue}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{rep.description}</p>
                <p className="text-[10px] text-slate-500 pt-1">Dilaporkan: {rep.created_at}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
