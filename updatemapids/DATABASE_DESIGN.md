# 🗄 DATABASE_DESIGN.md

# MAPID Transit Intelligence

## Spatial Database Design

---

# 📖 Overview

MAPID menggunakan PostgreSQL dengan ekstensi PostGIS sebagai database utama.

Database tidak hanya menyimpan informasi pengguna, tetapi juga menyimpan data spasial yang menjadi fondasi seluruh sistem.

Seluruh rekomendasi yang diberikan oleh Transit Intelligence berasal dari data yang terdapat di dalam database.

---

# 🎯 Database Objective

Database dirancang untuk:

- Menyimpan data spasial
- Menyimpan informasi transportasi
- Menyimpan fasilitas stasiun
- Menyimpan perjalanan pengguna
- Menyimpan laporan komunitas
- Mendukung Recommendation Engine

---

# 🗂 Database Architecture

Database dibagi menjadi empat kelompok utama.

```

Master Data

↓

Operational Data

↓

Recommendation Data

↓

Community Data

```

---

# 1️⃣ Master Data

Master Data merupakan data yang relatif jarang berubah.

## Station

Menyimpan informasi seluruh stasiun.

Contoh atribut

- Station ID
- Station Name
- Operator
- Latitude
- Longitude
- Address

---

## Bus Stop

Menyimpan informasi halte.

Contoh atribut

- Stop ID
- Stop Name
- Latitude
- Longitude
- Corridor

---

## Facility

Menyimpan seluruh fasilitas.

Contoh

- Toilet
- Mushola
- Lift
- Escalator
- ATM
- Nursery Room

Contoh atribut

Facility ID

Facility Name

Category

Station ID

Floor

Coordinate

Operating Hours

Status

---

## Tenant

Contoh

- Indomaret
- Lawson
- Roti O
- Kopi Kenangan

Atribut

Tenant ID

Station ID

Location

Floor

Category

Operating Hours

Current Status

---

## Exit

Menyimpan informasi pintu keluar.

Contoh

Exit ID

Station ID

Exit Name

Nearest Road

Coordinate

---

# 2️⃣ Operational Data

Merupakan data yang berubah sesuai perjalanan pengguna.

## Route

Informasi rute.

- Route ID
- Origin
- Destination
- Operator

---

## Journey

Menyimpan perjalanan pengguna.

Contoh

Journey ID

User ID

Route

Current Stage

Current Station

Destination

Journey Status

---

## Journey Timeline

Menyimpan progress perjalanan.

Contoh

Walking

Boarding

Transit

Arrival

Exit

---

# 3️⃣ Recommendation Data

Digunakan oleh Transit Intelligence.

## Boarding Recommendation

Contoh

Station

Recommended Car

Reason

Nearest Exit

Walking Distance

---

## Exit Recommendation

Contoh

Exit

Reason

Destination

Nearest Facility

---

## Facility Recommendation

Contoh

Facility

Distance

Estimated Walking Time

Current Status

---

# 4️⃣ Community Data

Digunakan untuk memperbarui kondisi fasilitas.

## Community Report

Contoh

Report ID

Station

Facility

Issue

Photo

Created Time

Status

Verification

---

## Live Status

Merupakan hasil agregasi berbagai laporan.

Contoh

Facility

Current Status

Confidence

Last Updated

---

# Spatial Relationship

Setiap Station memiliki:

- Banyak Facility
- Banyak Exit
- Banyak Tenant

Setiap Journey memiliki:

- Satu Route
- Banyak Timeline

Setiap Community Report berkaitan dengan:

- Station
- Facility

---

# Simplified ERD

```

Station

│

├──── Facility

│

├──── Exit

│

├──── Tenant

│

└──── Route

↓

Journey

↓

Journey Timeline

↓

Recommendation

↓

Community Report

↓

Live Status

```

---

# Spatial Database

Setiap objek spasial memiliki informasi geografi.

Contoh

Coordinate

Latitude

Longitude

Geometry (PostGIS)

Floor

---

# Future Database

Versi berikutnya dapat ditambahkan:

- Crowd History

- Delay History

- User Preference

- AI Feedback

- Accessibility Route

- Weather Cache

---

# MVP Database

Versi Hackathon hanya membutuhkan tabel berikut.

✅ Station

✅ Bus Stop

✅ Facility

✅ Tenant

✅ Exit

✅ Route

✅ Journey

✅ Boarding Recommendation

✅ Community Report

Database ini sudah cukup untuk mendukung seluruh fitur MVP.

---

# Closing

Database merupakan fondasi utama MAPID.

Seluruh rekomendasi yang dihasilkan oleh Transit Intelligence berasal dari informasi spasial yang tersimpan di dalam database.

Dengan menggunakan PostgreSQL dan PostGIS, sistem mampu mengelola data geografis secara efisien serta mendukung pengembangan fitur berbasis WebGIS pada tahap berikutnya.