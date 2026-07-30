import React, { useState } from 'react';
import api from '../services/api';
import { Search, Database, MapPin, Compass, AlertCircle } from 'lucide-react';
import WebGisMap from '../components/WebGisMap';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [source, setSource] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await api.get(`/map/search?query=${encodeURIComponent(query)}`);
      setResults(res.data.results || []);
      setSource(res.data.source || '');
      if (res.data.results?.length > 0) {
        setSelectedPlace(res.data.results[0]);
      }
    } catch (err) {
      console.error('Search failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-600/20 text-blue-400 rounded-2xl border border-blue-500/30">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">MAPID Spatial Search & Geocoder</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Cari nama stasiun, halte, tempat umum, atau koordinat spasial dengan fallback otomatis dari OpenStreetMap ke Database Dummy PostGIS.
            </p>
          </div>
        </div>

        {/* Search Input Form */}
        <form onSubmit={handleSearch} className="mt-5 flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Masukkan nama stasiun, halte, atau lokasi (contoh: Bundaran HI, Harmoni, Sudirman)..."
            className="flex-1 bg-slate-900/90 border border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-500 font-bold text-white px-6 py-3 rounded-2xl text-xs transition shadow-lg shadow-blue-600/30 flex items-center gap-2 shrink-0"
          >
            {loading ? 'Mencari...' : <><Search className="w-4 h-4" /> Cari Lokasi</>}
          </button>
        </form>

        {source && (
          <div className="mt-4 p-3 bg-slate-900/60 border border-slate-700/60 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300">Sumber Data Dipakai: <strong className="text-emerald-400 font-mono">{source}</strong></span>
            </div>
            {source.includes('OpenStreetMap') ? (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-semibold">API External Online</span>
            ) : (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full font-semibold">Fallback Dummy PostGIS</span>
            )}
          </div>
        )}
      </div>

      {/* Results Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Hasil Pencarian ({results.length})
          </h2>

          {results.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700/60 p-6 rounded-2xl text-center text-xs text-slate-400">
              <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              Silakan ketikkan pencarian lokasi di atas untuk melihat data spasial.
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[450px] overflow-y-auto pr-1">
              {results.map((res, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedPlace(res)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    selectedPlace?.id === res.id
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                      : 'bg-slate-800/80 border-slate-700/70 text-slate-300 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-sm leading-tight text-white">{res.name}</h3>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-400 font-semibold shrink-0">
                      {res.type}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-slate-400 space-y-1">
                    <p>Operator / Source: <strong className="text-slate-200">{res.operator}</strong></p>
                    <p className="font-mono text-[11px]">Lat: {res.latitude}, Lng: {res.longitude}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Display */}
        <div className="lg:col-span-7">
          <div className="h-[480px] w-full rounded-3xl overflow-hidden border border-slate-700 shadow-2xl">
            <WebGisMap
              stations={[]}
              selectedStation={selectedPlace}
              searchResults={results}
              onSelectStation={(st) => setSelectedStation(st)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
