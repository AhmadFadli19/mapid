<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('gtfs_stops', function (Blueprint $table) {
            $table->id();
            $table->string('stop_id')->unique();
            $table->string('stop_code')->nullable();
            $table->string('stop_name');
            $table->text('stop_desc')->nullable();
            $table->decimal('stop_lat', 10, 8);
            $table->decimal('stop_lon', 11, 8);
            $table->string('parent_station')->nullable()->index();
            $table->unsignedTinyInteger('location_type')->nullable();
            $table->unsignedTinyInteger('wheelchair_boarding')->nullable();
            $table->timestamps();
            $table->index(['stop_lat', 'stop_lon']);
        });

        Schema::create('gtfs_routes', function (Blueprint $table) {
            $table->id();
            $table->string('route_id')->unique();
            $table->string('agency_id')->nullable();
            $table->string('route_short_name')->nullable();
            $table->string('route_long_name')->nullable();
            $table->unsignedInteger('route_type')->nullable();
            $table->string('route_color', 7)->nullable();
            $table->string('route_text_color', 7)->nullable();
            $table->timestamps();
        });

        Schema::create('gtfs_trips', function (Blueprint $table) {
            $table->id();
            $table->string('trip_id')->unique();
            $table->string('route_id')->index();
            $table->string('service_id')->nullable()->index();
            $table->string('trip_headsign')->nullable();
            $table->string('trip_short_name')->nullable();
            $table->unsignedTinyInteger('direction_id')->nullable();
            $table->string('shape_id')->nullable();
            $table->timestamps();
            $table->index(['route_id', 'service_id']);
        });

        Schema::create('gtfs_stop_times', function (Blueprint $table) {
            $table->id();
            $table->string('trip_id')->index();
            $table->string('stop_id')->index();
            $table->unsignedInteger('stop_sequence');
            $table->string('arrival_time')->nullable();
            $table->string('departure_time')->nullable();
            $table->string('stop_headsign')->nullable();
            $table->unsignedTinyInteger('pickup_type')->nullable();
            $table->unsignedTinyInteger('drop_off_type')->nullable();
            $table->decimal('shape_dist_traveled', 12, 3)->nullable();
            $table->timestamps();
            $table->unique(['trip_id', 'stop_id', 'stop_sequence'], 'gtfs_stop_times_trip_stop_sequence_unique');
            $table->index(['trip_id', 'stop_sequence']);
        });

        Schema::create('gtfs_transfers', function (Blueprint $table) {
            $table->id();
            $table->string('from_stop_id')->index();
            $table->string('to_stop_id')->index();
            $table->unsignedTinyInteger('transfer_type')->nullable();
            $table->unsignedInteger('min_transfer_time')->nullable();
            $table->timestamps();
            $table->unique(['from_stop_id', 'to_stop_id'], 'gtfs_transfers_from_to_unique');
        });

        Schema::create('gtfs_calendars', function (Blueprint $table) {
            $table->id();
            $table->string('service_id')->unique();
            $table->boolean('monday')->default(false);
            $table->boolean('tuesday')->default(false);
            $table->boolean('wednesday')->default(false);
            $table->boolean('thursday')->default(false);
            $table->boolean('friday')->default(false);
            $table->boolean('saturday')->default(false);
            $table->boolean('sunday')->default(false);
            $table->date('start_date')->nullable();
            $table->date('end_date')->nullable();
            $table->timestamps();
        });

        Schema::create('gtfs_frequencies', function (Blueprint $table) {
            $table->id();
            $table->string('trip_id')->index();
            $table->string('start_time');
            $table->string('end_time');
            $table->unsignedInteger('headway_secs');
            $table->boolean('exact_times')->nullable();
            $table->timestamps();
            $table->unique(['trip_id', 'start_time', 'end_time'], 'gtfs_frequencies_trip_window_unique');
        });

        Schema::create('transit_realtime_snapshots', function (Blueprint $table) {
            $table->id();
            $table->string('record_type')->index();
            $table->string('trip_id')->nullable()->index();
            $table->string('vehicle_id')->nullable()->index();
            $table->string('current_stop_id')->nullable()->index();
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            $table->integer('delay_seconds')->nullable();
            $table->string('service_status')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('fetched_at')->nullable()->index();
            $table->string('source')->nullable();
            $table->timestamps();
        });

        if (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE gtfs_stops ADD COLUMN location geometry(Point, 4326);');
            DB::statement('CREATE INDEX gtfs_stops_location_idx ON gtfs_stops USING GIST(location);');
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('transit_realtime_snapshots');
        Schema::dropIfExists('gtfs_frequencies');
        Schema::dropIfExists('gtfs_calendars');
        Schema::dropIfExists('gtfs_transfers');
        Schema::dropIfExists('gtfs_stop_times');
        Schema::dropIfExists('gtfs_trips');
        Schema::dropIfExists('gtfs_routes');
        Schema::dropIfExists('gtfs_stops');
    }
};
