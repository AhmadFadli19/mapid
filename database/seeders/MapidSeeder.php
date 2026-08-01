<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Station;
use App\Models\Facility;
use App\Models\ExitGate;
use App\Models\BoardingRecommendation;
use App\Models\CommunityReport;
use App\Models\StationTenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MapidSeeder extends Seeder
{
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();
        StationTenant::truncate();
        CommunityReport::truncate();
        BoardingRecommendation::truncate();
        ExitGate::truncate();
        Facility::truncate();
        Station::truncate();
        Schema::enableForeignKeyConstraints();

        // 1. Stations
        $stationsData = [
            [
                'id' => 1,
                'code' => 'BHI',
                'name' => 'Stasiun Bundaran HI',
                'operator' => 'MRT Jakarta',
                'line_color' => '#0284c7',
                'latitude' => -6.193125,
                'longitude' => 106.822894,
                'address' => 'Jl. M.H. Thamrin, Menteng, Jakarta Pusat',
            ],
            [
                'id' => 2,
                'code' => 'DKA',
                'name' => 'Stasiun Dukuh Atas BNI',
                'operator' => 'MRT Jakarta',
                'line_color' => '#0284c7',
                'latitude' => -6.200788,
                'longitude' => 106.822765,
                'address' => 'Jl. Jend. Sudirman, Setiabudi, Jakarta Selatan',
            ],
            [
                'id' => 3,
                'code' => 'BLM',
                'name' => 'Stasiun Blok M BCA',
                'operator' => 'MRT Jakarta',
                'line_color' => '#0284c7',
                'latitude' => -6.244365,
                'longitude' => 106.798150,
                'address' => 'Kebayoran Baru, Jakarta Selatan',
            ],
            [
                'id' => 4,
                'code' => 'CWG-LRT',
                'name' => 'Stasiun LRT Cawang',
                'operator' => 'LRT Jabodebek',
                'line_color' => '#e11d48',
                'latitude' => -6.242850,
                'longitude' => 106.862400,
                'address' => 'Cawang, Kramat Jati, Jakarta Timur',
            ],
            [
                'id' => 5,
                'code' => 'MRI',
                'name' => 'Stasiun Manggarai',
                'operator' => 'KAI Commuter',
                'line_color' => '#16a34a',
                'latitude' => -6.209900,
                'longitude' => 106.849900,
                'address' => 'Tebet, Jakarta Selatan (Central Hub)',
            ],
            [
                'id' => 6,
                'code' => 'HRM',
                'name' => 'Halte Harmoni Central',
                'operator' => 'TransJakarta',
                'line_color' => '#ea580c',
                'latitude' => -6.167382,
                'longitude' => 106.820251,
                'address' => 'Gambir, Jakarta Pusat',
            ]
        ];

        foreach ($stationsData as $s) {
            $st = Station::create($s);
            if (DB::getDriverName() === 'pgsql') {
                DB::statement("UPDATE stations SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?", [
                    $s['longitude'], $s['latitude'], $st->id
                ]);
            }
        }

        // 2. Facilities
        Facility::create([
            'station_id' => 1,
            'facility_name' => 'Lift Prioritas Difabel & Lansia',
            'category' => 'Accessibility',
            'floor' => 'Concourse Level',
            'is_available' => true,
            'status_note' => 'Berfungsi Normal',
            'operating_hours' => '05:00 - 23:30',
            'latitude' => -6.193100,
            'longitude' => 106.822850,
        ]);
        Facility::create([
            'station_id' => 1,
            'facility_name' => 'Toilet Ramah Disabilitas & Musholla',
            'category' => 'Public Facilities',
            'floor' => 'Concourse Level',
            'is_available' => true,
            'status_note' => 'Bersih & Buka 24 Jam Operasional Transit',
            'operating_hours' => '05:00 - 23:30',
            'latitude' => -6.193150,
            'longitude' => 106.822900,
        ]);
        Facility::create([
            'station_id' => 5,
            'facility_name' => 'Eskalator Peron 6 & 7 (Bogor Line)',
            'category' => 'Accessibility',
            'floor' => 'Peron Lantai 2',
            'is_available' => true,
            'status_note' => 'Operasional Lancar',
            'operating_hours' => '04:00 - 24:00',
            'latitude' => -6.209910,
            'longitude' => 106.849910,
        ]);

        // 3. Exits
        ExitGate::create([
            'station_id' => 1,
            'gate_name' => 'Exit Gate A (Plaza Indonesia)',
            'target_street' => 'Jl. M.H. Thamrin (Sisi Barat)',
            'is_accessible' => true,
            'nearest_poi' => 'Plaza Indonesia & Grand Indonesia',
            'latitude' => -6.192900,
            'longitude' => 106.822600,
        ]);
        ExitGate::create([
            'station_id' => 1,
            'gate_name' => 'Exit Gate B (Wisma Nusantara)',
            'target_street' => 'Jl. M.H. Thamrin (Sisi Timur)',
            'is_accessible' => true,
            'nearest_poi' => 'Hotel Indonesia Kempinski',
            'latitude' => -6.193300,
            'longitude' => 106.823100,
        ]);
        ExitGate::create([
            'station_id' => 5,
            'gate_name' => 'Pintu Keluar Barat (Pasar Manggarai)',
            'target_street' => 'Jl. Manggarai Utara I',
            'is_accessible' => true,
            'nearest_poi' => 'Pasar Manggarai & Halte TransJakarta',
            'latitude' => -6.209800,
            'longitude' => 106.849700,
        ]);

        // 4. Boarding Recommendations
        BoardingRecommendation::create([
            'station_id' => 1,
            'destination_station_id' => 3,
            'car_number' => 'Gerbong 2 atau 3',
            'reason' => 'Paling cepat dijangkau dari Lift Exit Gate A & Eskalator Utama.',
            'nearest_exit' => 'Exit Gate A',
            'walking_time_seconds' => 90,
        ]);
        BoardingRecommendation::create([
            'station_id' => 5,
            'destination_station_id' => 1,
            'car_number' => 'Gerbong 7 atau 8',
            'reason' => 'Sejajar dengan tangga transit Peron 6 arah Jakarta Kota.',
            'nearest_exit' => 'Peron Transit Atas',
            'walking_time_seconds' => 110,
        ]);

        // 5. Community Reports
        CommunityReport::create([
            'station_id' => 1,
            'report_type' => 'Kebersihan',
            'issue' => 'Lantai Area Tap Gate B Agak Licin',
            'description' => 'Petunjuk arah guiding block bersih, namun lantai basah setelah hujan.',
            'status' => 'Verified',
            'latitude' => -6.193200,
            'longitude' => 106.823000,
        ]);
        CommunityReport::create([
            'station_id' => 5,
            'report_type' => 'Penumpukan',
            'issue' => 'Antrean Panjang di Escalator Peron 6 Jam 17.30',
            'description' => 'Disarankan ambil gerbong 2 untuk akses tangga manual.',
            'status' => 'Verified',
            'latitude' => -6.209900,
            'longitude' => 106.849800,
        ]);

        // 6. MAPID Mission Tenants (MENU_GO, STRUK_GO, PROPERTI_GO)
        StationTenant::create([
            'station_id' => 1,
            'tenant_name' => 'Kopi Kenangan MRT Bundaran HI',
            'mission_type' => 'MENU_GO',
            'category' => 'Coffee & Beverages',
            'price_avg' => 22000,
            'promo_photo' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93',
            'latitude' => -6.193130,
            'longitude' => 106.822910,
            'is_active' => true,
        ]);
        StationTenant::create([
            'station_id' => 1,
            'tenant_name' => 'Indomaret Point Gate B',
            'mission_type' => 'STRUK_GO',
            'category' => 'Convenience Store',
            'price_avg' => 15000,
            'promo_photo' => 'https://images.unsplash.com/photo-1578916171728-46686eac8d58',
            'latitude' => -6.193180,
            'longitude' => 106.822950,
            'is_active' => true,
        ]);
        StationTenant::create([
            'station_id' => 3,
            'tenant_name' => 'Apartemen Mahakam Residence',
            'mission_type' => 'PROPERTI_GO',
            'category' => 'Transit-Oriented Property (TOD)',
            'price_avg' => 750000000,
            'promo_photo' => 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00',
            'latitude' => -6.244400,
            'longitude' => 106.798200,
            'is_active' => true,
        ]);
    }
}
