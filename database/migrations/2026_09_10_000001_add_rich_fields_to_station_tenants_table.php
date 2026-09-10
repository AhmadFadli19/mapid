<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('station_tenants', function (Blueprint $table) {
            $table->text('foto_tempat')->nullable()->after('promo_photo');
            $table->text('foto_menu_1')->nullable()->after('foto_tempat');
            $table->text('foto_menu_2')->nullable()->after('foto_menu_1');
            $table->string('link_menu')->nullable()->after('foto_menu_2');
            $table->string('menu_utama')->nullable()->after('category');
            $table->string('jam_buka', 10)->default('06:00')->after('menu_utama');
            $table->string('jam_tutup', 10)->default('22:00')->after('jam_buka');
            $table->string('mobilitas')->nullable()->after('jam_tutup');
            $table->string('kondisi_tempat')->nullable()->after('mobilitas');
            $table->text('catatan')->nullable()->after('kondisi_tempat');
            $table->timestamp('synced_from_api_at')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('station_tenants', function (Blueprint $table) {
            $table->dropColumn([
                'foto_tempat',
                'foto_menu_1',
                'foto_menu_2',
                'link_menu',
                'menu_utama',
                'jam_buka',
                'jam_tutup',
                'mobilitas',
                'kondisi_tempat',
                'catatan',
                'synced_from_api_at'
            ]);
        });
    }
};
