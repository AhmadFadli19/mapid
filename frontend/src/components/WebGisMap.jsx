import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom SVG Markers based on Operator
const createOperatorIcon = (lineColor, operatorCode) => {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${lineColor};
        color: white;
        border: 2px solid white;
        border-radius: 12px;
        padding: 3px 7px;
        font-size: 10px;
        font-weight: 800;
        box-shadow: 0 4px 10px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        gap: 3px;
        white-space: nowrap;
      ">
        <span>🚆</span>
        <span>${operatorCode}</span>
      </div>
    `,
    iconSize: [60, 24],
    iconAnchor: [30, 12],
  });
};

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function WebGisMap({ stations, selectedStation, searchResults, onSelectStation }) {
  const defaultCenter = [-6.193125, 106.822894];
  const mapCenter = selectedStation
    ? [selectedStation.latitude, selectedStation.longitude]
    : defaultCenter;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        className="w-full h-full rounded-3xl overflow-hidden shadow-inner"
        style={{ minHeight: '480px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap center={mapCenter} />

        {/* Stations Markers */}
        {stations.map((st) => {
          const icon = createOperatorIcon(st.line_color || '#0284c7', st.code);
          return (
            <Marker
              key={`st-${st.id}`}
              position={[st.latitude, st.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectStation(st),
              }}
            >
              <Popup>
                <div className="p-1 text-slate-800">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span
                      className="text-[10px] px-2 py-0.5 rounded font-bold text-white"
                      style={{ backgroundColor: st.line_color || '#0284c7' }}
                    >
                      {st.operator}
                    </span>
                    <span className="text-[10px] font-mono bg-slate-200 px-1 rounded text-slate-700">{st.code}</span>
                  </div>
                  <h3 className="font-bold text-sm mt-0.5">{st.name}</h3>
                  <p className="text-xs text-slate-500">{st.address}</p>
                  <button
                    onClick={() => onSelectStation(st)}
                    className="mt-2 text-xs text-blue-600 font-semibold underline block"
                  >
                    Lihat Profil Stasiun & Fasilitas →
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Search Results Markers */}
        {searchResults.map((item, idx) => (
          <Marker key={`sr-${idx}`} position={[item.latitude, item.longitude]}>
            <Popup>
              <div className="text-slate-800">
                <span className="text-xs px-1.5 py-0.5 bg-emerald-600 text-white rounded font-bold">
                  {item.type} ({item.operator})
                </span>
                <p className="text-xs font-semibold mt-1">{item.name}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
