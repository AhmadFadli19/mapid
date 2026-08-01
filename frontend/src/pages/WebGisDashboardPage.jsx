import React, { useState, useEffect } from 'react';
import api from '../services/api';
import JourneyPanel from '../components/JourneyPanel';
import StationContextPanel from '../components/StationContextPanel';
import WebGisMap from '../components/WebGisMap';
import { Train, Layers, X, SlidersHorizontal, Filter, Activity, Zap, Radio } from 'lucide-react';

const operators = [
  { id: 'ALL',              label: 'Semua Moda',      color: 'bg-slate-600' },
  { id: 'MRT Jakarta',      label: 'MRT Jakarta',     color: 'bg-sky-600' },
  { id: 'LRT Jabodebek',    label: 'LRT Jabodebek',   color: 'bg-rose-600' },
  { id: 'KRL Commuter Line',label: 'KRL Commuter',    color: 'bg-emerald-600' },
  { id: 'KAI Antarkota',    label: 'Kereta Antarkota',color: 'bg-amber-600' },
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
    setFilteredStations(op === 'ALL' ? stations : stations.filter(s => s.operator === op));
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
          <span style={{ color: '#f1f5f9', fontWeight: 700 }}>KRL Bogor</span>
          {' → '}
          <span style={{ color: '#f1f5f9', fontWeight: 700 }}>Sudirman</span>
          {' · ETA '}
          <span style={{ color: '#fbbf24', fontWeight: 800 }}>6 Mnt</span>
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
                  : op.id === 'MRT Jakarta'  ? '#0284c7'
                  : op.id === 'LRT Jabodebek'? '#e11d48'
                  : op.id === 'KRL Commuter Line'? '#059669'
                  : '#d97706'
                : '#1e293b',
              color: selectedOp === op.id ? '#fff' : '#94a3b8',
            }}
          >
            {op.label}
          </button>
        ))}

        {/* Spacer */}
        <span style={{ flex: 1 }} />

        {/* Station count */}
        <span style={{ fontSize: 10, fontWeight: 700, color: '#34d399', flexShrink: 0, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 8, padding: '3px 10px' }}>
          {filteredStations.length} Stasiun
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

      {/* ── 3-Column body ──────────────────────────────────────── */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0 }}>

        {/* ══ LEFT SIDEBAR ══════════════════════════════════════ */}
        {/* Backdrop (mobile) */}
        {leftOpen && (
          <div
            onClick={() => setLeftOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(2,6,23,0.6)', backdropFilter: 'blur(4px)',
            }}
            className="lg:hidden"
          />
        )}

        <aside
          style={{
            width: 288,
            flexShrink: 0,
            background: '#0f172a',
            borderRight: '1px solid rgba(51,65,85,0.4)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          className="hidden lg:flex"
        >
          {/* Sidebar header */}
          <div style={{
            padding: '10px 12px',
            borderBottom: '1px solid rgba(51,65,85,0.4)',
            display: 'flex', alignItems: 'center', gap: 8,
            flexShrink: 0, background: '#0f172a',
          }}>
            <div style={{ padding: 5, background: 'rgba(16,185,129,0.15)', borderRadius: 8 }}>
              <Train style={{ width: 14, height: 14, color: '#10b981' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>Journey & Action Panel</span>
          </div>
          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            <JourneyPanel selectedStation={selectedStation} />
          </div>
        </aside>

        {/* Mobile left drawer */}
        <aside
          className="lg:hidden"
          style={{
            position: 'fixed', top: 0, left: 0, height: '100%',
            width: 280, zIndex: 50,
            background: '#0f172a',
            borderRight: '1px solid rgba(51,65,85,0.4)',
            display: 'flex', flexDirection: 'column',
            transform: leftOpen ? 'translateX(0)' : 'translateX(-100%)',
            transition: 'transform 0.3s ease',
          }}
        >
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(51,65,85,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>Journey & Action Panel</span>
            <button onClick={() => setLeftOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            <JourneyPanel selectedStation={selectedStation} />
          </div>
        </aside>

        {/* ══ CENTER MAP ════════════════════════════════════════ */}
        <main style={{ flex: 1, position: 'relative', overflow: 'hidden', minWidth: 0 }}>
          {/* GTFS ticker */}
          <div style={{
            position: 'absolute', top: 12, left: 12, zIndex: 1000,
            display: 'flex', alignItems: 'center', gap: 7,
            background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: 12, padding: '6px 12px',
            pointerEvents: 'none',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 600, color: '#34d399' }}>Kereta berjalan lancar (GTFS Realtime)</span>
          </div>

          {/* Selected station pill */}
          {selectedStation && (
            <div style={{
              position: 'absolute', top: 12, right: 12, zIndex: 1000,
              background: 'rgba(15,23,42,0.92)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(6,182,212,0.4)',
              borderRadius: 12, padding: '8px 12px',
              pointerEvents: 'none',
            }}>
              <p style={{ fontSize: 9, color: '#64748b', margin: 0 }}>Stasiun Dipilih</p>
              <p style={{ fontSize: 12, fontWeight: 900, color: '#67e8f9', margin: '2px 0 0' }}>{selectedStation.name}</p>
              <p style={{ fontSize: 9, color: '#64748b', margin: '1px 0 0' }}>{selectedStation.operator}</p>
            </div>
          )}

          {/* Loading overlay */}
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, zIndex: 999,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(4px)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                background: '#1e293b', border: '1px solid #334155',
                borderRadius: 16, padding: '12px 20px',
              }}>
                <Zap style={{ width: 16, height: 16, color: '#10b981' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>Memuat data stasiun...</span>
              </div>
            </div>
          )}

          {/* The actual Leaflet map — fills remaining space */}
          <div style={{ position: 'absolute', inset: 0 }}>
            <WebGisMap
              stations={filteredStations}
              selectedStation={selectedStation}
              stationRoutes={stationRoutes}
              selectedRouteId={selectedRouteId}
              searchResults={[]}
              onSelectStation={handleSelectStation}
            />
          </div>
        </main>

        {/* ══ RIGHT SIDEBAR ═════════════════════════════════════ */}
        {rightOpen && (
          <div
            onClick={() => setRightOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(2,6,23,0.6)', backdropFilter: 'blur(4px)',
            }}
            className="lg:hidden"
          />
        )}

        <aside
          style={{
            width: 288,
            flexShrink: 0,
            background: '#0f172a',
            borderLeft: '1px solid rgba(51,65,85,0.4)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
          className="hidden lg:flex"
        >
          <div style={{
            padding: '10px 12px',
            borderBottom: '1px solid rgba(51,65,85,0.4)',
            display: 'flex', alignItems: 'center', gap: 8,
            flexShrink: 0, background: '#0f172a',
          }}>
            <div style={{ padding: 5, background: 'rgba(6,182,212,0.15)', borderRadius: 8 }}>
              <Layers style={{ width: 14, height: 14, color: '#06b6d4' }} />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>Station Context & Insights</span>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            <StationContextPanel
              selectedStation={selectedStation}
              stationRoutes={stationRoutes}
              loadingRoutes={loadingRoutes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={setSelectedRouteId}
            />
          </div>
        </aside>

        {/* Mobile right drawer */}
        <aside
          className="lg:hidden"
          style={{
            position: 'fixed', top: 0, right: 0, height: '100%',
            width: 280, zIndex: 50,
            background: '#0f172a',
            borderLeft: '1px solid rgba(51,65,85,0.4)',
            display: 'flex', flexDirection: 'column',
            transform: rightOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.3s ease',
          }}
        >
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(51,65,85,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#e2e8f0' }}>Station Context & Insights</span>
            <button onClick={() => setRightOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 4 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
            <StationContextPanel
              selectedStation={selectedStation}
              stationRoutes={stationRoutes}
              loadingRoutes={loadingRoutes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={setSelectedRouteId}
            />
          </div>
        </aside>

      </div>
    </div>
  );
}
