import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import api, { getGeoServerLayers } from '../services/api';

const getOperatorIconSymbol = (operator) => {
  if (operator === 'TransJakarta') return '🚌';
  if (operator === 'MRT Jakarta') return '🚇';
  if (operator === 'LRT Jabodebek') return '🚝';
  if (operator === 'KAI Antarkota') return '🚂';
  return '🚆'; // KRL Commuter Line
};

// Map Styles Configuration with MAPID Vector Basemap option
const MAP_STYLES = {
  dark: {
    name: '🌙 Dark Mode (CARTO)',
    style: {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
            'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        }
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
          minzoom: 0,
          maxzoom: 20
        }
      ]
    }
  },
  light: {
    name: '☀️ Light Mode (CARTO)',
    style: {
      version: 8,
      sources: {
        'carto-light': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
            'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap &copy; CARTO'
        }
      },
      layers: [
        {
          id: 'carto-light-layer',
          type: 'raster',
          source: 'carto-light',
          minzoom: 0,
          maxzoom: 20
        }
      ]
    }
  },
  satellite: {
    name: '🛰️ Satelit (Esri)',
    style: {
      version: 8,
      sources: {
        'esri-satellite': {
          type: 'raster',
          tiles: [
            'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
          ],
          tileSize: 256,
          attribution: '&copy; Esri, Maxar, Earthstar'
        }
      },
      layers: [
        {
          id: 'esri-satellite-layer',
          type: 'raster',
          source: 'esri-satellite',
          minzoom: 0,
          maxzoom: 20
        }
      ]
    }
  }
};

export default function WebGisMap({
  stations = [],
  selectedStation = null,
  stationRoutes = null,
  selectedRouteId = null,
  searchResults = [],
  onSelectStation = () => {}
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);

  const defaultCenter = [106.822894, -6.193125]; // [lng, lat] for MapLibre
  const [currentStyle, setCurrentStyle] = useState('dark');
  const [is3DMode, setIs3DMode] = useState(true);
  const [showGeoServerLayer, setShowGeoServerLayer] = useState(true);
  const [fallbackRoutes, setFallbackRoutes] = useState([]);

  // Fetch fallback simplified route polylines
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await api.get('/v1/routes/geojson?limit=35&tolerance=0.0004');
        if (res.data?.features) {
          setFallbackRoutes(res.data.features);
        }
      } catch (err) {
        console.error("Failed fetching route polylines:", err);
      }
    };
    fetchRoutes();
  }, []);

  const hasStationRoutes = stationRoutes?.features && stationRoutes.features.length > 0;
  const activeFeatures = hasStationRoutes ? stationRoutes.features : fallbackRoutes;

  // Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const initialPitch = is3DMode ? 45 : 0;
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAP_STYLES[currentStyle].style,
      center: defaultCenter,
      zoom: 12.8,
      pitch: initialPitch,
      bearing: -10,
      antialias: true
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.FullscreenControl(), 'top-right');
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true
      }),
      'top-right'
    );

    mapRef.current = map;

    map.on('load', () => {
      // Add GeoJSON source for transit routes
      if (!map.getSource('transit-routes')) {
        map.addSource('transit-routes', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: activeFeatures
          }
        });

        // Glow Layer for selected/active route
        map.addLayer({
          id: 'routes-glow-layer',
          type: 'line',
          source: 'transit-routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': ['coalesce', ['get', 'color'], '#ea580c'],
            'line-width': 12,
            'line-opacity': [
              'case',
              ['==', ['get', 'route_id'], selectedRouteId || ''],
              0.45,
              0
            ]
          }
        });

        // Main Route Line Layer
        map.addLayer({
          id: 'routes-line-layer',
          type: 'line',
          source: 'transit-routes',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': ['coalesce', ['get', 'color'], '#ea580c'],
            'line-width': [
              'case',
              ['==', ['get', 'route_id'], selectedRouteId || ''],
              7,
              hasStationRoutes ? 5 : 3.5
            ],
            'line-opacity': selectedRouteId
              ? ['case', ['==', ['get', 'route_id'], selectedRouteId], 0.95, 0.25]
              : hasStationRoutes ? 0.9 : 0.75
          }
        });
      }

      // Fetch & Add MAPID GeoServer Halte & Stasiun Layer (Jakarta Timur 2025)
      fetchGeoServerGeoJson(map);
    });

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      map.remove();
    };
  }, []);

  // Fetch MAPID GeoServer vector layers and display as MapLibre circle layer
  const fetchGeoServerGeoJson = async (map) => {
    try {
      const halteData = await getGeoServerLayers('halte');
      if (halteData?.data?.features && halteData.data.features.length > 0) {
        if (!map.getSource('mapid-geoserver-halte')) {
          map.addSource('mapid-geoserver-halte', {
            type: 'geojson',
            data: halteData.data
          });

          map.addLayer({
            id: 'mapid-geoserver-halte-layer',
            type: 'circle',
            source: 'mapid-geoserver-halte',
            paint: {
              'circle-radius': 6,
              'circle-color': '#f97316',
              'circle-stroke-width': 2,
              'circle-stroke-color': '#ffffff',
              'circle-opacity': 0.85
            }
          });
        }
      }
    } catch (e) {
      console.warn('GeoServer layer render note:', e);
    }
  };

  // Update Map Style when toggled
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    map.setStyle(MAP_STYLES[currentStyle].style);
  }, [currentStyle]);

  // Update Route Polylines WebGL Layer
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('transit-routes');
    if (source) {
      source.setData({
        type: 'FeatureCollection',
        features: activeFeatures
      });
    }
  }, [activeFeatures, selectedRouteId, hasStationRoutes]);

  // Render & Update Markers on Map
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    const visibleStations = (stations || []).slice(0, 250);

    visibleStations.forEach((st) => {
      const isSelected = selectedStation?.id === st.id;
      const color = st.line_color || (st.operator === 'TransJakarta' ? '#ea580c' : '#0284c7');
      const isMajorHub = st.operator !== 'TransJakarta';
      const symbol = getOperatorIconSymbol(st.operator);

      const el = document.createElement('div');
      el.className = 'maplibre-custom-marker';
      el.style.cursor = 'pointer';

      if (isSelected) {
        el.innerHTML = `
          <div style="position:relative; transform: scale(1.15);">
            <div style="
              position:absolute; inset:-8px;
              border-radius:14px;
              background:${color}55;
              animation: pulse 1.5s ease-in-out infinite;
            "></div>
            <div style="
              background-color: ${color};
              color: white;
              border: 2.5px solid white;
              border-radius: 10px;
              padding: 4px 10px;
              font-size: 11px;
              font-weight: 900;
              box-shadow: 0 4px 16px rgba(0,0,0,0.6), 0 0 0 3px ${color}55;
              display: flex;
              align-items: center;
              gap: 5px;
              white-space: nowrap;
              font-family: system-ui, sans-serif;
              position: relative;
              z-index: 1;
            ">
              <span>${symbol}</span>
              <span>${st.code || st.name.substring(0, 12)}</span>
              <span style="background: #10b981; border-radius: 50%; width: 7px; height: 7px; display: inline-block;"></span>
            </div>
          </div>
        `;
      } else if (isMajorHub) {
        el.innerHTML = `
          <div style="
            background-color: ${color};
            color: white;
            border: 2px solid rgba(255,255,255,0.85);
            border-radius: 10px;
            padding: 3px 8px;
            font-size: 10px;
            font-weight: 800;
            box-shadow: 0 3px 12px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            gap: 4px;
            white-space: nowrap;
            font-family: system-ui, sans-serif;
            transition: transform 0.2s ease;
          ">
            <span>${symbol}</span>
            <span>${st.code || st.name.substring(0, 10)}</span>
          </div>
        `;
      } else {
        el.innerHTML = `
          <div style="
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: ${color};
            border: 2px solid white;
            box-shadow: 0 2px 6px rgba(0,0,0,0.5);
            transition: transform 0.2s ease;
          "></div>
        `;
      }

      // Popup Node Content with Full Transit Intelligence Quick Actions
      const popupNode = document.createElement('div');
      popupNode.style.cssText = `
        background: #0f172a;
        border: 1px solid #334155;
        border-radius: 14px;
        padding: 12px 14px;
        min-width: 220px;
        font-family: system-ui, sans-serif;
        color: #f8fafc;
        box-shadow: 0 12px 32px rgba(0,0,0,0.7);
      `;
      popupNode.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
          <span style="
            font-size: 9px; font-weight: 800;
            background: ${color};
            color: white; padding: 2px 8px;
            border-radius: 99px;
          ">${symbol} ${st.operator}</span>
          <span style="
            font-size: 9px; font-weight: 700;
            background: #1e293b; color: #10b981;
            padding: 2px 6px; border-radius: 6px;
            border: 1px solid rgba(16,185,129,0.3);
          ">🟢 Live</span>
        </div>
        <h3 style="font-weight: 900; font-size: 13px; color: #f1f5f9; margin: 0 0 3px; line-height: 1.3;">${st.name}</h3>
        <p style="font-size: 10px; color: #94a3b8; margin: 0 0 8px;">${st.address || 'DKI Jakarta, Indonesia'}</p>

        <!-- Quick POI Badges -->
        <div style="display: flex; gap: 4px; margin-bottom: 10px; flex-wrap: wrap;">
          <span style="font-size: 9px; background: #1e293b; color: #cbd5e1; padding: 2px 6px; border-radius: 6px;">🚻 Toilet Buka</span>
          <span style="font-size: 9px; background: #1e293b; color: #cbd5e1; padding: 2px 6px; border-radius: 6px;">🕌 Mushola</span>
          <span style="font-size: 9px; background: #1e293b; color: #cbd5e1; padding: 2px 6px; border-radius: 6px;">🚪 Exit Gate A</span>
        </div>

        <button id="select-btn-${st.id}" style="
          font-size: 10px; font-weight: 800;
          color: white; background: linear-gradient(135deg, #10b981, #059669);
          border: none; border-radius: 8px; padding: 6px 12px;
          cursor: pointer; width: 100%; text-align: center;
          box-shadow: 0 4px 12px rgba(16,185,129,0.3);
          transition: transform 0.15s ease;
        ">Buka Profil & Transit Intelligence →</button>
      `;

      const popup = new maplibregl.Popup({ offset: isSelected ? 20 : 10, closeButton: false })
        .setDOMContent(popupNode);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([st.longitude, st.latitude])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        onSelectStation(st);
      });

      popup.on('open', () => {
        const btn = document.getElementById(`select-btn-${st.id}`);
        if (btn) {
          btn.onclick = () => onSelectStation(st);
        }
      });

      markersRef.current.push(marker);
    });
  }, [stations, selectedStation, searchResults]);

  // Recenter map on selectedStation changes with 3D camera flyTo animation
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedStation && selectedStation.latitude && selectedStation.longitude) {
      map.flyTo({
        center: [selectedStation.longitude, selectedStation.latitude],
        zoom: 15.8,
        pitch: is3DMode ? 50 : 0,
        bearing: -15,
        duration: 1600,
        essential: true
      });
    }
  }, [selectedStation, is3DMode]);

  // Toggle 3D Camera Pitch
  const toggle3DPitch = () => {
    const map = mapRef.current;
    if (!map) return;
    const nextMode = !is3DMode;
    setIs3DMode(nextMode);
    map.easeTo({
      pitch: nextMode ? 50 : 0,
      bearing: nextMode ? -15 : 0,
      duration: 1000
    });
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      {/* Map Container Ref */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Top-Left Control Toolbar */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 10,
        display: 'flex',
        gap: '6px',
        alignItems: 'center',
        background: 'rgba(15, 23, 42, 0.88)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(51, 65, 85, 0.8)',
        borderRadius: '12px',
        padding: '5px 10px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
      }}>
        {/* 3D Pitch Toggle */}
        <button
          onClick={toggle3DPitch}
          style={{
            background: is3DMode ? '#3b82f6' : '#1e293b',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            transition: 'all 0.2s ease'
          }}
        >
          <span>🏢</span>
          <span>{is3DMode ? '3D View (50°)' : '2D View (Flat)'}</span>
        </button>

        {/* Style Selector */}
        <select
          value={currentStyle}
          onChange={(e) => setCurrentStyle(e.target.value)}
          style={{
            background: '#1e293b',
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '5px 8px',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            outline: 'none'
          }}
        >
          {Object.entries(MAP_STYLES).map(([key, item]) => (
            <option key={key} value={key}>{item.name}</option>
          ))}
        </select>

        {/* MAPID GeoServer Layer Indicator */}
        <div style={{
          background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.4)',
          borderRadius: '8px',
          padding: '4px 8px',
          fontSize: '10px',
          fontWeight: 800,
          color: '#34d399',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>🗺️</span>
          <span>MAPID GeoServer Layer</span>
        </div>
      </div>

      {/* Custom CSS overrides for MapLibre UI */}
      <style>{`
        .maplibregl-ctrl-group {
          background: rgba(15, 23, 42, 0.88) !important;
          backdrop-filter: blur(12px) !important;
          border: 1px solid rgba(51, 65, 85, 0.8) !important;
          border-radius: 12px !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
          overflow: hidden;
        }
        .maplibregl-ctrl-group button {
          border-bottom: 1px solid rgba(51, 65, 85, 0.5) !important;
          width: 32px !important;
          height: 32px !important;
        }
        .maplibregl-ctrl-group button:last-child {
          border-bottom: none !important;
        }
        .maplibregl-ctrl-icon {
          filter: invert(1) hue-rotate(180deg) brightness(1.5) !important;
        }
        .maplibregl-popup-content {
          background: transparent !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .maplibregl-popup-anchor-bottom .maplibregl-popup-tip {
          border-top-color: #0f172a !important;
        }
        .maplibregl-popup-anchor-top .maplibregl-popup-tip {
          border-bottom-color: #0f172a !important;
        }
        .maplibregl-popup-anchor-left .maplibregl-popup-tip {
          border-right-color: #0f172a !important;
        }
        .maplibregl-popup-anchor-right .maplibregl-popup-tip {
          border-left-color: #0f172a !important;
        }
      `}</style>
    </div>
  );
}
