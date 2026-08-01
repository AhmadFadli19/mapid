<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 0. Enable PostGIS Extension if PostgreSQL
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('CREATE EXTENSION IF NOT EXISTS postgis;');
        }

        // 1. Stations Table
        Schema::create('stations', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->string('line_color')->default('#007bff');
            $table->string('operator'); // KAI, MRT, LRT, TJ
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->string('address')->nullable();
            $table->timestamps();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE stations ADD COLUMN location GEOMETRY(Point, 4326);');
            DB::statement('CREATE INDEX stations_location_idx ON stations USING GIST(location);');
        }

        // 2. Facilities Table
        Schema::create('facilities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->string('facility_name'); // Lift, Escalator, Toilet, Musholla, Ramp
            $table->string('category')->default('Public Facilities'); // Accessibility, Public, Commercial
            $table->string('floor')->default('Concourse');
            $table->boolean('is_available')->default(true);
            $table->string('status_note')->nullable();
            $table->string('operating_hours')->default('05:00 - 23:00');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
        });

        // 3. Exits Table
        Schema::create('exits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->string('gate_name'); // Gate A, Exit B, etc.
            $table->string('target_street')->nullable();
            $table->boolean('is_accessible')->default(true);
            $table->string('nearest_poi')->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->timestamps();
        });

        // 4. Boarding Recommendations Table
        Schema::create('boarding_recommendations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->foreignId('destination_station_id')->nullable()->constrained('stations')->onDelete('cascade');
            $table->string('car_number'); // Car 2, Car 3, Gerbong 7, etc.
            $table->text('reason'); // "Dekat dengan Lift & Eskalator Exit A"
            $table->string('nearest_exit')->nullable();
            $table->integer('walking_time_seconds')->default(120);
            $table->timestamps();
        });

        // 5. Community Reports Table
        Schema::create('community_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('facility_id')->nullable()->constrained('facilities')->onDelete('cascade');
            $table->string('report_type'); // Kerusakan, Penumpukan, Kebersihan, Aksesibilitas
            $table->string('issue')->nullable();
            $table->text('description')->nullable();
            $table->string('status')->default('Pending'); // Pending, Verified, Resolved
            $table->string('photo_url')->nullable();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->timestamps();
        });

        // 6. Station Tenants Table (MAPID Mission Integration: MENU_GO, STRUK_GO, PROPERTI_GO)
        Schema::create('station_tenants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('station_id')->constrained('stations')->onDelete('cascade');
            $table->string('tenant_name');
            $table->enum('mission_type', ['MENU_GO', 'STRUK_GO', 'PROPERTI_GO'])->default('MENU_GO');
            $table->string('category')->default('F&B');
            $table->decimal('price_avg', 10, 2)->default(25000);
            $table->string('promo_photo')->nullable();
            $table->decimal('latitude', 10, 8);
            $table->decimal('longitude', 11, 8);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // 7. Journeys Table
        Schema::create('journeys', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('origin_station_id')->constrained('stations')->onDelete('cascade');
            $table->foreignId('destination_station_id')->constrained('stations')->onDelete('cascade');
            $table->timestamp('start_time')->useCurrent();
            $table->timestamp('estimated_arrival')->nullable();
            $table->string('status')->default('ONGOING'); // ONGOING, COMPLETED, CANCELLED
            $table->timestamps();
        });

        // 8. Journey Timelines Table
        Schema::create('journey_timelines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('journey_id')->constrained('journeys')->onDelete('cascade');
            $table->integer('step_order');
            $table->string('title');
            $table->text('instruction');
            $table->string('transport_mode')->default('WALK'); // WALK, MRT, LRT, KRL, TJ
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->string('status')->default('PENDING'); // PENDING, ACTIVE, PASSED
            $table->timestamps();
        });
        // 9. Transit Routes Table (GTFS Master LineString)
        Schema::create('transit_routes', function (Blueprint $table) {
            $table->id();
            $table->string('route_id')->unique();
            $table->string('agency_id')->nullable();
            $table->string('route_short_name');
            $table->string('route_long_name');
            $table->integer('route_type')->default(3); // 3 = Bus
            $table->string('route_color', 7)->default('#007bff');
            $table->string('route_text_color', 7)->default('#ffffff');
            $table->longText('coordinates')->nullable(); // JSON fallback array of [lon, lat]
            $table->timestamps();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE transit_routes ADD COLUMN path GEOMETRY(LineString, 4326);');
            DB::statement('CREATE INDEX transit_routes_path_idx ON transit_routes USING GIST(path);');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('transit_routes');
        Schema::dropIfExists('journey_timelines');
        Schema::dropIfExists('journeys');
        Schema::dropIfExists('station_tenants');
        Schema::dropIfExists('community_reports');
        Schema::dropIfExists('boarding_recommendations');
        Schema::dropIfExists('exits');
        Schema::dropIfExists('facilities');
        Schema::dropIfExists('stations');
    }
};
