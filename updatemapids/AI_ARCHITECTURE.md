# 🤖 AI_ARCHITECTURE.md

# MAPID Transit Intelligence Engine

## Decision Architecture

---

# 📖 Introduction

Artificial Intelligence pada MAPID tidak dirancang sebagai chatbot ataupun sistem yang menghasilkan informasi baru.

AI pada MAPID berfungsi sebagai **Decision Engine**, yaitu sistem yang membantu pengguna mengambil keputusan terbaik selama menggunakan transportasi umum.

Dengan kata lain,

AI tidak menggantikan navigasi.

AI tidak menggantikan Google Maps.

AI bekerja sebagai lapisan kecerdasan (Intelligence Layer) di atas WebGIS.

---

# 🎯 Objective

Mengubah berbagai data spasial dan data perjalanan menjadi rekomendasi yang relevan sesuai kondisi pengguna.

---

# 🧠 AI Philosophy

AI tidak menciptakan informasi.

AI tidak menebak.

AI tidak berasumsi.

AI hanya melakukan tiga hal.

- Memahami konteks
- Menganalisis data
- Memberikan rekomendasi

---

# AI Is Not Magic

AI yang salah

```

AI tahu halte sedang ramai.

```

Pertanyaan:

"Dari mana AI tahu?"

Tidak ada jawaban.

---

AI yang benar

```

AI memperkirakan tingkat kepadatan
berdasarkan data historis,
laporan komunitas,
dan data operasional.

```

Setiap rekomendasi harus memiliki alasan yang dapat dijelaskan.

---

# AI Workflow

```

Collect Data

↓

Understand Context

↓

Analyze Situation

↓

Generate Recommendation

↓

Notify User

```

AI tidak pernah langsung menghasilkan rekomendasi.

AI selalu melalui proses analisis.

---

# Layer 1

## Data Collection

Pada tahap ini sistem mengumpulkan seluruh informasi yang diperlukan.

Contoh:

- GPS
- Current Time
- Weather
- GTFS Realtime
- Journey Route
- Station Database
- Facility Database
- Community Report

Output:

Raw Data

---

# Layer 2

## Context Detection

AI memahami kondisi pengguna.

Misalnya:

Walking

On Bus

On Train

Transit

Arrived

AI juga memahami:

- jam
- cuaca
- tujuan
- posisi perjalanan

Output:

Current Journey Context

---

# Layer 3

## Journey Understanding

AI memahami posisi pengguna di dalam perjalanan.

Contoh

```

Home

↓

Bus

↓

Transit

↓

Train

↓

Destination

```

Misalnya AI mengetahui

```

User berada
2 stasiun sebelum tujuan.

```

atau

```

User sedang
melakukan transit.

```

---

# Layer 4

## Decision Engine

Ini merupakan inti dari seluruh AI.

Decision Engine menerima:

- Journey Context
- Spatial Data
- Facility Data
- Transit Data

Kemudian memilih rekomendasi terbaik.

Contoh:

Input

```

Destination

+

Current Station

+

Boarding Position

+

Available Exit

+

Facility Database

```

Output

```

Naik Gerbong Tengah.

Turun melalui Exit Timur.

Lift tersedia.

Toilet berada di sebelah kanan.

```

---

# Layer 5

## Recommendation

Recommendation harus selalu memiliki alasan.

Contoh:

```

Recommended Boarding

Middle Car

Reason

Near Escalator

Closer to Exit

Save Walking Distance

```

atau

```

Recommended Exit

East Gate

Reason

Closer to Destination

Near Bus Stop

```

---

# Layer 6

## Notification Engine

AI menentukan kapan pengguna harus diberi notifikasi.

Misalnya:

2 Stasiun Sebelum Tujuan

↓

Arrival Reminder

atau

Transit Time < 3 Minutes

↓

Transfer Alert

atau

Lift Maintenance

↓

Alternative Recommendation

---

# AI Modules

MAPID terdiri dari beberapa modul AI.

---

## Context Engine

Memahami kondisi pengguna.

Input:

- GPS
- Speed
- Route
- Time

Output:

Walking

On Train

Transit

---

## Recommendation Engine

Menghasilkan rekomendasi.

Misalnya:

- Boarding Recommendation
- Exit Recommendation
- Facility Recommendation

---

## Journey Engine

Memahami tahapan perjalanan.

Contoh:

Planning

Boarding

Transit

Arrival

Exit

---

## Notification Engine

Mengirim pengingat.

Contoh:

Alarm

Vibration

Voice Reminder

---

## Community Intelligence

Mengolah laporan pengguna.

Misalnya:

Lift Rusak

Toilet Ditutup

Exit Closed

Semakin banyak laporan yang sama.

Semakin tinggi tingkat kepercayaan data.

---

# AI Input

AI memperoleh informasi dari berbagai sumber.

| Data | Source |
|--------|---------|
| User Position | GPS |
| Current Time | Smartphone |
| Weather | Weather API |
| Transit Information | GTFS Realtime |
| Route | Navigation Engine |
| Station Data | Spatial Database |
| Facility Data | Spatial Database |
| Live Status | Operator |
| Community Report | User Report |

---
    
# AI Output

AI menghasilkan beberapa jenis rekomendasi.

- Boarding Recommendation

- Arrival Reminder

- Exit Recommendation

- Facility Recommendation

- Transfer Recommendation

- Live Alert

---

# AI Decision Flow

```

GPS

+

Journey

+

Station Database

+

Facility Database

+

Transit Data

↓

Context Engine

↓

Decision Engine

↓

Recommendation

↓

Notification

↓

User

```

---

# Explainable AI

Setiap rekomendasi harus memiliki alasan.

Contoh:

```

Recommended Exit

East Gate

Reason

✔ Nearest Bus Stop

✔ Shorter Walking Distance

✔ Near Elevator

```

AI harus mampu menjelaskan mengapa rekomendasi tersebut diberikan.

---

# AI Scope for Hackathon

AI yang akan diimplementasikan.

✅ Journey Context Detection

✅ Boarding Recommendation

✅ Arrival Reminder

✅ Exit Recommendation

✅ Facility Recommendation

✅ Community Intelligence

---

# Future Development

- Personalized Recommendation

- Crowd Prediction

- Delay Prediction

- Safety Recommendation

- Accessibility Recommendation

- Learning User Preference

---

# Closing

MAPID menggunakan AI sebagai Decision Support System.

AI tidak menggantikan navigasi.

AI tidak menghasilkan informasi baru.

AI membantu pengguna mengambil keputusan terbaik berdasarkan data spasial, data transportasi, dan konteks perjalanan secara real-time.