import React, { useState, useEffect } from 'react';
import api from '../services/api';
import JourneyPanel from '../components/JourneyPanel';
import StationContextPanel from '../components/StationContextPanel';
import WebGisMap from '../components/WebGisMap';
import { Train, Layers, X, SlidersHorizontal, Filter, Activity, Zap, Radio, Bus } from 'lucide-react';

const operators = [
  { id: 'ALL',              label: 'Semua Moda',           icon: '🌐', color: 'bg-slate-600' },
  { id: 'TransJakarta',     label: '🚌 BRT TransJakarta',  icon: '🚌', color: 'bg-orange-600' },
  { id: 'RAIL_ALL',         label: '🚆 Semua Kereta',      icon: '🚆', color: 'bg-indigo-600' },
  { id: 'MRT Jakarta',      label: 'MRT Jakarta',          icon: '🚇', color: 'bg-sky-600' },
  { id: 'LRT Jabodebek',    label: 'LRT Jabodebek',        icon: '🚝', color: 'bg-rose-600' },
  { id: 'KRL Commuter Line',label: 'KRL Commuter',         icon: '🚆', color: 'bg-emerald-600' },
  { id: 'KAI Antarkota',    label: 'Kereta Antarkota',     icon: '🚂', color: 'bg-amber-600' },
];

export default function WebGisDashboardPage() {
  const [leftOpen,  setLeftOpen]  = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  const [stations,         setStations]         = useState([]);
  const [filteredStations, setFilteredStations] = useState([]);
  const [selectedStation,  setSelectedStation]  = useState(null);
  const [stationRoutes,    setStationRoutes]    = useState([]);
  const [loadingRoutes,    setLoadingRoutes]    = useState(false);
  const [selectedRouteId,  setSelectedRouteId]  = useState(null);
  const [selectedOp,       setSelectedOp]       = useState('ALL');
  const [loading,          setLoading]          = useState(true);

  useEffect(() => { fetchStations(); }, []);

  useEffect(() => {
    if (selectedStation?.id) {
      fetchStationRoutes(selectedStation.id);
    } else {
      setStationRoutes([]);
    }
  }, [selectedStation]);

  const fetchStations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/stations');
      const data = res.data?.data || [];
      setStations(data);
      setFilteredStations(data);
      if (data.length > 0) setSelectedStation(data[0]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStationRoutes = async (stationId) => {
    setLoadingRoutes(true);
    setSelectedRouteId(null);
    try {
      const res = await api.get(`/stations/${stationId}/routes`);
      const routesData = res.data?.routes || [];
      const geojsonFeatures = res.data?.geojson?.features || [];
      setStationRoutes({
        routes: routesData,
        features: geojsonFeatures,
        total: res.data?.total_routes || 0
      });
    } catch (e) {
      console.error('Failed fetching station routes:', e);
      setStationRoutes({ routes: [], features: [], total: 0 });
    } finally {
      setLoadingRoutes(false);
    }
  };

  const handleFilter = (op) => {
    setSelectedOp(op);
    if (op === 'ALL') {
      setFilteredStations(stations);
    } else if (op === 'TransJakarta') {
      setFilteredStations(stations.filter(s => s.operator === 'TransJakarta'));
    } else if (op === 'RAIL_ALL') {
      setFilteredStations(stations.filter(s => s.operator !== 'TransJakarta'));
    } else {
      setFilteredStations(stations.filter(s => s.operator === op));
    }
  };

  const handleSelectStation = (st) => {
    setSelectedStation(st);
    setRightOpen(true); // auto-open right panel on mobile
  };

  // ─── SIDEBAR WIDTH ────────────────────────────────────────────
  const SIDEBAR_W = 'w-72'; // 288px fixed

  return (
    /*
     * Outer wrapper: fills the remaining flex-1 space from App.jsx's <main>.
     * overflow-hidden prevents any child from pushing the layout.
     */
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', minHeight: 0 }}>

      {/* ── Sub-header: live status + operator filter bar ─────── */}
      <div
        style={{
          flexShrink: 0,
          background: 'rgba(30,41,59,0.7)',
          borderBottom: '1px solid rgba(51,65,85,0.4)',
          padding: '6px 12px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {/* Live badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399' }}>Live</span>
        </div>

        <span style={{ width: 1, height: 14, background: '#334155', flexShrink: 0 }} />

        {/* Journey summary */}
        <span style={{ fontSize: 10, color: '#94a3b8', flexShrink: 0 }}>
          <span style={{ color: '#ea580c', fontWeight: 700 }}>BRT TJ Corridor 1</span>
          {' → '}
          <span style={{ color: '#0284c7', fontWeight: 700 }}>MRT Bundaran HI</span>
          {' · Transit '}
          <span style={{ color: '#fbbf24', fontWeight: 800 }}>Dukuh Atas</span>
        </span>

        <span style={{ width: 1, height: 14, background: '#334155', flexShrink: 0 }} />

        {/* Filter label */}
        <Filter style={{ width: 11, height: 11, color: '#64748b', flexShrink: 0 }} />

        {/* Operator pills */}
        {operators.map((op) => (
          <button
            key={op.id}
            onClick={() => handleFilter(op.id)}
            style={{
              flexShrink: 0,
              padding: '3px 10px',
              borderRadius: 8,
              fontSize: 10,
              fontWeight: 700,
              cursor: 'pointer',
              border: selectedOp === op.id ? 'none' : '1px solid rgba(51,65,85,0.6)',
              background: selectedOp === op.id
                ? op.id === 'ALL'            ? '#475569'
                  : op.id === 'TransJakarta' ? '#ea580c'
                  : op.id === 'RAIL_ALL'     ? '#6366f1'
                  : op.id === 'MRT Jakarta'  ? '#0284c7'
                  : op.id === 'LRT Jabodebek'? '#e11d48'
                  : op.id === 'KRL Commuter Line'? '#059669'
                  : '#d97706'
                : '#1e293b',
              color: selectedOp === op.id ? '#fff' : '#94a3b8',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {op.label}
          </button>
        ))}

        {/* Spacer */}
        <span style={{ flex: 1 }} />

        {/* Station count */}
        <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', flexShrink: 0, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '3px 10px' }}>
          {filteredStations.length} Titik Transit
        </span>

        {/* Mobile toggles */}
        <button
          onClick={() => setLeftOpen(!leftOpen)}
          className="lg:hidden"
          style={{ padding: 6, background: 'rgba(51,65,85,0.6)', border: '1px solid rgba(71,85,105,0.5)', borderRadius: 8, color: '#cbd5e1', cursor: 'pointer', flexShrink: 0 }}
        >
          <Train style={{ width: 14, height: 14 }} />
        </button>
        <button
          onClick={() => setRightOpen(!rightOpen)}
          className="lg:hidden"
          style={{ padding: 6, background: 'rgba(51,65,85,0.6)', border: '1px solid rgba(71,85,105,0.5)', borderRadius: 8, color: '#cbd5e1', cursor: 'pointer', flexShrink: 0 }}
        >
          <SlidersHorizontal style={{ width: 14, height: 14 }} />
        </button>
      </div>

      {/* ── Main Body: 3-column layout ───────────────────────── */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, position: 'relative' }}>

        {/* ── LEFT PANEL: Journey & Route Planner ─────────────── */}
        {/* Desktop */}
        <aside
          className={`hidden lg:flex flex-col ${SIDEBAR_W}`}
          style={{
            flexShrink: 0,
            background: '#0f172a',
            borderRight: '1px solid rgba(51,65,85,0.5)',
            zIndex: 10,
          }}
        >
          <JourneyPanel
            stations={stations}
            selectedStation={selectedStation}
            onSelectStation={handleSelectStation}
          />
        </aside>

        {/* Mobile drawer */}
        {leftOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex"
            onClick={() => setLeftOpen(false)}
          >
            <div
              className={`w-80 h-full bg-slate-900 border-r border-slate-700 flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Train className="w-3.5 h-3.5 text-emerald-400" /> Perencana Rute & Stepper
                </span>
                <button onClick={() => setLeftOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <JourneyPanel
                  stations={stations}
                  selectedStation={selectedStation}
                  onSelectStation={(st) => { handleSelectStation(st); setLeftOpen(false); }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── CENTER PANEL: Interactive WebGIS Map Canvas ──────── */}
        <div style={{ flex: 1, position: 'relative', minWidth: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Bottom-left map overlay: Mode Legend (placed at bottom-left to avoid covering map controls) */}
          <div
            style={{
              position: 'absolute',
              bottom: 16, left: 16,
              zIndex: 10,
              background: 'rgba(15, 23, 42, 0.88)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(51, 65, 85, 0.8)',
              borderRadius: 12,
              padding: '10px 14px',
              fontFamily: 'system-ui, sans-serif',
              fontSize: 10,
              color: '#cbd5e1',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              pointerEvents: 'none'
            }}
          >
            <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: 11, marginBottom: 2, letterSpacing: '0.3px' }}>
              Kategori Moda Transit
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#ea580c', display: 'inline-block', boxShadow: '0 0 6px #ea580c' }} />
              <span style={{ fontWeight: 700, color: '#fed7aa' }}>🚌 BRT TransJakarta (Busway)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#0284c7', display: 'inline-block', boxShadow: '0 0 6px #0284c7' }} />
              <span style={{ fontWeight: 700, color: '#bae6fd' }}>🚇 MRT Jakarta</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#e11d48', display: 'inline-block', boxShadow: '0 0 6px #e11d48' }} />
              <span style={{ fontWeight: 700, color: '#fecdd3' }}>🚝 LRT Jabodebek</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#059669', display: 'inline-block', boxShadow: '0 0 6px #059669' }} />
              <span style={{ fontWeight: 700, color: '#a7f3d0' }}>🚆 KRL Commuter Line</span>
            </div>
          </div>

          <WebGisMap
            stations={filteredStations}
            selectedStation={selectedStation}
            stationRoutes={stationRoutes}
            selectedRouteId={selectedRouteId}
            onSelectStation={handleSelectStation}
          />
        </div>

        {/* ── RIGHT PANEL: Station Profile & Micro-Facilities ──── */}
        {/* Desktop */}
        <aside
          className={`hidden lg:flex flex-col ${SIDEBAR_W}`}
          style={{
            flexShrink: 0,
            background: '#0f172a',
            borderLeft: '1px solid rgba(51,65,85,0.5)',
            zIndex: 10,
          }}
        >
          <StationContextPanel
            station={selectedStation}
            stationRoutes={stationRoutes}
            loadingRoutes={loadingRoutes}
            selectedRouteId={selectedRouteId}
            onSelectRoute={(routeId) => setSelectedRouteId(routeId === selectedRouteId ? null : routeId)}
          />
        </aside>

        {/* Mobile drawer */}
        {rightOpen && (
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end"
            onClick={() => setRightOpen(false)}
          >
            <div
              className={`w-80 h-full bg-slate-900 border-l border-slate-700 flex flex-col`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> Profil & Fasilitas Halte
                </span>
                <button onClick={() => setRightOpen(false)} className="text-slate-400 hover:text-white p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <StationContextPanel
                  station={selectedStation}
                  stationRoutes={stationRoutes}
                  loadingRoutes={loadingRoutes}
                  selectedRouteId={selectedRouteId}
                  onSelectRoute={(routeId) => setSelectedRouteId(routeId === selectedRouteId ? null : routeId)}
                />
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
