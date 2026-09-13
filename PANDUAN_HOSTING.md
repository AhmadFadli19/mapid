# Panduan Lengkap Deploy & Hosting Laravel 11 + React WebGIS (PanduYuk)

Dokumen ini berisi panduan langkah demi langkah agar aplikasi **PanduYuk** dapat di-hosting dengan lancar di berbagai jenis hosting:
- **Shared Hosting (cPanel / DirectAdmin / CyberPanel)** seperti Niagahoster, DomaiNesia, Rumahweb, Hostinger, IDCloudHost, dll.
- **VPS (Ubuntu / Debian / Nginx / Apache)**.

---

## 1. Berkas Konfigurasi Hosting yang Sudah Dibuat

Berikut adalah berkas-berkas yang telah dipasang dan dikonfigurasi:

| Berkas | Lokasi | Fungsi & Keunggulan |
|---|---|---|
| **Root `.htaccess`** | `/.htaccess` | Mengarahkan semua trafik ke folder `/public` secara otomatis, melindungi file sensitif (`.env`, `.git`, `composer.json`, `artisan`, dll.) dan folder inti (`app`, `storage/logs`) dari akses langsung via web browser. |
| **Public `.htaccess`** | `/public/.htaccess` | Menangani routing Laravel & SPA frontend, mengaktifkan `CGIPassAuth On` agar Authorization Bearer Token Sanctum tidak hilang di FastCGI, mengaktifkan **Gzip Deflate Compression** (mempercepat loading MapLibre/Leaflet & GeoJSON), dan **Browser Caching**. |
| **PHP User Config** | `/.user.ini` & `/public/.user.ini` | Mengatur `memory_limit = 256M`, `upload_max_filesize = 64M`, `post_max_size = 64M`, `max_execution_time = 300` detik, dan timezone `Asia/Jakarta`. |
| **PHP Ini Fallback** | `/php.ini` | Fallback untuk web server yang membaca `php.ini` di root direktori. |
| **Production Env Template** | `/.env.production.example` | Template file environment siap pakai untuk production dengan pengaturan keamanan & koneksi database MySQL. |
| **Force HTTPS** | `app/Providers/AppServiceProvider.php` | Otomatis mengarahkan semua asset dan URL ke `https://` di mode production agar terhindar dari error *Mixed Content*. |
| **Web Maintenance Tool** | `/system/maintenance` di `routes/web.php` | Solusi bagi shared hosting yang tidak memiliki akses SSH / Terminal untuk menjalankan `storage:link`, `optimize`, dan `migrate` dengan aman menggunakan secret key. |

---

## 2. Persiapan Sebelum Upload ke Hosting

### A. Build Frontend React
Sebelum mengunggah proyek, pastikan asset frontend React sudah ter-compile ke dalam folder `public/`:
```bash
cd frontend
npm install
npm run build
cd ..
```
Hasil build akan otomatis masuk ke folder `public/index.html` dan `public/assets/`.

### B. Kompresi Berkas ke Format ZIP
Kompres seluruh folder proyek ke dalam format `.zip` (misal: `panduyuk.zip`).
> [!TIP]
> **PENTING**: Anda **TIDAK PERLU** mengikutsertakan folder `node_modules` di dalam ZIP karena frontend sudah di-build. Folder `vendor` bisa diikutsertakan jika di hosting Anda tidak tersedia Composer CLI.

---

## 3. Pilihan Cara Deploy di Shared Hosting (cPanel)

Terdapat 2 metode populer untuk cPanel:

### Metode A: Praktis (Upload Langsung ke `public_html`)
*Cocok jika Anda ingin proses upload yang cepat tanpa memisahkan folder.*

1. Buka **cPanel** > **File Manager** > buka folder `public_html`.
2. Upload file `panduyuk.zip` ke dalam `public_html`.
3. Klik kanan file ZIP tersebut, lalu pilih **Extract**.
4. Pastikan file `.htaccess` di root `public_html` sudah ada (aktifkan *Show Hidden Files* di File Manager jika tidak terlihat).
5. File `.htaccess` root yang kami sediakan akan otomatis meneruskan semua request ke folder `public/` dengan aman tanpa mengekspos `.env` atau folder backend Anda.

---

### Metode B: Rekomendasi Keamanan Tertinggi (Metode 2 Folder)
*Standar keamanan industri untuk Laravel di shared hosting.*

1. Buka **File Manager**, tetap di root akun Anda (satu level di atas `public_html`).
2. Buat folder baru, misal bernama `panduyuk_core`.
3. Upload dan extract seluruh file proyek Laravel ke dalam folder `panduyuk_core`.
4. Buka folder `panduyuk_core/public/`, pilih **Select All**, lalu pindahkan (**Move**) seluruh isinya ke dalam folder `public_html`.
5. Edit file `public_html/index.php`, ubah baris penunjuk vendor dan bootstrap menjadi:
   ```php
   // Baris 14:
   require __DIR__.'/../panduyuk_core/vendor/autoload.php';

   // Baris 19:
   $app = require_once __DIR__.'/../panduyuk_core/bootstrap/app.php';
   ```
6. Selesai! Dengan metode ini, seluruh kode program berada di luar jangkauan web (`public_html`).

---

### Metode C: Subdomain / Addon Domain
Jika Anda menggunakan subdomain (misal: `gis.domainanda.com`):
1. Buat Subdomain di cPanel menu **Domains** atau **Subdomains**.
2. Pada kolom **Document Root**, tentukan langsung ke folder `public`:
   ```
   public_html/panduyuk/public
   ```
3. Trafik akan langsung diarahkan ke `public` tanpa perlu modifikasi apa pun.

---

## 4. Konfigurasi Database di Hosting

1. Di cPanel, buka **MySQL Database Wizard**:
   - Buat nama database (misal: `usercpanel_panduyuk`).
   - Buat user database & password yang kuat (misal: `usercpanel_dbuser`).
   - Centang **ALL PRIVILEGES** saat menghubungkan user ke database.
2. Di File Manager, rename `.env.production.example` menjadi `.env` (atau buat file `.env` baru).
3. Buka dan edit file `.env`:
   ```env
   APP_NAME="PanduYuk"
   APP_ENV=production
   APP_KEY=base64:SALIN_KEY_DARI_LOCAL_ANDA
   APP_DEBUG=false
   APP_URL=https://domainanda.com

   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=usercpanel_panduyuk
   DB_USERNAME=usercpanel_dbuser
   DB_PASSWORD="PasswordKuatAnda"

   ARTISAN_MAINTENANCE_KEY=kunci_rahasia_bebas_anda_12345
   ```
   > [!NOTE]
   > Ganti `ARTISAN_MAINTENANCE_KEY` dengan teks rahasia Anda sendiri untuk mengamankan tool maintenance via browser.

---

## 5. Menjalankan Migrasi & Menghubungkan Storage (`storage:link`)

Jika hosting Anda memiliki akses **Terminal / SSH**:
```bash
php artisan migrate --force
php artisan storage:link
php artisan optimize
```

### Jika Hosting TIDAK Memiliki Terminal / SSH:
Gunakan Web Maintenance Tool yang sudah kami pasang di aplikasi. Buka URL berikut di browser Anda:

1. **Jalankan Migrasi Database:**
   ```
   https://domainanda.com/system/maintenance?action=migrate&key=kunci_rahasia_bebas_anda_12345
   ```
2. **Buat Symlink Storage (storage:link):**
   ```
   https://domainanda.com/system/maintenance?action=storage-link&key=kunci_rahasia_bebas_anda_12345
   ```
3. **Bersihkan & Re-cache Konfigurasi:**
   ```
   https://domainanda.com/system/maintenance?action=optimize&key=kunci_rahasia_bebas_anda_12345
   ```

---

## 6. Setting Cron Job untuk Realtime Transit Sync & Scheduler

Proyek ini memiliki task berkala di `routes/console.php`:
`transit:sync-realtime` (sinkronisasi data realtime GTFS).

Untuk mengaktifkannya di cPanel:
1. Buka menu **Cron Jobs** di cPanel.
2. Pada pilihan waktu, pilih **Once Per Minute** (`* * * * *`).
3. Masukkan perintah berikut pada kolom Command:
   ```bash
   /usr/local/bin/php /home/USERNAME_CPANEL/public_html/artisan schedule:run >> /dev/null 2>&1
   ```
   *(Sesuaikan path `/home/USERNAME_CPANEL/...` dan binary PHP di server hosting Anda)*.
4. Klik **Add New Cron Job**.

---

## 7. Troubleshooting Masalah Umum di Hosting

| Gejala Masalah | Penyebab | Solusi |
|---|---|---|
| **HTTP 500 Internal Server Error** | Folder `storage` dan `bootstrap/cache` tidak writable. | Ubah permission folder `storage` dan `bootstrap/cache` menjadi `775` (atau `777` jika diperlukan) via File Manager cPanel. |
| **API Token 401 "Unauthenticated"** | Apache FastCGI membuang header `Authorization: Bearer`. | Berkas `.htaccess` yang kami sediakan sudah dilengkapi `CGIPassAuth On` dan `SetEnvIfNoCase ^Authorization$`, sehingga masalah ini sudah otomatis teratasi. |
| **Tampilan CSS/JS Rusak atau 404** | Path asset tidak sesuai atau belum di-build. | Pastikan sudah menjalankan `npm run build` di folder `frontend` sebelum upload, dan pastikan `APP_URL` di `.env` sudah menggunakan `https://domainanda.com`. |
| **Mixed Content Warning (Gembok SSL Hilang)** | Gambar / API dipanggil dengan `http://` bukan `https://`. | Berkas `app/Providers/AppServiceProvider.php` yang kami perbarui sudah memaksakan HTTPS pada mode production. |
| **Database SQLite Read-Only / Cannot Open** | Permission database file di Linux hosting. | Jika menggunakan SQLite, pastikan file `database/database.sqlite` sudah dibuat dan folder `database/` memiliki permission `775`. Sangat disarankan beralih ke MySQL di hosting shared. |
