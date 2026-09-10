import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  MessageSquarePlus, Send, CheckCircle2, AlertTriangle,
  ShieldCheck, Clock, Check, X, ShieldAlert, Filter,
  Building2, HelpCircle, User, RefreshCw
} from 'lucide-react';

const REPORT_TYPES = [
  'Fasilitas Rusak',
  'Aksesibilitas Difabel',
  'Eskalator / Lift Mati',
  'Toilet Kotor / Ditutup',
  'Tenant Tutup',
  'Kepadatan Peron',
  'Keterlambatan Armada'
];

export default function CommunityReportsPage() {
  const [stations, setStations] = useState([]);
  const [stationId, setStationId] = useState('');
  const [reportType, setReportType] = useState(REPORT_TYPES[0]);
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'verified' | 'pending'

  useEffect(() => {
    fetchStations();
    fetchReports();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      if (res.data?.data?.length > 0) {
        setStations(res.data.data);
        setStationId(res.data.data[0].id);
      }
    } catch (err) {
      console.error('Fetch stations error:', err);
    }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await api.get('/v1/community-reports');
      if (res.data?.data) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Fetch reports error:', err);
    } finally {
      setLoadingReports(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    // Acceptance Criteria: Jika submit laporan tanpa lokasi/deskripsi -> tampilkan pesan error yang jelas
    if (!stationId) {
      setError('Stasiun / Halte lokasi kejadian wajib dipilih.');
      return;
    }
    if (!issue.trim()) {
      setError('Judul kendala wajib diisi.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError('Keterangan detail kendala wajib diisi minimal 5 karakter agar dapat diverifikasi.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/v1/community-report', {
        station_id: stationId,
        report_type: reportType,
        issue: issue.trim(),
        description: description.trim(),
        photo_url: photoUrl.trim() || null,
      });

      setMessage('Laporan Anda berhasil dikirim dan masuk antrean verifikasi! Status: "Dalam Verifikasi".');
      setIssue('');
      setDescription('');
      setPhotoUrl('');
      fetchReports();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengirim laporan. Coba lagi beberapa saat.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (reportId, status) => {
    try {
      await api.post(`/v1/community-reports/${reportId}/verify`, { status });
      fetchReports();
    } catch (err) {
      console.error('Failed to verify report:', err);
    }
  };

  const filteredReports = reports.filter((r) => {
    if (activeTab === 'verified') return r.status === 'disetujui' || r.status === 'Verified';
    if (activeTab === 'pending') return r.status === 'dalam verifikasi' || r.status === 'Pending' || r.status === 'diterima';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-16 text-slate-100 font-sans">

      {/* Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-purple-600/20 text-purple-400 rounded-2xl border border-purple-500/30">
            <MessageSquarePlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Community Report & Verification Pipeline</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Kanal pelaporan kondisi lapangan real-time dengan verifikasi berjenjang sebelum memengaruhi status fasilitas sistem.
            </p>
          </div>
        </div>

        <button
          onClick={fetchReports}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingReports ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Explainability PRD Rule Callout */}
      <div className="bg-purple-950/30 border border-purple-800/40 rounded-2xl p-4 flex items-start gap-3">
        <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-200 leading-relaxed space-y-1">
          <p className="font-bold">Prinsip Desain PRD #3 (Anti-Hoax & Verifikasi Berjenjang):</p>
          <p className="text-[11px] text-purple-300/90">
            Laporan pengguna baru <strong>tidak langsung mengubah status fasilitas bagi pengguna lain</strong>. Setiap laporan diberi status <em>"Dalam Verifikasi"</em> hingga divalidasi oleh moderator atau konfirmasi silang. Saat disetujui, fasilitas terkait langsung ditandai <em>"Dalam Perbaikan"</em> dan memicu rekomendasi fasilitas alternatif.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ── LEFT: FORM LAPOR KENDALA BARU ─────────────────── */}
        <div className="lg:col-span-5 bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700/70 pb-3">
            <h2 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400" />
              Form Pelaporan Lapangan
            </h2>
            <span className="text-[9px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-bold">
              Kanal Komunitas
            </span>
          </div>

          {message && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-purple-400" /> Lokasi Stasiun / Halte *
              </label>
              <select
                value={stationId}
                onChange={(e) => setStationId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition font-semibold"
              >
                {stations.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.operator})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                Kategori Laporan *
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition font-semibold"
              >
                {REPORT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                Judul Kendala / Laporan *
              </label>
              <input
                type="text"
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Contoh: Lift Concourse Rusak / Toilet Sisi B Ditutup"
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-600 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                Keterangan Detail Kondisi *
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan detail lokasi (lantai/gate) dan kondisi terkini..."
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-600 transition"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
                Link Foto Kondisi (Opsional)
              </label>
              <input
                type="url"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="https://... (URL foto kendala jika ada)"
                className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-600 transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 font-black text-white py-3 rounded-2xl text-xs transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? 'Mengirim Laporan...' : <><Send className="w-3.5 h-3.5" /> Kirim Laporan ke Antrean Verifikasi</>}
            </button>
          </form>
        </div>

        {/* ── RIGHT: LIVE FEED & VERIFIKASI MODERATOR ────────── */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeTab === 'all'
                    ? 'bg-purple-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Semua ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('verified')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  activeTab === 'verified'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Terverifikasi
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                  activeTab === 'pending'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Dalam Verifikasi
              </button>
            </div>

            <span className="text-[10px] text-slate-400 font-semibold">
              Mode: Evaluasi & Moderasi Langsung
            </span>
          </div>

          {loadingReports ? (
            <div className="p-8 text-center text-xs text-slate-500 bg-slate-800/60 rounded-3xl border border-slate-700/60">
              Memuat data laporan...
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 bg-slate-800/60 rounded-3xl border border-slate-700/60 space-y-1">
              <p className="font-bold text-white">Tidak ada laporan pada filter ini.</p>
              <p className="text-[10px] text-slate-500">Kirim laporan baru lewat form di sisi kiri.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredReports.map((rep) => {
                const isVerified = rep.status === 'disetujui' || rep.status === 'Verified';
                const isPending = rep.status === 'dalam verifikasi' || rep.status === 'Pending' || rep.status === 'diterima';

                return (
                  <div
                    key={rep.id}
                    className={`p-4 rounded-3xl border space-y-3 transition ${
                      isVerified
                        ? 'bg-slate-800/90 border-slate-700 shadow-md'
                        : 'bg-gradient-to-br from-amber-950/20 to-slate-900 border-amber-500/40 shadow-lg'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-purple-300">
                            {rep.station?.name || rep.station_name || 'Stasiun Transit'}
                          </span>
                          <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded text-slate-400 font-semibold border border-slate-700">
                            {rep.report_type || 'Kendala Fasilitas'}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-white mt-1">{rep.issue}</h3>
                      </div>

                      <span
                        className={`text-[9px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 shrink-0 ${
                          isVerified
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {isVerified ? (
                          <><ShieldCheck className="w-3 h-3" /> Terverifikasi</>
                        ) : (
                          <><Clock className="w-3 h-3 animate-spin" /> Dalam Verifikasi</>
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {rep.description}
                    </p>

                    {rep.photo_url && (
                      <div className="pt-1">
                        <img
                          src={rep.photo_url}
                          alt="Bukti foto kendala"
                          className="w-32 h-20 object-cover rounded-xl border border-slate-700"
                        />
                      </div>
                    )}

                    {/* Moderation Action Bar */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700/60 text-[10px] text-slate-400">
                      <span>Dilaporkan: {rep.created_at ? new Date(rep.created_at).toLocaleString('id-ID') : 'Baru saja'}</span>

                      {isPending && (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleVerify(rep.id, 'disetujui')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" /> Verifikasi & Setujui
                          </button>
                          <button
                            onClick={() => handleVerify(rep.id, 'ditolak')}
                            className="px-2 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-300 font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            <X className="w-3 h-3" /> Tolak
                          </button>
                        </div>
                      )}

                      {isVerified && (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          ✓ Status Fasilitas Telah Diperbarui di Peta
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
