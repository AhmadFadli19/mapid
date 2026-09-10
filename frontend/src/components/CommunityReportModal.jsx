import React, { useState } from 'react';
import { X, Send, AlertTriangle, CheckCircle2, ShieldAlert, Camera, MapPin, Building2, HelpCircle } from 'lucide-react';
import api from '../services/api';

const REPORT_TYPES = [
  { id: 'Fasilitas Rusak', label: '🛠️ Fasilitas Rusak / Malfungsi', desc: 'Lift mati, toilet kotor/ditutup, eskalator perbaikan' },
  { id: 'Aksesibilitas', label: '♿ Aksesibilitas Difabel Terkendala', desc: 'Guiding block terhalang, ramp licin/rusak, lift prioritas' },
  { id: 'Tenant Tutup', label: '🏪 Tenant / Kios Tutup', desc: 'Tenant MAPID Menu Go / F&B tidak beroperasi' },
  { id: 'Kepadatan Ekstrem', label: '👥 Kepadatan Ekstrem Peron', desc: 'Penumpukan penumpang di peron tertentu' },
  { id: 'Operasional', label: '⚠️ Gangguan Operasional Armada', desc: 'Keterlambatan armada, pintu peron tidak sinkron' },
];

export default function CommunityReportModal({ isOpen, onClose, stations = [], initialStationId = null, onReportSubmitted }) {
  const [stationId, setStationId] = useState(initialStationId || (stations[0]?.id || ''));
  const [reportType, setReportType] = useState(REPORT_TYPES[0].id);
  const [issue, setIssue] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Acceptance Criteria: Jika submit laporan tanpa lokasi/deskripsi -> pesan error jelas
    if (!stationId) {
      setErrorMsg('Pilih stasiun atau halte lokasi kendala.');
      return;
    }
    if (!issue.trim()) {
      setErrorMsg('Judul kendala wajib diisi.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setErrorMsg('Keterangan detail wajib diisi minimal 5 karakter agar dapat diverifikasi.');
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

      setSuccessMsg('Laporan Anda berhasil dikirim! Status saat ini: "Dalam Verifikasi" dan akan divalidasi moderator sebelum memengaruhi data fasilitas publik.');
      setIssue('');
      setDescription('');
      setPhotoUrl('');

      if (onReportSubmitted) {
        onReportSubmitted(res.data?.data);
      }

      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 2500);
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Gagal mengirim laporan. Pastikan koneksi internet aktif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-slate-900 via-purple-950/40 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-2xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white">Community Report Lapangan</h2>
              <p className="text-[10px] text-slate-400">Verifikasi Berjenjang Sebelum Update Sistem</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Explainability Banner */}
        <div className="bg-purple-950/30 border-b border-purple-800/30 px-5 py-2.5 flex items-start gap-2 text-[10px] text-purple-200 leading-relaxed">
          <HelpCircle className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
          <span>
            <strong>Prinsip PRD:</strong> Laporan Anda akan ditinjau tim verifikasi (status: <em>dalam verifikasi</em>) sebelum status fasilitas diperbarui untuk seluruh pengguna.
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {successMsg && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-2xl text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-2xl text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Stasiun Selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-purple-400" /> Lokasi Stasiun / Halte Transit *
            </label>
            <select
              value={stationId}
              onChange={(e) => setStationId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 transition"
            >
              {stations.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name} ({st.operator})
                </option>
              ))}
            </select>
          </div>

          {/* Tipe Laporan */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
              Kategori Laporan *
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {REPORT_TYPES.map((type) => (
                <div
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-2.5 rounded-xl border cursor-pointer transition text-left ${
                    reportType === type.id
                      ? 'bg-purple-900/40 border-purple-500 text-purple-200 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold">{type.label}</p>
                  <p className="text-[10px] text-slate-500">{type.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Judul Kendala */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
              Judul Kendala Singkat *
            </label>
            <input
              type="text"
              placeholder="Contoh: Lift Concourse Rusak / Eskalator Peron 2 Mati"
              value={issue}
              onChange={(e) => setIssue(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-600 transition"
            />
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5">
              Keterangan Kondisi Lapangan *
            </label>
            <textarea
              rows={3}
              placeholder="Jelaskan detail posisi (misal: dekat Gate B / lantai 2) dan kondisi saat ditemukan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-600 transition"
            />
          </div>

          {/* Foto URL (Opsional) */}
          <div>
            <label className="block text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-slate-400" /> Link Foto Kondisi Lapangan (Opsional)
            </label>
            <input
              type="url"
              placeholder="https://... (URL foto kendala jika ada)"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-2xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-purple-500 placeholder:text-slate-600 transition"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 hover:opacity-95 text-white font-black py-3 rounded-2xl text-xs transition shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <span>Mengirim Laporan...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim Laporan Komunitas</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
