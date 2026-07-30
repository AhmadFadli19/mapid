# 🚆 MAPID Transit Intelligence
### Beyond Navigation, Towards Intelligent Public Transportation

---

# 📖 Overview

MAPID Transit Intelligence merupakan platform WebGIS yang dirancang untuk meningkatkan pengalaman pengguna transportasi umum melalui pemanfaatan data spasial, rekomendasi cerdas, serta informasi perjalanan yang kontekstual.

Berbeda dengan aplikasi navigasi konvensional yang hanya berfokus pada pencarian rute tercepat, MAPID berfokus pada bagaimana pengguna dapat menjalani perjalanan dengan lebih nyaman, efisien, dan percaya diri.

MAPID mendampingi pengguna mulai dari sebelum keberangkatan hingga tiba di tujuan dengan memberikan rekomendasi berdasarkan kondisi perjalanan yang sedang berlangsung.

---

# 🎯 Vision

Membantu masyarakat menggunakan transportasi umum dengan pengalaman perjalanan yang lebih nyaman, efisien, dan informatif melalui pemanfaatan WebGIS dan Transit Intelligence.

---

# ❗ Background

Saat ini aplikasi navigasi seperti Google Maps mampu membantu pengguna menemukan rute menuju tujuan.

Namun masih terdapat berbagai permasalahan selama proses perjalanan.

Misalnya:

- pengguna tidak mengetahui fasilitas yang tersedia pada stasiun atau halte
- pengguna terlambat turun
- pengguna salah memilih gerbong
- pengguna bingung saat melakukan transit
- pengguna tidak mengetahui pintu keluar terbaik
- pengguna harus berjalan lebih jauh akibat salah memilih posisi naik

Permasalahan tersebut belum sepenuhnya dijawab oleh aplikasi navigasi konvensional.

---

# 💡 Solution

MAPID menghadirkan konsep **Transit Intelligence**.

Transit Intelligence merupakan sistem rekomendasi perjalanan yang memanfaatkan data spasial, kondisi perjalanan, serta informasi transportasi untuk membantu pengguna mengambil keputusan terbaik selama perjalanan.

MAPID bukan menggantikan navigasi.

MAPID menjadi pendamping perjalanan pengguna.

---

# 🧠 Core Concept

Google Maps menjawab pertanyaan:

> Bagaimana cara menuju tujuan?

MAPID menjawab pertanyaan:

> Bagaimana menjalani perjalanan dengan cara yang paling nyaman?

Perbedaan utama tersebut menjadi dasar seluruh fitur MAPID.

---

# 🗺 WebGIS as The Core

Seluruh sistem dibangun di atas data spasial.

Data spasial tersebut meliputi:

- lokasi halte
- lokasi stasiun
- jalur transportasi
- titik transit
- fasilitas umum
- tenant komersial
- pintu keluar
- lift
- eskalator
- mushola
- toilet
- ATM
- area aksesibilitas

Seluruh informasi tersebut menjadi fondasi utama sistem.

AI tidak membuat data.

AI hanya memanfaatkan data yang tersedia.

---

# 🏢 Station Profile

Setiap halte maupun stasiun memiliki halaman informasi yang berisi seluruh Point of Interest (POI).

Contohnya:

## Public Facilities

- Toilet
- Mushola
- Lift
- Escalator
- Nursery Room
- Charging Station

## Commercial Facilities

- Indomaret
- Lawson
- Roti O
- Kopi Kenangan
- ATM

## Accessibility

- Wheelchair Access
- Guiding Block
- Elevator
- Priority Route

Setiap fasilitas memiliki atribut tambahan seperti:

- lokasi
- lantai
- posisi relatif
- jam operasional
- status operasional

---

# 📍 Spatial Database

Seluruh informasi disimpan dalam Spatial Database.

Contoh data yang dimiliki setiap fasilitas:

Facility Name

Category

Coordinate

Floor

Nearest Exit

Nearest Escalator

Nearest Lift

Operating Hours

Status

Last Update

---

# 🔄 Dynamic Information

Selain data statis, MAPID juga menyimpan informasi yang dapat berubah.

Contohnya:

- lift maintenance
- tenant tutup sementara
- toilet ditutup
- exit ditutup
- eskalator rusak

Status tersebut dapat berasal dari:

- operator transportasi
- administrator
- laporan komunitas

---

# 🚉 User Journey

Perjalanan pengguna dibagi menjadi beberapa tahap.

1. Perencanaan perjalanan

Pengguna memilih tujuan.

↓

2. Persiapan keberangkatan

Sistem memberikan rekomendasi perjalanan.

↓

3. Perjalanan menuju halte

↓

4. Naik transportasi

↓

5. Transit

↓

6. Mendekati tujuan

↓

7. Turun

↓

8. Keluar stasiun

↓

9. Menuju destinasi akhir

Pada setiap tahap, sistem memberikan rekomendasi yang berbeda.

---

# 🚀 Core Features

MAPID menyediakan beberapa fitur utama.

- Smart Route Planning
- Station Profile
- Boarding Recommendation
- Arrival Reminder
- Transfer Assistant
- Facility Finder
- Exit Recommendation
- Journey Timeline
- Live Station Status

---

# 🟢 Live Station Status

Selain menampilkan fasilitas, sistem juga menampilkan kondisi terkini.

Contoh:

🟢 Toilet tersedia

🟡 Lift Maintenance

🔴 Exit Barat Ditutup

🟢 Mushola Tersedia

🟢 Roti O Buka

Status ini berasal dari:

- database
- operator
- laporan komunitas

---

# 🧭 Facility Finder

Pengguna dapat mencari fasilitas berdasarkan kebutuhan.

Misalnya:

Cari Toilet

↓

Sistem menampilkan:

- lokasi
- lantai
- pintu keluar terdekat
- estimasi waktu berjalan

---

# 📈 Why Transit Intelligence?

Google Maps membantu pengguna menemukan jalan.

MAPID membantu pengguna menjalani perjalanan.

MAPID tidak berusaha menggantikan navigasi.

Sebaliknya, MAPID meningkatkan pengalaman pengguna selama proses perjalanan berlangsung.

---

# 🏗 High Level System

```
                User

                  │

                  ▼

          Route Planning

                  │

                  ▼

         Spatial Database

      (Station, POI, Facility)

                  │

                  ▼

      Transit Intelligence Engine

                  │

                  ▼

        Recommendation Layer

                  │

                  ▼

            User Interface
```

---

# 📚 Data Sources

Seluruh rekomendasi berasal dari data yang dapat dipertanggungjawabkan.

Contohnya:

- OpenStreetMap
- GTFS
- GTFS Realtime
- MAPID Survey
- Operator Transport Data
- Community Report

---

# 🎯 Scope MVP

Versi Hackathon berfokus pada fitur yang dapat diimplementasikan secara realistis.

- Smart Route Planning
- Station Profile
- Boarding Recommendation
- Arrival Reminder
- Transfer Assistant
- Facility Finder
- Live Station Status

Sedangkan fitur seperti AI Prediction, Crowd Forecasting, Personalized Recommendation, dan Advanced Analytics menjadi bagian dari roadmap pengembangan berikutnya.