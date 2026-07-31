<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class MapidSeeder extends Seeder
{
    public function run(): void
    {
        // Truncate existing to re-seed clean
        Schema::disableForeignKeyConstraints();
        DB::table('boarding_recommendations')->truncate();
        DB::table('exits')->truncate();
        DB::table('facilities')->truncate();
        DB::table('stations')->truncate();
        Schema::enableForeignKeyConstraints();

        // 1. Seed Stations (MRT, LRT, KRL Commuter Line, Kereta Antarkota & Luar Kota)
        $stations = [
            // --- MRT JAKARTA ---
            [
                'id' => 1,
                'name' => 'Stasiun Bundaran HI',
                'code' => 'BHI',
                'operator' => 'MRT Jakarta',
                'line_color' => '#0284c7',
                'latitude' => -6.193125,
                'longitude' => 106.822894,
                'address' => 'Jl. M.H. Thamrin, Menteng, Jakarta Pusat',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 2,
                'name' => 'Stasiun Dukuh Atas BNI',
                'code' => 'DKA',
                'operator' => 'MRT Jakarta',
                'line_color' => '#0284c7',
                'latitude' => -6.200788,
                'longitude' => 106.822765,
                'address' => 'Jl. Jend. Sudirman, Setiabudi, Jakarta Selatan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 3,
                'name' => 'Stasiun Blok M Plaza',
                'code' => 'BLM',
                'operator' => 'MRT Jakarta',
                'line_color' => '#0284c7',
                'latitude' => -6.244365,
                'longitude' => 106.798150,
                'address' => 'Kebayoran Baru, Jakarta Selatan',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- LRT JABODEBEK ---
            [
                'id' => 4,
                'name' => 'Stasiun LRT Stasiun Cawang',
                'code' => 'CWG-LRT',
                'operator' => 'LRT Jabodebek',
                'line_color' => '#e11d48',
                'latitude' => -6.242850,
                'longitude' => 106.862400,
                'address' => 'Cawang, Kramat Jati, Jakarta Timur',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 5,
                'name' => 'Stasiun LRT Halim (KCIC Whoosh Hub)',
                'code' => 'HLM-LRT',
                'operator' => 'LRT Jabodebek',
                'line_color' => '#e11d48',
                'latitude' => -6.245200,
                'longitude' => 106.890600,
                'address' => 'Makasar, Jakarta Timur (Integrasi Kereta Cepat)',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- KRL COMMUTER LINE JABODETABEK ---
            [
                'id' => 6,
                'name' => 'Stasiun Manggarai (Central Hub)',
                'code' => 'MRI',
                'operator' => 'KRL Commuter Line',
                'line_color' => '#16a34a',
                'latitude' => -6.209900,
                'longitude' => 106.849900,
                'address' => 'Tebet, Jakarta Selatan',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 7,
                'name' => 'Stasiun Tanah Abang',
                'code' => 'THB',
                'operator' => 'KRL Commuter Line',
                'line_color' => '#16a34a',
                'latitude' => -6.185600,
                'longitude' => 106.810500,
                'address' => 'Tanah Abang, Jakarta Pusat',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 8,
                'name' => 'Stasiun Depok Baru',
                'code' => 'DPB',
                'operator' => 'KRL Commuter Line',
                'line_color' => '#16a34a',
                'latitude' => -6.391300,
                'longitude' => 106.821400,
                'address' => 'Pancoran Mas, Kota Depok',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 9,
                'name' => 'Stasiun Bogor',
                'code' => 'BOO',
                'operator' => 'KRL Commuter Line',
                'line_color' => '#16a34a',
                'latitude' => -6.596200,
                'longitude' => 106.790700,
                'address' => 'Bogor Tengah, Kota Bogor',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- KERETA ANTARKOTA & LUAR KOTA (KAI EXPRES / INTERCITY) ---
            [
                'id' => 10,
                'name' => 'Stasiun Gambir (Utama Antarkota)',
                'code' => 'GMR',
                'operator' => 'KAI Antarkota',
                'line_color' => '#d97706',
                'latitude' => -6.176700,
                'longitude' => 106.830600,
                'address' => 'Gambir, Jakarta Pusat (Kereta Eksekutif Bandung/Surabaya/Yogya)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 11,
                'name' => 'Stasiun Pasar Senen',
                'code' => 'PSE',
                'operator' => 'KAI Antarkota',
                'line_color' => '#d97706',
                'latitude' => -6.174800,
                'longitude' => 106.844300,
                'address' => 'Senen, Jakarta Pusat (Kereta Ekonomi & Luar Kota Jawa)',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 12,
                'name' => 'Stasiun Bandung (Luar Kota)',
                'code' => 'BD',
                'operator' => 'KAI Antarkota',
                'line_color' => '#d97706',
                'latitude' => -6.914700,
                'longitude' => 107.602500,
                'address' => 'Pasirkaliki, Kota Bandung',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 13,
                'name' => 'Stasiun Yogyakarta Tugu',
                'code' => 'YK',
                'operator' => 'KAI Antarkota',
                'line_color' => '#d97706',
                'latitude' => -7.789200,
                'longitude' => 110.363500,
                'address' => 'Gedongtengen, Kota Yogyakarta',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => 14,
                'name' => 'Stasiun Surabaya Gubeng',
                'code' => 'SGU',
                'operator' => 'KAI Antarkota',
                'line_color' => '#d97706',
                'latitude' => -7.265400,
                'longitude' => 112.752100,
                'address' => 'Tambaksari, Kota Surabaya',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // --- TRANSJAKARTA ---
            [
                'id' => 15,
                'name' => 'Halte Harmoni Transit Central',
                'code' => 'HRM',
                'operator' => 'TransJakarta',
                'line_color' => '#ea580c',
                'latitude' => -6.167382,
                'longitude' => 106.820251,
                'address' => 'Gambir, Jakarta Pusat',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];
        DB::table('stations')->insert($stations);

        // 2. Seed Facilities for MRT, KRL, LRT, and KAI Antarkota
        $facilities = [
            // MRT Bundaran HI
            [
                'station_id' => 1,
                'name' => 'Toilet Difabel & Umum (Utara)',
                'category' => 'Public Facilities',
                'floor' => 'Concourse Level',
                'latitude' => -6.193100,
                'longitude' => 106.822850,
                'operating_hours' => '05:00 - 23:30',
                'status' => 'Available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'station_id' => 1,
                'name' => 'Mushola Stasiun (Pintu B)',
                'category' => 'Public Facilities',
                'floor' => 'Concourse Level',
                'latitude' => -6.193150,
                'longitude' => 106.822900,
                'operating_hours' => '05:00 - 23:00',
                'status' => 'Available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'station_id' => 1,
                'name' => 'Indomaret Point Bundaran HI',
                'category' => 'Commercial Facilities',
                'floor' => 'Concourse Level',
                'latitude' => -6.193200,
                'longitude' => 106.822950,
                'operating_hours' => '06:00 - 22:00',
                'status' => 'Available',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // KRL Manggarai Hub
            [
                'station_id' => 6,
                'name' => 'Lift Prioritas Peron 6 & 7 (Bogor Line)',
                'category' => 'Accessibility',
                'floor' => 'Lantai 2 Peron',
                'latitude' => -6.209910,
                'longitude' => 106.849910,
                'operating_hours' => '04:00 - 24:00',
                'status' => 'Available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'station_id' => 6,
                'name' => 'Roti O & Minimarket Manggarai Utama',
                'category' => 'Commercial Facilities',
                'floor' => 'Concourse Utama',
                'latitude' => -6.209880,
                'longitude' => 106.849880,
                'operating_hours' => '05:00 - 22:00',
                'status' => 'Available',
                'created_at' => now(),
                'updated_at' => now(),
            ],

            // KAI Gambir Antarkota
            [
                'station_id' => 10,
                'name' => 'Executive Lounge & Charger Station',
                'category' => 'Commercial Facilities',
                'floor' => 'Lantai 1 Hall Utama',
                'latitude' => -6.176710,
                'longitude' => 106.830610,
                'operating_hours' => '24 Jam',
                'status' => 'Available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'station_id' => 10,
                'name' => 'Loket Pembelian Tiket & Check-in Mandiri',
                'category' => 'Public Facilities',
                'floor' => 'Pintu Barat',
                'latitude' => -6.176690,
                'longitude' => 106.830590,
                'operating_hours' => '24 Jam',
                'status' => 'Available',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('facilities')->insert($facilities);

        // 3. Seed Exits
        $exits = [
            [
                'station_id' => 1,
                'name' => 'Exit A (Plaza Indonesia)',
                'nearest_road' => 'Jl. M.H. Thamrin (Barat)',
                'latitude' => -6.192900,
                'longitude' => 106.822600,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'station_id' => 6,
                'name' => 'Pintu Keluar Barat (Pasar Manggarai)',
                'nearest_road' => 'Jl. Manggarai Utara',
                'latitude' => -6.209800,
                'longitude' => 106.849700,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'station_id' => 10,
                'name' => 'Pintu Keluar Gambir Barat (Monas)',
                'nearest_road' => 'Jl. Medan Merdeka Timur',
                'latitude' => -6.176600,
                'longitude' => 106.830400,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('exits')->insert($exits);

        // 4. Seed Boarding Recommendations
        $boarding = [
            [
                'station_id' => 1,
                'recommended_car' => 'Gerbong 2 atau 3 (Kereta Depan)',
                'reason' => 'Paling cepat dijangkau dari Eskalator & Lift Utama Exit B (Grand Indonesia)',
                'nearest_exit' => 'Exit B',
                'walking_time_seconds' => 90,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'station_id' => 6,
                'recommended_car' => 'Gerbong 7 atau 8 (Kereta Tengah)',
                'reason' => 'Dekat dengan Tangga & Lift Peron Transit Jalur 6 (Tujuan Depok/Bogor)',
                'nearest_exit' => 'Peron Transit Atas',
                'walking_time_seconds' => 100,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'station_id' => 10,
                'recommended_car' => 'Gerbong Eksekutif 3 (Depan)',
                'reason' => 'Sejajar dengan Pintu Masuk Direct Boarding Hall Utama',
                'nearest_exit' => 'Pintu Hall Utama Barat',
                'walking_time_seconds' => 60,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];
        DB::table('boarding_recommendations')->insert($boarding);
    }
}
