<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Station;
use App\Models\Facility;
use App\Models\ExitGate;
use App\Models\BoardingRecommendation;
use App\Models\CommunityReport;
use App\Models\StationTenant;
use App\Models\TransitRoute;
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

        // 0. Sync MAPID GeoServer API Halte & Stasiun Data (api.md)
        $ingestService = new \App\Services\MapidGeoServerIngestionService();
        $ingestResult = $ingestService->syncGeoServerData();
        \Illuminate\Support\Facades\Log::info("GeoServer Ingest Result: ", $ingestResult);




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
                'operator' => 'KRL Commuter Line',
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
            $dataWithoutId = $s;
            unset($dataWithoutId['id']);
            $st = Station::updateOrCreate(['code' => $s['code']], $dataWithoutId);
            if (DB::getDriverName() === 'pgsql') {
                DB::statement("UPDATE stations SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?", [
                    $s['longitude'], $s['latitude'], $st->id
                ]);
            }
        }


        // 2. Rail Transit Routes (MRT, LRT, KRL, KAI)
        $railRoutes = [
            [
                'route_id' => 'MRT_NORTH_SOUTH',
                'agency_id' => 'MRT',
                'route_short_name' => 'MRT North-South',
                'route_long_name' => 'MRT Jakarta Line (Bundaran HI - Lebak Bulus)',
                'route_type' => 1,
                'route_color' => '#0284c7',
                'route_text_color' => '#ffffff',
                'coordinates' => [
                    [106.822894, -6.193125],
                    [106.822765, -6.200788],
                    [106.821000, -6.208500],
                    [106.811500, -6.225000],
                    [106.798150, -6.244365],
                    [106.774000, -6.289000]
                ]
            ],
            [
                'route_id' => 'LRT_JABODEBEK',
                'agency_id' => 'LRT',
                'route_short_name' => 'LRT Jabodebek',
                'route_long_name' => 'LRT Jabodebek Line (Dukuh Atas - Cawang - Harjamukti)',
                'route_type' => 0,
                'route_color' => '#e11d48',
                'route_text_color' => '#ffffff',
                'coordinates' => [
                    [106.822765, -6.200788],
                    [106.835000, -6.220000],
                    [106.862400, -6.242850],
                    [106.890000, -6.370000]
                ]
            ],
            [
                'route_id' => 'KRL_COMMUTER_LINE',
                'agency_id' => 'KAI',
                'route_short_name' => 'KRL Bogor Line',
                'route_long_name' => 'KRL Commuter Line (Jakarta Kota - Manggarai - Bogor)',
                'route_type' => 2,
                'route_color' => '#16a34a',
                'route_text_color' => '#ffffff',
                'coordinates' => [
                    [106.814000, -6.137000],
                    [106.830000, -6.175000],
                    [106.849900, -6.209900],
                    [106.862400, -6.242850],
                    [106.800000, -6.590000]
                ]
            ],
            [
                'route_id' => 'KAI_ANTARKOTA',
                'agency_id' => 'KAI',
                'route_short_name' => 'KAI Antarkota',
                'route_long_name' => 'KAI Kereta Antarkota (Gambir - Pasar Senen - Jatinegara)',
                'route_type' => 2,
                'route_color' => '#d97706',
                'route_text_color' => '#ffffff',
                'coordinates' => [
                    [106.830000, -6.177000],
                    [106.845000, -6.185000],
                    [106.849900, -6.209900],
                    [106.868000, -6.215000]
                ]
            ]
        ];

        foreach ($railRoutes as $rr) {
            TransitRoute::updateOrCreate(
                ['route_id' => $rr['route_id']],
                $rr
            );
        }

        // 3. Facilities
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
            'facility_name' => 'Toilet Umum & Musholla',
            'category' => 'Public Facilities',
            'floor' => 'Concourse Level',
            'is_available' => true,
            'status_note' => 'Bersih & Buka 24 Jam Operasional Transit',
            'operating_hours' => '05:00 - 23:30',
            'latitude' => -6.193150,
            'longitude' => 106.822900,
        ]);

        // 4. Exits
        ExitGate::create([
            'station_id' => 1,
            'gate_name' => 'Exit Gate A (Plaza Indonesia)',
            'target_street' => 'Jl. M.H. Thamrin (Sisi Barat)',
            'is_accessible' => true,
            'nearest_poi' => 'Plaza Indonesia & Grand Indonesia',
            'latitude' => -6.192900,
            'longitude' => 106.822600,
        ]);

        // 5. Boarding Recommendations
        BoardingRecommendation::create([
            'station_id' => 1,
            'destination_station_id' => 3,
            'car_number' => 'Gerbong 2 atau 3',
            'reason' => 'Paling cepat dijangkau dari Lift Exit Gate A & Eskalator Utama.',
            'nearest_exit' => 'Exit Gate A',
            'walking_time_seconds' => 90,
        ]);

        // 6. Community Reports
        CommunityReport::create([
            'station_id' => 1,
            'report_type' => 'Kebersihan',
            'issue' => 'Lantai Area Tap Gate B Agak Licin',
            'description' => 'Petunjuk arah guiding block bersih, namun lantai basah setelah hujan.',
            'status' => 'Verified',
            'latitude' => -6.193200,
            'longitude' => 106.823000,
        ]);

        // 7. Station Tenants (Menu Go)
        $tenantsData = [
            [
                'station_id' => 1,
                'tenant_name' => 'Kopi Kenangan Bundaran HI',
                'mission_type' => 'MENU_GO',
                'category' => 'Coffee & Bakery',
                'price_avg' => 22000,
                'promo_photo' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
                'latitude' => -6.193130,
                'longitude' => 106.822910,
                'is_active' => true,
            ],
            [
                'station_id' => 1,
                'tenant_name' => 'Roti O Stasiun MRT',
                'mission_type' => 'MENU_GO',
                'category' => 'Bakery & Pastry',
                'price_avg' => 14000,
                'promo_photo' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
                'latitude' => -6.193140,
                'longitude' => 106.822920,
                'is_active' => true,
            ],
            [
                'station_id' => 1,
                'tenant_name' => 'Indomaret Point Concourse',
                'mission_type' => 'MENU_GO',
                'category' => 'Convenience & Snacks',
                'price_avg' => 18000,
                'promo_photo' => 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
                'latitude' => -6.193120,
                'longitude' => 106.822880,
                'is_active' => true,
            ],
            [
                'station_id' => 2,
                'tenant_name' => 'Lawson Station Dukuh Atas',
                'mission_type' => 'MENU_GO',
                'category' => 'Japanese Oden & Coffee',
                'price_avg' => 28000,
                'promo_photo' => 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=600&q=80',
                'latitude' => -6.200800,
                'longitude' => 106.822780,
                'is_active' => true,
            ],
            [
                'station_id' => 2,
                'tenant_name' => 'Starbucks Transit Hub',
                'mission_type' => 'MENU_GO',
                'category' => 'Premium Coffee',
                'price_avg' => 55000,
                'promo_photo' => 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=600&q=80',
                'latitude' => -6.200790,
                'longitude' => 106.822750,
                'is_active' => true,
            ],
            [
                'station_id' => 5,
                'tenant_name' => 'Alfamart Express Manggarai',
                'mission_type' => 'MENU_GO',
                'category' => 'Retail & Drinks',
                'price_avg' => 15000,
                'promo_photo' => 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=600&q=80',
                'latitude' => -6.209910,
                'longitude' => 106.849920,
                'is_active' => true,
            ]
        ];

        foreach ($tenantsData as $t) {
            StationTenant::create($t);
        }

        // 8. Struk Go Data (Digital Receipts)
        \App\Models\StrukGo::truncate();
        \App\Models\StrukGo::create([
            'user_id' => 1,
            'station_id' => 1,
            'receipt_number' => 'STRUK-MAPID-20260823-001',
            'merchant_name' => 'Kopi Kenangan Bundaran HI',
            'transaction_type' => 'F&B_PURCHASE',
            'items_json' => [
                ['name' => 'Kopi Kenangan Mantan (Large)', 'qty' => 1, 'price' => 24000],
                ['name' => 'Roti Coklat Keju', 'qty' => 1, 'price' => 12000]
            ],
            'subtotal' => 36000,
            'discount' => 5000,
            'total_amount' => 31000,
            'payment_method' => 'QRIS MAPID',
            'status' => 'SUCCESS',
            'transaction_time' => now()->subHours(2),
        ]);

        \App\Models\StrukGo::create([
            'user_id' => 1,
            'station_id' => 2,
            'receipt_number' => 'STRUK-MAPID-20260823-002',
            'merchant_name' => 'Tiket Transit MRT Dukuh Atas',
            'transaction_type' => 'TRANSIT_FARE',
            'items_json' => [
                ['name' => 'Single Trip MRT Bundaran HI -> Dukuh Atas', 'qty' => 1, 'price' => 4000]
            ],
            'subtotal' => 4000,
            'discount' => 0,
            'total_amount' => 4000,
            'payment_method' => 'Kartu Uang Elektronik (KUE)',
            'status' => 'SUCCESS',
            'transaction_time' => now()->subHours(5),
        ]);
    }
}

