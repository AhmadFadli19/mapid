#!/bin/bash

# ==============================================================================
# PanduYuk Transit Intelligence & WebGIS - Production Deployment Script
# Optimized for Hostinger, cPanel, & VPS
# Run via SSH: bash deploy.sh
# ==============================================================================

set -e

echo "🚀 [1/6] Memeriksa konfigurasi .env..."

# 1. Pastikan file .env ada
if [ ! -f ".env" ]; then
    echo "⚠️ File .env belum ada. Membuat dari .env.example..."
    cp .env.example .env
    php artisan key:generate --force
    echo "❗ Buka dan edit file .env sekarang dengan data MySQL Hostinger Anda: nano .env"
    exit 1
fi

# Jika DB_USERNAME masih 'root' tanpa password, ingatkan user
if grep -q "DB_USERNAME=root" .env; then
    echo "⚠️ PERINGATAN: File .env masih menggunakan DB_USERNAME=root!"
    echo "Hostinger memerlukan database & user yang dibuat di hPanel (Database Management)."
    echo "Silakan edit .env dengan: nano .env"
fi

# 2. Bersihkan cache config lama agar membaca nilai .env terbaru
echo "🧹 [2/6] Membersihkan config cache lama..."
php artisan config:clear || true
php artisan cache:clear || true

# 3. Install dependensi Composer untuk Production
echo "📦 [3/6] Menginstall dependensi Composer (Production)..."
composer install --no-dev --optimize-autoloader --no-interaction

# 4. Setting hak akses direktori storage dan cache
echo "🔒 [4/6] Mengatur izin folder storage & bootstrap/cache..."
chmod -R 775 storage bootstrap/cache || true

# 5. Hubungkan symbolic link storage (menggunakan 'ln -s' agar tidak error disable_functions exec() di Hostinger)
echo "🔗 [5/6] Memperbarui storage link..."
if [ ! -e "public/storage" ]; then
    ln -sfn "$(pwd)/storage/app/public" "public/storage" 2>/dev/null || php artisan storage:link || true
fi

# 6. Jalankan Database Migrations & Seeding
echo "🗄️ [6/6] Menjalankan migrasi database..."
php artisan migrate --force

echo "🚆 Memastikan seluruh stasiun MRT, KRL, LRT, & TJ tersinkronisasi..."
php artisan tinker --execute="app(App\Services\ComprehensiveTransitNetworkService::class)->seedCoreNetwork();" || true

# 7. Optimasi Cache Laravel untuk Kecepatan Maksimal
echo "⚡ Mengoptimasi konfigurasi, route, dan view cache..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ ==========================================================="
echo "🎉 DEPLOYMENT SELESAI! PanduYuk siap diakses di Hostinger."
echo "=============================================================="
