<?php

namespace App\Services;

use App\Models\Journey;
use App\Models\TransitRealtimeSnapshot;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class GtfsRealtimeService
{
    public function sync(): array
    {
        $url = trim((string)env('GTFS_RT_URL', ''));
        $fetchedAt = now();
        if ($url === '') {
            return ['status' => 'unavailable', 'message' => 'GTFS Realtime URL belum dikonfigurasi.', 'data_source' => 'GTFS_REALTIME', 'fetched_at' => null, 'records' => []];
        }

        try {
            $request = Http::timeout(15)->acceptJson();
            $apiKey = trim((string)env('GTFS_RT_API_KEY', ''));
            if ($apiKey !== '') $request = $request->withToken($apiKey);
            $response = $request->get($url);
            if (!$response->successful()) throw new \RuntimeException('Feed returned HTTP ' . $response->status());
            $payload = $response->json();
            if (!is_array($payload)) throw new \RuntimeException('Feed is protobuf/binary and no PHP protobuf decoder is installed.');

            $records = $this->normalize($payload, $fetchedAt->toIso8601String());
            TransitRealtimeSnapshot::query()->where('fetched_at', '<', now()->subHours(2))->delete();
            foreach ($records as $record) TransitRealtimeSnapshot::create($record);
            return ['status' => 'success', 'data_source' => $url, 'fetched_at' => $fetchedAt->toIso8601String(), 'records' => $records, 'record_count' => count($records)];
        } catch (\Throwable $e) {
            Log::warning('GTFS Realtime sync failed: ' . $e->getMessage());
            return ['status' => 'unavailable', 'message' => $e->getMessage(), 'data_source' => $url, 'fetched_at' => null, 'records' => []];
        }
    }

    public function statusForJourney(Journey $journey): array
    {
        $record = TransitRealtimeSnapshot::query()->where('trip_id', $journey->gtfs_trip_id)->latest('fetched_at')->first();
        $configured = trim((string)env('GTFS_RT_URL', '')) !== '';
        if (!$record) {
            return ['status' => $configured ? 'stale' : 'unavailable', 'service_status' => null, 'delay_seconds' => null, 'message' => $configured ? 'Belum ada snapshot realtime terbaru.' : 'Feed GTFS Realtime belum dikonfigurasi.', 'data_source' => 'GTFS_REALTIME', 'last_updated' => null, 'arrival_reminder' => ['status' => 'unavailable', 'message' => 'Posisi kendaraan belum tersedia untuk menghitung estimasi tiba.', 'data_source' => 'GTFS_REALTIME', 'last_updated' => null]];
        }

        $cacheSeconds = max(1, (int)env('GTFS_RT_CACHE_SECONDS', 15));
        $isStale = !$record->fetched_at || $record->fetched_at->lt(now()->subSeconds($cacheSeconds * 3));
        $status = $isStale ? 'stale' : 'live';
        $route = $journey->route_payload ?: [];
        $destination = $route['destination'] ?? [];
        $distance = null;
        if ($record->latitude !== null && $record->longitude !== null && isset($destination['latitude'], $destination['longitude'])) $distance = $this->distanceMeters($record->latitude, $record->longitude, (float)$destination['latitude'], (float)$destination['longitude']);
        $arrival = ['status' => $status, 'message' => $distance === null ? 'Jarak kendaraan ke tujuan belum dapat dihitung.' : "Jarak kendaraan ke {$destination['name']} sekitar " . round($distance) . ' meter.', 'distance_meters' => $distance === null ? null : round($distance, 1), 'delay_seconds' => $record->delay_seconds, 'data_source' => 'GTFS_REALTIME', 'last_updated' => $record->fetched_at?->toIso8601String()];
        return ['status' => $status, 'service_status' => $record->service_status, 'delay_seconds' => $record->delay_seconds, 'current_stop_id' => $record->current_stop_id, 'vehicle_id' => $record->vehicle_id, 'latitude' => $record->latitude, 'longitude' => $record->longitude, 'message' => $isStale ? 'Data realtime melewati batas kesegaran.' : 'Data realtime terbaru tersedia.', 'data_source' => 'GTFS_REALTIME', 'last_updated' => $record->fetched_at?->toIso8601String(), 'arrival_reminder' => $arrival];
    }

    private function normalize(array $payload, string $fetchedAt): array
    {
        $records = [];
        $entities = $payload['entity'] ?? $payload['entities'] ?? [];
        if (isset($payload['vehicle_positions'])) foreach ($payload['vehicle_positions'] as $item) $records[] = $this->record('vehicle_position', $item, $fetchedAt);
        if (isset($payload['trip_updates'])) foreach ($payload['trip_updates'] as $item) $records[] = $this->record('trip_update', $item, $fetchedAt);
        if (isset($payload['service_alerts'])) foreach ($payload['service_alerts'] as $item) $records[] = $this->record('service_alert', $item, $fetchedAt);
        foreach ($entities as $entity) {
            if (isset($entity['vehicle'])) $records[] = $this->record('vehicle_position', $entity['vehicle'], $fetchedAt);
            if (isset($entity['trip_update'])) $records[] = $this->record('trip_update', $entity['trip_update'], $fetchedAt);
            if (isset($entity['alert'])) $records[] = $this->record('service_alert', $entity['alert'], $fetchedAt);
        }
        return array_values(array_filter($records, fn ($record) => $record['trip_id'] || $record['record_type'] === 'service_alert'));
    }

    private function record(string $type, array $item, string $fetchedAt): array
    {
        $trip = $item['trip'] ?? $item['trip_update']['trip'] ?? [];
        $position = $item['position'] ?? [];
        $vehicle = $item['vehicle'] ?? [];
        $stopTime = $item['stop_time_update'][0] ?? $item['stop_time_updates'][0] ?? [];
        $delay = $item['delay_seconds'] ?? $item['delay'] ?? $stopTime['arrival']['delay'] ?? $stopTime['departure']['delay'] ?? null;
        return ['record_type' => $type, 'trip_id' => $trip['trip_id'] ?? $item['trip_id'] ?? null, 'vehicle_id' => $vehicle['id'] ?? $item['vehicle_id'] ?? null, 'current_stop_id' => $item['stop_id'] ?? $stopTime['stop_id'] ?? null, 'latitude' => isset($position['latitude']) ? (float)$position['latitude'] : (isset($item['latitude']) ? (float)$item['latitude'] : null), 'longitude' => isset($position['longitude']) ? (float)$position['longitude'] : (isset($item['longitude']) ? (float)$item['longitude'] : null), 'delay_seconds' => $delay === null ? null : (int)$delay, 'service_status' => $item['status'] ?? $item['service_status'] ?? 'ACTIVE', 'payload' => $item, 'fetched_at' => $fetchedAt, 'source' => env('GTFS_RT_URL')];
    }

    private function distanceMeters(float $lat1, float $lon1, float $lat2, float $lon2): float { $dLat = deg2rad($lat2 - $lat1); $dLon = deg2rad($lon2 - $lon1); $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2; return 6371000 * 2 * atan2(sqrt($a), sqrt(1 - $a)); }
}
