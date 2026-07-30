<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Pastikan extension PostGIS diaktifkan jika menggunakan PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS postgis;');
        }

        // 1. Stations Table
        Schema::create('stations', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();
            $table->string('operator'); // MRT, LRT, KCI, TransJakarta
            $table->string('line_color')->default('#007bff');
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('address')->nullable();
            $table->timestamps();
        });

        // 2. Facilities Table
        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->string('name');
            $table->string('category'); // Public, Commercial, Accessibility
            $table->string('floor')->default('Concourse');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('operating_hours')->default('05:00 - 23:00');
            $table->string('status')->default('Available'); // Available, Maintenance, Closed
            $table->timestamps();
        });

        // 3. Exits Table
        Schema::create('exits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->string('name'); // Exit A, Exit B, etc.
            $table->string('nearest_road')->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->timestamps();
        });

        // 4. Boarding Recommendations Table
        Schema::create('boarding_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->string('recommended_car'); // Car 1, Car 3, Front, Middle, Rear
            $table->text('reason'); // "Dekat dengan Lift & Eskalator Exit A"
            $table->string('nearest_exit')->nullable();
            $table->integer('walking_time_seconds')->default(120);
            $table->timestamps();
        });

        // 5. Community Reports Table
        Schema::create('community_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->foreignId('facility_id')->nullable()->constrained('facilities')->onDelete('cascade');
            $table->string('issue');
            $table->text('description')->nullable();
            $table->string('photo_url')->nullable();
            $table->string('status')->default('Pending'); // Pending, Verified, Resolved
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('community_reports');
        Schema::dropIfExists('boarding_recommendations');
        Schema::dropIfExists('exits');
        Schema::dropIfExists('facilities');
        Schema::dropIfExists('stations');
    }
};
