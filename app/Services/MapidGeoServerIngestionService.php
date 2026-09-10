<?php

namespace App\Services;

use App\Models\Station;
use App\Models\Facility;
use App\Models\ExitGate;
use App\Models\BoardingRecommendation;
use App\Models\StationTenant;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class MapidGeoServerIngestionService
{
    protected string $apiKey;
    protected string $halteUrl;
    protected string $stasiunUrl;

    public function __construct()
    {
        $this->apiKey = env('MAPID_API_KEY', 'f776ee857d4c465fa98a38bd44b5ff8d');
        $this->halteUrl = env('MAPID_HALTE_URL', "https://geoserver.mapid.io/layers_new/get_layer?api_key={$this->apiKey}&layer_id=6a7d6d5a5846ca0276fb22c1&project_id=6a7d6b24b57943085b34ec30");
        $this->stasiunUrl = env('MAPID_STASIUN_URL', "https://geoserver.mapid.io/layers_new/get_layer?api_key={$this->apiKey}&layer_id=6a7d6c7db57943085b35ca07&project_id=6a7d6b24b57943085b34ec30");
    }

    /**
     * Fetch & ingest all Halte and Stasiun features from MAPID GeoServer API into database.
     */
    public function syncGeoServerData(): array
    {
        $importedHalteCount = 0;
        $importedStasiunCount = 0;

        // 1. Ingest Halte Jakarta Timur
        try {
            $response = Http::withoutVerifying()->timeout(15)->get($this->halteUrl);
            if ($response->successful() && isset($response->json()['features'])) {
                $features = $response->json()['features'];
                foreach ($features as $idx => $feat) {
                    $props = $feat['properties'] ?? [];
                    $coords = $feat['geometry']['coordinates'] ?? [106.8, -6.2];
                    $lon = (float)($props['LONGITUDE'] ?? $coords[0]);
                    $lat = (float)($props['LATITUDE'] ?? $coords[1]);

                    $rawName = trim($props['NAMA'] ?? 'Halte TransJakarta');
                    $name = str_starts_with(strtoupper($rawName), 'HALTE') ? $rawName : "Halte {$rawName}";
                    $code = 'TJ_JT_' . ($props['fid'] ?? ($idx + 100));

                    $station = Station::updateOrCreate(
                        ['code' => $code],
                        [
                            'name' => ucwords(strtolower($name)),
                            'operator' => 'TransJakarta',
                            'line_color' => '#ea580c',
                            'latitude' => $lat,
                            'longitude' => $lon,
                            'address' => $props['ALAMAT'] ?? 'Kota Jakarta Timur',
                        ]
                    );

                    $this->seedStationDefaults($station);
                    $importedHalteCount++;
                }
            }
        } catch (\Exception $e) {
            Log::error('Error ingesting Halte GeoServer: ' . $e->getMessage());
        }

        // 2. Ingest Stasiun Jakarta Timur
        try {
            $response = Http::withoutVerifying()->timeout(15)->get($this->stasiunUrl);
            if ($response->successful() && isset($response->json()['features'])) {
                $features = $response->json()['features'];
                foreach ($features as $idx => $feat) {
                    $props = $feat['properties'] ?? [];
                    $coords = $feat['geometry']['coordinates'] ?? [106.8, -6.2];
                    $lon = (float)($props['LONGITUDE'] ?? $coords[0]);
                    $lat = (float)($props['LATITUDE'] ?? $coords[1]);

                    $rawName = trim($props['NAMA'] ?? 'Stasiun Transit');
                    $tipe3 = strtoupper(trim($props['TIPE_3'] ?? ''));

                    $operator = 'KRL Commuter Line';
                    $lineColor = '#16a34a';

                    if (str_contains($tipe3, 'LRT')) {
                        $operator = 'LRT Jabodebek';
                        $lineColor = '#e11d48';
                    } else if (str_contains($tipe3, 'MRT')) {
                        $operator = 'MRT Jakarta';
                        $lineColor = '#0284c7';
                    } else if (str_contains($tipe3, 'KAI') || str_contains($tipe3, 'ANTARKOTA')) {
                        $operator = 'KAI Antarkota';
                        $lineColor = '#d97706';
                    }

                    $code = 'ST_JT_' . ($idx + 101);

                    $station = Station::updateOrCreate(
                        ['code' => $code],
                        [
                            'name' => ucwords(strtolower($rawName)),
                            'operator' => $operator,
                            'line_color' => $lineColor,
                            'latitude' => $lat,
                            'longitude' => $lon,
                            'address' => $props['ALAMAT'] ?? 'Kota Jakarta Timur',
                        ]
                    );

                    $this->seedStationDefaults($station);
                    $importedStasiunCount++;
                }
            }
        } catch (\Exception $e) {
            Log::error('Error ingesting Stasiun GeoServer: ' . $e->getMessage());
        }

        return [
            'status' => 'success',
            'halte_count' => $importedHalteCount,
            'stasiun_count' => $importedStasiunCount,
            'total_imported' => $importedHalteCount + $importedStasiunCount
        ];
    }

    private function seedStationDefaults(Station $station): void
    {
        // 1. Facilities
        if ($station->facilities()->count() === 0) {
            Facility::create([
                'station_id' => $station->id,
                'facility_name' => 'Toilet Umum & Aksesibilitas',
                'category' => 'Public Facilities',
                'floor' => 'Lantai 1',
                'is_available' => true,
                'status_note' => 'Berfungsi Normal',
                'operating_hours' => '05:00 - 22:00',
                'latitude' => $station->latitude,
                'longitude' => $station->longitude,
            ]);
            Facility::create([
                'station_id' => $station->id,
                'facility_name' => 'Musholla Transit Bersih',
                'category' => 'Public Facilities',
                'floor' => 'Lantai Mezzanine',
                'is_available' => true,
                'status_note' => 'Buka & Bersih',
                'operating_hours' => '05:00 - 22:00',
                'latitude' => $station->latitude,
                'longitude' => $station->longitude,
            ]);
        }

        // 2. Exit Gates
        if ($station->exits()->count() === 0) {
            ExitGate::create([
                'station_id' => $station->id,
                'gate_name' => 'Exit Gate A (Trotoar Utama)',
                'target_street' => $station->address ?? 'Jalan Utama',
                'is_accessible' => true,
                'nearest_poi' => 'Halte Pengumpan & Penyeberangan Aman',
                'latitude' => $station->latitude,
                'longitude' => $station->longitude,
            ]);
        }

        // 3. Boarding Recommendation
        if ($station->boardingRecommendations()->count() === 0) {
            BoardingRecommendation::create([
                'station_id' => $station->id,
                'car_number' => 'Gerbong 2 atau 7',
                'reason' => 'Posisi paling dekat dengan Exit Gate A & Eskalator stasiun.',
                'nearest_exit' => 'Exit Gate A',
                'walking_time_seconds' => 75,
            ]);
        }

        // 4. Menu Go Tenants
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
                'price_avg' => 18000,
                'promo_photo' => 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
                'latitude' => $station->latitude,
                'longitude' => $station->longitude,
                'is_active' => true,
            ]);
        }
    }
}
