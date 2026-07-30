# 🏗 SYSTEM_ARCHITECTURE.md

# MAPID Transit Intelligence

## High-Level System Architecture

---

# 📖 Overview

MAPID dibangun menggunakan arsitektur berbasis WebGIS yang menggabungkan data spasial, data transportasi, dan sistem rekomendasi untuk membantu pengguna selama menggunakan transportasi umum.

Arsitektur ini terdiri dari beberapa komponen utama yang saling terhubung.

- Frontend
- Backend API
- Transit Intelligence Engine
- Spatial Database
- External Data Sources

Seluruh komponen bekerja bersama untuk menghasilkan rekomendasi perjalanan secara real-time.

---

# 🎯 System Goal

Menyediakan sistem yang mampu:

- Menampilkan navigasi transportasi umum
- Menampilkan informasi fasilitas stasiun
- Memberikan rekomendasi perjalanan
- Memberikan notifikasi selama perjalanan
- Mengolah data spasial menjadi insight

---

# 🏗 High-Level Architecture

```

                    User

                      │

                      ▼

              Frontend (Next.js)

                      │

              REST API Request

                      │

                      ▼

            Backend Service (FastAPI)

          ┌────────────┼─────────────┐
          │            │             │
          ▼            ▼             ▼

 Transit Intelligence   Spatial DB   External API
       Engine            (PostGIS)

          │            │             │
          ▼            ▼             ▼

 Recommendation     Station Data   GTFS Realtime
 Engine             Route Data     Weather API
                    Facility Data  Operator API

          └────────────┼─────────────┘
                       │
                       ▼

                 API Response

                       │

                       ▼

                  Frontend UI

                       │

                       ▼

                     User

```

---

# 🖥 Frontend Layer

Frontend merupakan antarmuka utama yang digunakan pengguna.

Teknologi:

- Next.js
- React
- Tailwind CSS
- Mapbox GL JS

Frontend bertugas untuk:

- Menampilkan peta
- Menampilkan rute perjalanan
- Menampilkan Station Profile
- Menampilkan Journey Timeline
- Menampilkan Boarding Recommendation
- Menampilkan Arrival Reminder
- Menampilkan Live Station Status

Frontend tidak melakukan proses AI.

Frontend hanya menampilkan informasi.

---

# ⚙ Backend Layer

Backend berfungsi sebagai pusat komunikasi sistem.

Teknologi:

- FastAPI
- Python

Tugas Backend:

- Mengelola request dari frontend
- Mengakses database
- Menghubungkan external API
- Memanggil Transit Intelligence Engine
- Mengirim hasil rekomendasi ke frontend

---

# 🧠 Transit Intelligence Engine

Merupakan inti dari sistem.

Engine ini bertugas:

- Memahami konteks perjalanan
- Mengolah data spasial
- Menghasilkan rekomendasi
- Menentukan notifikasi

Output yang dihasilkan:

- Boarding Recommendation
- Exit Recommendation
- Facility Recommendation
- Arrival Reminder
- Transfer Recommendation

Transit Intelligence Engine tidak menyimpan data.

Engine hanya memproses data.

---

# 🗺 Spatial Database

Database spasial menyimpan seluruh informasi geografis.

Teknologi:

- PostgreSQL
- PostGIS

Data yang disimpan:

- Station
- Bus Stop
- Route
- POI
- Facility
- Exit
- Lift
- Escalator
- Tenant
- Accessibility

Spatial Database menjadi fondasi seluruh sistem.

---

# 🌐 External Data Sources

Sistem menggunakan beberapa sumber data eksternal.

## GTFS

Digunakan untuk:

- Jalur transportasi
- Nama halte
- Nama stasiun
- Rute perjalanan

---

## GTFS Realtime

Digunakan untuk:

- Posisi kendaraan
- Status perjalanan
- Informasi keterlambatan

---

## Weather API

Digunakan untuk:

- Cuaca
- Hujan
- Temperatur

Data ini dapat digunakan oleh Transit Intelligence untuk memberikan rekomendasi tambahan.

---

## Community Report

Pengguna dapat melaporkan kondisi tertentu.

Misalnya:

- Lift rusak
- Exit ditutup
- Toilet ditutup
- Tenant tutup

Laporan ini akan memperbarui Live Station Status.

---

# 🔄 Data Flow

Seluruh proses dimulai dari pengguna.

```

User

↓

Search Destination

↓

Frontend

↓

Backend API

↓

Spatial Database

↓

Transit Intelligence Engine

↓

Recommendation

↓

Frontend

↓

Display to User

```

---

# 📦 Main Components

## User Interface

Bertanggung jawab terhadap interaksi pengguna.

---

## Backend API

Menghubungkan seluruh komponen sistem.

---

## Transit Intelligence Engine

Menghasilkan rekomendasi perjalanan.

---

## Spatial Database

Menyimpan data spasial.

---

## External Services

Memberikan data tambahan seperti:

- GTFS
- Weather
- Community Report

---

# 📡 API Communication

Frontend berkomunikasi dengan Backend menggunakan REST API.

Contoh Endpoint:

GET /route

GET /station

GET /facility

GET /recommendation

GET /journey

POST /community-report

---

# 🔔 Notification Flow

Saat pengguna berada dalam perjalanan.

```

GPS Update

↓

Journey Status

↓

Transit Intelligence Engine

↓

Arrival Reminder

↓

Frontend

↓

Notification

```

---

# 🔒 Scalability

Arsitektur dirancang agar mudah dikembangkan.

Komponen baru dapat ditambahkan tanpa mengubah sistem utama.

Contoh pengembangan berikutnya:

- AI Chat Assistant
- Crowd Prediction
- Indoor Navigation
- Voice Assistant
- Personalized Recommendation

---

# 🚀 MVP Architecture

Versi Hackathon hanya mengimplementasikan komponen inti.

✅ Frontend

✅ Backend API

✅ Spatial Database

✅ Transit Intelligence Engine

✅ GTFS

✅ Community Report

Fitur lanjutan seperti Crowd Prediction dan Personalized Recommendation menjadi bagian roadmap.

---

# ❤️ Closing

MAPID menggunakan arsitektur modular sehingga setiap komponen memiliki tanggung jawab yang jelas.

Frontend bertugas menampilkan informasi.

Backend mengelola komunikasi data.

Spatial Database menyimpan informasi geografis.

Transit Intelligence Engine menghasilkan rekomendasi.

Melalui arsitektur ini, MAPID mampu memberikan pengalaman transportasi umum yang lebih nyaman, informatif, dan kontekstual tanpa menggantikan sistem navigasi yang sudah ada.