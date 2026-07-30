import React, { useState, useEffect } from 'react';
import api from '../services/api';
import WebGisMap from '../components/WebGisMap';
import TransitIntelligencePanel from '../components/TransitIntelligencePanel';
import { Layers, Activity, Building2, Filter, Train, Flame, CheckCircle, Radio } from 'lucide-react';

export default function DashboardPage() {
  const [stations, setStations] = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedOperator, setSelectedOperator] = useState('ALL');

  useEffect(() => {
    fetchStations();
  }, []);

  const fetchStations = async () => {
    try {
      const res = await api.get('/stations');
      if (res.data?.data) {
        setStations(res.data.data);
        setFilteredStations(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedStation(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Fetch stations failed:', err);
    }
  };

  const handleFilter = (operator) => {
    setSelectedOperator(operator);
    if (operator === 'ALL') {
      setFilteredStations(stations);
    } else {
      setFilteredStations(stations.filter(s => s.operator === operator));
    }
  };

  const operators = [
    { id: 'ALL', label: 'Semua Moda', color: 'bg-slate-700' },
    { id: 'MRT Jakarta', label: 'MRT Jakarta', color: 'bg-sky-600' },
    { id: 'LRT Jabodebek', label: 'LRT Jabodebek', color: 'bg-rose-600' },
    { id: 'KRL Commuter Line', label: 'KRL Commuter', color: 'bg-emerald-600' },
    { id: 'KAI Antarkota', label: 'Kereta Antarkota', color: 'bg-amber-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full font-bold flex items-center gap-1">
              <Radio className="w-3 h-3 text-blue-400 animate-pulse" /> Multi-Moda Public Transit WebGIS
            </span>
          </div>
          <h1 className="text-2xl font-black text-white mt-2">WebGIS Interaktif MRT, LRT, KRL & Kereta Antarkota</h1>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Integrasi spasial jaringan MRT Jakarta, LRT Jabodebek, KRL Commuter Line, hingga Kereta Api Antarkota (Gambir, Bandung, Jogja, Surabaya).
          </p>
        </div>

        {/* Live Status Badge */}
        <div className="flex items-center gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-700/60 shrink-0">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
            <Activity className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400">Total Stasiun Aktif</p>
            <p className="text-sm font-black text-emerald-400">{filteredStations.length} Stasiun Terdaftar</p>
          </div>
        </div>
      </div>

      {/* Operator Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 mr-1">
          <Filter className="w-3.5 h-3.5" /> Filter Moda:
        </span>
        {operators.map((op) => (
          <button
            key={op.id}
            onClick={() => handleFilter(op.id)}
            className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              selectedOperator === op.id
                ? `${op.color} text-white shadow-lg shadow-blue-500/10 border border-white/20`
                : 'bg-slate-800 text-slate-400 border border-slate-700/80 hover:bg-slate-700 hover:text-slate-200'
            }`}
          >
            <Train className="w-3.5 h-3.5" /> {op.label}
          </button>
        ))}
      </div>

      {/* Main WebGIS Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Station Selector Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-800/80 backdrop-blur border border-slate-700/80 p-5 rounded-3xl shadow-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" /> Stasiun ({filteredStations.length})
            </h3>

            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
              {filteredStations.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setSelectedStation(st)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                    selectedStation?.id === st.id
                      ? 'bg-blue-600/20 border-blue-500 text-blue-300 shadow-md shadow-blue-500/10'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-700/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">{st.name}</h4>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-mono font-bold text-white"
                      style={{ backgroundColor: st.line_color || '#0284c7' }}
                    >
                      {st.code}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
                    <span className="font-semibold text-slate-300">{st.operator}</span>
                    <span className="text-[11px] font-semibold text-blue-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {st.facilities?.length || 0} POI
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Interactive WebGIS Map & Station Details */}
        <div className="lg:col-span-8 space-y-6">
          <div className="h-[480px] w-full rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 relative">
            <WebGisMap
              stations={filteredStations}
              selectedStation={selectedStation}
              searchResults={[]}
              onSelectStation={(st) => setSelectedStation(st)}
            />
          </div>

          <TransitIntelligencePanel
            station={selectedStation}
            routeInfo={null}
          />
        </div>
      </div>
    </div>
  );
}
