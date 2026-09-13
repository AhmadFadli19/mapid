<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'sqlite') return;

        DB::statement('PRAGMA foreign_keys = OFF');
        DB::statement('CREATE TABLE journeys_fixed (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NULL,
            origin_station_id INTEGER NOT NULL,
            destination_station_id INTEGER NOT NULL,
            start_time DATETIME NOT NULL,
            estimated_arrival DATETIME NULL,
            status VARCHAR(255) NOT NULL DEFAULT \'ONGOING\',
            gtfs_trip_id VARCHAR(255) NULL,
            current_stage VARCHAR(255) NULL,
            current_stop_id VARCHAR(255) NULL,
            delay_seconds INTEGER NULL,
            last_position_lat DECIMAL(10,8) NULL,
            last_position_lon DECIMAL(11,8) NULL,
            last_synced_at DATETIME NULL,
            reminder_sent_at DATETIME NULL,
            data_source VARCHAR(255) NULL,
            data_quality VARCHAR(255) NULL,
            route_payload TEXT NULL,
            guest_token VARCHAR(255) NULL,
            created_at DATETIME NULL,
            updated_at DATETIME NULL,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
            FOREIGN KEY(origin_station_id) REFERENCES stations(id) ON DELETE CASCADE,
            FOREIGN KEY(destination_station_id) REFERENCES stations(id) ON DELETE CASCADE
        )');
        DB::statement('INSERT INTO journeys_fixed (id,user_id,origin_station_id,destination_station_id,start_time,estimated_arrival,status,gtfs_trip_id,current_stage,current_stop_id,delay_seconds,last_position_lat,last_position_lon,last_synced_at,reminder_sent_at,data_source,data_quality,route_payload,guest_token,created_at,updated_at) SELECT id,user_id,origin_station_id,destination_station_id,start_time,estimated_arrival,status,gtfs_trip_id,current_stage,current_stop_id,delay_seconds,last_position_lat,last_position_lon,last_synced_at,reminder_sent_at,data_source,data_quality,route_payload,guest_token,created_at,updated_at FROM journeys');
        DB::statement('DROP TABLE journeys');
        DB::statement('ALTER TABLE journeys_fixed RENAME TO journeys');
        DB::statement('CREATE INDEX journeys_user_id_index ON journeys(user_id)');
        DB::statement('CREATE INDEX journeys_gtfs_trip_id_index ON journeys(gtfs_trip_id)');
        DB::statement('CREATE INDEX journeys_guest_token_index ON journeys(guest_token)');
        DB::statement('PRAGMA foreign_keys = ON');
    }

    public function down(): void
    {
        // The repair is intentionally not reversed because it restores required relational constraints.
    }
};
