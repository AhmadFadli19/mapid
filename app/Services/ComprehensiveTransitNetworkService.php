<?php

namespace App\Services;

use App\Models\Station;
use App\Models\Facility;
use App\Models\ExitGate;
use App\Models\BoardingRecommendation;
use App\Models\StationTenant;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ComprehensiveTransitNetworkService
{
    /**
     * Seeds and ensures all core transit network stations across Jakarta
     * (MRT Jakarta, KRL Commuter Line, LRT Jabodebek, LRT Jakarta, and iconic TransJakarta Hubs)
     * are fully available, correctly categorized, and geo-referenced.
     */
    public function seedCoreNetwork(): int
    {
        $stations = [
            // ==========================================
            // 🚇 MRT JAKARTA (NORTH - SOUTH LINE)
            // ==========================================
            [
                'code' => 'MRT_BHI', 'name' => 'Stasiun Bundaran HI Astra',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.193125, 'longitude' => 106.822894,
                'address' => 'Jl. M.H. Thamrin, Menteng, Jakarta Pusat',
                'car' => 'Gerbong 2 atau 3', 'exit' => 'Exit A (Plaza Indonesia)',
            ],
            [
                'code' => 'MRT_DKA', 'name' => 'Stasiun Dukuh Atas BNI',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.200788, 'longitude' => 106.822765,
                'address' => 'Jl. Jend. Sudirman, Setiabudi, Jakarta Selatan',
                'car' => 'Gerbong 4 atau 5', 'exit' => 'Exit B (JPO Sudirman & KRL)',
            ],
            [
                'code' => 'MRT_STB', 'name' => 'Stasiun Setiabudi Astra',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.208900, 'longitude' => 106.821700,
                'address' => 'Jl. Jend. Sudirman Kav. 34, Setiabudi, Jakarta Selatan',
                'car' => 'Gerbong 3', 'exit' => 'Exit A (Chase Plaza)',
            ],
            [
                'code' => 'MRT_BNH', 'name' => 'Stasiun Bendungan Hilir',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.215800, 'longitude' => 106.818300,
                'address' => 'Jl. Jend. Sudirman, Tanah Abang, Jakarta Pusat',
                'car' => 'Gerbong 2 atau 4', 'exit' => 'Exit C (Sampoerna Strategic)',
            ],
            [
                'code' => 'MRT_IST', 'name' => 'Stasiun Istora Mandiri',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.222900, 'longitude' => 106.808800,
                'address' => 'Jl. Jend. Sudirman, Gelora, Tanah Abang, Jakarta Pusat',
                'car' => 'Gerbong 1 atau 6', 'exit' => 'Exit B (GBK Senayan)',
            ],
            [
                'code' => 'MRT_SNY', 'name' => 'Stasiun Senayan Mastercard',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.226800, 'longitude' => 106.801600,
                'address' => 'Jl. Jend. Sudirman, Kebayoran Baru, Jakarta Selatan',
                'car' => 'Gerbong 3 atau 4', 'exit' => 'Exit A (Ratu Plaza & FX)',
            ],
            [
                'code' => 'MRT_ASN', 'name' => 'Stasiun ASEAN',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.238600, 'longitude' => 106.799300,
                'address' => 'Jl. Sisingamangaraja, Selong, Kebayoran Baru, Jakarta Selatan',
                'car' => 'Gerbong 2', 'exit' => 'Exit Integrasi CSW Koridor 13',
            ],
            [
                'code' => 'MRT_BLM', 'name' => 'Stasiun Blok M BCA',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.244365, 'longitude' => 106.798150,
                'address' => 'Jl. Panglima Polim, Melawai, Kebayoran Baru, Jakarta Selatan',
                'car' => 'Gerbong 3 atau 5', 'exit' => 'Exit A (Blok M Plaza)',
            ],
            [
                'code' => 'MRT_BLA', 'name' => 'Stasiun Blok A',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.254700, 'longitude' => 106.797200,
                'address' => 'Jl. Panglima Polim, Pulo, Kebayoran Baru, Jakarta Selatan',
                'car' => 'Gerbong 2', 'exit' => 'Exit Barat (Pasar Blok A)',
            ],
            [
                'code' => 'MRT_HNW', 'name' => 'Stasiun Haji Nawi',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.266200, 'longitude' => 106.797100,
                'address' => 'Jl. RS Fatmawati, Gandaria Selatan, Cilandak, Jakarta Selatan',
                'car' => 'Gerbong 3', 'exit' => 'Exit Timur (Jl. Madrasah)',
            ],
            [
                'code' => 'MRT_CPR', 'name' => 'Stasiun Cipete Raya',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.277800, 'longitude' => 106.797000,
                'address' => 'Jl. RS Fatmawati, Cipete Selatan, Cilandak, Jakarta Selatan',
                'car' => 'Gerbong 2 atau 4', 'exit' => 'Exit A (Jl. Cipete Raya)',
            ],
            [
                'code' => 'MRT_FTW', 'name' => 'Stasiun Fatmawati Indomaret',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.292600, 'longitude' => 106.793800,
                'address' => 'Jl. TB Simatupang, Cilandak Barat, Jakarta Selatan',
                'car' => 'Gerbong 4', 'exit' => 'Exit Barat (Cilandak Town Square)',
            ],
            [
                'code' => 'MRT_LBK', 'name' => 'Stasiun Lebak Bulus Grab',
                'operator' => 'MRT Jakarta', 'line_color' => '#0284c7',
                'latitude' => -6.289000, 'longitude' => 106.774000,
                'address' => 'Jl. Lebak Bulus Raya, Cilandak, Jakarta Selatan',
                'car' => 'Gerbong 1 atau 6', 'exit' => 'Exit Utama (Depo MRT & Terminal)',
            ],

            // ==========================================
            // 🚆 KRL COMMUTER LINE
            // ==========================================
            [
                'code' => 'KRL_JKK', 'name' => 'Stasiun Jakarta Kota',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.137600, 'longitude' => 106.814600,
                'address' => 'Pinangsia, Taman Sari, Jakarta Barat',
                'car' => 'Gerbong 1 atau 8', 'exit' => 'Exit Hall Utama (Kota Tua)',
            ],
            [
                'code' => 'KRL_JUA', 'name' => 'Stasiun Juanda',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.166800, 'longitude' => 106.830600,
                'address' => 'Jl. Ir. H. Juanda, Pasar Baru, Jakarta Pusat',
                'car' => 'Gerbong 3 atau 6', 'exit' => 'Exit Skybridge Halte Juanda',
            ],
            [
                'code' => 'KRL_GDD', 'name' => 'Stasiun Gondangdia',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.185700, 'longitude' => 106.832900,
                'address' => 'Kebon Sirih, Menteng, Jakarta Pusat',
                'car' => 'Gerbong 4', 'exit' => 'Exit Pintu Utara (MNC Center)',
            ],
            [
                'code' => 'KRL_CKN', 'name' => 'Stasiun Cikini',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.198300, 'longitude' => 106.843300,
                'address' => 'Jl. Pegangsaan Timur, Menteng, Jakarta Pusat',
                'car' => 'Gerbong 3 atau 7', 'exit' => 'Exit Barat (Taman Ismail Marzuki)',
            ],
            [
                'code' => 'KRL_MRI', 'name' => 'Stasiun Manggarai',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.209900, 'longitude' => 106.849900,
                'address' => 'Manggarai, Tebet, Jakarta Selatan (Central Interchange)',
                'car' => 'Gerbong 2, 5, atau 8', 'exit' => 'Exit Hall Barat & Skybridge Terminal',
            ],
            [
                'code' => 'KRL_TEB', 'name' => 'Stasiun Tebet',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.226300, 'longitude' => 106.858200,
                'address' => 'Tebet Timur, Tebet, Jakarta Selatan',
                'car' => 'Gerbong 3 atau 6', 'exit' => 'Exit Barat (Halte Feeder Tebet)',
            ],
            [
                'code' => 'KRL_CWG', 'name' => 'Stasiun Cawang (KRL)',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.242900, 'longitude' => 106.858900,
                'address' => 'Tebet Timur, Tebet, Jakarta Selatan',
                'car' => 'Gerbong 2 atau 7', 'exit' => 'Exit Skybridge Integrasi LRT Cikoko',
            ],
            [
                'code' => 'KRL_DRK', 'name' => 'Stasiun Duren Kalibata',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.255500, 'longitude' => 106.855000,
                'address' => 'Rawajati, Pancoran, Jakarta Selatan',
                'car' => 'Gerbong 4', 'exit' => 'Exit Mall Kalibata City',
            ],
            [
                'code' => 'KRL_PSM', 'name' => 'Stasiun Pasar Minggu',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.284000, 'longitude' => 106.844300,
                'address' => 'Pasar Minggu, Jakarta Selatan',
                'car' => 'Gerbong 3 atau 7', 'exit' => 'Exit Terminal Pasar Minggu',
            ],
            [
                'code' => 'KRL_TGB', 'name' => 'Stasiun Tanjung Barat',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.307900, 'longitude' => 106.838900,
                'address' => 'Tanjung Barat, Jagakarsa, Jakarta Selatan',
                'car' => 'Gerbong 3', 'exit' => 'Exit AEON Mall Tanjung Barat',
            ],
            [
                'code' => 'KRL_UI', 'name' => 'Stasiun Universitas Indonesia',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.360800, 'longitude' => 106.831700,
                'address' => 'Pondok Cina, Beji, Depok',
                'car' => 'Gerbong 2 atau 5', 'exit' => 'Exit Kampus UI & Bikun UI',
            ],
            [
                'code' => 'KRL_DPB', 'name' => 'Stasiun Depok Baru',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.391700, 'longitude' => 106.819700,
                'address' => 'Jl. Margonda Raya, Depok, Jawa Barat',
                'car' => 'Gerbong 3 atau 6', 'exit' => 'Exit Terminal Depok & ITC',
            ],
            [
                'code' => 'KRL_DP', 'name' => 'Stasiun Depok',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.405800, 'longitude' => 106.819400,
                'address' => 'Pancoran Mas, Depok, Jawa Barat',
                'car' => 'Gerbong 2 atau 7', 'exit' => 'Exit Pintu Barat (Depo KRL)',
            ],
            [
                'code' => 'KRL_BOO', 'name' => 'Stasiun Bogor',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.596000, 'longitude' => 106.790400,
                'address' => 'Cibogor, Bogor Tengah, Kota Bogor',
                'car' => 'Gerbong 1 atau 8', 'exit' => 'Exit Pintu Utama (Alun-Alun Bogor)',
            ],
            [
                'code' => 'KRL_SUD', 'name' => 'Stasiun Sudirman',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.202300, 'longitude' => 106.823600,
                'address' => 'Menteng, Jakarta Pusat (Kawasan Transit Dukuh Atas)',
                'car' => 'Gerbong 2 atau 7', 'exit' => 'Exit Terowongan Kendal & MRT',
            ],
            [
                'code' => 'KRL_BNI', 'name' => 'Stasiun BNI City',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.201700, 'longitude' => 106.820800,
                'address' => 'Karet Tengsin, Tanah Abang, Jakarta Pusat',
                'car' => 'Gerbong 4', 'exit' => 'Exit Bandara Soetta & Sudirman',
            ],
            [
                'code' => 'KRL_THB', 'name' => 'Stasiun Tanah Abang',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.185600, 'longitude' => 106.811100,
                'address' => 'Kampung Bali, Tanah Abang, Jakarta Pusat',
                'car' => 'Gerbong 3 atau 6', 'exit' => 'Exit Skybridge Pasar Tanah Abang',
            ],
            [
                'code' => 'KRL_PLM', 'name' => 'Stasiun Palmerah',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.207000, 'longitude' => 106.797200,
                'address' => 'Gelora, Tanah Abang, Jakarta Pusat',
                'car' => 'Gerbong 2 atau 5', 'exit' => 'Exit DPR/MPR & Kompas Gramedia',
            ],
            [
                'code' => 'KRL_KBY', 'name' => 'Stasiun Kebayoran',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.237200, 'longitude' => 106.782800,
                'address' => 'Kebayoran Lama, Jakarta Selatan',
                'car' => 'Gerbong 3 atau 7', 'exit' => 'Exit Skybridge Velbak Koridor 13',
            ],
            [
                'code' => 'KRL_SRP', 'name' => 'Stasiun Serpong',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.321700, 'longitude' => 106.666900,
                'address' => 'Serpong, Tangerang Selatan, Banten',
                'car' => 'Gerbong 2 atau 6', 'exit' => 'Exit Pasar Serpong',
            ],
            [
                'code' => 'KRL_TNG', 'name' => 'Stasiun Tangerang',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.177200, 'longitude' => 106.632500,
                'address' => 'Sukarasa, Kota Tangerang, Banten',
                'car' => 'Gerbong 1 atau 8', 'exit' => 'Exit Pasar Lama Tangerang',
            ],
            [
                'code' => 'KRL_PSE', 'name' => 'Stasiun Pasar Senen',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.174700, 'longitude' => 106.844700,
                'address' => 'Senen, Jakarta Pusat',
                'car' => 'Gerbong 2 atau 6', 'exit' => 'Exit JPO Senen & Halte TransJakarta',
            ],
            [
                'code' => 'KRL_JNG', 'name' => 'Stasiun Jatinegara',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.215000, 'longitude' => 106.868000,
                'address' => 'Pisangan Baru, Matraman, Jakarta Timur',
                'car' => 'Gerbong 3 atau 7', 'exit' => 'Exit JPO Skybridge Flyover Jatinegara',
            ],
            [
                'code' => 'KRL_BKS', 'name' => 'Stasiun Bekasi',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.236100, 'longitude' => 107.000300,
                'address' => 'Jl. Ir. H. Juanda, Bekasi Timur, Kota Bekasi',
                'car' => 'Gerbong 1 atau 8', 'exit' => 'Exit Pintu Selatan (Alun-Alun Bekasi)',
            ],
            [
                'code' => 'KRL_CKR', 'name' => 'Stasiun Cikarang',
                'operator' => 'KRL Commuter Line', 'line_color' => '#16a34a',
                'latitude' => -6.255300, 'longitude' => 107.144700,
                'address' => 'Karangasih, Cikarang Utara, Kabupaten Bekasi',
                'car' => 'Gerbong 2 atau 7', 'exit' => 'Exit Hall Utama',
            ],

            // ==========================================
            // 🚝 LRT JABODEBEK (CIBUBUR & BEKASI LINE)
            // ==========================================
            [
                'code' => 'LRT_DKA', 'name' => 'Stasiun Dukuh Atas LRT',
                'operator' => 'LRT Jabodebek', 'line_color' => '#e11d48',
                'latitude' => -6.202500, 'longitude' => 106.823900,
                'address' => 'Setiabudi, Jakarta Selatan (Jembatan Multiguna Integrasi)',
                'car' => 'Gerbong 2 atau 5', 'exit' => 'Exit JPO Skybridge Dukuh Atas',
            ],
            [
                'code' => 'LRT_RSD', 'name' => 'Stasiun Rasuna Said LRT',
                'operator' => 'LRT Jabodebek', 'line_color' => '#e11d48',
                'latitude' => -6.221700, 'longitude' => 106.832200,
                'address' => 'Jl. H.R. Rasuna Said, Karet Kuningan, Jakarta Selatan',
                'car' => 'Gerbong 3', 'exit' => 'Exit Plaza Festival & GOR Soemantri',
            ],
            [
                'code' => 'LRT_KNG', 'name' => 'Stasiun Kuningan LRT',
                'operator' => 'LRT Jabodebek', 'line_color' => '#e11d48',
                'latitude' => -6.232500, 'longitude' => 106.834400,
                'address' => 'Jl. H.R. Rasuna Said, Kuningan Timur, Jakarta Selatan',
                'car' => 'Gerbong 3 atau 4', 'exit' => 'Exit Menara Kadin & Departemen Kesehatan',
            ],
            [
                'code' => 'LRT_PCR', 'name' => 'Stasiun Pancoran LRT',
                'operator' => 'LRT Jabodebek', 'line_color' => '#e11d48',
                'latitude' => -6.243600, 'longitude' => 106.843600,
                'address' => 'Jl. Gatot Subroto, Pancoran, Jakarta Selatan',
                'car' => 'Gerbong 2', 'exit' => 'Exit Patung Pancoran & Halte TJ',
            ],
            [
                'code' => 'LRT_CKO', 'name' => 'Stasiun Cikoko LRT',
                'operator' => 'LRT Jabodebek', 'line_color' => '#e11d48',
                'latitude' => -6.243100, 'longitude' => 106.858300,
                'address' => 'Cikoko, Pancoran, Jakarta Selatan (Integrasi KRL & TJ)',
                'car' => 'Gerbong 3 atau 4', 'exit' => 'Exit Skybridge KRL Cawang & Halte Cikoko',
            ],
            [
                'code' => 'LRT_CWG', 'name' => 'Stasiun Cawang LRT',
                'operator' => 'LRT Jabodebek', 'line_color' => '#e11d48',
                'latitude' => -6.246400, 'longitude' => 106.872200,
                'address' => 'Jl. MT Haryono, Cawang, Kramat Jati, Jakarta Timur',
                'car' => 'Gerbong 2 atau 5', 'exit' => 'Exit Percabangan Jalur Cibubur-Bekasi',
            ],
            [
                'code' => 'LRT_HLM', 'name' => 'Stasiun Halim (Whoosh & LRT)',
                'operator' => 'LRT Jabodebek', 'line_color' => '#e11d48',
                'latitude' => -6.247200, 'longitude' => 106.884700,
                'address' => 'Makasar, Jakarta Timur (Integrasi KCIC Whoosh)',
                'car' => 'Gerbong 1 atau 6', 'exit' => 'Exit Concourse Stasiun Kereta Cepat Whoosh',
            ],
            [
                'code' => 'LRT_TMI', 'name' => 'Stasiun TMII LRT',
                'operator' => 'LRT Jabodebek', 'line_color' => '#e11d48',
                'latitude' => -6.289700, 'longitude' => 106.877800,
                'address' => 'Pinang Ranti, Makasar, Jakarta Timur',
                'car' => 'Gerbong 3', 'exit' => 'Exit Pintu 1 Taman Mini Indonesia Indah',
            ],
            [
                'code' => 'LRT_KBR', 'name' => 'Stasiun Kampung Rambutan LRT',
                'operator' => 'LRT Jabodebek', 'line_color' => '#e11d48',
                'latitude' => -6.309400, 'longitude' => 106.876700,
                'address' => 'Ciracas, Jakarta Timur',
                'car' => 'Gerbong 2 atau 5', 'exit' => 'Exit Skybridge Terminal Kampung Rambutan',
            ],
            [
                'code' => 'LRT_HJM', 'name' => 'Stasiun Harjamukti LRT',
                'operator' => 'LRT Jabodebek', 'line_color' => '#e11d48',
                'latitude' => -6.370800, 'longitude' => 106.892500,
                'address' => 'Harjamukti, Cimanggis, Kota Depok (Ujung Jalur Cibubur)',
                'car' => 'Gerbong 1 atau 6', 'exit' => 'Exit Mall Cibubur Junction & Trans Cibubur',
            ],
            [
                'code' => 'LRT_BKB', 'name' => 'Stasiun Bekasi Barat LRT',
                'operator' => 'LRT Jabodebek', 'line_color' => '#e11d48',
                'latitude' => -6.243900, 'longitude' => 106.993900,
                'address' => 'Pekayon Jaya, Bekasi Selatan, Kota Bekasi',
                'car' => 'Gerbong 3', 'exit' => 'Exit Revo Mall & Skybridge',
            ],
            [
                'code' => 'LRT_JTM', 'name' => 'Stasiun Jatimulya LRT',
                'operator' => 'LRT Jabodebek', 'line_color' => '#e11d48',
                'latitude' => -6.256900, 'longitude' => 107.034700,
                'address' => 'Jatimulya, Tambun Selatan, Kabupaten Bekasi',
                'car' => 'Gerbong 2 atau 5', 'exit' => 'Exit Depo LRT Jatimulya',
            ],

            // ==========================================
            // 🚝 LRT JAKARTA (KELAPA GADING - RAWAMANGUN)
            // ==========================================
            [
                'code' => 'LRT_PGD', 'name' => 'Stasiun Pegangsaan Dua',
                'operator' => 'LRT Jakarta', 'line_color' => '#dc2626',
                'latitude' => -6.155800, 'longitude' => 106.914200,
                'address' => 'Pegangsaan Dua, Kelapa Gading, Jakarta Utara',
                'car' => 'Gerbong 1', 'exit' => 'Exit Depo LRT Pegangsaan Dua',
            ],
            [
                'code' => 'LRT_BLU', 'name' => 'Stasiun Boulevard Utara',
                'operator' => 'LRT Jakarta', 'line_color' => '#dc2626',
                'latitude' => -6.158900, 'longitude' => 106.908900,
                'address' => 'Kelapa Gading Timur, Jakarta Utara',
                'car' => 'Gerbong 2', 'exit' => 'Exit Mall Kelapa Gading (MKG)',
            ],
            [
                'code' => 'LRT_VLD', 'name' => 'Stasiun Velodrome',
                'operator' => 'LRT Jakarta', 'line_color' => '#dc2626',
                'latitude' => -6.193100, 'longitude' => 106.882500,
                'address' => 'Rawamangun, Pulo Gadung, Jakarta Timur',
                'car' => 'Gerbong 2', 'exit' => 'Exit Skybridge Halte TJ Pemuda Rawamangun',
            ],

            // ==========================================
            // 🚌 ICONIC TRANSJAKARTA BRT TRANSIT HUBS
            // ==========================================
            [
                'code' => 'TJ_TSR', 'name' => 'Halte Tosari ICBC',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.196900, 'longitude' => 106.822800,
                'address' => 'Jl. M.H. Thamrin, Menteng, Jakarta Pusat (Dekat Bundaran HI)',
                'car' => 'Pintu Depan Busway', 'exit' => 'Exit Anjungan Pandang Kapal Pesiar',
            ],
            [
                'code' => 'TJ_BHI', 'name' => 'Halte Bundaran HI Astra',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.193600, 'longitude' => 106.822900,
                'address' => 'Bundaran HI, Menteng, Jakarta Pusat (Integrasi MRT BHI)',
                'car' => 'Pintu Tengah Busway', 'exit' => 'Exit Anjungan Menghadap Patung Selamat Datang',
            ],
            [
                'code' => 'TJ_MNS', 'name' => 'Halte Monas',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.176400, 'longitude' => 106.823900,
                'address' => 'Jl. Medan Merdeka Barat, Gambir, Jakarta Pusat',
                'car' => 'Pintu Depan', 'exit' => 'Exit Pintu Barat Monas & Museum Nasional',
            ],
            [
                'code' => 'TJ_HRM', 'name' => 'Halte Harmoni Central',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.167382, 'longitude' => 106.820251,
                'address' => 'Jl. Gajah Mada, Gambir, Jakarta Pusat (Transit Multi-Koridor)',
                'car' => 'Pintu Peron Koridor 1, 2, 3, 8', 'exit' => 'Exit Halte Harmoni Relokasi',
            ],
            [
                'code' => 'TJ_SNS', 'name' => 'Halte Senen Sentral',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.174200, 'longitude' => 106.843600,
                'address' => 'Senen, Jakarta Pusat (Integrasi KRL Pasar Senen)',
                'car' => 'Pintu Peron Koridor 2 & 5', 'exit' => 'Exit Skybridge JPO Megah Senen',
            ],
            [
                'code' => 'TJ_KMY', 'name' => 'Halte Kampung Melayu',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.224400, 'longitude' => 106.865300,
                'address' => 'Kampung Melayu, Jatinegara, Jakarta Timur (Hub Koridor 5, 7, 11)',
                'car' => 'Pintu Peron 1-4', 'exit' => 'Exit Terminal Kampung Melayu & Flyover',
            ],
            [
                'code' => 'TJ_PGC', 'name' => 'Halte PGC 2 Cililitan',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.262500, 'longitude' => 106.868300,
                'address' => 'Cililitan, Kramat Jati, Jakarta Timur',
                'car' => 'Pintu Busway Lantai 2', 'exit' => 'Exit Pusat Grosir Cililitan (PGC)',
            ],
            [
                'code' => 'TJ_RGN', 'name' => 'Halte Ragunan',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.310600, 'longitude' => 106.822500,
                'address' => 'Pasar Minggu, Jakarta Selatan (Terminus Koridor 6)',
                'car' => 'Pintu Utama Bus Gandeng', 'exit' => 'Exit Pintu Gerbang Utama Ragunan Zoo',
            ],
            [
                'code' => 'TJ_PRT', 'name' => 'Halte Pinang Ranti',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.289200, 'longitude' => 106.889400,
                'address' => 'Pinang Ranti, Makasar, Jakarta Timur (Terminus Koridor 9)',
                'car' => 'Pintu Busway 1', 'exit' => 'Exit Terminal Pinang Ranti',
            ],
            [
                'code' => 'TJ_PLT', 'name' => 'Halte Pluit',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.118900, 'longitude' => 106.790600,
                'address' => 'Penjaringan, Jakarta Utara (Terminus Koridor 9 & 12)',
                'car' => 'Pintu Busway 1 & 2', 'exit' => 'Exit Mall Pluit Village',
            ],
            [
                'code' => 'TJ_CSW', 'name' => 'Halte CSW ASEAN Integrasi',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.239200, 'longitude' => 106.799700,
                'address' => 'Kebayoran Baru, Jakarta Selatan (Integrasi Skybridge 5 Lantai)',
                'car' => 'Pintu Busway Koridor 13 (Elevated)', 'exit' => 'Exit Skybridge Melayang Menuju MRT ASEAN',
            ],
            [
                'code' => 'TJ_DKA', 'name' => 'Halte Dukuh Atas 1 & 2',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.201400, 'longitude' => 106.822200,
                'address' => 'Setiabudi, Jakarta Selatan (Kawasan Transit Terpadu)',
                'car' => 'Pintu Peron 1-3', 'exit' => 'Exit Jembatan Integrasi KRL, LRT, MRT',
            ],
            [
                'code' => 'TJ_SMG', 'name' => 'Halte Semanggi & Bendungan Hilir',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.219700, 'longitude' => 106.816400,
                'address' => 'Karet Semanggi, Setiabudi, Jakarta Selatan (JPO Terpanjang)',
                'car' => 'Pintu Tengah Busway', 'exit' => 'Exit JPO Integrasi Koridor 1 & Koridor 9',
            ],
            [
                'code' => 'TJ_RWG', 'name' => 'Halte Rawamangun',
                'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => -6.193900, 'longitude' => 106.883100,
                'address' => 'Rawamangun, Pulo Gadung, Jakarta Timur',
                'car' => 'Pintu Depan', 'exit' => 'Exit Skybridge Menuju LRT Velodrome',
            ],
        ];

        $seededCount = 0;
        foreach ($stations as $item) {
            $car = $item['car'] ?? 'Gerbong 2 atau 4';
            $exitGate = $item['exit'] ?? 'Exit Utama';
            unset($item['car'], $item['exit']);

            $station = Station::updateOrCreate(
                ['code' => $item['code']],
                $item
            );

            // Seed rich default facilities if none exist
            if ($station->facilities()->count() === 0) {
                Facility::create([
                    'station_id' => $station->id,
                    'facility_name' => 'Toilet Umum & Difabel Bersih',
                    'category' => 'Accessibility',
                    'floor' => 'Concourse Level',
                    'is_available' => true,
                    'status_note' => 'Berfungsi Sangat Baik & Terawat',
                    'operating_hours' => '05:00 - 23:30',
                    'latitude' => $station->latitude,
                    'longitude' => $station->longitude,
                ]);
                Facility::create([
                    'station_id' => $station->id,
                    'facility_name' => 'Musholla Transit Nyaman',
                    'category' => 'Public Facilities',
                    'floor' => 'Lantai Mezzanine',
                    'is_available' => true,
                    'status_note' => 'AC Dingin & Mukena Bersih',
                    'operating_hours' => '05:00 - 23:30',
                    'latitude' => $station->latitude,
                    'longitude' => $station->longitude,
                ]);
                Facility::create([
                    'station_id' => $station->id,
                    'facility_name' => 'Lift Prioritas Lansia & Ibu Hamil',
                    'category' => 'Accessibility',
                    'floor' => 'Platform to Concourse',
                    'is_available' => true,
                    'status_note' => 'Beroperasi Normal',
                    'operating_hours' => '05:00 - 23:30',
                    'latitude' => $station->latitude,
                    'longitude' => $station->longitude,
                ]);
            }

            // Seed Exit Gates if none exist
            if ($station->exits()->count() === 0) {
                ExitGate::create([
                    'station_id' => $station->id,
                    'gate_name' => $exitGate,
                    'target_street' => $station->address,
                    'is_accessible' => true,
                    'nearest_poi' => 'Integrasi Angkutan Umum & Pedestrian Aman',
                    'latitude' => $station->latitude,
                    'longitude' => $station->longitude,
                ]);
            }

            // Seed Boarding Recommendation
            if ($station->boardingRecommendations()->count() === 0) {
                BoardingRecommendation::create([
                    'station_id' => $station->id,
                    'car_number' => $car,
                    'reason' => 'Posisi optimal paling dekat dengan eskalator transit dan pintu keluar.',
                    'nearest_exit' => $exitGate,
                    'walking_time_seconds' => 70,
                ]);
            }

            // Seed Menu Go Tenants
            if ($station->tenants()->count() === 0) {
                StationTenant::create([
                    'station_id' => $station->id,
                    'tenant_name' => "Kopi Kenangan {$station->name}",
                    'mission_type' => 'MENU_GO',
                    'category' => 'Coffee & Bakery',
                    'price_avg' => 22000,
                    'promo_photo' => 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=600&q=80',
                    'latitude' => $station->latitude,
                    'longitude' => $station->longitude,
                    'is_active' => true,
                ]);
                StationTenant::create([
                    'station_id' => $station->id,
                    'tenant_name' => "Indomaret Point {$station->name}",
                    'mission_type' => 'MENU_GO',
                    'category' => 'Convenience Store',
                    'price_avg' => 15000,
                    'promo_photo' => 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
                    'latitude' => $station->latitude,
                    'longitude' => $station->longitude,
                    'is_active' => true,
                ]);
            }

            $seededCount++;
        }

        return $seededCount;
    }
}
