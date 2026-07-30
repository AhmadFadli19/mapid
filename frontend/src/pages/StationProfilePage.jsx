import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Building2, Info, CheckCircle, Clock, MapPin, Tag } from 'lucide-react';

export default function StationProfilePage() {
  const [stations, setStations] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      if (res.data?.data?.length > 0) {
        setStations(res.data.data);
        setSelectedId(res.data.data[0].id);
        loadProfile(res.data.data[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadProfile = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/stations/${id}`);
      setProfile(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex items-center justify-between">
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
        <div className="p-12 text-center text-xs text-slate-400">Memuat profil stasiun...</div>
      ) : profile ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Station Details Header */}
          <div className="lg:col-span-12 bg-slate-800/90 border border-slate-700/80 p-6 rounded-3xl shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/70 pb-4">
              <div>
                <span className="text-xs font-bold px-3 py-1 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-full">
                  {profile.station.operator}
                </span>
                <h2 className="text-2xl font-black text-white mt-2">{profile.station.name}</h2>
                <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-red-400" /> {profile.station.address}
                </p>
              </div>

              <div className="bg-slate-900/80 px-4 py-3 rounded-2xl border border-slate-700/60 text-right">
                <span className="text-[10px] text-slate-400 block">Kode Stasiun</span>
                <span className="text-lg font-mono font-bold text-emerald-400">{profile.station.code}</span>
              </div>
            </div>

            {/* Facilities Categorized Grid */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-400" /> Daftar Fasilitas & POI Stasiun
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {profile.facilities?.map((fac) => (
                  <div key={fac.id} className="bg-slate-900/80 border border-slate-700/60 p-4 rounded-2xl space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-bold text-xs text-slate-200">{fac.name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        fac.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        fac.status === 'Maintenance' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {fac.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1">
                      <p className="flex items-center gap-1">
                        <Tag className="w-3 h-3 text-blue-400" /> Kategori: {fac.category}
                      </p>
                      <p className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-amber-400" /> Posisi / Lantai: {fac.floor}
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-emerald-400" /> Jam Operasional: {fac.operating_hours}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Exits Info */}
            {profile.exits?.length > 0 && (
              <div className="pt-4 border-t border-slate-700/60">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                  Pintu Keluar Stasiun (Exits)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.exits.map((ex) => (
                    <div key={ex.id} className="bg-slate-900/60 border border-slate-700/50 p-3 rounded-2xl flex items-center justify-between">
                      <div>
                        <h5 className="text-xs font-bold text-slate-200">{ex.name}</h5>
                        <p className="text-[10px] text-slate-400">Jalan Terdekat: {ex.nearest_road}</p>
                      </div>
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-md font-mono">
                        Lat: {ex.latitude}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
