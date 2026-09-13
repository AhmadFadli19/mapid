<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('journeys', function (Blueprint $table) {
            $table->string('gtfs_trip_id')->nullable()->index();
            $table->string('current_stage')->nullable();
            $table->string('current_stop_id')->nullable();
            $table->integer('delay_seconds')->nullable();
            $table->decimal('last_position_lat', 10, 8)->nullable();
            $table->decimal('last_position_lon', 11, 8)->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamp('reminder_sent_at')->nullable();
            $table->string('data_source')->nullable();
            $table->string('data_quality')->nullable();
            $table->longText('route_payload')->nullable();
            $table->string('guest_token')->nullable()->index();
        });

        Schema::table('journey_timelines', function (Blueprint $table) {
            $table->foreignId('station_id')->nullable()->constrained('stations')->nullOnDelete();
            $table->string('gtfs_stop_id')->nullable()->index();
            $table->string('route_id')->nullable()->index();
            $table->string('route_name')->nullable();
            $table->timestamp('arrival_time')->nullable();
            $table->timestamp('departure_time')->nullable();
            $table->string('transfer_at')->nullable();
            $table->decimal('distance_meters', 10, 2)->nullable();
        });

        Schema::table('boarding_recommendations', function (Blueprint $table) {
            $table->string('platform_position')->nullable();
            $table->foreignId('exit_gate_id')->nullable()->constrained('exits')->nullOnDelete();
            $table->decimal('walking_distance_meters', 10, 2)->nullable();
            $table->string('analysis_method')->nullable();
        });

        Schema::table('community_reports', function (Blueprint $table) {
            $table->foreignId('verified_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('verification_notes')->nullable();
        });

        foreach (['stations', 'facilities', 'exits'] as $tableName) {
            if (DB::getDriverName() === 'pgsql' && !Schema::hasColumn($tableName, 'location')) {
                DB::statement("ALTER TABLE {$tableName} ADD COLUMN location geometry(Point, 4326);");
                DB::statement("CREATE INDEX {$tableName}_location_idx ON {$tableName} USING GIST(location);");
            }
        }

        if (DB::getDriverName() === 'pgsql') {
            DB::statement("UPDATE stations SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE location IS NULL");
            DB::statement("UPDATE facilities SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE latitude IS NOT NULL AND longitude IS NOT NULL AND location IS NULL");
            DB::statement("UPDATE exits SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE location IS NULL");
        }

        // Guest route planning is intentionally supported without inventing a user account.
        // SQLite cannot change a NOT NULL column in place, so rebuild only this table when needed.
        if (DB::getDriverName() === 'sqlite') {
            DB::statement('PRAGMA foreign_keys = OFF');
            DB::statement('CREATE TABLE journeys_nullable_user_id AS SELECT * FROM journeys');
            DB::statement('DROP TABLE journeys');
            DB::statement('ALTER TABLE journeys_nullable_user_id RENAME TO journeys');
            DB::statement('CREATE INDEX journeys_user_id_index ON journeys (user_id)');
            DB::statement('CREATE INDEX journeys_guest_token_index ON journeys (guest_token)');
            DB::statement('PRAGMA foreign_keys = ON');
        } elseif (DB::getDriverName() === 'pgsql') {
            DB::statement('ALTER TABLE journeys ALTER COLUMN user_id DROP NOT NULL');
        }
    }

    public function down(): void
    {
        Schema::table('community_reports', function (Blueprint $table) {
            $table->dropForeign(['verified_by']);
            $table->dropColumn(['verified_by', 'verified_at', 'verification_notes']);
        });
        Schema::table('boarding_recommendations', function (Blueprint $table) {
            $table->dropForeign(['exit_gate_id']);
            $table->dropColumn(['platform_position', 'exit_gate_id', 'walking_distance_meters', 'analysis_method']);
        });
        Schema::table('journey_timelines', function (Blueprint $table) {
            $table->dropForeign(['station_id']);
            $table->dropColumn(['station_id', 'gtfs_stop_id', 'route_id', 'route_name', 'arrival_time', 'departure_time', 'transfer_at', 'distance_meters']);
        });
        Schema::table('journeys', function (Blueprint $table) {
            $table->dropColumn(['gtfs_trip_id', 'current_stage', 'current_stop_id', 'delay_seconds', 'last_position_lat', 'last_position_lon', 'last_synced_at', 'reminder_sent_at', 'data_source', 'data_quality', 'route_payload', 'guest_token']);
        });
    }
};
