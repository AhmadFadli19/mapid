#!/bin/bash

# ==============================================================================
# PanduYuk Transit Intelligence & WebGIS - Production Deployment Script
# Run via SSH: bash deploy.sh
# ==============================================================================

set -e

echo "🚀 [1/7] Memulai deployment PanduYuk di Server..."

# 1. Pastikan file .env ada
if [ ! -f ".env" ]; then
    echo "⚠️ File .env tidak ditemukan! Membuat dari .env.example..."
    cp .env.example .env
    php artisan key:generate --force
    echo "❗ PENTING: Edit file .env sekarang dengan database production dan API keys Anda!"
fi

# 2. Install / Update dependensi Composer untuk Production
echo "📦 [2/7] Menginstall dependensi Composer (Production)..."
composer install --no-dev --optimize-autoloader --no-interaction

# 3. Setting hak akses direktori storage dan cache
echo "🔒 [3/7] Mengatur izin folder storage & bootstrap/cache..."
chmod -R 775 storage bootstrap/cache || true

# 4. Hubungkan symbolic link storage
echo "🔗 [4/7] Memperbarui storage link..."
php artisan storage:link || true

# 5. Jalankan Database Migrations
echo "🗄️ [5/7] Menjalankan migrasi database..."
php artisan migrate --force

# 6. Seed Jaringan Transit Lengkap & Halte
echo "🚆 [6/7] Memastikan seluruh stasiun MRT, KRL, LRT, & TJ tersinkronisasi..."
php artisan tinker --execute="app(App\Services\ComprehensiveTransitNetworkService::class)->seedCoreNetwork();" || true

# 7. Bersihkan & Optimasi Cache Laravel untuk Kecepatan Maksimal
echo "⚡ [7/7] Mengoptimasi konfigurasi, route, dan view cache..."
php artisan config:clear
php artisan route:clear
php artisan view:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "✅ ==========================================================="
echo "🎉 DEPLOYMENT SELESAI! PanduYuk siap diakses dengan performa maksimal."
echo "=============================================================="
