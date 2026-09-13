<?php

namespace App\Services;

use App\Models\Station;
use App\Models\TransitRoute;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use ZipArchive;

class GtfsIngestionService
{
    protected string $defaultGtfsUrl = 'https://gtfs.transjakarta.co.id/files/file_gtfs.zip';

    public function ingestTransJakartaGtfs(): array
    {
        $localDir = base_path('file_gtfs_tj');
        $extractDir = storage_path('app/gtfs_extract');
        $zipPath = storage_path('app/gtfs_tj.zip');

        if (!is_file($localDir . '/stops.txt')) {
            if (!is_file($zipPath)) {
                try {
                    $response = Http::timeout(60)->get(env('GTFS_STATIC_URL', $this->defaultGtfsUrl));
                    if ($response->successful()) file_put_contents($zipPath, $response->body());
                } catch (\Throwable $e) {
                    Log::warning('GTFS static download failed: ' . $e->getMessage());
                }
            }
            if (is_file($zipPath)) {
                $zip = new ZipArchive();
                if ($zip->open($zipPath) === true) {
                    if (!is_dir($extractDir)) mkdir($extractDir, 0755, true);
                    $zip->extractTo($extractDir);
                    $zip->close();
                }
            }
            $localDir = $extractDir;
        }

        foreach (['stops.txt', 'routes.txt', 'trips.txt', 'stop_times.txt'] as $file) {
            if (!is_file($localDir . '/' . $file)) return ['status' => 'unavailable', 'message' => "GTFS static {$file} belum tersedia.", 'data_source' => 'GTFS_STATIC'];
        }

        try {
            DB::transaction(function () use ($localDir) {
                DB::table('gtfs_frequencies')->delete();
                DB::table('gtfs_stop_times')->delete();
                DB::table('gtfs_transfers')->delete();
                DB::table('gtfs_trips')->delete();
                DB::table('gtfs_routes')->delete();
                DB::table('gtfs_calendars')->delete();
                DB::table('gtfs_stops')->delete();
                $this->processStops($localDir . '/stops.txt');
                $this->processRoutes($localDir . '/routes.txt');
                $this->processTrips($localDir . '/trips.txt');
                $this->processStopTimes($localDir . '/stop_times.txt');
                $this->processOptionalFile($localDir . '/transfers.txt', 'transfers');
                $this->processOptionalFile($localDir . '/calendar.txt', 'calendar');
                $this->processOptionalFile($localDir . '/frequencies.txt', 'frequencies');
                $this->processShapes($localDir . '/shapes.txt');
            });

            return [
                'status' => 'success',
                'message' => 'GTFS static berhasil disimpan sebagai snapshot yang dapat dipakai route planner.',
                'data_source' => 'GTFS_STATIC',
                'processed_stops' => DB::table('gtfs_stops')->count(),
                'processed_routes' => DB::table('gtfs_routes')->count(),
                'processed_trips' => DB::table('gtfs_trips')->count(),
                'processed_stop_times' => DB::table('gtfs_stop_times')->count(),
                'processed_transfers' => DB::table('gtfs_transfers')->count(),
            ];
        } catch (\Throwable $e) {
            Log::error('GTFS ingestion failed: ' . $e->getMessage());
            return ['status' => 'error', 'message' => $e->getMessage(), 'data_source' => 'GTFS_STATIC'];
        }
    }

    private function processStops(string $file): void
    {
        $this->readCsv($file, function (array $data) {
            $stopId = trim($data['stop_id'] ?? '');
            $name = trim($data['stop_name'] ?? '');
            $lat = (float)($data['stop_lat'] ?? 0);
            $lon = (float)($data['stop_lon'] ?? 0);
            if ($stopId === '' || $name === '' || $lat == 0.0 || $lon == 0.0) return;

            DB::table('gtfs_stops')->insert([
                'stop_id' => $stopId, 'stop_code' => $this->nullable($data['stop_code'] ?? null),
                'stop_name' => $name, 'stop_desc' => $this->nullable($data['stop_desc'] ?? null),
                'stop_lat' => $lat, 'stop_lon' => $lon,
                'parent_station' => $this->nullable($data['parent_station'] ?? null),
                'location_type' => $this->nullableInt($data['location_type'] ?? null),
                'wheelchair_boarding' => $this->nullableInt($data['wheelchair_boarding'] ?? null),
                'created_at' => now(), 'updated_at' => now(),
            ]);

            $station = Station::updateOrCreate(['code' => 'TJ_' . $stopId], [
                'name' => $name, 'operator' => 'TransJakarta', 'line_color' => '#ea580c',
                'latitude' => $lat, 'longitude' => $lon, 'address' => 'Halte TransJakarta',
            ]);
            if (DB::getDriverName() === 'pgsql') {
                DB::statement('UPDATE gtfs_stops SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE stop_id = ?', [$lon, $lat, $stopId]);
                DB::statement('UPDATE stations SET location = ST_SetSRID(ST_MakePoint(?, ?), 4326) WHERE id = ?', [$lon, $lat, $station->id]);
            }
        });
    }

    private function processRoutes(string $file): void
    {
        $this->readCsv($file, function (array $data) {
            $routeId = trim($data['route_id'] ?? '');
            if ($routeId === '') return;
            DB::table('gtfs_routes')->insert([
                'route_id' => $routeId, 'agency_id' => $this->nullable($data['agency_id'] ?? null),
                'route_short_name' => $this->nullable($data['route_short_name'] ?? null),
                'route_long_name' => $this->nullable($data['route_long_name'] ?? null),
                'route_type' => $this->nullableInt($data['route_type'] ?? null),
                'route_color' => $this->normalizeColor($data['route_color'] ?? null),
                'route_text_color' => $this->normalizeColor($data['route_text_color'] ?? null),
                'created_at' => now(), 'updated_at' => now(),
            ]);
        });
    }

    private function processTrips(string $file): void
    {
        $this->readCsv($file, function (array $data) {
            $tripId = trim($data['trip_id'] ?? '');
            $routeId = trim($data['route_id'] ?? '');
            if ($tripId === '' || $routeId === '') return;
            DB::table('gtfs_trips')->insert([
                'trip_id' => $tripId, 'route_id' => $routeId,
                'service_id' => $this->nullable($data['service_id'] ?? null),
                'trip_headsign' => $this->nullable($data['trip_headsign'] ?? null),
                'trip_short_name' => $this->nullable($data['trip_short_name'] ?? null),
                'direction_id' => $this->nullableInt($data['direction_id'] ?? null),
                'shape_id' => $this->nullable($data['shape_id'] ?? null),
                'created_at' => now(), 'updated_at' => now(),
            ]);
        });
    }

    private function processStopTimes(string $file): void
    {
        $buffer = [];
        $flush = function () use (&$buffer) {
            if ($buffer !== []) { DB::table('gtfs_stop_times')->insert($buffer); $buffer = []; }
        };
        $this->readCsv($file, function (array $data) use (&$buffer, $flush) {
            $tripId = trim($data['trip_id'] ?? ''); $stopId = trim($data['stop_id'] ?? '');
            if ($tripId === '' || $stopId === '') return;
            $buffer[] = [
                'trip_id' => $tripId, 'stop_id' => $stopId, 'stop_sequence' => (int)($data['stop_sequence'] ?? 0),
                'arrival_time' => $this->nullable($data['arrival_time'] ?? null), 'departure_time' => $this->nullable($data['departure_time'] ?? null),
                'stop_headsign' => $this->nullable($data['stop_headsign'] ?? null),
                'pickup_type' => $this->nullableInt($data['pickup_type'] ?? null), 'drop_off_type' => $this->nullableInt($data['drop_off_type'] ?? null),
                'shape_dist_traveled' => $this->nullableFloat($data['shape_dist_traveled'] ?? null),
                'created_at' => now(), 'updated_at' => now(),
            ];
            if (count($buffer) >= 1000) $flush();
        });
        $flush();
    }

    private function processOptionalFile(string $file, string $type): void
    {
        if (!is_file($file)) return;
        $buffer = [];
        $flush = function () use (&$buffer, $type) {
            if ($buffer !== []) { DB::table($type === 'calendar' ? 'gtfs_calendars' : 'gtfs_' . $type)->insert($buffer); $buffer = []; }
        };
        $this->readCsv($file, function (array $data) use (&$buffer, $type, $flush) {
            if ($type === 'transfers') {
                if (empty($data['from_stop_id']) || empty($data['to_stop_id'])) return;
                $buffer[] = ['from_stop_id' => trim($data['from_stop_id']), 'to_stop_id' => trim($data['to_stop_id']), 'transfer_type' => $this->nullableInt($data['transfer_type'] ?? null), 'min_transfer_time' => $this->nullableInt($data['min_transfer_time'] ?? null), 'created_at' => now(), 'updated_at' => now()];
            } elseif ($type === 'calendar') {
                if (empty($data['service_id'])) return;
                $row = ['service_id' => trim($data['service_id'])];
                foreach (['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as $day) $row[$day] = (int)($data[$day] ?? 0) === 1;
                $row['start_date'] = $this->formatGtfsDate($data['start_date'] ?? null); $row['end_date'] = $this->formatGtfsDate($data['end_date'] ?? null);
                $row['created_at'] = now(); $row['updated_at'] = now(); $buffer[] = $row;
            } else {
                if (empty($data['trip_id'])) return;
                $buffer[] = ['trip_id' => trim($data['trip_id']), 'start_time' => trim($data['start_time'] ?? ''), 'end_time' => trim($data['end_time'] ?? ''), 'headway_secs' => (int)($data['headway_secs'] ?? 0), 'exact_times' => $this->nullableInt($data['exact_times'] ?? null), 'created_at' => now(), 'updated_at' => now()];
            }
            if (count($buffer) >= 1000) $flush();
        });
        $flush();
    }

    private function processShapes(string $file): void
    {
        if (!is_file($file)) return;
        $grouped = [];
        $this->readCsv($file, function (array $data) use (&$grouped) {
            $shape = trim($data['shape_id'] ?? ''); $lat = (float)($data['shape_pt_lat'] ?? 0); $lon = (float)($data['shape_pt_lon'] ?? 0);
            if ($shape === '' || $lat == 0.0 || $lon == 0.0) return;
            $grouped[$shape][(int)($data['shape_pt_sequence'] ?? 0)] = [$lon, $lat];
        });
        $shapeToRoute = DB::table('gtfs_trips')->whereNotNull('shape_id')->pluck('route_id', 'shape_id')->all();
        $routeCoordinates = [];
        foreach ($grouped as $shape => $points) {
            ksort($points); $routeId = $shapeToRoute[$shape] ?? null;
            if ($routeId && (!isset($routeCoordinates[$routeId]) || count($points) > count($routeCoordinates[$routeId]))) $routeCoordinates[$routeId] = array_values($points);
        }
        foreach ($routeCoordinates as $routeId => $coords) {
            $meta = DB::table('gtfs_routes')->where('route_id', $routeId)->first(); if (!$meta) continue;
            TransitRoute::updateOrCreate(['route_id' => $routeId], ['agency_id' => $meta->agency_id, 'route_short_name' => $meta->route_short_name ?: $routeId, 'route_long_name' => $meta->route_long_name ?: $routeId, 'route_type' => $meta->route_type ?: 3, 'route_color' => $meta->route_color ?: '#ea580c', 'route_text_color' => $meta->route_text_color ?: '#ffffff', 'coordinates' => $coords]);
        }
    }

    private function readCsv(string $file, callable $callback): void
    {
        $handle = fopen($file, 'r'); if (!$handle) return;
        $headers = fgetcsv($handle); if (!$headers) { fclose($handle); return; }
        $headers[0] = preg_replace('/^\xEF\xBB\xBF/', '', $headers[0]);
        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) < count($headers)) $row = array_pad($row, count($headers), null);
            $callback(array_combine($headers, array_slice($row, 0, count($headers))));
        }
        fclose($handle);
    }

    private function nullable(?string $value): ?string { $value = $value !== null ? trim($value) : ''; return $value === '' ? null : $value; }
    private function nullableInt(?string $value): ?int { return $value === null || trim($value) === '' ? null : (int)$value; }
    private function nullableFloat(?string $value): ?float { return $value === null || trim($value) === '' ? null : (float)$value; }
    private function normalizeColor(?string $value): ?string { $value = $this->nullable($value); return $value === null ? null : (str_starts_with($value, '#') ? $value : '#' . $value); }
    private function formatGtfsDate(?string $value): ?string { $value = $this->nullable($value); return $value === null || strlen($value) !== 8 ? null : substr($value, 0, 4) . '-' . substr($value, 4, 2) . '-' . substr($value, 6, 2); }
}
