import axios from 'axios';

export const MAPID_API_KEY = 'f776ee857d4c465fa98a38bd44b5ff8d';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const normalizeStations = (payload) => {
  const raw = payload?.data || payload?.features || payload || [];
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => {
      const station = item?.properties || item;
      const coordinates = item?.geometry?.coordinates || [];
      return {
        ...station,
        latitude: station.latitude ?? coordinates[1],
        longitude: station.longitude ?? coordinates[0],
      };
    })
    .filter((station) => station?.id && station?.name && station?.latitude && station?.longitude);
};

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Attach Token dynamically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mapid_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const guestToken = localStorage.getItem('pandu_guest_journey_token') || sessionStorage.getItem('pandu_guest_journey_token');
  if (guestToken && String(config.url || '').includes('/v1/journeys/')) {
    config.headers['X-Guest-Token'] = guestToken;
  }
  return config;
});

export const askGeminiAi = async (prompt, stationId = null) => {
  try {
    const res = await api.post('/v1/ai/assistant', { prompt, station_id: stationId });
    return res.data;
  } catch (err) {
    console.error('Failed calling Gemini AI:', err);
    return {
      status: 'error',
      reply: 'Maaf, terjadi gangguan pada koneksi AI. Silakan coba beberapa saat lagi.'
    };
  }
};

export const explainRouteWithAi = async (routeContext) => {
  const origin = routeContext?.origin?.name || routeContext?.route?.origin?.name || 'Titik Keberangkatan';
  const destination = routeContext?.destination?.name || routeContext?.route?.destination?.name || 'Stasiun Tujuan';
  const prompt = `Jelaskan secara mendalam rekomendasi rute perjalanan transit dari ${origin} ke ${destination} di Jakarta. Kenapa rute ini terbaik, bagaimana kondisi jalur pejalan kaki/skybridge, gerbong mana yang paling nyaman, dan pintu keluar mana yang paling dekat.`;
  return askGeminiAi(prompt, routeContext?.destination?.id || routeContext?.route?.destination?.id);
};

export const getLiveTransitRealtime = async () => {
  try {
    const res = await api.get('/v1/transit/realtime');
    return res.data;
  } catch (err) {
    console.error('Failed fetching live transit realtime:', err);
    return { status: 'error', data: [] };
  }
};

export const getGeoServerLayers = async (type = 'halte') => {
  try {
    const res = await api.get(`/v1/geoserver/layers?type=${type}`);
    return res.data;
  } catch (err) {
    console.error('Failed fetching GeoServer layer:', err);
    return { type: 'FeatureCollection', features: [] };
  }
};

/**
 * Direct Live Stations from MAPID GeoServer (Key: f776ee857d4c465fa98a38bd44b5ff8d)
 */
export const getLiveMapidStations = async () => {
  try {
    const res = await api.get('/v1/mapid/live-stations');
    return res.data;
  } catch (err) {
    console.error('Failed fetching live MAPID stations:', err);
    return { status: 'error', data: [] };
  }
};

/**
 * Direct Live Busway Stops from MAPID GeoServer
 */
export const getLiveMapidStops = async () => {
  try {
    const res = await api.get('/v1/mapid/live-stops');
    return res.data;
  } catch (err) {
    console.error('Failed fetching live MAPID stops:', err);
    return { status: 'error', data: [] };
  }
};

/**
 * Aggregated Station Context: GeoServer Station + MenuGo + PropertiGo + Activities
 */
export const getStationMapidContext = async (stationId) => {
  try {
    const res = await api.get(`/v1/mapid/station-context/${stationId}`);
    return res.data;
  } catch (err) {
    console.error('Failed fetching station MAPID context:', err);
    return { status: 'error', data: null };
  }
};

/**
 * Bounding box polygon generator matching penulisanapi.md B.5
 */
export const createBoundingBoxPolygon = (centerLng, centerLat, radiusKm = 1) => {
  const deltaLat = radiusKm / 111;
  const deltaLng = radiusKm / (111 * Math.cos((centerLat * Math.PI) / 180));

  const minLng = centerLng - deltaLng;
  const maxLng = centerLng + deltaLng;
  const minLat = centerLat - deltaLat;
  const maxLat = centerLat + deltaLat;

  return [
    [
      [minLng, minLat],
      [maxLng, minLat],
      [maxLng, maxLat],
      [minLng, maxLat],
      [minLng, minLat],
    ],
  ];
};

/**
 * Trigger Autonomous Gemini AI Station Micro-Data Enrichment
 */
export const enrichStationWithAi = async (stationId, force = true) => {
  try {
    const res = await api.post(`/v1/ai/enrich-station/${stationId}`, { force });
    return res.data;
  } catch (err) {
    console.error('Failed enriching station with Gemini AI:', err);
    return { status: 'error', message: 'Gagal memperbarui data stasiun via Gemini AI' };
  }
};

export default api;
