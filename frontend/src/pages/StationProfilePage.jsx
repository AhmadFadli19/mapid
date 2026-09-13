import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, Info, CheckCircle, Clock, MapPin, Tag, ShieldCheck, DoorOpen, Utensils, RefreshCw, ExternalLink } from 'lucide-react';

export default function StationProfilePage() {
  const [stations, setStations] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [profile, setProfile] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [menuGoTenants, setMenuGoTenants] = useState([]);
  const [menuGoMeta, setMenuGoMeta] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedPhotoMap, setSelectedPhotoMap] = useState({});
  const [isRefreshingMenu, setIsRefreshingMenu] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      const data = res.data?.data || [];
      if (data.length > 0) {
        setStations(data);
        setSelectedId(data[0].id);
        loadProfile(data[0].id);
      }
    } catch (err) {
      console.error('Fetch stations failed:', err);
    }
  };

  const loadProfile = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.get(`/stations/${id}`);
      setProfile(res.data);
      const routesRes = await api.get(`/stations/${id}/routes`);
      setRoutes(routesRes.data?.routes || routesRes.data?.data || []);
      const menuRes = await api.get(`/v1/stations/${id}/menu-go`);
      if (menuRes.data?.menu_go_tenants) {
        setMenuGoTenants(menuRes.data.menu_go_tenants);
        setMenuGoMeta(menuRes.data);
      }
    } catch (err) {
      console.error('Load station profile failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshMenu = async () => {
    if (!selectedId || isRefreshingMenu) return;
    setIsRefreshingMenu(true);
    try {
      await api.post(`/v1/stations/${selectedId}/menu-go/refresh`);
      const menuRes = await api.get(`/v1/stations/${selectedId}/menu-go`);
      if (menuRes.data?.menu_go_tenants) {
        setMenuGoTenants(menuRes.data.menu_go_tenants);
        setMenuGoMeta(menuRes.data);
      }
    } catch (err) {
      console.error('Refresh Menu Go failed:', err);
    } finally {
      setIsRefreshingMenu(false);
    }
  };

  // Safely extract station object
  const station = profile?.data || profile?.station || profile;
  const facilities = station?.facilities || [];
  const exits = station?.exits || [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4 md:p-6 pb-16 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Station Profile & Facility Directory</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Informasi lengkap Point of Interest (POI), fasilitas umum, tenant komersial, dan pintu keluar stasiun.
            </p>
          </div>
        </div>

        {/* Station Select dropdown */}
        <select
          value={selectedId}
          onChange={(e) => {
            setSelectedId(e.target.value);
            loadProfile(e.target.value);
          }}
          className="bg-slate-900 border border-slate-700 rounded-2xl px-4 py-2.5 text-xs font-bold text-slate-100 focus:outline-none focus:border-blue-500"
        >
          {stations.map((st) => (
            <option key={st.id} value={st.id}>{st.name} ({st.operator})</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-slate-800/50 rounded-3xl border border-slate-700/60">
          Memuat profil stasiun...
        </div>
      ) : station ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Station Details Header */}
          <div className="lg:col-span-12 bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/70 pb-4">
              <div>
                <span className="text-xs font-bold px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full">
                  {station.operator || 'Transit Operator'}
                </span>
                <h2 className="text-2xl font-black text-white mt-2">{station.name || 'Nama stasiun unavailable'}</h2>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> {station.address || 'Address unavailable'}
                </p>
              </div>

              <div className="bg-slate-900/80 px-4 py-3 rounded-2xl border border-slate-700/60 text-right">
                <span className="text-[10px] text-slate-400 block">Kode Stasiun / Halte</span>
                <span className="text-lg font-mono font-bold text-emerald-400">{station.code || 'Code unavailable'}</span>
              </div>
            </div>

            {/* TransJakarta / Rail Routes Grid */}
            {routes && routes.length > 0 && (
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-sm">🚌</span> Rute Transit Melintas ({routes.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                  {routes.map((r, idx) => (
                    <div
                      key={r.route_id || idx}
                      className="bg-slate-900/80 border border-slate-700/60 p-3 rounded-2xl flex items-center gap-2.5"
                    >
                      <span
                        className="text-xs font-black px-2.5 py-1 rounded-xl shrink-0"
                        style={{
                          backgroundColor: r.route_color || '#ea580c',
                          color: r.route_text_color || '#ffffff',
                        }}
                      >
                        {r.route_short_name || r.route_id || 'Rute'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-200 truncate">
                          {r.route_long_name || r.route_short_name || 'Rute Integrated'}
                        </p>
                        <p className="text-[9px] text-slate-400">
                          {r.agency_id || 'TransJakarta'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Facilities Categorized Grid */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" /> Daftar Fasilitas & POI Stasiun
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {facilities.length > 0 ? (
                  facilities.map((fac) => (
                    <div key={fac.id} className="bg-slate-900/80 border border-slate-700/60 p-4 rounded-2xl space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-xs text-slate-200">{fac.facility_name || fac.name}</h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          fac.is_available !== false ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        }`}>
                          {fac.status_note || (fac.is_available ? 'Available' : 'Unavailable')}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-1">
                        <p className="flex items-center gap-1">
                          <Tag className="w-3 h-3 text-blue-400" /> Kategori: {fac.category || 'Category unavailable'}
                        </p>
                        <p className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-amber-400" /> Posisi / Lantai: {fac.floor || 'Floor unavailable'}
                        </p>
                        <p className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-emerald-400" /> Jam Operasional: {fac.operating_hours || 'Unavailable'}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-slate-900/40 p-4 rounded-2xl text-center text-xs text-slate-400">
                    Data fasilitas belum tersedia dari sumber terverifikasi.
                  </div>
                )}
              </div>
            </div>

            {/* Exits Info */}
            <div className="pt-4 border-t border-slate-700/60 space-y-3">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <DoorOpen className="w-4 h-4 text-cyan-400" /> Pintu Keluar Stasiun (Exits)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {exits.length > 0 ? (
                  exits.map((ex) => (
                    <div key={ex.id} className="bg-slate-900/60 border border-slate-700/50 p-3 rounded-2xl flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-200">{ex.gate_name || ex.name || 'Exit unavailable'}</h5>
                        <p className="text-[10px] text-slate-400">Target: {ex.target_street || ex.nearest_road || 'Target unavailable'}</p>
                      </div>
                      <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-md font-mono">
                        Aksesibel
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full bg-slate-900/40 p-3 rounded-2xl text-center text-xs text-slate-400">
                    Data exit gate belum tersedia dari sumber terverifikasi.
                  </div>
                )}
              </div>
            </div>

            {/* MAPID Menu Go Tenants Section (Local Database Stored) */}
            <div className="pt-6 border-t border-slate-700/60 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-amber-400" />
                    MAPID Menu Go Tenants & Kios Kuliner
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                      💾 Database Lokal (0ms Load)
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Data tenant dan galeri foto menu diambil dari MAPID API lalu disimpan permanen di database lokal agar tidak perlu memuat ulang.
                  </p>
                </div>

                <button
                  onClick={handleRefreshMenu}
                  disabled={isRefreshingMenu}
                  className="self-start sm:self-auto flex items-center gap-1.5 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMenu ? 'animate-spin' : ''}`} />
                  {isRefreshingMenu ? 'Menyinkronkan...' : 'Perbarui dari MAPID API'}
                </button>
              </div>

              {menuGoTenants.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {menuGoTenants.map((t) => {
                    const photos = (t.photos && t.photos.length > 0) ? t.photos : [t.img || 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600'];
                    const activePhoto = selectedPhotoMap[t.id] || photos[0];

                    return (
                      <div
                        key={t.id}
                        className="bg-slate-900/80 border border-slate-700/70 rounded-3xl p-4 space-y-3 hover:border-slate-600 transition shadow-lg"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
                              {t.category || 'F&B'}
                            </span>
                            <h4 className="text-xs font-black text-white mt-1 leading-tight">{t.tenant_name}</h4>
                          </div>
                          <span className="text-xs font-black text-emerald-400 shrink-0">{t.price_formatted}</span>
                        </div>

                        {/* Main Image */}
                        <div className="relative rounded-2xl overflow-hidden bg-black h-36">
                          <img
                            src={activePhoto}
                            alt={t.tenant_name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute top-2 left-2 text-[8px] font-bold bg-slate-900/80 text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-500/30">
                            ✓ Tersimpan Lokal
                          </span>
                        </div>

                        {/* Thumbnails */}
                        {photos.length > 1 && (
                          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
                            {photos.map((p, pIdx) => (
                              <button
                                key={pIdx}
                                onClick={() => setSelectedPhotoMap(prev => ({ ...prev, [t.id]: p }))}
                                className={`shrink-0 rounded-lg overflow-hidden border transition cursor-pointer ${
                                  activePhoto === p ? 'border-amber-400 ring-2 ring-amber-400/30' : 'border-slate-700 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img src={p} alt="thumb" className="w-12 h-9 object-cover" />
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Details */}
                        <div className="text-[11px] text-slate-300 space-y-1 bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
                          <p className="flex items-center gap-1 font-medium">
                            <span className="text-slate-400">🍽️ Menu:</span>
                            <span className="text-white font-bold truncate">{t.menu_utama}</span>
                          </p>
                          <p className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-emerald-400 shrink-0" />
                            <span>{t.operating_hours}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">♿ {t.mobilitas}</p>
                        </div>

                        {t.link_menu && t.link_menu !== '#' && (
                          <a
                            href={t.link_menu}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-center text-[10px] font-bold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 py-1.5 rounded-xl transition"
                          >
                            Buku Menu Digital ↗
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-slate-900/40 p-4 rounded-2xl text-center text-xs text-slate-400">
                  Belum ada tenant tersimpan di stasiun ini.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-800/50 border border-slate-700/60 p-8 rounded-3xl text-center text-xs text-slate-400">
          Pilih stasiun dari menu dropdown di atas.
        </div>
      )}
    </div>
  );
}
