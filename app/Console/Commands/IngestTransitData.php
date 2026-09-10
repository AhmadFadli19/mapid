<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\GtfsIngestionService;
use App\Services\BmkgWeatherService;
use App\Services\InariskFloodService;
use App\Services\OverpassIngestionService;
use App\Models\Station;

class IngestTransitData extends Command
{
    protected $signature = 'transit:ingest {--mode=all : Mode of ingestion (gtfs, weather, inarisk, overpass, mapid, all)}';

    protected $description = 'Run PanduYuk Transit Data Ingestion Pipeline (GTFS, BMKG Weather, InaRISK Flood, Overpass, MAPID)';

    public function handle(
        GtfsIngestionService $gtfsService,
        BmkgWeatherService $weatherService,
        InariskFloodService $floodService,
        OverpassIngestionService $overpassService,
        \App\Services\MapidGeoServerIngestionService $mapidService
    ): int {
        $mode = $this->option('mode');
        $this->info("🚀 Starting PanduYuk Data Pipeline [Mode: {$mode}]...");

        if ($mode === 'mapid' || $mode === 'all') {
            $this->info("Fetching live Halte and Stasiun from MAPID GeoServer API...");
            $res = $mapidService->syncGeoServerData();
            $this->info("MAPID GeoServer Ingested: {$res['halte_count']} Halte, {$res['stasiun_count']} Stasiun (Total: {$res['total_imported']})");
        }

        if ($mode === 'gtfs' || $mode === 'all') {
            $this->info("Downloading and processing GTFS feeds...");
            $res = $gtfsService->ingestTransJakartaGtfs();
            $this->info("GTFS Status: " . ($res['message'] ?? 'Done'));
        }

        if ($mode === 'weather' || $mode === 'all') {
            $this->info("Fetching BMKG Open Weather API with Redis Caching...");
            $weather = $weatherService->getWeatherByAdm4('31.71.03.1001');
            $this->info("BMKG Weather: {$weather['weather_desc']}, Temp: {$weather['temperature']}°C (Source: {$weather['source']})");
        }

        if ($mode === 'inarisk' || $mode === 'all') {
            $this->info("Running InaRISK Flood spatial overlay...");
            $firstStation = Station::first();
            if ($firstStation) {
                $flood = $floodService->getStationFloodRisk($firstStation);
                $this->info("Flood Risk for {$firstStation->name}: {$flood['flood_risk_level']} (Source: {$flood['source']})");
            }
        }

        if ($mode === 'overpass' || $mode === 'all') {
            $this->info("Querying Overpass Turbo API for pedestrian footways & street lighting...");
            $firstStation = Station::first();
            if ($firstStation) {
                $overpass = $overpassService->fetchStationInfrastructure($firstStation, 500);
                $this->info("Overpass Infrastructure for {$firstStation->name}: {$overpass['footway_count']} footways, {$overpass['street_lamp_count']} street lamps.");
            }
        }

        $this->info("✅ Ingestion Pipeline Completed Successfully!");
        return Command::SUCCESS;
    }
}
