# 🚆 TRANSIT_INTELLIGENCE.md

# MAPID Transit Intelligence

## Beyond Navigation, Towards Intelligent Public Transportation

---

# 📖 What is Transit Intelligence?

Transit Intelligence adalah konsep utama yang digunakan MAPID untuk membantu pengguna selama menggunakan transportasi umum.

Berbeda dengan aplikasi navigasi konvensional yang hanya memberikan rute tercepat, Transit Intelligence berfokus pada bagaimana pengguna dapat menjalani seluruh perjalanan dengan lebih nyaman, efisien, dan minim kebingungan.

Transit Intelligence memanfaatkan data spasial, data transportasi, dan konteks perjalanan untuk menghasilkan rekomendasi yang relevan pada setiap tahap perjalanan.

Dengan kata lain,

> MAPID bukan hanya menunjukkan jalan menuju tujuan.

> MAPID menjadi pendamping perjalanan pengguna.

---

# 🎯 Vision

Menciptakan pengalaman menggunakan transportasi umum yang lebih nyaman melalui rekomendasi berbasis data spasial.

---

# 🚩 Current Problem

Saat menggunakan transportasi umum, pengguna sering mengalami berbagai kendala seperti:

- Tidak mengetahui fasilitas yang tersedia di stasiun atau halte.
- Bingung menentukan posisi naik kereta.
- Terlambat turun dari kendaraan.
- Salah memilih pintu keluar.
- Tidak mengetahui lokasi tenant atau fasilitas umum.
- Kesulitan melakukan transit.
- Harus berjalan lebih jauh karena memilih gerbong yang kurang tepat.

Sebagian besar aplikasi navigasi saat ini hanya memberikan informasi mengenai rute perjalanan, namun belum mendampingi pengguna selama proses perjalanan berlangsung.

---

# 💡 Our Solution

MAPID menghadirkan sebuah sistem bernama **Transit Intelligence**.

Transit Intelligence merupakan Recommendation System yang bekerja berdasarkan:

- Data spasial
- Data transportasi
- Konteks perjalanan
- Kondisi lingkungan
- Informasi fasilitas

Seluruh informasi tersebut diproses menjadi rekomendasi yang membantu pengguna mengambil keputusan selama perjalanan.

---

# 🧭 Core Philosophy

Google Maps membantu pengguna menemukan jalan.

MAPID membantu pengguna menjalani perjalanan.

Google Maps menjawab:

> "Bagaimana saya sampai ke tujuan?"

MAPID menjawab:

> "Bagaimana saya sampai ke tujuan dengan pengalaman terbaik?"

---

# 🗺 WebGIS as the Foundation

WebGIS merupakan fondasi utama sistem.

Seluruh rekomendasi yang diberikan MAPID berasal dari data spasial.

Contoh data spasial yang digunakan:

- Halte
- Stasiun
- Jalur transportasi
- Titik transit
- Exit
- Lift
- Escalator
- Toilet
- Mushola
- ATM
- Tenant
- Area aksesibilitas

Transit Intelligence tidak membuat data.

Transit Intelligence memanfaatkan data tersebut untuk menghasilkan rekomendasi.

---

# 🏢 Station Profile

Setiap halte maupun stasiun memiliki halaman informasi yang lengkap.

Halaman ini menampilkan seluruh fasilitas yang tersedia.

## Public Facilities

- Toilet
- Mushola
- Lift
- Escalator
- Charging Station
- Nursery Room

## Commercial Facilities

- Indomaret
- Lawson
- Roti O
- Kopi Kenangan
- ATM

## Accessibility

- Wheelchair Access
- Guiding Block
- Priority Route
- Elevator

Setiap fasilitas memiliki informasi tambahan seperti:

- Lokasi
- Lantai
- Posisi relatif
- Jam operasional
- Status operasional

Contoh:

Roti O

Location:
Floor 2

Nearby:
West Toilet

Operating Hours:
06.00 - 21.00

Status:
Open

---

# 📍 Facility Finder

Pengguna dapat mencari fasilitas tertentu.

Misalnya:

Cari Toilet

↓

MAPID menampilkan:

- Lokasi toilet
- Lantai
- Estimasi berjalan
- Exit terdekat
- Lift terdekat

Tujuannya bukan hanya menunjukkan lokasi, tetapi memberikan informasi yang membantu pengguna mengambil keputusan.

---

# 📊 Live Station Status

Selain menampilkan lokasi fasilitas, MAPID juga menampilkan status operasional setiap fasilitas.

Contoh:

🟢 Toilet Available

🟢 Mushola Available

🟡 Lift Maintenance

🔴 Exit Barat Closed

🟢 Roti O Open

Status tersebut berasal dari:

- Operator
- Administrator
- Community Report

---

# 🚉 Journey-Based Assistance

Transit Intelligence bekerja mengikuti tahapan perjalanan pengguna.

## Stage 1

Journey Planning

Pengguna memilih tujuan.

MAPID menampilkan:

- Rute
- Transit
- Estimasi perjalanan
- Boarding Recommendation

---

## Stage 2

Walking

Pengguna berjalan menuju halte atau stasiun.

MAPID memberikan:

- Informasi halte
- Informasi fasilitas
- Informasi akses masuk

---

## Stage 3

Boarding

Sebelum naik kendaraan.

MAPID memberikan:

- Gerbong terbaik
- Posisi naik
- Alasan rekomendasi

Contoh:

Recommended Boarding

Middle Car

Reason:

- Near Exit
- Near Escalator
- Save Walking Time

---

## Stage 4

On Transit

Saat pengguna berada di dalam kendaraan.

MAPID membantu pengguna memantau perjalanan.

Misalnya:

Remaining:

3 Stations

Estimated Arrival:

10 Minutes

---

## Stage 5

Arrival Reminder

Sebelum tiba.

MAPID memberikan:

- Alarm
- Vibrasi
- Voice Reminder
- Full Screen Notification

Tujuannya agar pengguna tidak terlambat turun.

---

## Stage 6

Transfer

Jika pengguna harus berpindah moda transportasi.

MAPID memberikan:

- Jalur transit
- Platform tujuan
- Exit yang digunakan
- Estimasi waktu transit

---

## Stage 7

Exit Recommendation

Setelah pengguna turun.

MAPID merekomendasikan:

- Exit terbaik
- Lift terdekat
- Toilet terdekat
- Halte lanjutan
- Tenant terdekat

Contoh:

Recommended Exit

East Gate

Reason

Closer to destination

Near Bus Stop

Near Escalator

---

# 📚 Spatial Database

Seluruh sistem dibangun di atas Spatial Database.

Setiap Point of Interest (POI) memiliki atribut seperti:

Facility Name

Category

Coordinate

Floor

Nearest Exit

Nearest Lift

Nearest Escalator

Operating Hours

Current Status

Last Updated

Database inilah yang menjadi fondasi seluruh rekomendasi.

---

# 🔄 Static & Dynamic Data

## Static Data

Merupakan data yang jarang berubah.

Contoh:

- Toilet
- Lift
- Escalator
- Exit
- Mushola
- Jalur transportasi

---

## Dynamic Data

Merupakan data yang dapat berubah sewaktu-waktu.

Contoh:

- Lift Maintenance
- Exit Closed
- Toilet Cleaning
- Tenant Closed
- Temporary Restriction

Informasi ini diperbarui melalui:

- Operator
- Administrator
- Community Report

---

# 🌍 Trusted Data Sources

MAPID menggunakan data yang dapat dipertanggungjawabkan.

Contohnya:

- GTFS
- GTFS Realtime
- OpenStreetMap
- MAPID Survey
- Public Transportation Operators
- Community Report

---

# 🏗 High Level Architecture

```
User

↓

Route Planning

↓

Spatial Database

↓

Transit Intelligence

↓

Recommendation Engine

↓

User Recommendation
```

Transit Intelligence tidak menggantikan sistem navigasi.

Transit Intelligence menjadi lapisan rekomendasi yang bekerja di atas data spasial.

---

# 🚀 Scope Hackathon

Fitur yang menjadi fokus implementasi:

- Smart Route Planning
- Station Profile
- Facility Finder
- Boarding Recommendation
- Arrival Reminder
- Transfer Assistant
- Exit Recommendation
- Journey Timeline
- Live Station Status

---

# 🌱 Future Roadmap

Pengembangan selanjutnya dapat mencakup:

- Crowd Prediction
- Delay Prediction
- Accessibility Routing
- Safety Recommendation
- Personalized Recommendation
- Indoor Navigation
- Voice Assistant

---

# ❤️ Closing Statement

Transit Intelligence bukan bertujuan menggantikan aplikasi navigasi yang sudah ada.

Transit Intelligence hadir untuk melengkapi pengalaman pengguna selama menggunakan transportasi umum melalui rekomendasi yang dihasilkan dari data spasial yang akurat dan dapat dipertanggungjawabkan.

Dengan memanfaatkan WebGIS sebagai fondasi utama, MAPID membantu pengguna menjalani perjalanan yang lebih nyaman, lebih efisien, dan lebih percaya diri.