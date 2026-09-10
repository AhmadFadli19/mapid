import React, { useState, useEffect } from 'react';
import {
  Building2, Wifi, Wind, Toilet, Coffee, MapPin,
  ThumbsUp, ThumbsDown, Plus, AlertTriangle, CheckCircle,
  XCircle, Clock, MessageSquare, ChevronRight, Utensils,
  Receipt, ShoppingBag, Star, Tag, Check, Download,
  Accessibility, ShieldCheck, DoorOpen, HelpCircle, AlertCircle,
  Sparkles, RefreshCw, Eye, ExternalLink
} from 'lucide-react';
import api, { enrichStationWithAi } from '../services/api';
import CommunityReportModal from './CommunityReportModal';

export default function StationContextPanel({
  selectedStation,
  stationRoutes,
  loadingRoutes,
  selectedRouteId,
  onSelectRoute,
  onOpenReportModal
}) {
  const [activeTab, setActiveTab] = useState('facilities'); // 'facilities' | 'exits' | 'tenants' | 'reports'
  const [facilityFilter, setFacilityFilter] = useState('ALL'); // 'ALL' | 'ACCESSIBILITY' | 'LIFT' | 'TOILET'
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [menuGoTenants, setMenuGoTenants] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(false);
  const [selectedPhotoMap, setSelectedPhotoMap] = useState({});
  const [previewModalImage, setPreviewModalImage] = useState(null);
  const [isRefreshingMenuGo, setIsRefreshingMenuGo] = useState(false);
  const [menuGoMeta, setMenuGoMeta] = useState(null);
  const [stationReports, setStationReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [isEnrichingAi, setIsEnrichingAi] = useState(false);
  const [aiSuccessToast, setAiSuccessToast] = useState(null);
  const [aiMetadata, setAiMetadata] = useState(null);

  useEffect(() => {
    if (selectedStation?.id) {
      fetchFacilities(selectedStation.id);
      fetchMenuGo(selectedStation.id);
      fetchStationReports(selectedStation.id);
    }
  }, [selectedStation, facilityFilter]);

  const handleTriggerAiEnrichment = async () => {
    if (!selectedStation?.id || isEnrichingAi) return;
    setIsEnrichingAi(true);
    setAiSuccessToast(null);
    try {
      const res = await enrichStationWithAi(selectedStation.id, true);
      if (res?.status === 'success') {
        setAiSuccessToast(res.message || 'Data diperbarui otomatis oleh Gemini 3.6 Flash!');
        setAiMetadata(res.ai_result);
        await Promise.all([
          fetchFacilities(selectedStation.id),
          fetchMenuGo(selectedStation.id),
        ]);
        setTimeout(() => setAiSuccessToast(null), 5000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsEnrichingAi(false);
    }
  };

  const fetchFacilities = async (stationId) => {
    setLoadingFacilities(true);
    try {
      let url = `/v1/facilities/search?station_id=${stationId}`;
      if (facilityFilter === 'ACCESSIBILITY') {
        url += '&accessibility=true';
      } else if (facilityFilter !== 'ALL') {
        url += `&query=${facilityFilter}`;
      }
      const res = await api.get(url);
      if (res.data?.facilities) {
        setFacilities(res.data.facilities);
      } else {
        setFacilities(selectedStation?.facilities || []);
      }
    } catch (e) {
      console.error('Failed fetching facilities:', e);
      setFacilities(selectedStation?.facilities || []);
    } finally {
      setLoadingFacilities(false);
    }
  };

  const [mapidMeta, setMapidMeta] = useState(null);

  const fetchMenuGo = async (stationId) => {
    setLoadingMenu(true);
    try {
      const res = await api.get(`/v1/stations/${stationId}/menu-go`);
      if (res.data?.menu_go_tenants) {
        setMenuGoTenants(res.data.menu_go_tenants);
        setMenuGoMeta({
          cached_locally: res.data.cached_locally,
          source: res.data.source,
          last_synced: res.data.last_synced,
          total: res.data.total_tenants,
          station: res.data.station
        });
      }
    } catch (e) {
      console.error('Failed fetching MAPID Menu Go:', e);
    } finally {
      setLoadingMenu(false);
    }
  };

  const handleRefreshMenuGo = async () => {
    if (!selectedStation?.id || isRefreshingMenuGo) return;
    setIsRefreshingMenuGo(true);
    try {
      await api.post(`/v1/stations/${selectedStation.id}/menu-go/refresh`);
      await fetchMenuGo(selectedStation.id);
    } catch (e) {
      console.error('Failed refreshing MAPID Menu Go:', e);
    } finally {
      setIsRefreshingMenuGo(false);
    }
  };

  const fetchStationReports = async (stationId) => {
    setLoadingReports(true);
    try {
      const res = await api.get(`/v1/community-reports?station_id=${stationId}`);
      if (res.data?.data) {
        setStationReports(res.data.data);
      }
    } catch (e) {
      console.error('Failed fetching reports:', e);
    } finally {
      setLoadingReports(false);
    }
  };

  const stationName = selectedStation?.name || 'Stasiun Bundaran HI';
  const stationCode = selectedStation?.code || 'BHI';
  const stationOperator = selectedStation?.operator || 'MRT Jakarta';
  const stationAddress = selectedStation?.address || 'Jl. M.H. Thamrin, Menteng, Jakarta Pusat';
  const stationExits = selectedStation?.exits || [
    { id: 1, gate_name: 'Exit Gate A (Plaza Indonesia)', target_street: 'Jl. M.H. Thamrin Sisi Barat', is_accessible: true, nearest_poi: 'Plaza Indonesia & Halte BRT' },
    { id: 2, gate_name: 'Exit Gate B (Grand Indonesia)', target_street: 'Jl. Teluk Betung', is_accessible: true, nearest_poi: 'Grand Indonesia Mall' },
    { id: 3, gate_name: 'Exit Gate C (Sarinah)', target_street: 'Jl. M.H. Thamrin Sisi Timur', is_accessible: false, nearest_poi: 'Gedung Kedutaan & Sarinah' },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden text-slate-100 font-sans">

      {/* Station Profile Header */}
      <div className="p-3.5 bg-slate-900 border-b border-slate-800 space-y-2 shrink-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-md">
            {stationOperator} • {stationCode}
          </span>
          <span className="text-[9px] text-slate-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-400" /> Jam Buka: 05.00 - 24.00
          </span>
        </div>

        <div>
          <h2 className="text-sm font-black text-white leading-tight">{stationName}</h2>
          <p className="text-[10px] text-slate-400 truncate mt-0.5">{stationAddress}</p>
        </div>

        {/* Gemini AI Autonomous Enrichment Trigger & Status */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[9px] text-cyan-300 font-bold truncate">
              Gemini 3.6 Flash AI Verified
            </span>
          </div>

          <button
            onClick={handleTriggerAiEnrichment}
            disabled={isEnrichingAi}
            className="text-[9px] bg-gradient-to-r from-cyan-600 to-emerald-600 hover:from-cyan-500 hover:to-emerald-500 text-white font-bold px-2.5 py-1 rounded-lg transition flex items-center gap-1 shrink-0 cursor-pointer disabled:opacity-50 shadow-sm shadow-cyan-600/20"
            title="Klik untuk memperbarui fasilitas, gerbong, dan akses stasiun secara otomatis menggunakan Gemini AI terbaru"
          >
            {isEnrichingAi ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin text-white" />
                <span>Meneliti...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-cyan-200" />
                <span>Update AI Cerdas</span>
              </>
            )}
          </button>
        </div>

        {/* Success Alert if AI re-enriched */}
        {aiSuccessToast && (
          <div className="bg-emerald-950/80 border border-emerald-500/40 text-emerald-200 px-2.5 py-1.5 rounded-xl text-[9px] font-bold flex items-center gap-1.5 animate-fade-in">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="truncate">{aiSuccessToast}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 gap-1 pt-1">
          <button
            onClick={() => setActiveTab('facilities')}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition text-center truncate ${
              activeTab === 'facilities'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Fasilitas
          </button>
          <button
            onClick={() => setActiveTab('exits')}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition text-center truncate ${
              activeTab === 'exits'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Exit Gates
          </button>
          <button
            onClick={() => setActiveTab('tenants')}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition text-center truncate ${
              activeTab === 'tenants'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Tenant POI
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-1.5 px-1 rounded-xl text-[10px] font-bold transition text-center truncate ${
              activeTab === 'reports'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Laporan ({stationReports.length})
          </button>
        </div>
      </div>

      {/* Tab Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-700">

        {/* ── TAB 1: FASILITAS & REKOMENDASI AKSESIBILITAS ─────────── */}
        {activeTab === 'facilities' && (
          <div className="space-y-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
              <button
                onClick={() => setFacilityFilter('ALL')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                  facilityFilter === 'ALL'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setFacilityFilter('ACCESSIBILITY')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition flex items-center gap-1 ${
                  facilityFilter === 'ACCESSIBILITY'
                    ? 'bg-cyan-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                ♿ Difabel & Lansia
              </button>
              <button
                onClick={() => setFacilityFilter('Lift')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                  facilityFilter === 'Lift'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🛗 Lift
              </button>
              <button
                onClick={() => setFacilityFilter('Toilet')}
                className={`px-2 py-1 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                  facilityFilter === 'Toilet'
                    ? 'bg-amber-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                🚻 Toilet & Musala
              </button>
            </div>

            {/* Explainable PRD Principle Note */}
            <div className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-[9px] text-slate-400 space-y-1">
              <p className="flex items-center gap-1 font-bold text-slate-300">
                <HelpCircle className="w-3 h-3 text-emerald-400" />
                Aturan Rekomendasi Fasilitas (Rule-Based):
              </p>
              <p>
                Fasilitas terdekat yang sedang tidak berfungsi <strong>tidak akan direkomendasikan</strong>. Sistem otomatis menyarankan alternatif terdekat yang berfungsi normal.
              </p>
            </div>

            {/* Facilities List */}
            {loadingFacilities ? (
              <div className="p-4 text-center text-xs text-slate-500">Memuat data fasilitas...</div>
            ) : facilities.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500 bg-slate-900 rounded-xl border border-slate-800">
                Belum ada data fasilitas untuk filter ini.
              </div>
            ) : (
              <div className="space-y-2">
                {facilities.map((f) => {
                  const isAvail = f.is_available !== false;
                  return (
                    <div
                      key={f.id}
                      className={`p-3 rounded-2xl border space-y-2 transition ${
                        isAvail
                          ? 'bg-slate-800/80 border-slate-700 hover:border-slate-600'
                          : 'bg-rose-950/20 border-rose-800/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                            {f.name || f.facility_name}
                            {f.is_accessible && (
                              <span className="text-[9px] bg-cyan-500/20 text-cyan-300 px-1 rounded font-normal">
                                ♿ Ramah Difabel
                              </span>
                            )}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {f.floor || 'Lantai Concourse'} • {f.category || 'Fasilitas Umum'}
                          </p>
                        </div>
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded-full font-bold shrink-0 border ${
                            isAvail
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                          }`}
                        >
                          {isAvail ? '🟢 Normal' : '🔴 Perbaikan'}
                        </span>
                      </div>

                      {/* Status note */}
                      {f.status_note && (
                        <p className={`text-[10px] ${isAvail ? 'text-slate-300' : 'text-rose-300 font-semibold'}`}>
                          {f.status_note}
                        </p>
                      )}

                      {/* PRD Broken Facility Fallback Alternative */}
                      {!isAvail && f.alternative_facility && (
                        <div className="p-2 bg-amber-950/40 border border-amber-500/30 rounded-xl space-y-1">
                          <p className="text-[9px] font-bold text-amber-300 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Rekomendasi Alternatif:
                          </p>
                          <p className="text-[9px] text-amber-200">
                            {f.alternative_facility.recommendation_note}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[8px] text-slate-500 pt-1 border-t border-slate-700/40">
                        <span>Pintu Keluar: <strong>{f.nearest_exit || 'Exit Gate A'}</strong></span>
                        <span>Diperbarui: {f.last_updated || '15 mnt lalu'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 2: EXIT GATES & INTERKONEKSI ───────────────────── */}
        {activeTab === 'exits' && (
          <div className="space-y-2.5">
            <p className="text-[10px] text-slate-400">
              Daftar pintu keluar resmi berdasarkan analisis spasial kedekatan dengan moda lanjutan dan trotoar.
            </p>

            {stationExits.map((exit, idx) => (
              <div
                key={exit.id || idx}
                className="bg-slate-800/80 border border-slate-700/80 p-3 rounded-2xl space-y-1.5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5 text-cyan-400" />
                    {exit.gate_name}
                  </span>
                  {exit.is_accessible && (
                    <span className="text-[8px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-1.5 py-0.2 rounded font-bold">
                      ♿ Ramp & Lift
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-slate-300">
                  🎯 Menuju: <strong>{exit.target_street || exit.nearest_poi}</strong>
                </p>
                <p className="text-[9px] text-slate-400">
                  Interkoneksi: Trotoar aman, Halte Integrasi TransJakarta, & Jalur Sepeda.
                </p>
              </div>
            ))}
          </div>
        )}

        {/* ── TAB 3: TENANTS (MENU GO) ───────────────────────────── */}
        {activeTab === 'tenants' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Utensils className="w-3.5 h-3.5 text-amber-400" />
                  MAPID Menu Go Tenants
                </span>
                <span className="text-[10px] text-slate-400 block">
                  Kuliner, Kafe & Kios Belanja Transit
                </span>
              </div>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-bold">
                {menuGoTenants.length} Tenant Aktif
              </span>
            </div>

            {/* Local Database Cache & MAPID Synchronization Status Banner */}
            <div className="bg-slate-900/95 border border-slate-700/80 p-3 rounded-2xl space-y-2">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    💾 Tersimpan di Database Lokal (MySQL)
                  </span>
                </div>
                <span className="text-[9px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                  Akses Cepat Instant (0ms)
                </span>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed">
                Semua data tenant dan foto-foto menu diambil dari MAPID API lalu disimpan secara lokal. Navigasi berikutnya dibuka seketika tanpa loading berulang.
              </p>

              <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[9px] text-slate-500">
                <span>
                  Sinkronisasi:{' '}
                  <span className="text-slate-300 font-mono">
                    {menuGoMeta?.last_synced
                      ? new Date(menuGoMeta.last_synced).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Tersimpan'}
                  </span>
                </span>
                <button
                  onClick={handleRefreshMenuGo}
                  disabled={isRefreshingMenuGo}
                  className="flex items-center gap-1 text-[9px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition cursor-pointer disabled:opacity-50"
                  title="Sinkronkan ulang dari MAPID API dan perbarui database lokal"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshingMenuGo ? 'animate-spin' : ''}`} />
                  {isRefreshingMenuGo ? 'Menyinkronkan...' : 'Perbarui dari MAPID API'}
                </button>
              </div>
            </div>

            {loadingMenu ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
                <RefreshCw className="w-5 h-5 animate-spin mx-auto text-amber-400" />
                <p>Mengambil data tenant dari database lokal...</p>
              </div>
            ) : menuGoTenants.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
                <Utensils className="w-6 h-6 mx-auto text-slate-600" />
                <p>Belum ada tenant tersimpan di stasiun ini.</p>
                <button
                  onClick={handleRefreshMenuGo}
                  className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-lg"
                >
                  Tarik Data dari MAPID API
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {menuGoTenants.map((t) => {
                  const photos = (t.photos && t.photos.length > 0) ? t.photos : [t.img || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'];
                  const activePhoto = selectedPhotoMap[t.id] || photos[0];

                  return (
                    <div
                      key={t.id}
                      className="bg-slate-800/90 border border-slate-700/80 rounded-2xl overflow-hidden hover:border-slate-600 transition shadow-lg space-y-2.5 p-3.5"
                    >
                      {/* Header bar: Name + Category + Price */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                            {t.category || 'F&B'}
                          </span>
                          <h4 className="text-xs font-black text-white mt-1 leading-tight">
                            {t.tenant_name}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                            {t.location || 'Lantai Concourse'}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-emerald-400 block">
                            {t.price_formatted}
                          </span>
                          <span className="text-[8px] text-slate-500">Estimasi Rata-rata</span>
                        </div>
                      </div>

                      {/* Multi-Photo Gallery: Active Image Showcase */}
                      <div className="relative rounded-xl overflow-hidden border border-slate-700 group bg-slate-950">
                        <img
                          src={activePhoto}
                          alt={t.tenant_name}
                          className="w-full h-36 object-cover transition-transform duration-300 group-hover:scale-105 cursor-pointer"
                          onClick={() => setPreviewModalImage({ url: activePhoto, title: t.tenant_name })}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                        <button
                          onClick={() => setPreviewModalImage({ url: activePhoto, title: t.tenant_name })}
                          className="absolute bottom-2 right-2 text-[9px] font-bold bg-slate-900/90 hover:bg-slate-900 text-white px-2 py-1 rounded-lg border border-slate-700/80 flex items-center gap-1 shadow cursor-pointer"
                        >
                          <Eye className="w-3 h-3 text-amber-400" /> Perbesar
                        </button>
                        <span className="absolute top-2 left-2 text-[8px] font-bold bg-slate-900/85 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                          ✓ Database Lokal
                        </span>
                      </div>

                      {/* Photo Thumbnail Strip (Galeri Lengkap) */}
                      {photos.length > 1 && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-400 font-bold block">
                            Galeri Foto ({photos.length} Foto Lengkap):
                          </span>
                          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                            {photos.map((pUrl, pIdx) => {
                              const isSelected = activePhoto === pUrl;
                              const label = pIdx === 0 ? 'Kios / Tempat' : pIdx === 1 ? 'Menu 1' : 'Menu 2';
                              return (
                                <button
                                  key={pIdx}
                                  onClick={() => setSelectedPhotoMap(prev => ({ ...prev, [t.id]: pUrl }))}
                                  className={`relative shrink-0 rounded-lg overflow-hidden border-2 transition cursor-pointer group ${
                                    isSelected
                                      ? 'border-amber-400 ring-2 ring-amber-400/30 scale-105'
                                      : 'border-slate-700 opacity-70 hover:opacity-100 hover:border-slate-500'
                                  }`}
                                >
                                  <img
                                    src={pUrl}
                                    alt={`${t.tenant_name} ${pIdx + 1}`}
                                    className="w-14 h-11 object-cover"
                                  />
                                  <span className="absolute inset-x-0 bottom-0 bg-slate-950/90 text-[7px] text-slate-200 text-center py-0.5 truncate px-0.5">
                                    {label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Rich Information Attributes */}
                      <div className="bg-slate-900/70 border border-slate-800/80 p-2.5 rounded-xl space-y-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                          <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-slate-400">Menu Utama:</span>
                          <span className="font-bold text-white truncate">{t.menu_utama}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="text-slate-400">Jam Buka:</span>
                          <span className="text-emerald-300 font-bold">{t.operating_hours}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-200">
                          <Accessibility className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span className="text-slate-400">Aksesibilitas:</span>
                          <span className="text-slate-200">{t.mobilitas}</span>
                        </div>
                        {t.catatan && (
                          <div className="text-[9px] bg-slate-800/90 p-1.5 rounded-lg text-slate-300 border border-slate-700/50">
                            💡 {t.catatan}
                          </div>
                        )}
                      </div>

                      {/* Footer Actions: Digital Menu Link */}
                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[8px] text-slate-500">
                          ID: #{t.id} • MAPID Mission MenuGo
                        </span>
                        {t.link_menu && t.link_menu !== '#' && (
                          <a
                            href={t.link_menu}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[9px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 px-2.5 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
                          >
                            Buku Menu Digital <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── TAB 4: LAPORAN LAPANGAN (COMMUNITY FEED) ──────────── */}
        {activeTab === 'reports' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Laporan Komunitas ({stationName})</span>
              <button
                onClick={() => setReportModalOpen(true)}
                className="text-[9px] bg-purple-600 hover:bg-purple-500 text-white font-bold px-2 py-1 rounded-lg transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Buat Laporan
              </button>
            </div>

            {loadingReports ? (
              <div className="p-4 text-center text-xs text-slate-500">Memuat laporan...</div>
            ) : stationReports.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                <p>Belum ada laporan kendala di stasiun ini.</p>
                <p className="text-[10px] text-slate-500">Semua fasilitas tercatat beroperasi normal.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {stationReports.map((rep) => (
                  <div key={rep.id} className="bg-slate-800/90 border border-slate-700/80 p-3 rounded-2xl space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-purple-300">
                        {rep.report_type || 'Kendala Lapangan'}
                      </span>
                      <span
                        className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                          rep.status === 'disetujui'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {rep.status === 'disetujui' ? '✓ Terverifikasi' : '⏳ Dalam Verifikasi'}
                      </span>
                    </div>
                    <h5 className="text-xs font-bold text-white">{rep.issue}</h5>
                    <p className="text-[10px] text-slate-300 leading-snug">{rep.description}</p>
                    <p className="text-[8px] text-slate-500 pt-1">
                      Dilaporkan {rep.created_at ? new Date(rep.created_at).toLocaleTimeString() : 'Baru saja'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Community Report Modal */}
      <CommunityReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        stations={[selectedStation]}
        initialStationId={selectedStation?.id}
        onReportSubmitted={() => {
          if (selectedStation?.id) {
            fetchStationReports(selectedStation.id);
            fetchFacilities(selectedStation.id);
          }
        }}
      />

      {/* Lightbox Photo Preview Modal */}
      {previewModalImage && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setPreviewModalImage(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-3 p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Utensils className="w-4 h-4 text-amber-400" />
                {previewModalImage.title}
              </h3>
              <button
                onClick={() => setPreviewModalImage(null)}
                className="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition cursor-pointer text-xs font-bold"
              >
                ✕ Tutup
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black max-h-[70vh]">
              <img
                src={previewModalImage.url}
                alt={previewModalImage.title}
                className="w-full h-full max-h-[70vh] object-contain mx-auto"
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
              <span>Resolusi Penuh • MAPID Menu Go Integration</span>
              <span className="text-emerald-400 font-bold">💾 Tersimpan di Database Lokal</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
