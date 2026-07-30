# 👤 USER_FLOW.md

# MAPID Transit Intelligence

## User Journey

---

# 📖 Overview

MAPID dirancang untuk mendampingi pengguna selama seluruh perjalanan menggunakan transportasi umum.

Berbeda dengan aplikasi navigasi konvensional yang hanya memberikan rute, MAPID memberikan bantuan kontekstual mulai dari tahap perencanaan perjalanan hingga pengguna tiba di tujuan.

---

# 🎯 User Journey

```

Open MAPID

↓

Search Destination

↓

Choose Route

↓

Travel Preparation

↓

Start Journey

↓

Transit Monitoring

↓

Arrival

↓

Finish Journey

```

---

# 🚀 Flow 1

## Open Application

Pengguna membuka aplikasi MAPID.

Halaman utama menampilkan:

- Search Destination
- Current Location
- Nearby Station
- Recent Destination

---

# 🚀 Flow 2

## Search Destination

Pengguna memasukkan tujuan.

Contoh:

```

Universitas Indonesia

```

Sistem kemudian menampilkan beberapa alternatif rute.

Informasi yang ditampilkan:

- Estimasi waktu
- Jumlah transit
- Moda transportasi
- Jarak berjalan kaki

---

# 🚀 Flow 3

## Route Overview

Setelah pengguna memilih rute, MAPID menampilkan gambaran perjalanan secara lengkap.

Contoh:

```

Home

↓

Walk 250 m

↓

Halte Cawang UKI

↓

TransJakarta

↓

Stasiun Cawang

↓

KRL

↓

Stasiun Depok Baru

↓

Walk 180 m

↓

Destination

```

Setiap titik perjalanan dapat dipilih untuk melihat informasi lebih lanjut.

---

# 🚀 Flow 4

## Station Information

Pengguna dapat melihat informasi setiap halte atau stasiun.

Contoh informasi:

### Public Facilities

- Toilet
- Mushola
- Lift
- Escalator
- ATM

### Commercial Facilities

- Indomaret
- Lawson
- Roti O
- Kopi Kenangan

### Accessibility

- Wheelchair Access
- Guiding Block
- Nursery Room

Selain daftar fasilitas, pengguna juga memperoleh informasi lokasi fasilitas.

Contoh:

```

Roti O

Lantai 2

Dekat Exit Timur

```

atau

```

Toilet

Lantai Dasar

Sebelah Lift

```

---

# 🚀 Flow 5

## Boarding Recommendation

Sebelum naik kendaraan, MAPID memberikan rekomendasi posisi terbaik.

Contoh:

```

Recommended Boarding

Middle Car

Reason

Near Exit

Near Escalator

Save Walking Distance

```

Pengguna dapat mengikuti rekomendasi atau memilih posisi lain sesuai kebutuhan.

---

# 🚀 Flow 6

## Journey Monitoring

Saat perjalanan berlangsung, MAPID memantau progres perjalanan.

Status yang dapat ditampilkan:

- Walking
- On Bus
- On Train
- Transit
- Arrived

Pengguna juga dapat melihat sisa perjalanan secara real-time.

Contoh:

```

Current Station

Manggarai

Remaining

2 Stations

```

---

# 🚀 Flow 7

## Arrival Reminder

Sebelum mencapai tujuan, MAPID memberikan pengingat.

Jenis pengingat:

- Alarm
- Vibrasi
- Voice Reminder
- Full-screen Notification

Contoh:

```

Your destination is arriving.

Please prepare to get off at

Depok Baru Station.

```

---

# 🚀 Flow 8

## Exit Recommendation

Setelah turun dari kendaraan, MAPID memberikan rekomendasi pintu keluar terbaik.

Contoh:

```

Recommended Exit

East Gate

Reason

Nearest Bus Stop

Near Elevator

Shortest Walking Distance

```

---

# 🚀 Flow 9

## Facility Finder

Apabila pengguna ingin mencari fasilitas tertentu, MAPID menampilkan informasi lokasi fasilitas.

Contoh:

```

Toilet

Ground Floor

Near Lift

Distance

25 meters

```

atau

```

Indomaret

Second Floor

Near East Exit

Distance

40 meters

```

---

# 🚀 Flow 10

## Journey Complete

Setelah pengguna mencapai tujuan, aplikasi menampilkan ringkasan perjalanan.

Informasi yang ditampilkan:

- Total Travel Time
- Total Walking Distance
- Number of Transit
- Arrival Time

Pengguna juga dapat memberikan laporan apabila menemukan kondisi tertentu di stasiun atau halte.

Contoh laporan:

- Lift Rusak
- Toilet Ditutup
- Tenant Tutup
- Exit Ditutup

Laporan tersebut akan digunakan untuk memperbarui informasi pada perjalanan berikutnya.

---

# 📌 Complete User Flow

```

Open App

↓

Search Destination

↓

Choose Route

↓

View Route Overview

↓

View Station Information

↓

Boarding Recommendation

↓

Start Journey

↓

Journey Monitoring

↓

Arrival Reminder

↓

Exit Recommendation

↓

Facility Finder

↓

Journey Complete

↓

Community Report (Optional)

```

---

# 🎯 MVP User Flow

Pada versi Hackathon, alur utama yang akan diimplementasikan adalah:

✅ Search Destination

✅ Route Overview

✅ Station Information

✅ Boarding Recommendation

✅ Journey Monitoring

✅ Arrival Reminder

✅ Exit Recommendation

✅ Facility Finder

✅ Community Report

---

# ❤️ Closing

MAPID tidak hanya membantu pengguna mencapai tujuan, tetapi juga mendampingi setiap tahapan perjalanan melalui rekomendasi yang relevan, informasi fasilitas yang lengkap, dan pengingat kontekstual sehingga pengalaman menggunakan transportasi umum menjadi lebih nyaman, efisien, dan informatif.