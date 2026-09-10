# PRD Summary — PanduYuk (WebGIS Transit Companion)
> **Dokumen ini adalah ringkasan terstruktur dari PRD asli PanduYuk**, ditulis khusus untuk AI agent agar dapat memahami keseluruhan sistem, fitur, dan batasan proyek secara lengkap dan akurat sebelum membantu pengembangan.

---

## 1. Gambaran Umum Produk

| Field | Detail |
|---|---|
| **Nama Produk** | PanduYuk |
| **Tipe Produk** | WebGIS Transit Companion (web app, tanpa instalasi) |
| **Tim** | Anti Kecelakaan — kolaborasi UPNVJ & Telkom University |
| **Target Wilayah MVP** | Jabodetabek (KRL Commuter Line, MRT Jakarta, LRT Jabodebek, TransJakarta) |
| **Akses Pengguna** | Browser modern, tanpa instalasi aplikasi |

### Positioning
PanduYuk **bukan** pengganti Google Maps atau aplikasi resmi operator. PanduYuk mengisi celah sebagai **transit companion & decision support system** yang mendampingi pengguna **sejak perencanaan hingga tiba di tujuan**, dengan rekomendasi berbasis data yang selalu bisa dijelaskan (explainable).

---

## 2. Problem Statement

Ada 4 titik masalah yang terjadi konsisten dalam perjalanan transit massal Jabodetabek:

1. **Sebelum naik** — Pengguna tidak tahu gerbong mana yang paling strategis agar dekat dengan pintu keluar atau titik transit berikutnya.
2. **Saat berpindah moda** — Kebingungan soal jalur perpindahan, jarak jalan kaki, dan estimasi waktu.
3. **Setiba di stasiun tujuan** — Pintu keluar yang tepat tidak diketahui sebelumnya.
4. **Soal fasilitas** — Kondisi toilet, musala, lift, tenant baru diketahui setelah sampai lokasi.

Informasi sebenarnya ada, tapi tersebar dan tidak disajikan sesuai konteks perjalanan pengguna secara real-time.

---

## 3. Goals & Indikator Keberhasilan

| Kode | Goal | Indikator |
|---|---|---|
| G1 | Mengurangi kebingungan memilih gerbong, pintu keluar, fasilitas | Rekomendasi tersedia di setiap tahap Journey Timeline pada MVP |
| G2 | Pendampingan kontekstual selama perjalanan (bukan hanya pra-perjalanan) | 9 kapabilitas inti berjalan end-to-end |
| G3 | Setiap rekomendasi explainable | Setiap output menyertakan alasan & sumber data/timestamp |
| G4 | Manfaatkan data spasial komunitas yang sudah ada | Community Maps MAPID sebagai sumber POI/fasilitas/tenant utama |
| G5 | Kanal pembaruan data dari lapangan secara real-time | Community Report berjalan dengan mekanisme verifikasi sebelum update sistem |

---

## 4. User Persona

| Persona | Karakteristik | Kebutuhan Utama |
|---|---|---|
| **Raka** (Pengguna Baru/First-timer, 19th, Tangerang) | Belum familiar sistem transit Jabodetabek, takut salah gerbong/jalur | Smart Route Overview, Journey Timeline, Boarding Rec, Arrival Reminder, Exit Rec |
| **Andi** (Komuter Rutin, 24th, Bekasi) | Pengguna harian, butuh efisiensi maksimal | Boarding Rec berdasarkan posisi gerbong, Journey Monitoring, Exit Rec, info kondisi terkini |
| **Nadia** (Wisatawan, 22th, Garut) | Tidak familiar geografi Jabodetabek, takut salah arah | Smart Route Overview, Journey Timeline, Boarding Rec, Arrival Reminder, Exit Rec jelas |
| **Putri** (Pengguna Aksesibilitas, 35th, Jakarta) | Butuh lift & jalur ramah difabel yang benar-benar bisa digunakan | Facility Rec berbasis aksesibilitas, status/kondisi fasilitas real-time, alternatif jika tidak tersedia |
| **Citra** (Kontributor Komunitas, 24th, Depok) | Aktif menemukan kondisi lapangan berbeda dari info sistem | Form Community Report sederhana, mekanisme verifikasi, status laporan |

---

## 5. User Stories (Lengkap)

1. **Smart Route Overview & Station Information**
   - Sebagai pengguna baru, ingin lihat gambaran rute & titik perpindahan sebelum berangkat.
   - Sebagai komuter, ingin lihat fasilitas stasiun yang akan dilalui agar bisa merencanakan mampir.

2. **Journey Timeline**
   - Sebagai pengguna, ingin lihat seluruh tahapan perjalanan dalam satu alur waktu (tidak semua info sekaligus di awal).

3. **Boarding Recommendation**
   - Sebagai komuter rutin, ingin tahu gerbong mana yang sebaiknya dinaiki agar saat turun lebih dekat ke pintu keluar/titik transit berikutnya.

4. **Arrival Reminder & Exit Recommendation**
   - Sebagai pengguna, ingin diingatkan kapan harus bersiap turun agar tidak kelewatan.
   - Sebagai wisatawan, ingin direkomendasikan pintu keluar paling sesuai agar tidak salah arah.

5. **Facility Recommendation**
   - Sebagai pengguna aksesibilitas, ingin fasilitas yang direkomendasikan benar-benar bisa dipakai (bukan sekadar terdekat).

6. **Journey Monitoring**
   - Sebagai pengguna, ingin rekomendasi selalu mengikuti kondisi perjalanan terkini.

7. **Community Report**
   - Sebagai kontributor, ingin melaporkan fasilitas rusak/tenant tutup dengan mudah.
   - Sebagai pengguna, ingin tahu kapan data terakhir diperbarui jika status fasilitas belum jelas.

---

## 6. 9 Kapabilitas Inti (Fitur MVP)

| No | Fitur | Deskripsi Singkat |
|---|---|---|
| 1 | **Smart Route Overview** | Tampilkan rute end-to-end + moda + titik perpindahan via peta interaktif MAPID MAPS |
| 2 | **Station Information** | Detail fasilitas, tenant, exit gate tiap stasiun (dari Community Maps MAPID) |
| 3 | **Journey Timeline** | Satu alur waktu yang menggabungkan semua tahap perjalanan & widget aktif |
| 4 | **Boarding Recommendation** | Rekomendasi posisi gerbong berdasarkan Spatial Relationship Analysis |
| 5 | **Arrival Reminder** | Notifikasi otomatis saat pengguna harus bersiap turun (berbasis GTFS Realtime) |
| 6 | **Exit Recommendation** | Rekomendasi pintu keluar terbaik menjelang tiba di tujuan |
| 7 | **Facility Recommendation** | Rekomendasi fasilitas berdasarkan posisi + kondisi (aksesibilitas, status operasional) |
| 8 | **Journey Monitoring** | Layer background yang update rekomendasi jika kondisi berubah (real-time) |
| 9 | **Community Report** | Form pelaporan kondisi lapangan + alur verifikasi sebelum data dipakai sistem |

---

## 7. Sumber Data & Strategi

| Sumber | Jenis Data | Fungsi |
|---|---|---|
| Community Maps MAPID | POI, tenant, fasilitas, bangunan sekitar titik transit | Sumber data spasial utama |
| GTFS (statis) | Rute, halte, jadwal | Dasar Smart Route Overview & Station Information |
| GTFS Realtime | Posisi kendaraan, status layanan | Dasar Journey Monitoring & Arrival Reminder |
| BMKG | Data cuaca | Konteks tambahan perjalanan |
| BIG | Batas administrasi & referensi spasial | Data spasial pendukung |
| BPS | Statistik transportasi | Konteks analisis & validasi tren |
| Community Report | Laporan pengguna terverifikasi | Pembaruan kondisi lapangan (lift rusak, tenant tutup) — lewat verifikasi dulu |

> **Catatan penting:** PanduYuk tidak membangun basis data spasial dari nol pada MVP. Gap data ditutup lewat Community Report dengan alur verifikasi berjenjang.

---

## 8. Spatial Analysis & AI Logic

**PanduYuk menggunakan rule-based spatial analysis (BUKAN machine learning) pada MVP.**  
Alasan: prioritas explainability — setiap output bisa ditelusuri ke aturan dan data sumbernya.

| Metode | Fungsi | Fitur yang Didukung |
|---|---|---|
| Proximity Analysis | Analisis jarak dasar | Facility Recommendation |
| Nearest Facility Analysis | Jarak + kondisi fasilitas (lantai, status) | Facility Rec, Exit Recommendation |
| Spatial Relationship Analysis | Hubungan antarobjek di area stasiun (gerbong vs pintu keluar) | Boarding Rec, Exit Recommendation |
| Network Analysis | Keterhubungan antarmoda & jalur transportasi | Journey Timeline |

### Transit Intelligence Engine — Cara Kerjanya
- **Bukan chatbot, bukan LLM** — perannya sebagai penerjemah data.
- **Input:** data spasial (GEO MAPID) + data operasional (GTFS/GTFS Realtime) + konteks perjalanan pengguna (posisi terkini, tahap perjalanan).
- **Proses:** analisis spasial (4 metode di atas) → pencocokan aturan per fitur.
- **Output:** 
  - **Insight** — informatif, tidak mengarahkan tindakan.
  - **Recommendation** — mengarahkan tindakan spesifik.
  - Disajikan bertahap mengikuti Journey Timeline.
- **Prinsip explainability:** jika data tidak lengkap/belum update, engine **tidak menebak** — menampilkan data terakhir yang tersedia beserta timestamp pembaruan.

---

## 9. Arsitektur Sistem (High-Level)

### Stack Teknologi
| Layer | Teknologi |
|---|---|
| Frontend | Next.js, React, Tailwind CSS, MAPID MAPS |
| Backend | Laravel + Laravel Sanctum |
| Engine | Transit Intelligence Engine (rule-based spatial analysis) |
| Database | PostgreSQL + PostGIS (SRID 4326, indeks GiST) |
| Data Spasial | GEO MAPID (terpisah dari DB aplikasi) |
| Peta Interaktif | MAPID MAPS (basemap + layer visualisasi) |

### Alur Sistem
```
Pengguna (input tujuan)
    ↓
Frontend (Next.js + MAPID MAPS)
    ↓
Backend Laravel (auth Sanctum + manajemen data non-spasial)
    ↓
Transit Intelligence Engine
    ├── GEO MAPID (data spasial POI)
    ├── GTFS / GTFS Realtime (rute, jadwal, posisi)
    ├── BMKG / BIG / BPS (data pendukung)
    └── Community Report (laporan terverifikasi)
    ↓ (rule-based spatial analysis)
Insight & Recommendation
    ↓
Backend → Frontend → MAPID MAPS (visualisasi peta berlapis)
    ↓
Pengguna melihat rekomendasi dalam konteks peta
```

### Komponen Database
- **PostgreSQL + PostGIS** — data non-spasial aplikasi (akun, riwayat, Community Report) + kolom geometry untuk query spasial rute GTFS.
- **GEO MAPID** — platform pengelolaan data spasial komunitas (terpisah dari DB aplikasi).
- **MAPID MAPS** — basemap & layanan visualisasi peta interaktif berlapis.

---

## 10. Information Architecture

```
Beranda / Input Tujuan
    └── Smart Route Overview (rute, moda, titik transit)
            └── Station Information (fasilitas & tenant stasiun)
                    └── Journey Timeline (hub semua tahap)
                            ├── Sebelum Naik → Boarding Recommendation
                            ├── Dalam Perjalanan → Journey Monitoring
                            ├── Menuju Tujuan → Arrival Reminder + Exit Recommendation
                            └── Kebutuhan Fasilitas → Facility Recommendation

Community Report (dapat diakses dari layer manapun)
```

---

## 11. Detailed Requirements per Halaman/Widget

### 11.1 Halaman Smart Route Overview
- Tampilkan rute end-to-end: titik asal → tujuan, semua moda, titik perpindahan.
- Peta interaktif MAPID MAPS dengan jalur transportasi berlapis.
- Data dari GTFS (statis) + GEO MAPID (spasial).

### 11.2 Halaman Station Information
- Detail stasiun/halte yang dilalui: fasilitas (toilet, musala, lift), tenant, exit gate.
- Data POI dari Community Maps MAPID via GEO MAPID.
- Tampilkan status ketersediaan fasilitas + timestamp pembaruan terakhir jika belum real-time.

### 11.3 Dashboard Journey Timeline
- Gabungkan Smart Route Overview + Station Information dalam satu alur waktu.
- Tandai tahap aktif (sebelum berangkat / di kendaraan / berpindah moda / mendekati tujuan).
- Menjadi "kerangka" yang menentukan widget mana yang ditampilkan saat ini.

### 11.4 Widget Boarding Recommendation
- Muncul saat tahap "sebelum naik" atau "di dalam kendaraan".
- Rekomendasikan posisi gerbong berdasarkan Spatial Relationship Analysis (gerbong vs pintu keluar/titik transit berikutnya).
- **Wajib sertakan alasan rekomendasi**, contoh: *"Gerbong 3 dipilih karena paling dekat dengan pintu keluar arah [nama exit]"*.

### 11.5 Widget Arrival Reminder
- Trigger otomatis berdasarkan estimasi waktu tempuh tersisa (dari GTFS Realtime).
- Tampilkan notifikasi/alert kapan pengguna harus bersiap turun.

### 11.6 Widget Exit Recommendation
- Muncul menjelang kedatangan di stasiun tujuan.
- Rekomendasikan pintu keluar berdasarkan Spatial Relationship + Nearest Facility Analysis, disesuaikan tujuan akhir pengguna.

### 11.7 Widget Facility Recommendation
- Tampilkan fasilitas relevan berdasarkan posisi pengguna & kebutuhan (ada filter aksesibilitas).
- Gunakan Proximity Analysis + Nearest Facility Analysis (jarak + kondisi lantai/status ketersediaan).

### 11.8 Layer Journey Monitoring
- Berjalan di background sepanjang perjalanan.
- Update insight/recommendation lain jika kondisi berubah (keterlambatan, laporan komunitas baru).
- Gabungkan GTFS Realtime + Community Report terbaru.

### 11.9 Halaman/Form Community Report
- Form pelaporan: jenis laporan (fasilitas rusak, tenant tutup, dll.), lokasi, deskripsi singkat, foto (opsional).
- Laporan masuk ke antrean verifikasi **sebelum** memengaruhi data yang dilihat pengguna lain.
- Tampilkan status laporan ke pelapor: `diterima` / `dalam verifikasi` / `disetujui`.

---

## 12. Acceptance Criteria (Lengkap)

### Smart Route Overview
- ✅ Jika pengguna input asal & tujuan → sistem tampilkan rute lengkap (moda + titik perpindahan) dalam waktu wajar.
- ✅ Jika data GTFS tidak tersedia → tampilkan pesan "data belum tersedia" (bukan rute kosong tanpa keterangan).

### Boarding Recommendation
- ✅ Jika pengguna di tahap sebelum naik → sistem tampilkan rekomendasi gerbong + alasannya.
- ✅ Jika data posisi gerbong tidak lengkap → tampilkan insight umum (bukan rekomendasi yang menebak).

### Arrival Reminder
- ✅ Jika estimasi waktu tempuh tersisa mencapai ambang batas → kirim reminder bersiap turun.

### Exit Recommendation
- ✅ Jika pengguna mendekati stasiun tujuan → tampilkan pintu keluar yang direkomendasikan + alasan (jarak/arah tujuan).

### Facility Recommendation
- ✅ Jika fasilitas terdekat sedang tidak berfungsi/dalam perbaikan → jangan rekomendasikan, tampilkan alternatif berikutnya.
- ✅ Jika status fasilitas belum diperbarui dalam periode tertentu → sertakan keterangan waktu data terakhir diperbarui.

### Journey Monitoring
- ✅ Jika terjadi perubahan kondisi (keterlambatan, laporan komunitas baru) yang relevan dengan tahap aktif → update insight/recommendation yang ditampilkan.

### Community Report
- ✅ Jika laporan belum terverifikasi → tidak langsung memengaruhi data pengguna lain.
- ✅ Jika laporan sudah terverifikasi → data diperbarui + tampilkan sumber (Community Report) + waktu update.
- ✅ Jika submit laporan tanpa lokasi/deskripsi → tampilkan pesan error yang jelas, jangan teruskan ke antrean verifikasi.

---

## 13. Scope Boundaries

### ✅ Dalam Scope MVP

| Area | Cakupan |
|---|---|
| 9 kapabilitas inti | Smart Route Overview, Station Information, Journey Timeline, Boarding Rec, Arrival Reminder, Exit Rec, Facility Rec, Journey Monitoring, Community Report |
| Wilayah | Jabodetabek: KRL Commuter Line, MRT Jakarta, LRT Jabodebek, TransJakarta |
| Metode analisis | Rule-based spatial: Proximity, Nearest Facility, Spatial Relationship, Network Analysis |
| Data spasial | Community Maps MAPID + GEO MAPID + MAPID MAPS |
| Data operasional | GTFS (statis) + GTFS Realtime |
| Community Report | Pelaporan + verifikasi manual berjenjang |
| Akses | Browser modern, tanpa instalasi |

### ❌ Di Luar Scope MVP (Non-Goals)

| Yang Tidak Dikerjakan | Alasan |
|---|---|
| Machine learning / prediksi (kepadatan, keterlambatan, personalisasi) | Data historis belum cukup; rule-based lebih mudah diverifikasi saat demo MVP |
| Ekspansi ke luar Jabodetabek | Data jadwal operator & data spasial kota lain belum tersedia |
| Fungsi pencarian rute menyeluruh ala Google Maps/Moovit | PanduYuk adalah pelengkap setelah rute dipilih, bukan pesaing di fase pencarian |
| Aplikasi mobile native (iOS/Android) | Web app cukup untuk MVP; native app menambah kompleksitas yang tidak sepadan |
| Chatbot / LLM | Transit Intelligence Engine harus rule-based agar explainable; LLM mengaburkan prinsip ini |

---

## 14. Sprint Roadmap

| Sprint | Minggu | Deliverable |
|---|---|---|
| Sprint 0 | Sebelum minggu 1 | Setup repo, environment (Laravel + React), akses API GTFS, akun GEO MAPID, finalisasi skema DB |
| Sprint 1 | Minggu 1–2 | Integrasi Community Maps MAPID → GEO MAPID, parsing GTFS statis, setup autentikasi Sanctum |
| Sprint 2 | Minggu 3–4 | Beranda/Input Tujuan, Smart Route Overview + Station Information, peta interaktif MAPID MAPS |
| Sprint 3 | Minggu 5–6 | Transit Intelligence Engine (4 metode spatial analysis), Boarding Rec, Exit Rec, Facility Rec |
| Sprint 4 | Minggu 7 | Journey Timeline (hub semua widget), Arrival Reminder, Journey Monitoring |
| Sprint 5 | Minggu 8 | Community Report (form + alur verifikasi + integrasi ke Facility Rec & Monitoring) |
| Sprint 6 | Minggu 9 | End-to-end testing (9 kapabilitas), bug fixing, polish UI/UX, materi demo & pitch |

---

## 15. Pembagian Tanggung Jawab Tim

| Nama | Peran | Tanggung Jawab Utama |
|---|---|---|
| **Ahmad Fadli** | Backend Developer | Laravel API, autentikasi (Sanctum), manajemen data non-spasial, jembatan request ke Transit Intelligence Engine |
| **Muzhaffar Shadiq** | Frontend Developer | UI/UX React + Tailwind, integrasi MAPID MAPS, halaman Smart Route Overview / Station Information / Journey Timeline |
| **Adrian Firmansyah** | Project Lead & GIS/Data Engineer | Koordinasi tim & timeline, integrasi GEO MAPID & Community Maps MAPID, skema PostgreSQL+PostGIS, parsing GTFS/GTFS Realtime |
| **Adibta Ilham W.** | AI/Logic Engineer | Transit Intelligence Engine — 4 metode rule-based spatial analysis, logika Insight & Recommendation |
| **Michaela Azaria S.** | QA & Documentation Lead | Testing terhadap Acceptance Criteria, dokumentasi PRD, materi demo/pitch, alur verifikasi Community Report |

---

## 16. Prinsip Penting yang Harus Selalu Dijaga

> Ini adalah prinsip desain sistem yang **tidak boleh dilanggar** dalam implementasi:

1. **Explainability first** — setiap output rekomendasi harus menyertakan alasan dan sumber data. Sistem tidak boleh menebak.
2. **Jika data tidak lengkap, tampilkan timestamp, jangan kosongkan** — lebih baik tampilkan data lama + keterangan "terakhir diperbarui [waktu]" daripada tidak menampilkan apapun atau menampilkan data yang tidak valid.
3. **Community Report tidak langsung memengaruhi data pengguna lain** — selalu lewat verifikasi berjenjang dulu.
4. **Rule-based, bukan ML** — pada MVP, semua logika engine harus bisa ditelusuri ke aturan tertulis dan data sumbernya.
5. **Journey Timeline sebagai hub** — semua widget/rekomendasi harus mengikuti konteks tahap perjalanan aktif pengguna, bukan ditampilkan semua sekaligus.
6. **Rekomendasi aksesibilitas harus mempertimbangkan kondisi, bukan hanya jarak** — fasilitas terdekat yang rusak/tidak bisa digunakan tidak boleh direkomendasikan.
