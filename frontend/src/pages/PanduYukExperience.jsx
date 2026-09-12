import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Accessibility,
  Building2,
  Check,
  CircleCheck,
  ChevronRight,
  CircleAlert,
  CircleUserRound,
  Clock3,
  DoorOpen,
  Gauge,
  House,
  Info,
  LocateFixed,
  MapPin,
  MapPinned,
  MessageCircle,
  RefreshCw,
  Route as RouteIcon,
  Search,
  Send,
  Sparkles,
  TriangleAlert,
} from 'lucide-react';
import api, { normalizeStations } from '../services/api';
import WebGisMap from '../components/WebGisMap';
import avatar from '../assets/figma/panduyuk-avatar.svg';
import toggleKnob from '../assets/figma/panduyuk-toggle-knob.svg';
import station from '../assets/figma/panduyuk-station.svg';
import stationDestination from '../assets/figma/panduyuk-station-destination.svg';
import routeStop from '../assets/figma/panduyuk-route-stop.svg';
import routeDestination from '../assets/figma/panduyuk-route-destination.svg';
import timelineDone from '../assets/figma/panduyuk-timeline-done.svg';
import timelineNext from '../assets/figma/panduyuk-timeline-next.svg';
import timelineSoon from '../assets/figma/panduyuk-timeline-soon.svg';
import timelineLater from '../assets/figma/panduyuk-timeline-later.svg';
import './PanduYukExperience.css';

const FALLBACK_STATIONS = [
  { id: 142, code: 'BHI', name: 'Stasiun Bundaran HI', operator: 'MRT Jakarta', line_color: '#0284c7', latitude: -6.193125, longitude: 106.822894, address: 'Jl. M.H. Thamrin, Menteng, Jakarta Pusat' },
  { id: 143, code: 'DKA', name: 'Stasiun Dukuh Atas BNI', operator: 'MRT Jakarta', line_color: '#0284c7', latitude: -6.200788, longitude: 106.822765, address: 'Jl. Jend. Sudirman, Setiabudi, Jakarta Selatan' },
  { id: 146, code: 'MRI', name: 'Stasiun Manggarai', operator: 'KRL Commuter Line', line_color: '#16a34a', latitude: -6.2099, longitude: 106.8499, address: 'Tebet, Jakarta Selatan' },
  { id: 147, code: 'HRM', name: 'Halte Harmoni Central', operator: 'TransJakarta', line_color: '#ea580c', latitude: -6.167382, longitude: 106.820251, address: 'Gambir, Jakarta Pusat' },
  { id: 1, code: 'TJ_JT_1028', name: 'Halte Pasar Enjo', operator: 'TransJakarta', line_color: '#ea580c', latitude: -6.2148666, longitude: 106.8783037, address: 'Pisangan Timur, Jakarta Timur' },
];

const TRANSIT_LAYERS = [
  { id: 'ALL', label: 'All modes' },
  { id: 'KRL Commuter Line', label: 'KRL' },
  { id: 'MRT Jakarta', label: 'MRT' },
  { id: 'LRT Jabodebek', label: 'LRT' },
  { id: 'TransJakarta', label: 'TransJakarta' },
];

const REPORT_TYPES = [
  { value: 'Broken facility', label: 'Broken facility', mobileLabel: 'Facility' },
  { value: 'Tenant closed', label: 'Tenant closed', mobileLabel: 'Tenant' },
  { value: 'Crowded', label: 'Crowded', mobileLabel: 'Crowded' },
];

const timelineItems = [
  { time: '08:10', label: 'Depart Palmerah', status: 'Done', tone: 'done', icon: timelineDone },
  { time: '08:24', label: 'Transfer at Dukuh Atas', status: 'Next', tone: 'next', icon: timelineNext },
  { time: '08:28', label: 'Board car 3', status: 'Soon', tone: 'soon', icon: timelineSoon },
  { time: '08:44', label: 'Exit at Bundaran HI', status: 'Later', tone: 'later', icon: timelineLater },
];

function stationLabel(station, fallback) {
  return station?.name || fallback;
}

function preferredStation(stations) {
  return stations.find((item) => /bundaran hi/i.test(item.name || ''))
    || stations.find((item) => item.operator && item.operator !== 'TransJakarta')
    || stations[0]
    || null;
}

function displayStationName(name, fallback) {
  return (name || fallback || '').replace(/^Stasiun\s+/i, '');
}

function formatFare(value) {
  if (value === null || value === undefined || value === '') return '—';
  return `Rp${Number(value).toLocaleString('id-ID')}`;
}

function formatUpdatedAt(value, fallback = 'Waktu pembaruan belum tersedia') {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(parsed);
}

function dataSourceLabel(source, timestamp) {
  return `${source || 'Sumber data belum tersedia'} · ${timestamp ? formatUpdatedAt(timestamp) : 'timestamp belum tersedia'}`;
}

function unwrapApiData(payload) {
  return payload?.data?.data || payload?.data || payload;
}

function facilityIsAvailable(facility) {
  if (!facility) return false;
  if (facility.is_available === false) return false;
  return !/rusak|tutup|perbaikan|terkendala|tidak tersedia/i.test(facility.status_note || facility.status || '');
}

function useStationDetails(stationId) {
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    if (!stationId) {
      setStation(null);
      return undefined;
    }

    setLoading(true);
    setError('');
    api.get(`/stations/${stationId}`)
      .then((response) => {
        if (active) setStation(unwrapApiData(response.data));
      })
      .catch(() => {
        if (active) setError('Detail stasiun belum tersedia.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [stationId, reloadKey]);

  return { station, loading, error, reload: () => setReloadKey((value) => value + 1) };
}

function DataSourceNote({ source, timestamp, children }) {
  return (
    <small className="pandu-data-source">
      {children || dataSourceLabel(source, timestamp)}
    </small>
  );
}

function ExplicitDataState({ title = 'Data belum tersedia', body = 'Sumber data belum mengirim informasi yang cukup untuk ditampilkan.', actionLabel, onAction }) {
  return (
    <div className="pandu-empty-state">
      <TriangleAlert size={18} aria-hidden="true" />
      <strong>{title}</strong>
      <p>{body}</p>
      {actionLabel && onAction ? <button type="button" className="pandu-secondary-button" onClick={onAction}>{actionLabel}</button> : null}
    </div>
  );
}

function StationSelector({ stations, value, onChange }) {
  return (
    <label className="pandu-station-selector">
      <span>STATION / STOP</span>
      <select value={value || ''} onChange={(event) => onChange(event.target.value)}>
        {stations.length === 0 ? <option value="">Data stasiun belum tersedia</option> : null}
        {stations.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
      </select>
    </label>
  );
}

function buildJourneyTimeline(journeyData) {
  const route = journeyData?.route;
  const intelligence = journeyData?.transit_intelligence || {};
  const originName = displayStationName(route?.origin?.name, 'Stasiun asal');
  const destinationName = displayStationName(route?.destination?.name, 'Stasiun tujuan');
  const boarding = intelligence.boarding_recommendation;
  const arrival = intelligence.arrival_reminder;
  const exit = intelligence.exit_recommendation;

  return [
    { time: 'Now', label: `Depart ${originName}`, status: 'Done', tone: 'done', icon: timelineDone },
    { time: 'Next', label: boarding?.recommended_car ? `Board ${boarding.recommended_car}` : 'Board next service', status: 'Next', tone: 'next', icon: timelineNext },
    { time: arrival?.trigger_distance_meters ? `${arrival.trigger_distance_meters} m` : 'Soon', label: `Prepare at ${destinationName}`, status: 'Soon', tone: 'soon', icon: timelineSoon },
    { time: 'Exit', label: exit?.recommended_exit || 'Follow the recommended exit', status: 'Later', tone: 'later', icon: timelineLater },
  ];
}

function formatToday() {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  })
    .format(new Date())
    .toUpperCase();
}

function PanduHeader({ darkMode, onToggleTheme, title, backLabel, mobileBackLabel, onBack, onLogout }) {
  const navigate = useNavigate();

  return (
    <header className={`pandu-header ${title ? 'has-page-title' : ''}`}>
      <button className="pandu-brand" type="button" onClick={() => navigate('/webgis-dashboard')} aria-label="Kembali ke home">
        <span className="pandu-wordmark-blue">PANDU</span><span className="pandu-wordmark-cyan">YUK</span>
      </button>

      {backLabel ? (
        <button type="button" className="pandu-back-link" onClick={onBack}>
          <ArrowLeft size={14} aria-hidden="true" />
          <span className="desktop-only">{backLabel}</span>
          <span className="mobile-only">{mobileBackLabel || backLabel}</span>
        </button>
      ) : null}

      <nav className="pandu-desktop-nav" aria-label="Navigasi PanduYuk">
        <button type="button" className={!title ? 'is-active' : ''} onClick={() => navigate('/webgis-dashboard')}>Explore</button>
        <button type="button" className={title === 'Your journey' ? 'is-active' : ''} onClick={() => navigate('/trip-detail')}>My trips</button>
        <button type="button" onClick={() => navigate('/webgis-dashboard#how-it-works')}>How it works</button>
      </nav>

      {title ? <div className="pandu-page-title">{title}</div> : null}

      <div className="pandu-header-actions">
        <button
          type="button"
          className={`pandu-theme-toggle ${darkMode ? 'is-dark' : 'is-light'}`}
          onClick={onToggleTheme}
          aria-label={`Aktifkan mode ${darkMode ? 'light' : 'dark'}`}
          aria-pressed={darkMode}
        >
          <span className="pandu-theme-symbol" aria-hidden="true">{darkMode ? '☾' : '☼'}</span>
          <span className="pandu-toggle-knob"><img src={toggleKnob} alt="" /></span>
        </button>
        <span className="pandu-theme-label">{darkMode ? 'Dark' : 'Light'}</span>
        <button type="button" className="pandu-avatar" onClick={onLogout} aria-label="Profil pengguna">
          <img src={avatar} alt="" />
          <span>A</span>
        </button>
      </div>
    </header>
  );
}

function BottomNavigation({ active }) {
  const navigate = useNavigate();
  const items = [
    { id: 'home', label: 'Home', icon: House, path: '/webgis-dashboard' },
    { id: 'trips', label: 'Trips', icon: RouteIcon, path: '/trip-detail' },
    { id: 'reports', label: 'Reports', icon: CircleAlert, path: '/community-report' },
    { id: 'profile', label: 'Profile', icon: CircleUserRound, path: '/webgis-dashboard' },
  ];

  return (
    <nav className="pandu-bottom-nav" aria-label="Navigasi mobile">
      {items.map(({ id, label, icon: Icon, path }) => (
        <button key={id} type="button" className={active === id ? 'is-active' : ''} onClick={() => navigate(path)}>
          <Icon size={13} strokeWidth={2} aria-hidden="true" />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

function SearchJourneyCard({ onPlan }) {
  return (
    <div className="pandu-search-card">
      <div className="pandu-search-copy">
        <span className="pandu-card-label desktop-only">Plan a journey</span>
        <span className="pandu-search-icon"><Search size={17} aria-hidden="true" /></span>
        <span className="pandu-search-placeholder mobile-only">Where are you going?</span>
        <span className="pandu-search-route desktop-only">Stasiun Palmerah <span aria-hidden="true">→</span> Bundaran HI</span>
      </div>
      <button type="button" className="pandu-primary-button pandu-search-button" onClick={onPlan} aria-label="Plan trip">
        <span className="desktop-only">Plan trip</span>
        <ChevronRight size={18} className="mobile-only" aria-hidden="true" />
      </button>
    </div>
  );
}

function MiniTransitMap() {
  return (
    <div className="pandu-mini-map" aria-label="Peta mini rute Palmerah ke Bundaran HI">
      <span className="pandu-map-line pandu-map-line-a" />
      <span className="pandu-map-line pandu-map-line-b" />
      <span className="pandu-map-stop stop-one"><img src={station} alt="" /></span>
      <span className="pandu-map-stop stop-two"><img src={station} alt="" /></span>
      <span className="pandu-map-stop stop-three"><img src={stationDestination} alt="" /></span>
      <span className="pandu-map-label label-one">Palmerah</span>
      <span className="pandu-map-label label-two">Dukuh Atas</span>
      <span className="pandu-map-label label-three">Bundaran HI</span>
    </div>
  );
}

function PanduMapCard({ stations, onNavigate, compact = false }) {
  const [selectedOp, setSelectedOp] = useState('ALL');
  const [selectedStationId, setSelectedStationId] = useState(preferredStation(stations)?.id ?? null);
  const [stationRoutes, setStationRoutes] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState(null);

  const filteredStations = useMemo(() => {
    if (selectedOp === 'ALL') return stations;
    return stations.filter((item) => item.operator === selectedOp);
  }, [selectedOp, stations]);

  useEffect(() => {
    const preferred = preferredStation(stations);
    setSelectedStationId(preferred?.id ?? null);
  }, [stations]);

  useEffect(() => {
    if (!filteredStations.some((item) => String(item.id) === String(selectedStationId))) {
      setSelectedStationId(filteredStations[0]?.id ?? null);
    }
  }, [filteredStations, selectedStationId]);

  const selectedStation = stations.find((item) => String(item.id) === String(selectedStationId)) || filteredStations[0] || stations[0] || null;

  useEffect(() => {
    let active = true;
    if (!selectedStation?.id) {
      setStationRoutes(null);
      return undefined;
    }

    setLoadingRoutes(true);
    api.get(`/stations/${selectedStation.id}/routes`)
      .then((response) => {
        if (!active) return;
        setStationRoutes({
          routes: response.data?.routes || [],
          features: response.data?.geojson?.features || [],
          total: response.data?.total_routes || 0,
        });
        setLastSyncedAt(new Date());
      })
      .catch(() => {
        if (active) setStationRoutes({ routes: [], features: [], total: 0 });
      })
      .finally(() => {
        if (active) setLoadingRoutes(false);
      });

    return () => { active = false; };
  }, [selectedStation?.id]);

  const handleLayerChange = (layerId) => {
    setSelectedOp(layerId);
    const nextStations = layerId === 'ALL'
      ? stations
      : stations.filter((item) => item.operator === layerId);
    if (nextStations[0]) setSelectedStationId(nextStations[0].id);
  };

  const facilityNames = (selectedStation?.facilities || [])
    .slice(0, 3)
    .map((item) => item.facility_name || item.name)
    .filter(Boolean);
  const detailChips = facilityNames.length > 0 ? facilityNames : ['Facilities', 'Exit gates', 'Tenants & POI'];
  const hasRouteData = Boolean(stationRoutes?.total || stationRoutes?.features?.length);
  const syncLabel = lastSyncedAt
    ? `Synced ${lastSyncedAt.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`
    : 'Waiting for live data';

  return (
    <section className={`pandu-map-card ${compact ? 'is-compact' : ''}`} aria-labelledby="pandu-map-title">
      <div className="pandu-map-card-header">
        <div>
          <span className="pandu-card-label blue">MAPID MAPS • ROUTE CONTEXT</span>
          <h2 id="pandu-map-title">{compact ? 'See every transfer in context.' : 'See your journey in context.'}</h2>
          <p>Transit layers, stations, exits, and nearby facilities in one view.</p>
        </div>
        <span className="pandu-live-status"><span />{loadingRoutes ? 'Syncing' : hasRouteData ? 'Layer live' : 'Data belum tersedia'}</span>
      </div>

      <div className="pandu-map-layer-switcher" role="tablist" aria-label="Transit map layers">
        {TRANSIT_LAYERS.map((layer) => (
          <button
            key={layer.id}
            type="button"
            role="tab"
            aria-selected={selectedOp === layer.id}
            className={selectedOp === layer.id ? 'is-active' : ''}
            onClick={() => handleLayerChange(layer.id)}
          >
            {layer.label}
          </button>
        ))}
      </div>

      <div className="pandu-map-content">
        <div className="pandu-map-viewport">
          <WebGisMap
            stations={filteredStations}
            selectedStation={selectedStation}
            stationRoutes={stationRoutes}
            onSelectStation={(stationItem) => setSelectedStationId(stationItem.id)}
            initialStyle="light"
            compactControls
          />
        </div>

        <aside className="pandu-map-context">
          <span className="pandu-card-label">SELECTED POINT</span>
          <h3>{selectedStation?.name || 'Choose a station'}</h3>
          <p>{selectedStation?.operator || 'Transit stop'}{selectedStation?.address ? ` · ${selectedStation.address}` : ''}</p>
          <div className="pandu-map-detail-list">
            {detailChips.map((chip) => <span key={chip}>{chip}</span>)}
          </div>
          <div className="pandu-map-route-count">
            <RouteIcon size={14} aria-hidden="true" />
            <span>{hasRouteData ? `${stationRoutes.total || stationRoutes.features.length} mapped route${(stationRoutes.total || stationRoutes.features.length) === 1 ? '' : 's'}` : 'Data rute belum tersedia'}</span>
          </div>
          <button type="button" className="pandu-text-button" onClick={() => onNavigate(`/station-info?station_id=${selectedStation?.id || ''}`)}>
            Open station info <ArrowRight size={13} />
          </button>
          <small>{syncLabel} · source: Community Maps MAPID</small>
        </aside>
      </div>
    </section>
  );
}

function StationInformationView({ stations, onNavigate, initialStationId = '' }) {
  const defaultStation = preferredStation(stations);
  const [selectedStationId, setSelectedStationId] = useState(initialStationId || defaultStation?.id || '');
  const [activeTab, setActiveTab] = useState('facilities');
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const { station: stationDetail, loading, error, reload } = useStationDetails(selectedStationId);

  useEffect(() => {
    if (!selectedStationId && defaultStation) setSelectedStationId(defaultStation.id);
  }, [defaultStation, selectedStationId]);

  const selectedStation = stations.find((item) => String(item.id) === String(selectedStationId)) || defaultStation;
  const station = stationDetail || selectedStation;
  const facilities = station?.facilities || [];
  const exits = station?.exits || [];
  const tenants = station?.tenants || [];
  const visibleFacilities = accessibleOnly ? facilities.filter((facility) => facility.is_accessible || /akses|lift|difabel|ramp/i.test(facility.facility_name || facility.name || '')) : facilities;

  return (
    <div className="pandu-page pandu-subpage pandu-station-page">
      <div className="pandu-subpage-intro pandu-station-intro">
        <div>
          <p className="pandu-eyebrow blue-text">STATION INFORMATION</p>
          <h1>{station?.name || 'Choose a station'}</h1>
          <p className="pandu-lede">Facilities, exits, tenants, and accessibility in one calm view.</p>
        </div>
        <StationSelector stations={stations} value={selectedStationId} onChange={setSelectedStationId} />
      </div>

      <div className="pandu-station-meta-row">
        <span className="pandu-status-pill success"><span />{station?.operator || 'Operator belum tersedia'}</span>
        <span>{station?.address || 'Alamat stasiun belum tersedia'}</span>
        <DataSourceNote source="Community Maps MAPID" timestamp={station?.updated_at} />
        <button type="button" className="pandu-icon-button" onClick={reload} aria-label="Refresh station data"><RefreshCw size={14} /></button>
      </div>

      <div className="pandu-station-grid">
        <section className="pandu-station-map-panel">
          <div className="pandu-panel-heading">
            <div>
              <span className="pandu-card-label blue">MAPID MAPS · STATION CONTEXT</span>
              <h2>{station?.name || 'Station map'}</h2>
            </div>
            <span className="pandu-live-status"><span />{loading ? 'Syncing' : stationDetail ? 'Layer live' : 'Data belum tersedia'}</span>
          </div>
          <div className="pandu-station-map-viewport">
            <WebGisMap
              stations={selectedStation ? [selectedStation] : stations}
              selectedStation={selectedStation}
              initialStyle="light"
              compactControls
            />
          </div>
          <div className="pandu-panel-actions">
            <button type="button" className="pandu-secondary-button" onClick={() => onNavigate('/community-report')}><CircleAlert size={14} /> Report issue</button>
            <button type="button" className="pandu-primary-button" onClick={() => onNavigate('/trip-detail')}>Show my journey <ArrowRight size={14} /></button>
          </div>
        </section>

        <section className="pandu-station-detail-panel">
          <div className="pandu-detail-tabs" role="tablist" aria-label="Station information sections">
            {[['facilities', 'Facilities'], ['exits', 'Exit gates'], ['tenants', 'Tenants']].map(([id, label]) => (
              <button key={id} type="button" role="tab" aria-selected={activeTab === id} className={activeTab === id ? 'is-active' : ''} onClick={() => setActiveTab(id)}>{label}</button>
            ))}
          </div>

          {activeTab === 'facilities' ? (
            <>
              <div className="pandu-filter-row">
                <span className="pandu-card-label">LIVE FACILITY STATUS</span>
                <label className="pandu-inline-toggle"><input type="checkbox" checked={accessibleOnly} onChange={(event) => setAccessibleOnly(event.target.checked)} /><span />Accessible only</label>
              </div>
              {error ? <ExplicitDataState title="Station data belum tersambung" body={error} actionLabel="Try again" onAction={reload} /> : null}
              {!loading && !error && visibleFacilities.length === 0 ? <ExplicitDataState body="Tidak ada fasilitas yang cocok dengan filter ini. Kami tidak menebak status yang tidak tersedia." /> : null}
              <div className="pandu-station-list">
                {visibleFacilities.map((facility) => {
                  const available = facilityIsAvailable(facility);
                  return (
                    <article className="pandu-station-list-item" key={facility.id || facility.facility_name}>
                      <div className="pandu-list-icon"><Accessibility size={16} /></div>
                      <div className="pandu-list-copy"><strong>{facility.facility_name || facility.name}</strong><span>{facility.status_note || facility.category || 'Facility status'}</span><DataSourceNote source="GEO MAPID + Community Report" timestamp={facility.updated_at}>{facility.updated_at ? `Updated ${formatUpdatedAt(facility.updated_at)}` : 'Last update not available'}</DataSourceNote></div>
                      <span className={`pandu-status-pill ${available ? 'success' : 'danger'}`}><span />{available ? 'Available' : 'Unavailable'}</span>
                    </article>
                  );
                })}
              </div>
            </>
          ) : null}

          {activeTab === 'exits' ? (
            <div className="pandu-station-list">
              {exits.length === 0 ? <ExplicitDataState body="Data pintu keluar belum tersedia untuk stasiun ini." /> : exits.map((exit) => (
                <article className="pandu-station-list-item" key={exit.id || exit.gate_name}>
                  <div className="pandu-list-icon"><DoorOpen size={16} /></div>
                  <div className="pandu-list-copy"><strong>{exit.gate_name}</strong><span>{exit.target_street || exit.nearest_poi || 'Arah tujuan belum tersedia'}</span><DataSourceNote source="Community Maps MAPID" timestamp={exit.updated_at} /></div>
                  {exit.is_accessible ? <span className="pandu-status-pill success"><span />Accessible</span> : null}
                </article>
              ))}
            </div>
          ) : null}

          {activeTab === 'tenants' ? (
            <div className="pandu-station-list">
              {tenants.length === 0 ? <ExplicitDataState body="Data tenant belum tersedia untuk stasiun ini." /> : tenants.map((tenant) => (
                <article className="pandu-station-list-item" key={tenant.id || tenant.tenant_name}>
                  <div className="pandu-list-icon"><Building2 size={16} /></div>
                  <div className="pandu-list-copy"><strong>{tenant.tenant_name}</strong><span>{tenant.category || 'Tenant'}{tenant.jam_buka ? ` · ${tenant.jam_buka}–${tenant.jam_tutup}` : ''}</span><DataSourceNote source="Community Maps MAPID" timestamp={tenant.synced_from_api_at || tenant.updated_at} /></div>
                  <span className={`pandu-status-pill ${tenant.is_active === false ? 'danger' : 'success'}`}><span />{tenant.is_active === false ? 'Closed' : 'Open'}</span>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
      <BottomNavigation active="home" />
    </div>
  );
}

function ArrivalExitView({ onNavigate, onToast, journeyData }) {
  const intelligence = journeyData?.transit_intelligence || {};
  const arrival = intelligence.arrival_reminder;
  const exit = intelligence.exit_recommendation;
  const destinationId = journeyData?.route?.destination?.id;
  const { station: destinationStation } = useStationDetails(destinationId);
  const alternatives = (destinationStation?.exits || []).filter((item) => item.gate_name !== exit?.recommended_exit);
  const hasLiveData = Boolean(journeyData && arrival && exit);

  return (
    <div className="pandu-page pandu-subpage pandu-arrival-page">
      <div className="pandu-subpage-intro">
        <p className="pandu-eyebrow orange-text">ARRIVAL REMINDER · EXIT GUIDE</p>
        <h1>Arrive with a little more certainty.</h1>
        <p className="pandu-lede">The next alert and the right exit, explained with the data behind them.</p>
      </div>

      {!hasLiveData ? (
        <ExplicitDataState title="Journey data belum tersedia" body="Plan a journey first so PanduYuk can show an arrival reminder and exit recommendation without guessing." actionLabel="Plan a journey" onAction={() => onNavigate('/route-planner')} />
      ) : (
        <>
          <section className="pandu-arrival-alert">
            <div className="pandu-alert-icon"><Gauge size={22} /></div>
            <div><span className="pandu-card-label orange">GET READY</span><h2>{arrival.trigger_distance_meters || 500}m before {journeyData.route.destination.name}</h2><p>{arrival.message}</p><DataSourceNote source={arrival.data_source || 'GTFS Realtime'} timestamp={arrival.last_updated} /></div>
          </section>

          <div className="pandu-arrival-grid-large">
            <section className="pandu-exit-recommendation">
              <span className="pandu-card-label blue">RECOMMENDED EXIT</span>
              <div className="pandu-exit-heading"><div className="pandu-list-icon"><DoorOpen size={18} /></div><div><h2>{exit.recommended_exit}</h2><p>{exit.target_street || 'Arah tujuan belum tersedia'}</p></div></div>
              <div className="pandu-exit-meta"><span><MapPinned size={14} />{intelligence.boarding_recommendation?.walking_time_seconds || '—'}m from arrival</span><span><Accessibility size={14} />{exit.is_accessible ? 'Accessible route' : 'Accessibility not available'}</span></div>
              <div className="pandu-explain-box"><Info size={15} /><div><strong>Why this is recommended</strong><p>{exit.reason}</p><small>{exit.analysis_method || 'Spatial Relationship + Nearest Facility Analysis'} · {formatUpdatedAt(exit.last_updated)}</small></div></div>
              <div className="pandu-panel-actions"><button type="button" className="pandu-primary-button" onClick={() => onNavigate(`/facility-finder?station_id=${destinationId || ''}`)}>Show facilities <ArrowRight size={14} /></button><button type="button" className="pandu-secondary-button" onClick={() => onToast(exit.explainability || exit.reason)}>Explain recommendation</button></div>
            </section>

            <aside className="pandu-alternative-exits">
              <span className="pandu-card-label">OTHER EXITS</span>
              {alternatives.length === 0 ? <ExplicitDataState body="Alternatif exit belum tersedia." /> : alternatives.map((item) => <div className="pandu-alternative-exit" key={item.id || item.gate_name}><strong>{item.gate_name}</strong><span>{item.target_street || item.nearest_poi || 'Direction not available'}</span>{item.is_accessible ? <small><Accessibility size={12} /> Accessible</small> : null}</div>)}
              <DataSourceNote source="Community Maps MAPID" timestamp={destinationStation?.updated_at} />
            </aside>
          </div>
        </>
      )}
      <BottomNavigation active="trips" />
    </div>
  );
}

function FacilityRecommendationView({ stations, onNavigate, initialStationId = '' }) {
  const defaultStation = preferredStation(stations);
  const [selectedStationId, setSelectedStationId] = useState(initialStationId || defaultStation?.id || '');
  const [filter, setFilter] = useState('ALL');
  const [accessibleOnly, setAccessibleOnly] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { station: stationDetail } = useStationDetails(selectedStationId);

  useEffect(() => {
    if (!selectedStationId && defaultStation) setSelectedStationId(defaultStation.id);
  }, [defaultStation, selectedStationId]);

  useEffect(() => {
    let active = true;
    if (!selectedStationId) return undefined;
    setLoading(true);
    setError('');
    api.get(`/v1/facilities/search?station_id=${selectedStationId}`)
      .then((response) => {
        if (!active) return;
        const payload = response.data || {};
        const next = payload.facilities || payload.data || [];
        setFacilities(Array.isArray(next) ? next : []);
      })
      .catch(() => {
        if (active) setError('Fasilitas belum dapat dimuat dari sumber data.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedStationId]);

  const station = stations.find((item) => String(item.id) === String(selectedStationId)) || defaultStation;
  const sourceFacilities = facilities.length > 0 ? facilities : (stationDetail?.facilities || []);
  const filteredFacilities = sourceFacilities.filter((facility) => {
    const name = `${facility.name || ''} ${facility.facility_name || ''} ${facility.category || ''}`.toLowerCase();
    const matchesFilter = filter === 'ALL' || (filter === 'ACCESSIBILITY' ? Boolean(facility.is_accessible) || /akses|difabel|lift|ramp/.test(name) : name.includes(filter.toLowerCase()));
    return matchesFilter && (!accessibleOnly || Boolean(facility.is_accessible) || /akses|difabel|lift|ramp/.test(name));
  });
  const rankedFacilities = [...filteredFacilities].sort((a, b) => Number(a.walking_time_seconds ?? 999999) - Number(b.walking_time_seconds ?? 999999));
  const recommended = rankedFacilities.find(facilityIsAvailable);

  return (
    <div className="pandu-page pandu-subpage pandu-facility-page">
      <div className="pandu-subpage-intro pandu-station-intro"><div><p className="pandu-eyebrow green-text">FACILITY RECOMMENDATION</p><h1>Find what you need, nearby.</h1><p className="pandu-lede">Recommendations respect distance, accessibility, and whether a facility is actually available.</p></div><StationSelector stations={stations} value={selectedStationId} onChange={setSelectedStationId} /></div>
      <div className="pandu-facility-toolbar"><div className="pandu-filter-chips" role="tablist" aria-label="Facility filters">{[['ALL', 'All'], ['LIFT', 'Lift'], ['TOILET', 'Toilet'], ['MUSALA', 'Musala'], ['ACCESSIBILITY', 'Accessible']].map(([id, label]) => <button key={id} type="button" className={filter === id ? 'is-active' : ''} onClick={() => setFilter(id)}>{label}</button>)}</div><label className="pandu-inline-toggle"><input type="checkbox" checked={accessibleOnly} onChange={(event) => setAccessibleOnly(event.target.checked)} /><span />Accessible only</label></div>

      {error ? <ExplicitDataState title="Facility data belum tersedia" body={error} actionLabel="Open station information" onAction={() => onNavigate(`/station-info?station_id=${selectedStationId || ''}`)} /> : null}
      {!loading && !error && !recommended ? <ExplicitDataState title="No available facility found" body="Fasilitas terdekat tidak tersedia atau statusnya belum cukup baru. Kami tidak merekomendasikan fasilitas yang tidak bisa diverifikasi." actionLabel="Report an update" onAction={() => onNavigate('/community-report')} /> : null}

      <div className="pandu-facility-grid">
        <section className="pandu-facility-map-panel"><div className="pandu-panel-heading"><div><span className="pandu-card-label blue">PROXIMITY MAP</span><h2>{station?.name || 'Station context'}</h2></div><span className="pandu-live-status"><span />{loading ? 'Syncing' : recommended ? 'Recommendation live' : 'Data unavailable'}</span></div><div className="pandu-facility-map-viewport"><WebGisMap stations={station ? [station] : stations} selectedStation={station} initialStyle="light" compactControls /></div><DataSourceNote source={recommended?.data_source || 'GEO MAPID + Community Report'} timestamp={recommended?.updated_at || station?.updated_at} /></section>
        <section className="pandu-facility-list-panel"><span className="pandu-card-label green">NEAREST VERIFIED OPTION</span>{recommended ? <article className="pandu-recommended-facility"><div className="pandu-list-icon"><Accessibility size={18} /></div><div><h2>{recommended.name || recommended.facility_name}</h2><p>{recommended.status_note || recommended.category || 'Facility available'}</p><div className="pandu-facility-meta"><span><MapPin size={13} />{recommended.walking_time_seconds != null ? `${recommended.walking_time_seconds}m` : 'Distance unavailable'}</span><span><CircleCheck size={13} />Available</span></div><small>{recommended.nearest_exit ? `Near ${recommended.nearest_exit}` : 'Nearest Facility Analysis'} · {recommended.last_updated || formatUpdatedAt(recommended.updated_at)}</small></div></article> : null}<div className="pandu-facility-list-heading"><span>All matching facilities</span><span>{rankedFacilities.length}</span></div>{rankedFacilities.map((facility) => { const available = facilityIsAvailable(facility); return <article className={`pandu-facility-row ${available ? '' : 'is-unavailable'}`} key={facility.id || facility.name || facility.facility_name}><div className="pandu-list-icon">{/lift|ramp|akses|difabel/i.test(facility.name || facility.facility_name || '') ? <Accessibility size={15} /> : <Building2 size={15} />}</div><div><strong>{facility.name || facility.facility_name}</strong><span>{available ? (facility.status_note || 'Available') : (facility.status_note || 'Status unavailable')}</span><small>{facility.walking_time_seconds != null ? `${facility.walking_time_seconds}m walk` : 'Distance not available'} · {facility.last_updated || formatUpdatedAt(facility.updated_at)}</small>{!available && facility.alternative_facility ? <em>Alternative: {facility.alternative_facility.name || facility.alternative_facility.facility_name}</em> : null}</div><span className={`pandu-status-pill ${available ? 'success' : 'danger'}`}><span />{available ? 'Available' : 'Unavailable'}</span></article>; })}<button type="button" className="pandu-secondary-button pandu-full-button" onClick={() => onNavigate('/community-report')}><CircleAlert size={14} /> Report facility update</button></section>
      </div>
      <BottomNavigation active="home" />
    </div>
  );
}

function CommunityReportStatusView({ onNavigate }) {
  const [report, setReport] = useState(null);

  useEffect(() => {
    let active = true;
    try {
      const saved = JSON.parse(sessionStorage.getItem('pandu_report_status') || 'null');
      if (saved && active) setReport(saved);
    } catch { /* ignore malformed local state */ }
    api.get('/v1/community-reports')
      .then((response) => {
        const reports = response.data?.data || [];
        if (!active || !Array.isArray(reports) || reports.length === 0) return;
        const savedId = JSON.parse(sessionStorage.getItem('pandu_report_status') || 'null')?.id;
        setReport(reports.find((item) => String(item.id) === String(savedId)) || reports[0]);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  const status = report?.status || '';
  const statusIndex = /disetujui|approved|verified/i.test(status) ? 2 : /verifikasi|review/i.test(status) ? 1 : 0;
  const steps = [['Received', 'Your report is safely queued.'], ['Community check', 'The details are being reviewed.'], ['Approved', 'Only approved reports update live data.']];

  return (
    <div className="pandu-page pandu-subpage pandu-report-status-page"><div className="pandu-subpage-intro"><p className="pandu-eyebrow blue-text">COMMUNITY REPORT · STATUS</p><h1>{report ? 'Your report is in safe hands.' : 'Track a community report.'}</h1><p className="pandu-lede">Reports are checked before they can influence what other riders see.</p></div>{report ? <div className="pandu-report-status-grid"><section className="pandu-report-status-card"><span className={`pandu-status-pill ${statusIndex === 2 ? 'success' : 'warning'}`}><span />{statusIndex === 2 ? 'APPROVED' : 'UNDER VERIFICATION'}</span><h2>{report.issue || report.report_type || 'Community update'}</h2><p>{report.description}</p><div className="pandu-status-detail"><span><MapPin size={14} />{report.station?.name || 'Station location saved'}</span><span><Clock3 size={14} />Submitted {formatUpdatedAt(report.created_at)}</span></div><DataSourceNote source="Community Report" timestamp={report.updated_at || report.created_at} /></section><section className="pandu-verification-card"><span className="pandu-card-label blue">VERIFICATION FLOW</span>{steps.map(([label, body], index) => <div className={`pandu-verification-step ${index <= statusIndex ? 'is-complete' : ''}`} key={label}><div className="pandu-step-number">{index < statusIndex ? <Check size={14} /> : index + 1}</div><div><strong>{label}</strong><p>{body}</p></div></div>)}<div className="pandu-panel-actions"><button type="button" className="pandu-primary-button" onClick={() => onNavigate('/trip-detail')}>Back to my journey</button><button type="button" className="pandu-secondary-button" onClick={() => onNavigate('/community-report')}>Report another issue</button></div></section></div> : <ExplicitDataState title="Belum ada laporan untuk dilacak" body="Kirim laporan komunitas untuk melihat status Received, Community check, dan Approved." actionLabel="Report an issue" onAction={() => onNavigate('/community-report')} />}<BottomNavigation active="reports" /></div>
  );
}

function DataAvailabilityView({ onNavigate }) {
  return <div className="pandu-page pandu-subpage pandu-availability-page"><div className="pandu-subpage-intro"><p className="pandu-eyebrow orange-text">DATA TRANSPARENCY</p><h1>When data is missing, we say so.</h1><p className="pandu-lede">PanduYuk never fills gaps with a guess. We show the source and the last time it was checked.</p></div><div className="pandu-availability-grid"><section className="pandu-availability-card"><span className="pandu-status-pill danger"><span />DATA UNAVAILABLE</span><h2>Real-time route data is not available.</h2><p>GTFS Realtime did not return a route for this journey. Choose another transit point or try again later.</p><DataSourceNote source="GTFS Realtime" timestamp={new Date().toISOString()} /><button type="button" className="pandu-primary-button" onClick={() => onNavigate('/route-planner')}>Choose another transit point <ArrowRight size={14} /></button></section><section className="pandu-availability-card"><span className="pandu-status-pill warning"><span />PARTIALLY AVAILABLE</span><h2>Facility status needs verification.</h2><p>We keep the last known status visible and tell you when it was last checked.</p><DataSourceNote source="GEO MAPID + Community Report" /><button type="button" className="pandu-secondary-button" onClick={() => onNavigate('/station-info')}>Open station guide <ArrowRight size={14} /></button></section></div><BottomNavigation active="home" /></div>;
}

function HomeView({ stations, onNavigate, onToast }) {
  const today = useMemo(formatToday, []);

  return (
    <div className="pandu-page pandu-home-page">
      <div className="pandu-home-grid">
        <section className="pandu-home-main">
          <p className="pandu-eyebrow">{today}</p>
          <h1>Your commute, made calm.</h1>
          <p className="pandu-lede">A simple companion for every transfer, platform, and exit.</p>

          <SearchJourneyCard onPlan={() => onNavigate('/route-planner')} />

          <div className="pandu-desktop-home-cards desktop-only">
            <article className="pandu-card next-ride-card">
              <span className="pandu-card-label green">NEXT DEPARTURE</span>
              <strong>08:24</strong>
              <span className="pandu-card-title">MRT Jakarta • Dukuh Atas</span>
              <span className="pandu-card-meta">4 min away&nbsp; · &nbsp;Platform 2</span>
              <ArrowRight className="next-ride-arrow" size={30} aria-hidden="true" />
            </article>

            <article className="pandu-card journey-progress-card">
              <span className="pandu-card-label blue">YOUR JOURNEY</span>
              <span className="pandu-card-title">Palmerah → Bundaran HI</span>
              <span className="pandu-card-meta">Transit in 14 minutes</span>
              <div className="pandu-progress"><span /></div>
              <span className="pandu-card-meta">2 of 5 stages complete</span>
              <button type="button" className="pandu-text-button" onClick={() => onNavigate('/trip-detail')}>Open journey <ArrowRight size={13} /></button>
            </article>
          </div>

          <div className="pandu-mobile-home-cards mobile-only">
            <article className="pandu-mobile-journey-card">
              <span className="pandu-card-label blue">NEXT JOURNEY</span>
              <strong>Stasiun Palmerah</strong>
              <strong>Bundaran HI</strong>
              <span className="pandu-card-meta">08:24&nbsp; · &nbsp;1 transit&nbsp; · &nbsp;34 min</span>
              <button type="button" className="pandu-primary-button" onClick={() => onNavigate('/trip-detail')}>Open</button>
            </article>

            <article className="pandu-card mobile-progress-card">
              <span className="pandu-card-label green">YOUR JOURNEY</span>
              <span className="pandu-card-title">Transit in 14 minutes</span>
              <div className="pandu-progress"><span /></div>
              <span className="pandu-progress-count">2 / 5</span>
            </article>
          </div>

          <div className="pandu-quick-actions-block" id="how-it-works">
            <p className="pandu-section-label">QUICK ACTIONS</p>
            <div className="pandu-quick-actions">
              <button type="button" className="pandu-quick-card" onClick={() => onNavigate('/station-info')}>
                <MapPin size={18} className="blue-icon" aria-hidden="true" />
                <span>Station guide</span>
                <small>Find exits &amp; facilities</small>
              </button>
              <button type="button" className="pandu-quick-card" onClick={() => onNavigate('/arrival-exit')}>
                <Clock3 size={18} className="green-icon" aria-hidden="true" />
                <span>Arrival reminder</span>
                <small>Never miss your stop</small>
              </button>
              <button type="button" className="pandu-quick-card" onClick={() => onNavigate('/community-report')}>
                <CircleAlert size={18} className="orange-icon" aria-hidden="true" />
                <span>Report an issue</span>
                <small>Help other riders</small>
              </button>
              <button type="button" className="pandu-quick-card" onClick={() => onToast('Rekomendasi memakai posisi rute, exit, dan status data terakhir yang tersedia.')}>
                <Sparkles size={18} className="purple-icon" aria-hidden="true" />
                <span>Explain route</span>
                <small>See why it is recommended</small>
              </button>
            </div>
          </div>
        </section>

        <aside className="pandu-glance-card">
          <span className="pandu-card-label">TODAY AT A GLANCE</span>
          <h2>One trip, less thinking.</h2>
          <p>Your important moments are in one place.</p>
          <MiniTransitMap />
          <div className="pandu-next-moment">
            <span className="pandu-card-label blue">NEXT MOMENT</span>
            <strong>Boarding recommendation</strong>
            <span>Ready when you are&nbsp; · &nbsp;3 min</span>
            <ChevronRight size={20} className="blue-icon" aria-hidden="true" />
          </div>
        </aside>
      </div>
      <PanduMapCard stations={stations} onNavigate={onNavigate} />
      <BottomNavigation active="home" />
    </div>
  );
}

function RouteStop({ time, label, destination = false }) {
  return (
    <div className="pandu-route-stop">
      <img src={destination ? routeDestination : routeStop} alt="" />
      <span className={destination ? 'orange-text' : 'blue-text'}>{time}</span>
      <strong>{label}</strong>
    </div>
  );
}

function PlanTripView({ stations, onNavigate, onToast, onJourneyReady }) {
  const defaultOrigin = stations.find((station) => /palmerah|manggarai/i.test(station.name || '')) || stations[0];
  const defaultDestination = stations.find((station) => /bundaran hi/i.test(station.name || '')) || stations[1] || stations[0];
  const [originId, setOriginId] = useState(defaultOrigin?.id ?? '');
  const [destinationId, setDestinationId] = useState(defaultDestination?.id ?? '');
  const [loading, setLoading] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const [routeAttempted, setRouteAttempted] = useState(false);
  const [journeyData, setJourneyData] = useState(null);

  useEffect(() => {
    const nextOrigin = stations.find((station) => /palmerah|manggarai/i.test(station.name || '')) || stations[0];
    const nextDestination = stations.find((station) => /bundaran hi/i.test(station.name || '')) || stations[1] || stations[0];
    setOriginId(nextOrigin?.id ?? '');
    setDestinationId(nextDestination?.id ?? '');
  }, [stations]);

  const origin = stations.find((station) => String(station.id) === String(originId));
  const destination = stations.find((station) => String(station.id) === String(destinationId));
  const originName = stationLabel(journeyData?.route?.origin || origin, 'Stasiun Manggarai');
  const destinationName = stationLabel(journeyData?.route?.destination || destination, 'Stasiun Bundaran HI');
  const routeSummary = journeyData?.route;
  const routeSteps = journeyData?.route?.stepper_timeline || [];
  const estimatedDuration = routeSummary?.estimated_duration_minutes || 34;
  const totalFare = routeSummary?.total_fare ?? 3500;
  const transferCount = Math.max(0, routeSteps.filter((step) => /TRANSIT/i.test(step.transport_mode || '')).length);
  const routeMethod = journeyData?.transit_intelligence?.boarding_recommendation?.analysis_method;

  const handleFindRoutes = async (event) => {
    event.preventDefault();
    if (!originId || !destinationId) return;
    setRouteAttempted(true);
    setLoading(true);
    try {
      const response = await api.get(`/v1/route/plan?origin_id=${originId}&destination_id=${destinationId}`);
      const data = response.data?.data || null;
      setJourneyData(data);
      setRouteReady(Boolean(data));
      if (data) onJourneyReady(data);
    } catch {
      setRouteReady(false);
      setJourneyData(null);
      onToast('Data rute belum tersedia untuk kombinasi ini. Pilih titik transit lain.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pandu-page pandu-subpage pandu-plan-page">
      <div className="pandu-subpage-intro">
        <p className="pandu-eyebrow blue-text">ONE SIMPLE QUESTION</p>
        <h1>Where are you going?</h1>
        <p className="pandu-lede">Choose your start and destination. We’ll take care of the details.</p>
      </div>

      <div className="pandu-plan-grid">
        <form className="pandu-form-card" onSubmit={handleFindRoutes}>
          <span className="pandu-card-label">YOUR JOURNEY</span>
          <label htmlFor="origin">From</label>
          <div className="pandu-select-wrap blue-field">
            <span className="pandu-field-dot" />
            <select id="origin" value={originId} onChange={(event) => setOriginId(event.target.value)}>
              {stations.map((station) => <option key={`origin-${station.id}`} value={station.id}>{station.name}</option>)}
            </select>
          </div>
          <label htmlFor="destination">To</label>
          <div className="pandu-select-wrap orange-field">
            <span className="pandu-field-dot" />
            <select id="destination" value={destinationId} onChange={(event) => setDestinationId(event.target.value)}>
              {stations.map((station) => <option key={`destination-${station.id}`} value={station.id}>{station.name}</option>)}
            </select>
          </div>
          <label htmlFor="when">When</label>
          <div className="pandu-plan-actions">
            <select id="when" className="pandu-when-select" defaultValue="now">
              <option value="now">Leave now</option>
              <option value="later">Leave later</option>
            </select>
            <button type="submit" className="pandu-primary-button" disabled={loading}>
              {loading ? 'Loading…' : 'Show routes'}
            </button>
          </div>
        </form>

        <section className="pandu-recommended-route">
          {routeAttempted && !routeReady ? <ExplicitDataState title="Data rute belum tersedia" body="GTFS tidak mengirim perjalanan yang cocok. Kami tidak menampilkan rute kosong atau membuat rekomendasi tanpa sumber." actionLabel="Open data status" onAction={() => onNavigate('/data-availability')} /> : null}
          {!routeAttempted || routeReady ? <>
          <span className="pandu-card-label blue">RECOMMENDED FOR YOU</span>
          <h2>The calmest route</h2>
          <p className="pandu-route-summary">{transferCount} transfer&nbsp; · &nbsp;{estimatedDuration} min&nbsp; · &nbsp;{formatFare(totalFare)}</p>
          <div className="pandu-route-timeline">
            <RouteStop time="Start" label={displayStationName(originName, 'Manggarai')} />
            <RouteStop time={routeReady ? 'Live' : 'Next'} label={routeReady ? (routeSteps.find((step) => /TRANSIT|KRL|MRT|LRT/i.test(step.transport_mode || ''))?.title || 'Transit connection') : 'Transit connection'} />
            <RouteStop time={`${estimatedDuration} min`} label={displayStationName(destinationName, 'Bundaran HI')} destination />
          </div>
          <div className="pandu-route-note">{routeMethod || 'Rule-based route ranking'} · GTFS + MAPID data</div>
          <button type="button" className="pandu-primary-button pandu-route-cta" onClick={() => onNavigate('/trip-detail')}>
            {routeReady ? 'Continue with live route' : 'Show route details'} <ArrowRight size={15} />
          </button>
          </> : null}
        </section>
      </div>
      <PanduMapCard stations={stations} onNavigate={onNavigate} compact />
      <p className="pandu-footnote">You can change the route anytime.</p>
      <BottomNavigation active="trips" />
    </div>
  );
}

function TimelineRow({ item, index, totalItems }) {
  return (
    <div className={`pandu-timeline-row ${item.tone}`}>
      <div className="pandu-timeline-marker">
        <img src={item.icon} alt="" />
        {index < totalItems - 1 ? <span /> : null}
      </div>
      <span className="pandu-timeline-time">{item.time}</span>
      <strong>{item.label}</strong>
      <span className="pandu-timeline-status">{item.status}</span>
    </div>
  );
}

function TripDetailView({ onNavigate, onToast, journeyData }) {
  const route = journeyData?.route;
  const intelligence = journeyData?.transit_intelligence || {};
  const boarding = intelligence.boarding_recommendation;
  const exit = intelligence.exit_recommendation;
  const monitoring = intelligence.journey_monitoring;
  const originName = displayStationName(route?.origin?.name, 'Palmerah');
  const destinationName = displayStationName(route?.destination?.name, 'Bundaran HI');
  const liveTimeline = journeyData ? buildJourneyTimeline(journeyData) : timelineItems;
  const recommendedCar = boarding?.recommended_car || 'Board car 3';
  const exitLabel = exit?.recommended_exit || 'Gate 3';
  const walkingLabel = boarding?.walking_time_seconds ? `${Math.ceil(boarding.walking_time_seconds / 60)} min walk` : '4 min walk';

  return (
    <div className="pandu-page pandu-subpage pandu-trip-page">
      <div className="pandu-subpage-intro">
        <p className="pandu-eyebrow green-text">LIVE JOURNEY</p>
        <h1>{originName} → {destinationName}</h1>
        <p className="pandu-lede">You’re on track. Here’s what matters next.</p>
      </div>

      <div className="pandu-trip-grid">
        <section className="pandu-timeline-card">
          <span className="pandu-card-label">YOUR TIMELINE</span>
          <h2>A calm step at a time.</h2>
          <div className="pandu-timeline-list">
            {liveTimeline.map((item, index) => <TimelineRow item={item} index={index} totalItems={liveTimeline.length} key={item.label} />)}
          </div>
        </section>

        <div className="pandu-trip-side">
          <section className="pandu-next-action-card">
            <span className="pandu-card-label blue">NEXT BEST ACTION</span>
            <h2>{recommendedCar}</h2>
            <p>{boarding?.reason || 'Closest to the best exit for your destination.'}</p>
            <button type="button" className="pandu-primary-button" onClick={() => onToast(boarding?.explainability || 'Boarding car dipilih dari posisi rute dan exit terdekat yang tersedia.')}>Explain recommendation</button>
          </section>

          <section className="pandu-arrival-card">
            <span className="pandu-card-label">ARRIVAL SNAPSHOT</span>
            <div className="pandu-arrival-grid">
              <div><span>Exit</span><strong>{exitLabel} • {boarding?.walking_time_seconds || 85} m</strong></div>
              <div><span>Access</span><strong>{exit?.is_accessible === false ? 'Check accessibility' : 'Accessible route'}</strong></div>
              <div><span>Walk</span><strong>{walkingLabel}</strong></div>
            </div>
            <button type="button" className="pandu-secondary-button" onClick={() => onNavigate('/community-report')}>Report issue</button>
          </section>

          <section className="pandu-monitoring-card">
            <span className="pandu-card-label green">JOURNEY MONITORING</span>
            <strong>{monitoring?.status_label || 'Service status is being monitored'}</strong>
            <p>{monitoring?.crowd_level || 'Live crowd level will appear when realtime data is available.'}{monitoring?.weather?.condition ? ` · ${monitoring.weather.condition} ${monitoring.weather.temperature || ''}` : ''}</p>
            <small>{monitoring?.last_synced_at ? `GTFS Realtime + BMKG · ${monitoring.last_synced_at}` : 'GTFS Realtime + recent community reports'}</small>
          </section>
        </div>
      </div>
      <p className="pandu-footnote">{journeyData ? `Live route data · ${monitoring?.last_synced_at || 'synced just now'}` : 'Choose a route to activate live recommendations.'}</p>
      <BottomNavigation active="trips" />
    </div>
  );
}

function CommunityReportView({ stations, onToast, onNavigate }) {
  const [reportType, setReportType] = useState(REPORT_TYPES[0].value);
  const [detail, setDetail] = useState('');
  const [location, setLocation] = useState('');
  const [stationId, setStationId] = useState(stations[0]?.id ?? '');
  const [photoUrl, setPhotoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [nearbyCount, setNearbyCount] = useState(3);

  useEffect(() => {
    if (!stationId && stations[0]) setStationId(stations[0].id);
  }, [stations, stationId]);

  useEffect(() => {
    api.get('/v1/community-reports')
      .then((response) => {
        const reports = response.data?.data || response.data?.reports || [];
        if (Array.isArray(reports) && reports.length > 0) setNearbyCount(reports.length);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!location.trim() || !stationId) {
      setError('Lokasi wajib dipilih agar laporan bisa diverifikasi.');
      return;
    }
    if (!detail.trim()) {
      setError('Tulis sedikit detail supaya laporan bisa diverifikasi.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const selectedStation = stations.find((station) => String(station.id) === String(stationId));
      const response = await api.post('/v1/community-report', {
        station_id: stationId || stations[0]?.id,
        report_type: reportType,
        issue: reportType,
        description: detail.trim(),
        photo_url: photoUrl.trim() || null,
        latitude: selectedStation?.latitude || null,
        longitude: selectedStation?.longitude || null,
      });
      const savedReport = response.data?.data || null;
      if (savedReport) sessionStorage.setItem('pandu_report_status', JSON.stringify(savedReport));
      setMessage(`${response.data?.message || 'Laporan berhasil diterima.'} Status: Dalam Verifikasi.`);
      setNearbyCount((count) => count + 1);
      if (onNavigate) onNavigate('/community-report-status');
    } catch {
      setError('Laporan belum terkirim. Coba lagi beberapa saat lagi.');
      onToast('Koneksi laporan sedang bermasalah.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pandu-page pandu-subpage pandu-report-page">
      <div className="pandu-subpage-intro">
        <p className="pandu-eyebrow orange-text">MAKE THE NEXT TRIP BETTER</p>
        <h1>What did you notice?</h1>
        <p className="pandu-lede">A quick note can help other riders choose better.</p>
      </div>

      <div className="pandu-report-grid">
        <form className="pandu-form-card pandu-report-form" onSubmit={handleSubmit}>
          <span className="pandu-card-label">REPORT TYPE</span>
          <div className="pandu-report-types" role="radiogroup" aria-label="Jenis laporan">
            {REPORT_TYPES.map((type) => (
              <button
                type="button"
                role="radio"
                aria-checked={reportType === type.value}
                key={type.value}
                className={reportType === type.value ? 'is-selected' : ''}
                onClick={() => setReportType(type.value)}
              >
                <span className="desktop-only">{type.label}</span>
                <span className="mobile-only">{type.mobileLabel}</span>
              </button>
            ))}
          </div>

          <label htmlFor="report-detail">TELL US A LITTLE MORE</label>
          <textarea
            id="report-detail"
            value={detail}
            onChange={(event) => setDetail(event.target.value)}
            placeholder="Example: East lift has been under maintenance since 08:15…"
            aria-invalid={Boolean(error && !detail.trim())}
            rows={4}
          />

          <label htmlFor="report-location">LOCATION</label>
          <div className="pandu-location-row">
            <input id="report-location" value={location} onChange={(event) => setLocation(event.target.value)} aria-invalid={Boolean(error && !location.trim())} placeholder="Add a landmark, gate, or platform" />
            <button type="button" className="pandu-current-location" onClick={() => setLocation('Current location')}>
              <LocateFixed size={13} aria-hidden="true" /> Use current location
            </button>
          </div>

          <label htmlFor="report-station">STATION / STOP</label>
          <select id="report-station" className="pandu-report-station" value={stationId} onChange={(event) => setStationId(event.target.value)} aria-label="Stasiun laporan">
            {stations.map((station) => <option key={station.id} value={station.id}>{station.name}</option>)}
          </select>

          <label htmlFor="report-photo">PHOTO (OPTIONAL)</label>
          <input
            id="report-photo"
            className="pandu-report-photo"
            type="url"
            value={photoUrl}
            onChange={(event) => setPhotoUrl(event.target.value)}
            placeholder="Paste a photo link if you have one"
          />

          {message ? <div className="pandu-form-message success"><Check size={15} /> {message}</div> : null}
          {error ? <div className="pandu-form-message error"><CircleAlert size={15} /> {error}</div> : null}

          <button type="submit" className="pandu-primary-button pandu-submit-button" disabled={loading}>
            <Send size={15} aria-hidden="true" /> {loading ? 'Sending…' : 'Send report'}
          </button>
        </form>

        <div className="pandu-report-side">
          <section className="pandu-trust-card">
            <span className="pandu-card-label blue">WHY REPORT?</span>
            <h2>Small details keep recommendations honest.</h2>
            <p>Every report includes time and place so it can be checked by the community.</p>
            <strong>Your personal details are never shown publicly.</strong>
          </section>
          <section className="pandu-nearby-card">
            <span className="pandu-card-label">NEARBY NOW</span>
            <strong>{nearbyCount} recent reports around Bundaran HI</strong>
            <p>Last update 08:26&nbsp; · &nbsp;8 community confirmations</p>
          </section>
        </div>
      </div>
      <BottomNavigation active="reports" />
    </div>
  );
}

export default function PanduYukExperience({ onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('mapid_theme') === 'dark');
  const [stations, setStations] = useState(FALLBACK_STATIONS);
  const [toast, setToast] = useState('');
  const [journeyData, setJourneyData] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('pandu_journey_data') || 'null');
    } catch {
      return null;
    }
  });

  const handleJourneyReady = (data) => {
    setJourneyData(data);
    sessionStorage.setItem('pandu_journey_data', JSON.stringify(data));
  };

  useEffect(() => {
    localStorage.setItem('mapid_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    let active = true;
    api.get('/stations')
      .then((response) => {
        const data = normalizeStations(response.data);
        if (active && data.length > 0) setStations(data);
      })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const page = location.pathname;
  const stationIdFromQuery = new URLSearchParams(location.search).get('station_id');
  const forcedMobile = page === '/mobile';
  let content;
  let title = '';
  let backLabel = '';
  let mobileBackLabel = '';
  let onBack = () => navigate('/webgis-dashboard');

  if (page === '/route-planner') {
    title = 'Plan a journey';
    backLabel = 'Home';
    content = <PlanTripView stations={stations} onNavigate={navigate} onToast={setToast} onJourneyReady={handleJourneyReady} />;
  } else if (page === '/trip-detail') {
    title = 'Your journey';
    backLabel = 'My trips';
    mobileBackLabel = 'Your journey';
    onBack = () => navigate('/webgis-dashboard');
    content = <TripDetailView onNavigate={navigate} onToast={setToast} journeyData={journeyData} />;
  } else if (page === '/community-report') {
    title = 'Community report';
    backLabel = 'Your journey';
    mobileBackLabel = 'Community report';
    onBack = () => navigate('/trip-detail');
    content = <CommunityReportView stations={stations} onToast={setToast} onNavigate={navigate} />;
  } else if (page === '/community-report-status') {
    title = 'Report status';
    backLabel = 'Community report';
    mobileBackLabel = 'Report status';
    onBack = () => navigate('/community-report');
    content = <CommunityReportStatusView onNavigate={navigate} />;
  } else if (page === '/station-info') {
    title = 'Station information';
    backLabel = 'Home';
    mobileBackLabel = 'Station information';
    content = <StationInformationView stations={stations} onNavigate={navigate} initialStationId={stationIdFromQuery} />;
  } else if (page === '/arrival-exit') {
    title = 'Arrival & exit';
    backLabel = 'Your journey';
    mobileBackLabel = 'Arrival & exit';
    onBack = () => navigate('/trip-detail');
    content = <ArrivalExitView onNavigate={navigate} onToast={setToast} journeyData={journeyData} />;
  } else if (page === '/facility-finder') {
    title = 'Facility finder';
    backLabel = 'Station information';
    mobileBackLabel = 'Facility finder';
    onBack = () => navigate(`/station-info?station_id=${stationIdFromQuery || ''}`);
    content = <FacilityRecommendationView stations={stations} onNavigate={navigate} initialStationId={stationIdFromQuery} />;
  } else if (page === '/data-availability') {
    title = 'Data availability';
    backLabel = 'Plan a journey';
    mobileBackLabel = 'Data availability';
    onBack = () => navigate('/route-planner');
    content = <DataAvailabilityView onNavigate={navigate} />;
  } else {
    content = <HomeView stations={stations} onNavigate={navigate} onToast={setToast} />;
  }

  return (
    <div className={`pandu-app ${darkMode ? 'theme-dark' : 'theme-light'} ${forcedMobile ? 'pandu-forced-mobile' : ''}`}>
      <PanduHeader
        darkMode={darkMode}
        onToggleTheme={() => setDarkMode((value) => !value)}
        title={title}
        backLabel={backLabel}
        mobileBackLabel={mobileBackLabel}
        onBack={onBack}
        onLogout={onLogout}
      />
      {content}
      {toast ? <div className="pandu-toast" role="status"><MessageCircle size={15} /> {toast}</div> : null}
    </div>
  );
}
