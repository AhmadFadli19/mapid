# 🎤 PRESENTATION.md

# MAPID Transit Intelligence

## Presentation Flow (5–7 Minutes)

---

# 🎯 Presentation Objective

Meyakinkan juri bahwa MAPID bukan hanya aplikasi navigasi transportasi umum, tetapi sebuah platform berbasis WebGIS yang mampu meningkatkan pengalaman pengguna selama menggunakan transportasi publik melalui rekomendasi berbasis data spasial.

---

# Slide 1 — Opening

## Judul

**MAPID Transit Intelligence**

*"Helping People Travel Smarter, Not Just Faster."*

Perkenalkan tim dan jelaskan secara singkat tujuan proyek.

Durasi:

30 detik

---

# Slide 2 — Problem Statement

Transportasi umum di kota besar terus berkembang, tetapi pengalaman pengguna masih memiliki banyak kendala.

Permasalahan yang sering dialami pengguna:

- Tidak tahu harus naik dari gerbong mana.
- Terlambat turun dari kendaraan.
- Bingung mencari pintu keluar.
- Tidak mengetahui fasilitas yang tersedia.
- Harus berjalan lebih jauh karena salah memilih posisi saat naik.

Saat ini aplikasi navigasi hanya membantu menemukan rute, tetapi belum mendampingi pengguna selama perjalanan.

Durasi:

45 detik

---

# Slide 3 — Our Solution

MAPID Transit Intelligence hadir sebagai pendamping perjalanan berbasis WebGIS.

MAPID tidak menggantikan Google Maps.

MAPID melengkapi pengalaman perjalanan dengan memberikan rekomendasi yang sesuai dengan konteks pengguna.

Fitur utama:

- Smart Route Overview
- Station Information
- Boarding Recommendation
- Arrival Reminder
- Exit Recommendation
- Facility Finder

Durasi:

45 detik

---

# Slide 4 — User Journey

Tunjukkan alur perjalanan pengguna.

```

Home

↓

Walk

↓

Bus Stop

↓

Bus

↓

Transit

↓

Train

↓

Destination

```

Pada setiap tahapan perjalanan, MAPID memberikan informasi yang relevan sesuai konteks.

Durasi:

45 detik

---

# Slide 5 — Demo Features

Tunjukkan implementasi utama.

1. Search Destination

↓

2. Route Overview

↓

3. Station Information

↓

4. Boarding Recommendation

↓

5. Journey Monitoring

↓

6. Arrival Reminder

↓

7. Exit Recommendation

↓

8. Facility Finder

Fokus pada pengalaman pengguna.

Durasi:

1,5 menit

---

# Slide 6 — Transit Intelligence

Jelaskan bahwa AI bukan chatbot.

AI bekerja sebagai Decision Support System.

AI:

- memahami konteks perjalanan
- mengolah data spasial
- menghasilkan rekomendasi

Semua rekomendasi memiliki dasar data yang jelas.

Contoh:

```

Board Middle Car

Reason:

Near Exit

Near Escalator

Shorter Walking Distance

```

Durasi:

1 menit

---

# Slide 7 — System Architecture

Tampilkan arsitektur sistem.

```

Frontend

↓

Backend

↓

Transit Intelligence Engine

↓

Spatial Database

↓

External API

```

Jelaskan tanggung jawab masing-masing komponen secara singkat.

Durasi:

45 detik

---

# Slide 8 — Data Sources

Tunjukkan bahwa seluruh rekomendasi berasal dari data yang valid.

Data yang digunakan:

- GTFS
- GTFS Realtime
- PostgreSQL + PostGIS
- OpenStreetMap
- Weather API
- Community Report

Tekankan bahwa AI tidak menciptakan data baru, melainkan mengolah data yang tersedia menjadi rekomendasi.

Durasi:

30 detik

---

# Slide 9 — Business Value

MAPID membuka peluang kolaborasi dengan berbagai pihak.

Contoh:

- Operator transportasi
- Tenant stasiun
- Pemerintah daerah
- Penyedia layanan publik

Manfaat:

- meningkatkan pengalaman pengguna
- meningkatkan visibilitas tenant
- mendukung pengembangan Smart City

Durasi:

30 detik

---

# Slide 10 — Closing

MAPID tidak hanya membantu pengguna mencapai tujuan.

MAPID membantu pengguna menjalani perjalanan dengan lebih nyaman, efisien, dan informatif.

Tagline:

**"Helping People Travel Smarter, Not Just Faster."**

Terima kasih.

---

# Estimated Presentation Time

| Section | Duration |
|----------|----------|
| Opening | 30 sec |
| Problem | 45 sec |
| Solution | 45 sec |
| User Journey | 45 sec |
| Demo | 90 sec |
| AI | 60 sec |
| Architecture | 45 sec |
| Data Sources | 30 sec |
| Business | 30 sec |
| Closing | 30 sec |

Total:

≈ 6–7 menit

---

# Q&A Preparation

## Mengapa menggunakan AI?

AI digunakan untuk menghasilkan rekomendasi berdasarkan data spasial, konteks perjalanan, dan informasi transportasi, bukan untuk menggantikan sistem navigasi.

---

## Dari mana data berasal?

Data berasal dari:

- GTFS
- GTFS Realtime
- OpenStreetMap
- Database MAPID
- Community Report
- Weather API

---

## Mengapa tidak menggunakan kamera AR?

Pada MVP Hackathon, kami memprioritaskan fitur yang realistis untuk diimplementasikan dan memberikan dampak langsung bagi pengguna.

Konsep AR Navigation tetap menjadi bagian dari roadmap pengembangan berikutnya.

---

## Apa pembeda utama dengan Google Maps?

Google Maps berfokus pada menemukan rute tercepat.

MAPID berfokus pada memberikan pengalaman perjalanan terbaik melalui rekomendasi berbasis konteks, seperti posisi naik terbaik, pengingat sebelum turun, informasi fasilitas, dan rekomendasi pintu keluar.

---

# ❤️ Closing Message

MAPID memanfaatkan kekuatan WebGIS, data spasial, dan Transit Intelligence untuk menciptakan pengalaman transportasi umum yang lebih cerdas.

Kami percaya bahwa perjalanan yang baik bukan hanya tentang sampai di tujuan, tetapi juga tentang bagaimana pengguna menjalani setiap tahap perjalanan dengan nyaman, aman, dan efisien.