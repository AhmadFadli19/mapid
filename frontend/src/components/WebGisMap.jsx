import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';

// Fix default leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom pill marker per operator/line
const createOperatorIcon = (lineColor, operatorCode) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${lineColor};
        color: white;
        border: 2px solid rgba(255,255,255,0.85);
        border-radius: 10px;
        padding: 3px 8px;
        font-size: 10px;
        font-weight: 800;
        box-shadow: 0 3px 12px rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
        font-family: system-ui, sans-serif;
      ">
        <span>🚆</span>
        <span>${operatorCode}</span>
      </div>
    `,
    iconSize: [64, 26],
    iconAnchor: [32, 13],
  });
};

// Selected station marker — larger, glowing
const createSelectedIcon = (lineColor, operatorCode) => {
  return L.divIcon({
    className: 'custom-leaflet-marker-selected',
    html: `
      <div style="position:relative;">
        <div style="
          position:absolute; inset:-6px;
          border-radius:14px;
          background:${lineColor}33;
          animation: pulse 1.5s ease-in-out infinite;
        "></div>
        <div style="
          background-color: ${lineColor};
          color: white;
          border: 2.5px solid white;
          border-radius: 10px;
          padding: 4px 10px;
          font-size: 11px;
          font-weight: 900;
          box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 0 3px ${lineColor}55;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          font-family: system-ui, sans-serif;
          position: relative;
          z-index: 1;
        ">
          <span>📍</span>
          <span>${operatorCode}</span>
        </div>
      </div>
    `,
    iconSize: [80, 32],
    iconAnchor: [40, 16],
  });
};

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
}

export default function WebGisMap({
  stations,
  selectedStation,
  stationRoutes,
  selectedRouteId,
  searchResults,
  onSelectStation
}) {
  const defaultCenter = [-6.193125, 106.822894];
  const mapCenter = selectedStation
    ? [selectedStation.latitude, selectedStation.longitude]
    : defaultCenter;

  const [fallbackRoutes, setFallbackRoutes] = useState([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await api.get('/v1/routes/geojson?limit=30&tolerance=0.0004');
        if (res.data?.features) {
          setFallbackRoutes(res.data.features);
        }
      } catch (err) {
        console.error("Failed fetching simplified route polylines:", err);
      }
    };
    fetchRoutes();
  }, []);

  const hasStationRoutes = stationRoutes?.features && stationRoutes.features.length > 0;
  const activeFeatures = hasStationRoutes ? stationRoutes.features : fallbackRoutes;

  // Limit maximum visible markers on initial load to prevent DOM memory freezing
  const visibleStations = (stations || []).slice(0, 150);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', zIndex: 0 }}>
      <MapContainer
        center={defaultCenter}
        zoom={12}
        preferCanvas={true}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#0f172a' }}
      >
        {/* High performance CartoDB CDN basemap (no rate limit / no black square bugs) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        <RecenterMap center={mapCenter} />

        {/* TransJakarta Route Polylines (Highlighted per clicked station or active filter) */}
        {activeFeatures.map((feat, idx) => {
          const coords = feat.geometry?.coordinates || [];
          if (!coords || coords.length === 0) return null;
          const latLons = coords.map(c => [c[1], c[0]]);
          const props = feat.properties || {};
          const routeId = props.route_id;
          const color = props.color || '#ea580c';
          const shortName = props.route_short_name || routeId || 'TJ';
          const longName = props.route_long_name || '';

          const isRouteFiltered = selectedRouteId === routeId;
          const isDimmed = selectedRouteId && !isRouteFiltered;
          const weight = isRouteFiltered ? 7 : (hasStationRoutes ? 5 : 3.5);
          const opacity = isDimmed ? 0.2 : (hasStationRoutes ? 0.9 : 0.7);

          return (
            <React.Fragment key={`route-${routeId || idx}-${idx}`}>
              {/* Outer glow line for filtered/selected route */}
              {isRouteFiltered && (
                <Polyline
                  positions={latLons}
                  pathOptions={{
                    color: color,
                    weight: 12,
                    opacity: 0.35,
                  }}
                />
              )}
              <Polyline
                positions={latLons}
                pathOptions={{
                  color: color,
                  weight: weight,
                  opacity: opacity,
                  dashArray: isDimmed ? '4, 8' : null
                }}
              >
                <Popup className="dark-popup">
                  <div style={{
                    background: '#0f172a',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    padding: '8px 10px',
                    fontFamily: 'system-ui, sans-serif',
                    color: '#f8fafc'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        background: color,
                        color: props.text_color || '#fff',
                        fontWeight: 900,
                        fontSize: '10px',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {shortName}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0' }}>
                        {longName}
                      </span>
                    </div>
                  </div>
                </Popup>
              </Polyline>
            </React.Fragment>
          );
        })}

        {/* Station Markers — Clean, Non-Cluttered & Fast */}
        {visibleStations.map((st) => {
          const isSelected = selectedStation?.id === st.id;
          const color = st.line_color || '#0284c7';
          const isMajorHub = !st.code?.startsWith('TJ_');

          // Selected station gets full glowing badge
          if (isSelected) {
            return (
              <Marker
                key={`st-${st.id}`}
                position={[st.latitude, st.longitude]}
                icon={createSelectedIcon(color, st.code)}
                zIndexOffset={1000}
                eventHandlers={{
                  click: () => onSelectStation(st),
                }}
              >
                <Popup className="dark-popup" closeButton={false}>
                  <div style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    minWidth: '180px',
                    fontFamily: 'system-ui, sans-serif',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '9px', fontWeight: 800,
                        background: color,
                        color: 'white', padding: '2px 7px',
                        borderRadius: '99px',
                      }}>{st.operator}</span>
                      <span style={{
                        fontSize: '9px', fontWeight: 700,
                        background: '#0f172a', color: '#94a3b8',
                        padding: '2px 5px', borderRadius: '4px',
                        fontFamily: 'monospace',
                      }}>{st.code}</span>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: '13px', color: '#f1f5f9', margin: '0 0 3px' }}>
                      {st.name}
                    </h3>
                    <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 8px' }}>{st.address}</p>
                    <button
                      onClick={() => onSelectStation(st)}
                      style={{
                        fontSize: '10px', fontWeight: 700,
                        color: '#10b981', background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '8px', padding: '4px 10px',
                        cursor: 'pointer', width: '100%',
                      }}
                    >
                      Stasiun Terpilih
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          }

          // Major transit hubs (MRT, LRT, KRL, Harmoni) get pill badges
          if (isMajorHub) {
            return (
              <Marker
                key={`st-${st.id}`}
                position={[st.latitude, st.longitude]}
                icon={createOperatorIcon(color, st.code)}
                eventHandlers={{
                  click: () => onSelectStation(st),
                }}
              >
                <Popup className="dark-popup" closeButton={false}>
                  <div style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '12px',
                    padding: '10px 12px',
                    minWidth: '180px',
                    fontFamily: 'system-ui, sans-serif',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                      <span style={{
                        fontSize: '9px', fontWeight: 800,
                        background: color,
                        color: 'white', padding: '2px 7px',
                        borderRadius: '99px',
                      }}>{st.operator}</span>
                      <span style={{
                        fontSize: '9px', fontWeight: 700,
                        background: '#0f172a', color: '#94a3b8',
                        padding: '2px 5px', borderRadius: '4px',
                        fontFamily: 'monospace',
                      }}>{st.code}</span>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: '13px', color: '#f1f5f9', margin: '0 0 3px' }}>
                      {st.name}
                    </h3>
                    <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 8px' }}>{st.address}</p>
                    <button
                      onClick={() => onSelectStation(st)}
                      style={{
                        fontSize: '10px', fontWeight: 700,
                        color: '#10b981', background: 'rgba(16,185,129,0.1)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '8px', padding: '4px 10px',
                        cursor: 'pointer', width: '100%',
                      }}
                    >
                      Pilih Stasiun Hub →
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          }

          // Secondary bus stops get ultra-clean lightweight CircleMarkers
          return (
            <CircleMarker
              key={`st-${st.id}`}
              center={[st.latitude, st.longitude]}
              radius={5}
              pathOptions={{
                fillColor: color,
                fillOpacity: 0.85,
                color: '#ffffff',
                weight: 1.2,
              }}
              eventHandlers={{
                click: () => onSelectStation(st),
              }}
            >
              <Popup className="dark-popup" closeButton={false}>
                <div style={{
                  background: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '10px 12px',
                  minWidth: '180px',
                  fontFamily: 'system-ui, sans-serif',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <span style={{
                      fontSize: '9px', fontWeight: 800,
                      background: color,
                      color: 'white', padding: '2px 7px',
                      borderRadius: '99px',
                    }}>{st.operator}</span>
                    <span style={{
                      fontSize: '9px', fontWeight: 700,
                      background: '#0f172a', color: '#94a3b8',
                      padding: '2px 5px', borderRadius: '4px',
                      fontFamily: 'monospace',
                    }}>{st.code}</span>
                  </div>
                  <h3 style={{ fontWeight: 800, fontSize: '13px', color: '#f1f5f9', margin: '0 0 3px' }}>
                    {st.name}
                  </h3>
                  <p style={{ fontSize: '10px', color: '#64748b', margin: '0 0 8px' }}>{st.address}</p>
                  <button
                    onClick={() => onSelectStation(st)}
                    style={{
                      fontSize: '10px', fontWeight: 700,
                      color: '#10b981', background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.3)',
                      borderRadius: '8px', padding: '4px 10px',
                      cursor: 'pointer', width: '100%',
                    }}
                  >
                    Tampilkan Rute Halte Ini →
                  </button>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {/* Search Result Markers */}
        {searchResults && searchResults.map((item, idx) => (
          <Marker key={`sr-${idx}`} position={[item.latitude, item.longitude]}>
            <Popup>
              <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '11px' }}>
                <span style={{
                  fontSize: '9px', fontWeight: 800, padding: '2px 6px',
                  background: '#10b981', color: 'white', borderRadius: '6px',
                }}>
                  {item.type} ({item.operator})
                </span>
                <p style={{ fontWeight: 700, marginTop: '4px', color: '#1e293b' }}>{item.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
