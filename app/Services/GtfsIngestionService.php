<?php

namespace App\Services;

use App\Models\Station;
use App\Models\TransitRoute;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class GtfsIngestionService
{
    protected string $tjGtfsUrl = 'https://gtfs.transjakarta.co.id/files/file_gtfs.zip';

    /**
     * Download, extract, and ingest GTFS Static Feed for TransJakarta.
     * Uses local file_gtfs_tj directory if available, otherwise downloads live feed.
     */
    public function ingestTransJakartaGtfs(): array
    {
        $localGtfsDir = base_path('file_gtfs_tj');
        $extractPath = storage_path('app/gtfs_extract');
        $zipPath = storage_path('app/gtfs_tj.zip');

        // Check if local directory with unzipped GTFS files exists
        if (file_exists($localGtfsDir . '/stops.txt')) {
            $workingDir = $localGtfsDir;
        } else {
            if (!file_exists($extractPath)) {
                mkdir($extractPath, 0755, true);
            }

            // Download Static GTFS Feed if zip missing
            if (!file_exists($zipPath)) {
                try {
                    $response = Http::timeout(60)->get($this->tjGtfsUrl);
                    if ($response->successful()) {
                        file_put_contents($zipPath, $response->body());
                    }
                } catch (\Exception $e) {
                    Log::warning("Failed downloading live GTFS feed: " . $e->getMessage());
                }
            }

            if (file_exists($zipPath)) {
                $zip = new ZipArchive();
                if ($zip->open($zipPath) === TRUE) {
                    $zip->extractTo($extractPath);
                    $zip->close();
                }
            }

            $workingDir = $extractPath;
        }

        try {
            DB::beginTransaction();

            // 1. Process stops.txt -> stations table
            $processedStops = $this->processStops($workingDir . '/stops.txt');

            // 2. Process routes.txt -> routes metadata array
            $routesMeta = $this->processRoutes($workingDir . '/routes.txt');

            // 3. Process trips.txt -> shape_id to route_id map
            $shapeToRouteMap = $this->processTrips($workingDir . '/trips.txt');

            // 4. Process shapes.txt -> shape coordinates & LineStrings
            $processedRoutes = $this->processShapes($workingDir . '/shapes.txt', $routesMeta, $shapeToRouteMap);

            DB::commit();

            return [
                'status' => 'success',
                'message' => "Successfully ingested {$processedStops} stations and {$processedRoutes} transit routes from GTFS.",
                'processed_stops' => $processedStops,
                'processed_routes' => $processedRoutes,
            ];
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error("GTFS Ingestion Error: " . $e->getMessage());
            return [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }
    }

    protected function processStops(string $stopsFile): int
    {
        if (!file_exists($stopsFile)) {
            return 0;
        }

        $handle = fopen($stopsFile, 'r');
        if (!$handle) return 0;

        $header = fgetcsv($handle);
        $processed = 0;

        while (($row = fgetcsv($handle)) !== FALSE) {
            if (count($row) < count($header)) continue;
            $data = array_combine($header, $row);

            $stopId = trim($data['stop_id'] ?? '');
            $stopName = trim($data['stop_name'] ?? '');
            $lat = (float)($data['stop_lat'] ?? 0);
            $lon = (float)($data['stop_lon'] ?? 0);

            if (!empty($stopId) && !empty($stopName) && $lat != 0 && $lon != 0) {
                // Formatting line color based on TransJakarta stop naming or default
                $color = '#ea580c';

                $station = Station::updateOrCreate(
                    ['code' => 'TJ_' . $stopId],
                    [
                        'name' => $stopName,
                        'operator' => 'TransJakarta',
                        'line_color' => $color,
                        'latitude' => $lat,
                        'longitude' => $lon,
                        'address' => 'Halte TransJakarta'
                    ]
                );

                if (DB::getDriverName() === 'pgsql') {
                    DB::statement("UPDATE stations SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?", [
                        $lon, $lat, $station->id
                    ]);
                }

                $processed++;
            }
        }

        fclose($handle);
        return $processed;
    }

    protected function processRoutes(string $routesFile): array
    {
        if (!file_exists($routesFile)) {
            return [];
        }

        $handle = fopen($routesFile, 'r');
        if (!$handle) return [];

        $header = fgetcsv($handle);
        $routes = [];

        while (($row = fgetcsv($handle)) !== FALSE) {
            if (count($row) < count($header)) continue;
            $data = array_combine($header, $row);

            $routeId = trim($data['route_id'] ?? '');
            if (empty($routeId)) continue;

            $colorHex = trim($data['route_color'] ?? '007BFF');
            if (!str_starts_with($colorHex, '#')) {
                $colorHex = '#' . $colorHex;
            }

            $textColorHex = trim($data['route_text_color'] ?? 'FFFFFF');
            if (!str_starts_with($textColorHex, '#')) {
                $textColorHex = '#' . $textColorHex;
            }

            $routes[$routeId] = [
                'route_id' => $routeId,
                'agency_id' => trim($data['agency_id'] ?? 'Tije'),
                'route_short_name' => trim($data['route_short_name'] ?? $routeId),
                'route_long_name' => trim($data['route_long_name'] ?? $routeId),
                'route_type' => (int)($data['route_type'] ?? 3),
                'route_color' => $colorHex,
                'route_text_color' => $textColorHex,
            ];
        }

        fclose($handle);
        return $routes;
    }

    protected function processTrips(string $tripsFile): array
    {
        if (!file_exists($tripsFile)) {
            return [];
        }

        $handle = fopen($tripsFile, 'r');
        if (!$handle) return [];

        $header = fgetcsv($handle);
        $shapeToRoute = [];

        while (($row = fgetcsv($handle)) !== FALSE) {
            if (count($row) < count($header)) continue;
            $data = array_combine($header, $row);

            $routeId = trim($data['route_id'] ?? '');
            $shapeId = trim($data['shape_id'] ?? '');

            if (!empty($routeId) && !empty($shapeId)) {
                if (!isset($shapeToRoute[$shapeId])) {
                    $shapeToRoute[$shapeId] = $routeId;
                }
            }
        }

        fclose($handle);
        return $shapeToRoute;
    }

    protected function processShapes(string $shapesFile, array $routesMeta, array $shapeToRouteMap): int
    {
        if (!file_exists($shapesFile)) {
            return 0;
        }

        $handle = fopen($shapesFile, 'r');
        if (!$handle) return 0;

        $header = fgetcsv($handle);

        // Group coordinates by shape_id
        $shapePoints = [];

        while (($row = fgetcsv($handle)) !== FALSE) {
            if (count($row) < count($header)) continue;
            $data = array_combine($header, $row);

            $shapeId = trim($data['shape_id'] ?? '');
            $seq = (int)($data['shape_pt_sequence'] ?? 0);
            $lat = (float)($data['shape_pt_lat'] ?? 0);
            $lon = (float)($data['shape_pt_lon'] ?? 0);

            if (!empty($shapeId) && $lat != 0 && $lon != 0) {
                $shapePoints[$shapeId][$seq] = [$lon, $lat];
            }
        }

        fclose($handle);

        // Map shapePoints to route_id
        $routeCoordinates = [];

        foreach ($shapePoints as $shapeId => $seqPoints) {
            ksort($seqPoints);
            $coords = array_values($seqPoints);

            $routeId = $shapeToRouteMap[$shapeId] ?? null;
            if (!$routeId) {
                // Try deriving routeId from shapeId prefix if available
                $parts = explode('-', $shapeId);
                $routeId = $parts[0] ?? $shapeId;
            }

            // Save longest/most complete shape per routeId
            if (!isset($routeCoordinates[$routeId]) || count($coords) > count($routeCoordinates[$routeId])) {
                $routeCoordinates[$routeId] = $coords;
            }
        }

        $processedCount = 0;

        foreach ($routeCoordinates as $routeId => $coords) {
            $meta = $routesMeta[$routeId] ?? [
                'route_id' => $routeId,
                'agency_id' => 'Tije',
                'route_short_name' => $routeId,
                'route_long_name' => "Rute TransJakarta {$routeId}",
                'route_type' => 3,
                'route_color' => '#ea580c',
                'route_text_color' => '#ffffff',
            ];

            $transitRoute = TransitRoute::updateOrCreate(
                ['route_id' => $routeId],
                [
                    'agency_id' => $meta['agency_id'],
                    'route_short_name' => $meta['route_short_name'],
                    'route_long_name' => $meta['route_long_name'],
                    'route_type' => $meta['route_type'],
                    'route_color' => $meta['route_color'],
                    'route_text_color' => $meta['route_text_color'],
                    'coordinates' => $coords,
                ]
            );

            // PostGIS LineString creation if using PostgreSQL
            if (DB::getDriverName() === 'pgsql' && count($coords) > 1) {
                $wktPoints = [];
                foreach ($coords as $pt) {
                    $wktPoints[] = "{$pt[0]} {$pt[1]}";
                }
                $lineStringWkt = "LINESTRING(" . implode(', ', $wktPoints) . ")";
                DB::statement("UPDATE transit_routes SET path = ST_SetSRID(ST_GeomFromText(?), 4326) WHERE id = ?", [
                    $lineStringWkt, $transitRoute->id
                ]);
            }

            $processedCount++;
        }

        return $processedCount;
    }
}
