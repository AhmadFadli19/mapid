
# PRD & API Reference — PanduYuk (WebGIS Transit Companion)
> **Dokumen ini adalah referensi lengkap untuk AI agent** yang akan membantu pengembangan PanduYuk. Berisi PRD (Product Requirements Document) lengkap, dokumentasi API MAPID yang digunakan, cara penggunaan API key, dan contoh implementasi kode siap pakai.

---

## BAGIAN A — PRODUCT REQUIREMENTS DOCUMENT (PRD)

---

### A.1 Gambaran Umum Produk

| Field | Detail |
|---|---|
| **Nama Produk** | PanduYuk |
| **Tipe Produk** | WebGIS Transit Companion (web app, tanpa instalasi) |
| **Tim** | Anti Kecelakaan — kolaborasi UPNVJ & Telkom University |
| **Target Wilayah MVP** | Jabodetabek (KRL Commuter Line, MRT Jakarta, LRT Jabodebek, TransJakarta) |
| **Akses Pengguna** | Browser modern, tanpa instalasi aplikasi |

**Positioning:** PanduYuk **bukan** pengganti Google Maps atau aplikasi resmi operator. PanduYuk mengisi celah sebagai **transit companion & decision support system** yang mendampingi pengguna **sejak perencanaan hingga tiba di tujuan**, dengan rekomendasi berbasis data yang selalu bisa dijelaskan (explainable).

---

### A.2 Problem Statement

Ada 4 titik masalah yang terjadi konsisten dalam perjalanan transit massal Jabodetabek:

1. **Sebelum naik** — Pengguna tidak tahu gerbong mana yang paling strategis agar dekat dengan pintu keluar atau titik transit berikutnya.
2. **Saat berpindah moda** — Kebingungan soal jalur perpindahan, jarak jalan kaki, dan estimasi waktu.
3. **Setiba di stasiun tujuan** — Pintu keluar yang tepat tidak diketahui sebelumnya.
4. **Soal fasilitas** — Kondisi toilet, musala, lift, tenant baru diketahui setelah sampai lokasi.

---

### A.3 Goals & Indikator Keberhasilan

| Kode | Goal | Indikator |
|---|---|---|
| G1 | Mengurangi kebingungan memilih gerbong, pintu keluar, fasilitas | Rekomendasi tersedia di setiap tahap Journey Timeline pada MVP |
| G2 | Pendampingan kontekstual selama perjalanan | 9 kapabilitas inti berjalan end-to-end |
| G3 | Setiap rekomendasi explainable | Setiap output menyertakan alasan & sumber data/timestamp |
| G4 | Manfaatkan data spasial komunitas yang sudah ada | Community Maps MAPID sebagai sumber POI/fasilitas/tenant utama |
| G5 | Kanal pembaruan data dari lapangan secara real-time | Community Report berjalan dengan mekanisme verifikasi sebelum update sistem |

---

### A.4 User Persona

| Persona | Karakteristik | Kebutuhan Utama |
|---|---|---|
| **Raka** (Pengguna Baru, 19th, Tangerang) | Belum familiar sistem transit Jabodetabek | Smart Route Overview, Journey Timeline, Boarding Rec, Arrival Reminder, Exit Rec |
| **Andi** (Komuter Rutin, 24th, Bekasi) | Pengguna harian, butuh efisiensi maksimal | Boarding Rec posisi gerbong, Journey Monitoring, Exit Rec, info kondisi terkini |
| **Nadia** (Wisatawan, 22th, Garut) | Tidak familiar geografi Jabodetabek | Smart Route Overview, Arrival Reminder, Exit Rec jelas |
| **Putri** (Pengguna Aksesibilitas, 35th, Jakarta) | Butuh lift & jalur ramah difabel yang benar-benar bisa digunakan | Facility Rec berbasis aksesibilitas, status kondisi fasilitas real-time |
| **Citra** (Kontributor Komunitas, 24th, Depok) | Aktif melaporkan kondisi lapangan | Form Community Report sederhana, mekanisme verifikasi, status laporan |

---

### A.5 9 Kapabilitas Inti (Fitur MVP)

| No | Fitur | Deskripsi |
|---|---|---|
| 1 | **Smart Route Overview** | Rute end-to-end + moda + titik perpindahan via peta interaktif MAPID MAPS |
| 2 | **Station Information** | Detail fasilitas, tenant, exit gate tiap stasiun (dari Community Maps MAPID) |
| 3 | **Journey Timeline** | Satu alur waktu yang menggabungkan semua tahap perjalanan & widget aktif |
| 4 | **Boarding Recommendation** | Rekomendasi posisi gerbong berdasarkan Spatial Relationship Analysis |
| 5 | **Arrival Reminder** | Notifikasi otomatis saat pengguna harus bersiap turun (berbasis GTFS Realtime) |
| 6 | **Exit Recommendation** | Rekomendasi pintu keluar terbaik menjelang tiba di tujuan |
| 7 | **Facility Recommendation** | Rekomendasi fasilitas berdasarkan posisi + kondisi (aksesibilitas, status operasional) |
| 8 | **Journey Monitoring** | Layer background yang update rekomendasi jika kondisi berubah (real-time) |
| 9 | **Community Report** | Form pelaporan kondisi lapangan + alur verifikasi sebelum data dipakai sistem |

---

### A.6 Arsitektur Sistem

**Stack Teknologi:**

| Layer | Teknologi |
|---|---|
| Frontend | Next.js, React, Tailwind CSS, MAPID MAPS (MapLibre GL JS) |
| Backend | Laravel + Laravel Sanctum |
| Engine | Transit Intelligence Engine (rule-based spatial analysis) |
| Database | PostgreSQL + PostGIS (SRID 4326, indeks GiST) |
| Data Spasial | GEO MAPID (terpisah dari DB aplikasi) |
| Peta Interaktif | MAPID MAPS (basemap + layer visualisasi) |

**Alur Sistem:**
```
Pengguna (input tujuan)
    ↓
Frontend (Next.js + MAPID MAPS)
    ↓
Backend Laravel (auth Sanctum + manajemen data non-spasial)
    ↓
Transit Intelligence Engine
    ├── GEO MAPID / MAPID Mission API (data spasial + komunitas)
    ├── GTFS / GTFS Realtime (rute, jadwal, posisi)
    ├── BMKG / BIG / BPS (data pendukung)
    └── Community Report (laporan terverifikasi)
    ↓ (rule-based spatial analysis)
Insight & Recommendation
    ↓
Backend → Frontend → MAPID MAPS (visualisasi peta berlapis)
```

---

### A.7 Spatial Analysis & AI Logic

**PanduYuk menggunakan rule-based spatial analysis (BUKAN machine learning) pada MVP.**

| Metode | Fungsi | Fitur yang Didukung |
|---|---|---|
| Proximity Analysis | Analisis jarak dasar | Facility Recommendation |
| Nearest Facility Analysis | Jarak + kondisi fasilitas (lantai, status) | Facility Rec, Exit Recommendation |
| Spatial Relationship Analysis | Hubungan antarobjek di area stasiun (gerbong vs pintu keluar) | Boarding Rec, Exit Recommendation |
| Network Analysis | Keterhubungan antarmoda & jalur transportasi | Journey Timeline |

**Transit Intelligence Engine:**
- Bukan chatbot, bukan LLM — perannya sebagai penerjemah data.
- Input: data spasial (GEO MAPID) + data operasional (GTFS/GTFS Realtime) + konteks perjalanan pengguna.
- Output: **Insight** (informatif) dan **Recommendation** (mengarahkan tindakan spesifik).
- Prinsip explainability: jika data tidak lengkap, engine **tidak menebak** — tampilkan data terakhir + timestamp.

---

### A.8 Scope Boundaries

**✅ Dalam Scope MVP:** 9 kapabilitas inti, wilayah Jabodetabek, rule-based spatial analysis, MAPID MAPS + GEO MAPID, GTFS statis + Realtime, Community Report dengan verifikasi, web browser.

**❌ Non-Goals (tidak dikerjakan):**
- Machine learning / prediksi kepadatan / keterlambatan
- Ekspansi ke luar Jabodetabek
- Fungsi pencarian rute ala Google Maps/Moovit
- Aplikasi mobile native (iOS/Android)
- Chatbot / LLM

---

### A.9 Acceptance Criteria (Lengkap)

**Smart Route Overview:**
- ✅ Input asal & tujuan → tampilkan rute lengkap (moda + titik perpindahan).
- ✅ Data GTFS tidak tersedia → tampilkan pesan "data belum tersedia" (bukan kosong).

**Boarding Recommendation:**
- ✅ Tahap sebelum naik → tampilkan rekomendasi gerbong + alasannya.
- ✅ Data gerbong tidak lengkap → tampilkan insight umum, jangan tebak.

**Arrival Reminder:**
- ✅ Estimasi waktu tersisa mencapai ambang batas → kirim reminder bersiap turun.

**Exit Recommendation:**
- ✅ Mendekati stasiun tujuan → tampilkan pintu keluar yang direkomendasikan + alasan.

**Facility Recommendation:**
- ✅ Fasilitas terdekat tidak berfungsi → jangan rekomendasikan, tampilkan alternatif.
- ✅ Status fasilitas lama → sertakan keterangan waktu data terakhir diperbarui.

**Journey Monitoring:**
- ✅ Kondisi berubah (keterlambatan, laporan baru) → update insight/recommendation.

**Community Report:**
- ✅ Laporan belum terverifikasi → tidak langsung memengaruhi data pengguna lain.
- ✅ Laporan terverifikasi → data diperbarui + tampilkan sumber + waktu update.
- ✅ Submit tanpa lokasi/deskripsi → tampilkan error yang jelas, jangan teruskan.

---

### A.10 Prinsip Penting yang Tidak Boleh Dilanggar

1. **Explainability first** — setiap output rekomendasi harus menyertakan alasan dan sumber data. Sistem tidak boleh menebak.
2. **Jika data tidak lengkap, tampilkan timestamp** — lebih baik data lama + "terakhir diperbarui [waktu]" daripada kosong atau data tidak valid.
3. **Community Report tidak langsung memengaruhi data pengguna lain** — selalu lewat verifikasi berjenjang.
4. **Rule-based, bukan ML** — pada MVP semua logika engine harus bisa ditelusuri ke aturan tertulis dan data sumbernya.
5. **Journey Timeline sebagai hub** — semua widget mengikuti konteks tahap perjalanan aktif, tidak ditampilkan semua sekaligus.
6. **Rekomendasi aksesibilitas mempertimbangkan kondisi, bukan hanya jarak** — fasilitas rusak tidak boleh direkomendasikan.

---

---

## BAGIAN B — MAPID API REFERENCE & CARA PENGGUNAAN

---

### B.1 Kredensial & Autentikasi

> ⚠️ **PENTING untuk AI agent:** Semua request ke MAPID API WAJIB menyertakan API key di header. Gunakan kredensial berikut:

```
API Key  : f776ee857d4c465fa98a38bd44b5ff8d
Header   : x-api-key: f776ee857d4c465fa98a38bd44b5ff8d
```

**Cara menyertakan di setiap request:**

```javascript
// Fetch API (JavaScript/Node.js)
const headers = {
  "Content-Type": "application/json",
  "x-api-key": "f776ee857d4c465fa98a38bd44b5ff8d"
};

// Axios
axios.post(url, body, {
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "f776ee857d4c465fa98a38bd44b5ff8d"
  }
});

// Laravel (PHP) dengan Http facade
Http::withHeaders([
    'Content-Type'  => 'application/json',
    'x-api-key'     => 'f776ee857d4c465fa98a38bd44b5ff8d',
])->post($url, $body);

// cURL (PHP)
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'x-api-key: f776ee857d4c465fa98a38bd44b5ff8d'
]);
```

---

### B.2 MAPID Basemap (MAPID MAPS)

Digunakan untuk menampilkan peta interaktif di frontend. Menggunakan **MapLibre GL JS** dengan style Mapbox Style Format.

**Format Style URL:**
```
https://v2.basemap.mapid.io/styles/{style-name}/style.json?key=f776ee857d4c465fa98a38bd44b5ff8d
```

**Available Styles:**

| Style Name | URL Lengkap |
|---|---|
| Street (default) | `https://v2.basemap.mapid.io/styles/street-v2.0/style.json?key=f776ee857d4c465fa98a38bd44b5ff8d` |
| Satellite | `https://v2.basemap.mapid.io/styles/satellite-v2.0/style.json?key=f776ee857d4c465fa98a38bd44b5ff8d` |
| Dark | `https://v2.basemap.mapid.io/styles/dark-v2.0/style.json?key=f776ee857d4c465fa98a38bd44b5ff8d` |
| Light | `https://v2.basemap.mapid.io/styles/light-v2.0/style.json?key=f776ee857d4c465fa98a38bd44b5ff8d` |

**Implementasi MapLibre GL JS (Full HTML, siap pakai):**

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <title>PanduYuk Map</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@6.0.0/dist/maplibre-gl.css" />
  <style>
    body { margin: 0; padding: 0; }
    html, body, #map { height: 100%; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script type="module">
    import maplibregl from "https://unpkg.com/maplibre-gl@6.0.0/dist/maplibre-gl.mjs";

    const map = new maplibregl.Map({
      container: "map",
      style: "https://v2.basemap.mapid.io/styles/street-v2.0/style.json?key=f776ee857d4c465fa98a38bd44b5ff8d",
      center: [106.8271129, -6.1754398], // Jakarta
      zoom: 12,
      pitch: 0,
      bearing: 0,
    });
  </script>
</body>
</html>
```

**Implementasi di React/Next.js:**

```jsx
// Install: npm install maplibre-gl
import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const MAPID_API_KEY = "f776ee857d4c465fa98a38bd44b5ff8d";

export default function MapComponent() {
  const mapContainer = useRef(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: `https://v2.basemap.mapid.io/styles/street-v2.0/style.json?key=${MAPID_API_KEY}`,
      center: [106.8271129, -6.1754398],
      zoom: 12,
    });

    return () => map.remove();
  }, []);

  return <div ref={mapContainer} style={{ width: "100%", height: "100vh" }} />;
}
```

---

### B.3 MAPID Mission API

Base URL semua mission endpoint:
```
POST https://server.mapid.io/web/competition/{mission-type}
```

#### B.3.1 Struktur Request yang Digunakan Semua Mission Endpoint

**Headers (wajib di setiap request):**
```json
{
  "Content-Type": "application/json",
  "x-api-key": "f776ee857d4c465fa98a38bd44b5ff8d"
}
```

**Body (wajib):**
```json
{
  "feature": {
    "type": "Polygon",
    "coordinates": [
      [
        [106.7, -6.3],
        [107.0, -6.3],
        [107.0, -6.1],
        [106.7, -6.1],
        [106.7, -6.3]
      ]
    ]
  },
  "offset": 0
}
```

**Aturan penting untuk `feature` (Polygon):**
- Tipe harus `"Polygon"` (bukan MultiPolygon, Point, atau LineString).
- Setiap ring minimal 4 titik.
- Titik pertama dan terakhir harus sama (ring tertutup).

**Aturan `offset` (pagination):**
- Default: `0`
- Limit per request: **100 item** (tidak bisa diubah).
- Jika `pagination.hasMore = true` dan `total > 100`, kirim request berikutnya dengan `offset: 100`.
- Jika offset melebihi total data → server return HTTP 400 error.

#### B.3.2 Struktur Response Umum (HTTP 200 Sukses)

```json
{
  "success": true,
  "message": "Data retrieved successfully",
  "features": [
    {
      "_id": "...",
      "mission": "mission-type",
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [106.75, -6.2] },
      "key": "...",
      "properties": { ... }
    }
  ],
  "pagination": {
    "total": 100,
    "limit": 100,
    "offset": 0,
    "hasMore": false
  }
}
```

**Response Tidak Ada Data (HTTP 200):**
```json
{
  "success": true,
  "message": "No features found",
  "features": [],
  "pagination": { "total": 0, "limit": 100, "offset": 0, "hasMore": false }
}
```

**Response Error (HTTP 400):**
```json
{
  "success": false,
  "message": "feature is required in body"
}
```

**Response Offset Out of Range (HTTP 400):**
```json
{
  "success": false,
  "message": "offset (150) is out of range, must be between 0 and 99 (total data: 100)"
}
```

---

#### B.3.3 Endpoint: Properti Go

```
POST https://server.mapid.io/web/competition/propertigo
```

**Properties yang dikembalikan:**

| Field | Tipe | Deskripsi |
|---|---|---|
| `kategori_properti` | String | Kategori properti |
| `jenis_properti` | String | Jenis properti |
| `tanggal` | String | Tanggal |
| `alamat` | String | Alamat |
| `foto_tampak_depan` | String | URL foto tampak depan |
| `foto_spanduk` | String | URL foto spanduk |
| `catatan` | String | Catatan |

**Contoh penggunaan (JavaScript/fetch):**

```javascript
const MAPID_API_KEY = "f776ee857d4c465fa98a38bd44b5ff8d";

async function getPropertiGo(polygonCoordinates, offset = 0) {
  const response = await fetch("https://server.mapid.io/web/competition/propertigo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": MAPID_API_KEY,
    },
    body: JSON.stringify({
      feature: {
        type: "Polygon",
        coordinates: polygonCoordinates,
      },
      offset,
    }),
  });

  const data = await response.json();
  return data;
}

// Contoh penggunaan — area Jabodetabek
const jabodetabekPolygon = [
  [
    [106.7, -6.3],
    [107.0, -6.3],
    [107.0, -6.1],
    [106.7, -6.1],
    [106.7, -6.3],
  ],
];

const result = await getPropertiGo(jabodetabekPolygon);
console.log(result.features); // Array of property GeoJSON features
```

**Contoh response:**
```json
{
  "success": true,
  "message": "Propertigo data retrieved successfully",
  "features": [
    {
      "_id": "abc123",
      "mission": "properti",
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [106.75, -6.2] },
      "key": "...",
      "properties": {
        "kategori_properti": "Rumah",
        "jenis_properti": "Dijual",
        "alamat": "Jl. Contoh No. 1, Jakarta",
        "foto_tampak_depan": "https://cdn.mapid.io/..."
      }
    }
  ],
  "pagination": { "total": 1, "limit": 100, "offset": 0, "hasMore": false }
}
```

---

#### B.3.4 Endpoint: Menu Go

```
POST https://server.mapid.io/web/competition/menugo
```

**Properties yang dikembalikan:**

| Field | Tipe | Deskripsi |
|---|---|---|
| `nama_tempat` | String | Nama tempat makan |
| `jenis_tempat` | String | Jenis tempat |
| `tanggal` | String | Tanggal survei |
| `waktu` | String | Waktu survei |
| `jam_buka` | String | Jam buka |
| `jam_tutup` | String | Jam tutup |
| `foto_tempat` | String | URL foto tempat |
| `foto_menu_1` | String | URL foto menu 1 |
| `foto_menu_2` | String | URL foto menu 2 |
| `link_menu` | String | Link menu |
| `menu_utama` | String | Menu utama |
| `harga_rata_rata` | Number | Harga rata-rata (dalam Rupiah) |
| `kondisi_tempat` | String | Kondisi tempat |
| `mobilitas` | String | Aksesibilitas mobilitas |
| `catatan` | String | Catatan |

**Contoh penggunaan:**

```javascript
const MAPID_API_KEY = "f776ee857d4c465fa98a38bd44b5ff8d";

async function getMenuGo(polygonCoordinates, offset = 0) {
  const response = await fetch("https://server.mapid.io/web/competition/menugo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": MAPID_API_KEY,
    },
    body: JSON.stringify({
      feature: { type: "Polygon", coordinates: polygonCoordinates },
      offset,
    }),
  });
  return await response.json();
}
```

> **Relevansi untuk PanduYuk:** Data Menu Go berguna untuk fitur **Station Information** — menampilkan tenant/kuliner yang tersedia di sekitar stasiun.

---

#### B.3.5 Endpoint: Struck Go

```
POST https://server.mapid.io/web/competition/struckgo
```

**Properties yang dikembalikan:**

| Field | Tipe | Deskripsi |
|---|---|---|
| `nama_tempat` | String | Nama tempat |
| `kategori_tempat` | String | Kategori tempat |
| `tanggal` | String | Tanggal transaksi |
| `waktu` | String | Waktu transaksi |
| `metode_pembayaran` | String | Metode pembayaran |
| `foto_struk` | String | URL foto struk |
| `catatan` | String | Catatan |

**Contoh penggunaan:**

```javascript
const MAPID_API_KEY = "f776ee857d4c465fa98a38bd44b5ff8d";

async function getStruckGo(polygonCoordinates, offset = 0) {
  const response = await fetch("https://server.mapid.io/web/competition/struckgo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": MAPID_API_KEY,
    },
    body: JSON.stringify({
      feature: { type: "Polygon", coordinates: polygonCoordinates },
      offset,
    }),
  });
  return await response.json();
}
```

---

#### B.3.6 Pagination Helper — Ambil Semua Data (jika total > 100)

```javascript
const MAPID_API_KEY = "f776ee857d4c465fa98a38bd44b5ff8d";

async function fetchAllMissionData(missionType, polygonCoordinates) {
  // missionType: "propertigo" | "menugo" | "struckgo"
  const url = `https://server.mapid.io/web/competition/${missionType}`;
  let allFeatures = [];
  let offset = 0;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": MAPID_API_KEY,
      },
      body: JSON.stringify({
        feature: { type: "Polygon", coordinates: polygonCoordinates },
        offset,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      console.error("API Error:", data.message);
      break;
    }

    allFeatures = allFeatures.concat(data.features);
    hasMore = data.pagination.hasMore;
    offset += data.features.length; // Increment offset by items received
  }

  return allFeatures;
}

// Contoh penggunaan
const polygon = [[[106.7, -6.3], [107.0, -6.3], [107.0, -6.1], [106.7, -6.1], [106.7, -6.3]]];
const allMenus = await fetchAllMissionData("menugo", polygon);
console.log(`Total menu data: ${allMenus.length}`);
```

---

### B.4 MAPID Activities API

Endpoint untuk mengambil data aktivitas komunitas yang dibagikan pengguna MAPID Apps.

```
POST https://server.mapid.io/web/competition/activities
```

**Headers:**
```json
{
  "Content-Type": "application/json",
  "x-api-key": "f776ee857d4c465fa98a38bd44b5ff8d"
}
```

**Body Parameters:**

| Parameter | Tipe | Required | Deskripsi |
|---|---|---|---|
| `feature` | GeoJSON Polygon | ✅ Ya | Area polygon pencarian |
| `start_date` | String (YYYY-MM-DD) | ❌ Opsional | Filter tanggal mulai (harus bersama `end_date`) |
| `end_date` | String (YYYY-MM-DD) | ❌ Opsional | Filter tanggal akhir (harus bersama `start_date`) |
| `hashtag` | Array String | ❌ Opsional | Filter berdasarkan deskripsi (case-insensitive, partial match) |
| `author` | String | ❌ Opsional | Filter berdasarkan username atau full_name |

> ⚠️ `start_date` dan `end_date` **harus dikirim bersama**. Jika hanya salah satu → server return error 500.

**Aturan limit:**
- Tanpa date range: limit **60 item** (12×5).
- Dengan date range: semua data dalam range dikembalikan.
- Tidak ada parameter offset/limit — dikendalikan server.

**Contoh penggunaan (filter by hashtag):**

```javascript
const MAPID_API_KEY = "f776ee857d4c465fa98a38bd44b5ff8d";

async function getActivities({ polygonCoordinates, startDate, endDate, hashtags, author }) {
  const body = {
    feature: { type: "Polygon", coordinates: polygonCoordinates },
  };

  // Tambahkan filter opsional jika ada
  if (startDate && endDate) {
    body.start_date = startDate;
    body.end_date = endDate;
  }
  if (hashtags && hashtags.length > 0) {
    body.hashtag = hashtags;
  }
  if (author) {
    body.author = author;
  }

  const response = await fetch("https://server.mapid.io/web/competition/activities", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": MAPID_API_KEY,
    },
    body: JSON.stringify(body),
  });

  return await response.json();
}

// Contoh: cari aktivitas bertag "kuliner" di area Jabodetabek
const polygon = [[[106.7, -6.3], [107.0, -6.3], [107.0, -6.1], [106.7, -6.1], [106.7, -6.3]]];
const activities = await getActivities({
  polygonCoordinates: polygon,
  hashtags: ["kuliner", "stasiun"],
  startDate: "2024-01-01",
  endDate: "2024-12-31",
});

console.log(activities.data.activities);
```

**Struktur Response (HTTP 200 Sukses):**

```json
{
  "success": true,
  "message": "Community MAPS - Activities retrieved successfully",
  "data": {
    "activities": [
      {
        "_id": "...",
        "title": "Judul Aktivitas",
        "description": "Deskripsi aktivitas dengan #kuliner",
        "geometry": { "type": "Point", "coordinates": [106.75, -6.2] },
        "medias": ["https://cdn.mapid.io/foto1.jpg"],
        "user_name": "budi",
        "user_full_name": "Budi Santoso",
        "user_profile_picture": "https://cdn.mapid.io/profile.jpg",
        "community_name": "Komunitas Transit",
        "community_picture": "https://cdn.mapid.io/community.jpg",
        "community_description": "Deskripsi komunitas",
        "created_at": "2024-06-01T10:00:00.000Z",
        "likes": [
          {
            "_id": "...",
            "user_name": "andi",
            "full_name": "Andi Wijaya",
            "profile_picture": "https://cdn.mapid.io/andi.jpg",
            "created_at": "2024-06-01T11:00:00.000Z"
          }
        ],
        "total_comment": 5
      }
    ]
  },
  "meta": {
    "filters": {
      "feature": { "type": "Polygon", "coordinates": ["..."] },
      "start_date": "2024-01-01T00:00:00.000Z",
      "end_date": "2024-12-31T23:59:59.999Z",
      "hashtag": ["kuliner"],
      "author": null
    },
    "total": 1
  }
}
```

**Fields per activity:**

| Field | Tipe | Deskripsi |
|---|---|---|
| `_id` | String | ID unik aktivitas |
| `title` | String | Judul aktivitas |
| `description` | String | Deskripsi aktivitas |
| `geometry` | GeoJSON Point | Lokasi aktivitas |
| `medias` | Array String | URL foto/video (CDN) |
| `user_name` | String | Username pembuat |
| `user_full_name` | String | Nama lengkap pembuat |
| `user_profile_picture` | String | URL foto profil (CDN) |
| `community_name` | String | Nama komunitas |
| `community_picture` | String | URL foto komunitas (CDN) |
| `community_description` | String | Deskripsi komunitas |
| `created_at` | String | Timestamp ISO 8601 |
| `likes` | Array | Daftar user yang like |
| `total_comment` | Number | Jumlah komentar |

> **Relevansi untuk PanduYuk:** Data Activities berguna untuk **Community Report** dan **Station Information** — menampilkan laporan & foto kondisi lapangan dari komunitas pengguna MAPID.

---

### B.5 Cara Membuat Polygon dari Bounding Box Stasiun

Untuk query data di sekitar stasiun tertentu, bangun polygon dari koordinat stasiun + radius:

```javascript
/**
 * Buat polygon bounding box dari koordinat pusat + radius
 * @param {number} centerLng - Longitude pusat (contoh: 106.8271)
 * @param {number} centerLat - Latitude pusat (contoh: -6.1754)
 * @param {number} radiusKm - Radius dalam kilometer (contoh: 1)
 * @returns {Array} GeoJSON Polygon coordinates
 */
function createBoundingBoxPolygon(centerLng, centerLat, radiusKm) {
  // 1 derajat lat ≈ 111 km, 1 derajat lng ≈ 111 * cos(lat) km
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
      [minLng, minLat], // tutup ring
    ],
  ];
}

// Contoh: area radius 1km dari Stasiun Sudirman
const sudirmanPolygon = createBoundingBoxPolygon(106.8271, -6.2097, 1);

// Ambil data menu di sekitar Stasiun Sudirman
const menuResult = await getMenuGo(sudirmanPolygon);
```

---

### B.6 Error Handling & Best Practices

```javascript
const MAPID_API_KEY = "f776ee857d4c465fa98a38bd44b5ff8d";

async function safeMissionFetch(missionType, polygonCoordinates, offset = 0) {
  try {
    const response = await fetch(
      `https://server.mapid.io/web/competition/${missionType}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": MAPID_API_KEY,
        },
        body: JSON.stringify({
          feature: { type: "Polygon", coordinates: polygonCoordinates },
          offset,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      // HTTP 400 — validasi gagal atau offset out of range
      console.error(`API Error [${response.status}]:`, data.message);
      return { success: false, features: [], pagination: null, error: data.message };
    }

    return data;
  } catch (err) {
    // Network error / timeout
    console.error("Network error:", err);
    return { success: false, features: [], pagination: null, error: err.message };
  }
}
```

**Checklist sebelum kirim request:**
- [ ] Header `x-api-key: f776ee857d4c465fa98a38bd44b5ff8d` sudah ada.
- [ ] Header `Content-Type: application/json` sudah ada.
- [ ] `feature.type` adalah `"Polygon"` (bukan Point/LineString/MultiPolygon).
- [ ] Polygon sudah tertutup (koordinat pertama = koordinat terakhir).
- [ ] Setiap ring polygon minimal 4 titik.
- [ ] `offset` tidak melebihi `total` data dari response sebelumnya.
- [ ] `start_date` dan `end_date` selalu dikirim bersama (untuk Activities API).

---

### B.7 Pemetaan API ke Fitur PanduYuk

Ini adalah panduan konkret bagaimana setiap API MAPID digunakan di masing-masing fitur:

| Fitur PanduYuk | API MAPID yang Digunakan | Data yang Diambil |
|---|---|---|
| **Smart Route Overview** | MAPID MAPS (basemap) | Peta dasar untuk menampilkan jalur transportasi |
| **Station Information** | Mission API `/menugo` | Daftar tenant/kuliner di sekitar stasiun |
| **Station Information** | Mission API `/propertigo` | POI properti sekitar stasiun |
| **Station Information** | Activities API | Laporan & foto kondisi fasilitas dari komunitas |
| **Facility Recommendation** | Activities API (filter `#fasilitas`) | Status terkini fasilitas dari laporan komunitas |
| **Community Report** | Activities API (filter by author/date) | Tampilkan laporan yang sudah diverifikasi |
| **Journey Monitoring** | Activities API + Mission API | Update real-time kondisi stasiun yang dilalui |

> **Catatan untuk implementasi:** Semua query API MAPID harus menggunakan **polygon area stasiun yang relevan** dengan tahap perjalanan pengguna saat ini — bukan satu polygon besar Jabodetabek sekaligus. Ini menjaga response tetap ringan dan kontekstual.

---

### B.8 Contoh Koordinat Stasiun Utama Jabodetabek

Gunakan koordinat ini sebagai pusat untuk `createBoundingBoxPolygon()`:

| Stasiun | Longitude | Latitude |
|---|---|---|
| Sudirman (KRL/MRT) | 106.8271 | -6.2097 |
| Dukuh Atas BNI (MRT) | 106.8226 | -6.2021 |
| Blok M (MRT/TransJakarta) | 106.7992 | -6.2441 |
| Gambir | 106.8307 | -6.1764 |
| Manggarai | 106.8503 | -6.2149 |
| Tanah Abang | 106.8106 | -6.1869 |
| Bekasi | 107.0155 | -6.2393 |
| Bogor | 106.7973 | -6.5944 |
| Lebak Bulus (MRT) | 106.7743 | -6.2893 |
| Daan Mogot (LRT) | 106.7398 | -6.1705 |

---

## BAGIAN C — RINGKASAN CEPAT UNTUK AI AGENT

---

### C.1 TL;DR — Yang Harus Selalu Diingat

```
API KEY   : f776ee857d4c465fa98a38bd44b5ff8d
HEADER    : x-api-key: f776ee857d4c465fa98a38bd44b5ff8d
METHOD    : POST (semua endpoint)
BASE URL  : https://server.mapid.io/web/competition/
PETA      : https://v2.basemap.mapid.io/styles/street-v2.0/style.json?key=f776ee857d4c465fa98a38bd44b5ff8d
```

### C.2 Daftar Endpoint Lengkap

| Endpoint | Method | Fungsi |
|---|---|---|
| `/web/competition/propertigo` | POST | Data properti dalam polygon |
| `/web/competition/menugo` | POST | Data kuliner/restoran dalam polygon |
| `/web/competition/struckgo` | POST | Data struk/transaksi dalam polygon |
| `/web/competition/activities` | POST | Data aktivitas komunitas dalam polygon |

### C.3 Template Body Request Minimal

```json
{
  "feature": {
    "type": "Polygon",
    "coordinates": [[
      [LONG_MIN, LAT_MIN],
      [LONG_MAX, LAT_MIN],
      [LONG_MAX, LAT_MAX],
      [LONG_MIN, LAT_MAX],
      [LONG_MIN, LAT_MIN]
    ]]
  },
  "offset": 0
}
```

### C.4 Prinsip Pengembangan (Tidak Boleh Dilanggar)

1. Setiap rekomendasi harus menyertakan **alasan + sumber data**.
2. Jika data tidak ada/belum update, tampilkan **timestamp terakhir update**, jangan tebak.
3. Community Report **tidak langsung** memengaruhi data pengguna lain — wajib verifikasi dulu.
4. Logika engine **rule-based**, bukan ML/LLM.
5. Semua widget mengikuti **tahap aktif Journey Timeline** pengguna.
6. Facility Recommendation mempertimbangkan **kondisi fasilitas**, bukan hanya jarak.
