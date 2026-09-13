<?php

namespace App\Services;

use App\Models\BoardingRecommendation;
use App\Models\GtfsStop;
use App\Models\GtfsTransfer;
use App\Models\GtfsTrip;
use App\Models\Station;
use App\Models\TransitRoute;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class TransitRoutePlannerService
{
    private const WALK_SPEED_MPS = 1.2;
    private const INITIAL_WAIT_SECONDS = 300;
    private const TRANSFER_BUFFER_SECONDS = 120;

    public function plan(Station $origin, Station $destination, ?float $destinationLat = null, ?float $destinationLon = null): ?array
    {
        $originStop = $this->resolveStop($origin);
        $destinationStop = $this->resolveStop($destination);
        if (!$originStop || !$destinationStop || $originStop->stop_id === $destinationStop->stop_id) return null;

        $candidateIds = array_values(array_unique(array_merge(
            [$originStop->stop_id, $destinationStop->stop_id],
            GtfsTransfer::query()->pluck('from_stop_id')->all(),
            GtfsTransfer::query()->pluck('to_stop_id')->all()
        )));
        $rideEdges = $this->buildRideEdges($candidateIds);
        $transferEdges = $this->buildTransferEdges($candidateIds);
        $path = $this->dijkstra($originStop->stop_id, $destinationStop->stop_id, $rideEdges, $transferEdges);
        if ($path === null) return null;

        $legs = [];
        $timeline = [[
            'step' => 1,
            'title' => "Berangkat dari {$origin->name}",
            'instruction' => 'Menuju titik naik berdasarkan stasiun/halte yang dipilih.',
            'transport_mode' => 'WALK',
            'latitude' => $origin->latitude,
            'longitude' => $origin->longitude,
            'status' => 'PENDING',
        ]];
        $intermediate = [];
        $transferInstructions = [];
        $totalWeightSeconds = 0;
        $rideCount = 0;
        $lastRideIndex = null;
        $pendingTransfer = null;
        $mapFeatures = [];

        foreach ($path as $edge) {
            $totalWeightSeconds += $edge['weight_seconds'];
            if ($edge['kind'] === 'transfer') {
                $pendingTransfer = $edge['name'];
                $transferInstructions[] = "Pindah moda di {$edge['name']}" . ($edge['min_transfer_time'] ? "; waktu minimum {$edge['min_transfer_time']} detik." : '.');
                $timeline[] = [
                    'step' => count($timeline) + 1,
                    'title' => "Transfer di {$edge['name']}",
                    'instruction' => "Ikuti akses perpindahan menuju moda berikutnya. Sumber: GTFS transfers.",
                    'transport_mode' => 'WALK',
                    'latitude' => $edge['latitude'],
                    'longitude' => $edge['longitude'],
                    'transfer_at' => $edge['name'],
                    'status' => 'PENDING',
                ];
                continue;
            }

            $rideCount++;
            $stops = $edge['stops'];
            foreach (array_slice($stops, 1, -1) as $stop) {
                $intermediate[$stop['id']] = $stop;
            }
            $mode = $this->modeForRouteType($edge['route_type'], $edge['agency_id']);
            $leg = [
                'mode' => $mode,
                'operator' => $edge['agency_id'],
                'route_id' => $edge['route_id'],
                'route_name' => $edge['route_name'],
                'color' => $edge['route_color'],
                'trip_id' => $edge['trip_id'],
                'stops' => $stops,
                'transfer_at' => $pendingTransfer,
                'duration_minutes' => (int)ceil($edge['duration_seconds'] / 60),
                'data_source' => 'GTFS_STATIC',
            ];
            $legs[] = $leg;
            $lastRideIndex = count($legs) - 1;
            $pendingTransfer = null;
            $timeline[] = [
                'step' => count($timeline) + 1,
                'title' => "Naik {$mode} · {$edge['route_name']}",
                'instruction' => "Naik {$edge['route_name']} dari {$stops[0]['name']} sampai {$stops[count($stops) - 1]['name']}.",
                'transport_mode' => $mode,
                'route_id' => $edge['route_id'],
                'route_name' => $edge['route_name'],
                'gtfs_stop_id' => $stops[0]['id'],
                'latitude' => $stops[0]['latitude'],
                'longitude' => $stops[0]['longitude'],
                'arrival_time' => $stops[count($stops) - 1]['arrival_time'],
                'departure_time' => $stops[0]['departure_time'],
                'status' => 'PENDING',
            ];
            $mapFeatures[] = [
                'type' => 'Feature',
                'geometry' => ['type' => 'LineString', 'coordinates' => $this->geometryForLeg($edge['route_id'], $stops)],
                'properties' => ['route_id' => $edge['route_id'], 'route_name' => $edge['route_name'], 'color' => $edge['route_color'], 'mode' => $mode, 'operator' => $edge['agency_id'], 'geometry_source' => 'GTFS_SHAPE_OR_STOP_SEQUENCE'],
            ];
        }

        $exitRecommendation = $this->exitRecommendation($destination, $destinationLat, $destinationLon);
        $boarding = $this->boardingRecommendation($origin, $destination);
        $timeline[] = [
            'step' => count($timeline) + 1,
            'title' => "Tiba di {$destination->name}",
            'instruction' => 'Turun di stop tujuan dan lanjutkan ke akses keluar yang tersedia.',
            'transport_mode' => 'ARRIVE',
            'latitude' => $destination->latitude,
            'longitude' => $destination->longitude,
            'gtfs_stop_id' => $destinationStop->stop_id,
            'status' => 'PENDING',
        ];

        if ($exitRecommendation) {
            $timeline[] = [
                'step' => count($timeline) + 1,
                'title' => "Keluar melalui {$exitRecommendation['recommended_exit']}",
                'instruction' => $exitRecommendation['reason'],
                'transport_mode' => 'EXIT',
                'latitude' => $exitRecommendation['latitude'],
                'longitude' => $exitRecommendation['longitude'],
                'status' => 'PENDING',
            ];
        }

        if ($legs !== []) {
            $firstDeparture = $legs[0]['stops'][0]['departure_time'] ?? $legs[0]['stops'][0]['arrival_time'] ?? null;
            $totalWeightSeconds = max(0, $totalWeightSeconds - self::INITIAL_WAIT_SECONDS + $this->secondsUntilNextService($firstDeparture));
        }

        $route = [
            'origin' => $this->stationPayload($origin),
            'destination' => $this->stationPayload($destination),
            'origin_stop_id' => $originStop->stop_id,
            'destination_stop_id' => $destinationStop->stop_id,
            'legs' => $legs,
            'intermediate_stations' => array_values($intermediate),
            'total_duration_minutes' => (int)ceil($totalWeightSeconds / 60),
            'estimated_duration_minutes' => (int)ceil($totalWeightSeconds / 60),
            'total_transfers' => max(0, $rideCount - 1),
            'distance_km' => round($this->pathDistance($legs) / 1000, 2),
            'total_fare' => null,
            'stepper_timeline' => $timeline,
            'map' => ['type' => 'FeatureCollection', 'features' => $mapFeatures],
            'data_source' => 'GTFS_STATIC',
            'last_updated' => $this->staticFeedTimestamp(),
        ];

        return [
            'route' => $route,
            'journey_plan' => [
                'origin_stop_id' => $originStop->stop_id,
                'destination_stop_id' => $destinationStop->stop_id,
                'first_trip_id' => $legs[0]['trip_id'] ?? null,
                'timeline' => $timeline,
            ],
            'transit_intelligence' => [
                'boarding_recommendation' => $boarding,
                'exit_recommendation' => $exitRecommendation,
                'arrival_reminder' => [
                    'status' => 'unavailable',
                    'message' => 'Posisi kendaraan GTFS Realtime belum tersedia untuk menghitung reminder.',
                    'data_source' => 'GTFS_REALTIME',
                    'last_updated' => null,
                ],
                'journey_monitoring' => [
                    'status' => 'unavailable',
                    'status_label' => 'Realtime belum tersedia',
                    'delay_seconds' => null,
                    'data_source' => 'GTFS_REALTIME',
                    'last_synced_at' => null,
                ],
                'transfer_assistant' => ['instructions' => $transferInstructions, 'data_source' => 'GTFS_STATIC'],
            ],
        ];
    }

    private function resolveStop(Station $station): ?GtfsStop
    {
        $codes = array_values(array_unique(array_filter([$station->code, preg_replace('/^TJ_/', '', $station->code)])));
        $stop = GtfsStop::query()->whereIn('stop_id', $codes)->orWhereIn('stop_code', $codes)->first();
        if ($stop) return $stop;

        $fullName = strtolower(trim($station->name));
        $shortName = strtolower(preg_replace('/^(stasiun|halte)\s+/i', '', $station->name));
        $namedStops = GtfsStop::query()
            ->whereRaw('LOWER(stop_name) = ?', [$fullName])
            ->orWhereRaw('LOWER(stop_name) = ?', [$shortName])
            ->get();
        $scheduledNamedStops = $namedStops->filter(fn (GtfsStop $candidate) => DB::table('gtfs_stop_times')->where('stop_id', $candidate->stop_id)->exists());
        if ($scheduledNamedStops->isNotEmpty()) $namedStops = $scheduledNamedStops;
        $stop = $namedStops->sortBy(fn (GtfsStop $candidate) => $this->distanceMeters($station->latitude, $station->longitude, $candidate->stop_lat, $candidate->stop_lon))->first();
        if ($stop) return $stop;

        $nearby = GtfsStop::query()
            ->whereBetween('stop_lat', [$station->latitude - 0.02, $station->latitude + 0.02])
            ->whereBetween('stop_lon', [$station->longitude - 0.02, $station->longitude + 0.02])
            ->get();
        return $nearby->sortBy(fn (GtfsStop $candidate) => $this->distanceMeters($station->latitude, $station->longitude, $candidate->stop_lat, $candidate->stop_lon))->first(fn (GtfsStop $candidate) => $this->distanceMeters($station->latitude, $station->longitude, $candidate->stop_lat, $candidate->stop_lon) <= 2000);
    }

    private function buildRideEdges(array $candidateIds): array
    {
        $pairs = DB::table('gtfs_stop_times as from_time')
            ->join('gtfs_stop_times as to_time', function ($join) {
                $join->on('from_time.trip_id', '=', 'to_time.trip_id')->whereColumn('from_time.stop_sequence', '<', 'to_time.stop_sequence');
            })
            ->whereIn('from_time.stop_id', $candidateIds)
            ->whereIn('to_time.stop_id', $candidateIds)
            ->select('from_time.trip_id', 'from_time.stop_id as from_stop_id', 'to_time.stop_id as to_stop_id')
            ->get();
        $edges = [];
        $tripRows = [];
        $tripIds = $pairs->pluck('trip_id')->unique()->values();
        $trips = GtfsTrip::query()->whereIn('trip_id', $tripIds)->get()->keyBy('trip_id');
        $routes = DB::table('gtfs_routes')->whereIn('route_id', $trips->pluck('route_id')->unique())->get()->keyBy('route_id');
        foreach ($pairs as $pair) {
            if (!isset($trips[$pair->trip_id])) continue;
            if (!isset($tripRows[$pair->trip_id])) $tripRows[$pair->trip_id] = DB::table('gtfs_stop_times as st')->join('gtfs_stops as s', 's.stop_id', '=', 'st.stop_id')->where('st.trip_id', $pair->trip_id)->orderBy('st.stop_sequence')->get(['st.*', 's.stop_name', 's.stop_lat', 's.stop_lon']);
            $rows = collect($tripRows[$pair->trip_id]);
            $from = $rows->firstWhere('stop_id', $pair->from_stop_id); $to = $rows->firstWhere('stop_id', $pair->to_stop_id);
            if (!$from || !$to || $from->stop_sequence >= $to->stop_sequence) continue;
            $duration = $this->timeSeconds($to->arrival_time ?: $to->departure_time) - $this->timeSeconds($from->departure_time ?: $from->arrival_time);
            if ($duration <= 0) continue;
            $route = $routes[$trips[$pair->trip_id]->route_id] ?? null;
            $edge = [
                'kind' => 'ride', 'to' => $pair->to_stop_id, 'trip_id' => $pair->trip_id,
                'route_id' => $trips[$pair->trip_id]->route_id, 'route_name' => trim(($route->route_short_name ?? '') . ' ' . ($route->route_long_name ?? '')),
                'agency_id' => $route->agency_id ?? 'Unknown operator', 'route_type' => $route->route_type ?? 3,
                'route_color' => $route->route_color ?? null, 'duration_seconds' => $duration,
                'weight_seconds' => $duration + self::INITIAL_WAIT_SECONDS,
                'stops' => $rows->filter(fn ($row) => $row->stop_sequence >= $from->stop_sequence && $row->stop_sequence <= $to->stop_sequence)->map(fn ($row) => ['id' => $row->stop_id, 'name' => $row->stop_name, 'latitude' => (float)$row->stop_lat, 'longitude' => (float)$row->stop_lon, 'arrival_time' => $row->arrival_time, 'departure_time' => $row->departure_time])->values()->all(),
            ];
            $edges[$pair->from_stop_id][] = $edge;
        }
        foreach ($edges as $from => $list) {
            $best = [];
            foreach ($list as $edge) {
                $key = $edge['to'];
                if (!isset($best[$key]) || $edge['weight_seconds'] < $best[$key]['weight_seconds']) $best[$key] = $edge;
            }
            $edges[$from] = array_values($best);
        }
        return $edges;
    }

    private function buildTransferEdges(array $candidateIds): array
    {
        $edges = [];
        $stops = GtfsStop::query()->whereIn('stop_id', $candidateIds)->get()->keyBy('stop_id');
        foreach (GtfsTransfer::query()->whereIn('from_stop_id', $candidateIds)->whereIn('to_stop_id', $candidateIds)->get() as $transfer) {
            if ((int)$transfer->transfer_type === 3) continue;
            $from = $stops[$transfer->from_stop_id] ?? null; $to = $stops[$transfer->to_stop_id] ?? null;
            if (!$from || !$to) continue;
            $seconds = max((int)($transfer->min_transfer_time ?? 0), self::TRANSFER_BUFFER_SECONDS);
            $edge = ['kind' => 'transfer', 'to' => $transfer->to_stop_id, 'name' => $to->stop_name, 'latitude' => (float)$to->stop_lat, 'longitude' => (float)$to->stop_lon, 'min_transfer_time' => $transfer->min_transfer_time, 'weight_seconds' => $seconds];
            $edges[$transfer->from_stop_id][] = $edge;
            if ((int)$transfer->transfer_type === 0) $edges[$transfer->to_stop_id][] = ['kind' => 'transfer', 'to' => $transfer->from_stop_id, 'name' => $from->stop_name, 'latitude' => (float)$from->stop_lat, 'longitude' => (float)$from->stop_lon, 'min_transfer_time' => $transfer->min_transfer_time, 'weight_seconds' => $seconds];
        }
        return $edges;
    }

    private function dijkstra(string $start, string $target, array $rideEdges, array $transferEdges): ?array
    {
        $dist = [$start => 0]; $previous = []; $queue = new \SplPriorityQueue(); $queue->setExtractFlags(\SplPriorityQueue::EXTR_BOTH); $queue->insert($start, 0);
        while (!$queue->isEmpty()) {
            $current = $queue->extract(); $node = $current['data']; $cost = -$current['priority'];
            if ($cost > ($dist[$node] ?? PHP_INT_MAX)) continue;
            if ($node === $target) break;
            foreach (array_merge($rideEdges[$node] ?? [], $transferEdges[$node] ?? []) as $edge) {
                $nextCost = $cost + $edge['weight_seconds'];
                if ($nextCost < ($dist[$edge['to']] ?? PHP_INT_MAX)) { $dist[$edge['to']] = $nextCost; $previous[$edge['to']] = ['from' => $node, 'edge' => $edge]; $queue->insert($edge['to'], -$nextCost); }
            }
        }
        if (!isset($dist[$target])) return null;
        $path = []; $node = $target;
        while ($node !== $start) { if (!isset($previous[$node])) return null; array_unshift($path, $previous[$node]['edge']); $node = $previous[$node]['from']; }
        return $path;
    }

    private function boardingRecommendation(Station $origin, Station $destination): ?array
    {
        $recommendation = BoardingRecommendation::query()->where('station_id', $origin->id)->where('destination_station_id', $destination->id)->first();
        if (!$recommendation) return null;
        return ['recommended_car' => $recommendation->car_number, 'reason' => $recommendation->reason, 'nearest_exit' => $recommendation->nearest_exit, 'walking_time_seconds' => $recommendation->walking_time_seconds, 'walking_distance_meters' => $recommendation->walking_distance_meters, 'analysis_method' => $recommendation->analysis_method ?: 'Rule-based spatial relationship', 'data_source' => 'MAPID_VERIFIED_DATA', 'last_updated' => $recommendation->updated_at?->toIso8601String()];
    }

    private function exitRecommendation(Station $destination, ?float $lat, ?float $lon): ?array
    {
        if ($lat === null || $lon === null) return null;
        $exit = $destination->exits()->get()->map(function ($item) use ($lat, $lon) { $item->distance_meters = $this->distanceMeters($lat, $lon, $item->latitude, $item->longitude); return $item; })->sortBy('distance_meters')->first();
        if (!$exit) return null;
        return ['recommended_exit' => $exit->gate_name, 'target_street' => $exit->target_street, 'reason' => "Jarak terpendek ke koordinat tujuan: {$exit->distance_meters} meter.", 'is_accessible' => (bool)$exit->is_accessible, 'analysis_method' => 'Haversine estimate; pedestrian routing unavailable', 'distance_meters' => round($exit->distance_meters, 1), 'latitude' => $exit->latitude, 'longitude' => $exit->longitude, 'data_source' => 'MAPID_VERIFIED_DATA', 'last_updated' => $exit->updated_at?->toIso8601String()];
    }

    private function stationPayload(Station $station): array { return ['id' => $station->id, 'code' => $station->code, 'name' => $station->name, 'operator' => $station->operator, 'latitude' => $station->latitude, 'longitude' => $station->longitude]; }
    private function geometryForLeg(string $routeId, array $stops): array
    {
        $fallback = array_map(fn ($stop) => [(float)$stop['longitude'], (float)$stop['latitude']], $stops);
        if (count($fallback) < 2) return $fallback;

        $route = TransitRoute::query()->where('route_id', $routeId)->first();
        $shape = $route?->coordinates;
        if (!is_array($shape) || count($shape) < 2) return $fallback;

        $start = $this->nearestShapeIndex($shape, $stops[0]);
        $end = $this->nearestShapeIndex($shape, $stops[count($stops) - 1]);
        if ($start === null || $end === null || $start === $end) return $fallback;

        if ($start > $end) {
            $shape = array_reverse($shape);
            $start = count($shape) - 1 - $start;
            $end = count($shape) - 1 - $end;
        }

        $segment = array_values(array_slice($shape, $start, $end - $start + 1));
        if (count($segment) < 2) return $fallback;
        $segment[0] = $fallback[0];
        $segment[count($segment) - 1] = $fallback[count($fallback) - 1];
        return array_map(fn ($point) => [(float)$point[0], (float)$point[1]], $segment);
    }

    private function nearestShapeIndex(array $shape, array $stop): ?int
    {
        $nearestIndex = null;
        $nearestDistance = PHP_FLOAT_MAX;
        foreach ($shape as $index => $point) {
            if (!is_array($point) || count($point) < 2) continue;
            $distance = $this->distanceMeters((float)$stop['latitude'], (float)$stop['longitude'], (float)$point[1], (float)$point[0]);
            if ($distance < $nearestDistance) {
                $nearestDistance = $distance;
                $nearestIndex = $index;
            }
        }
        return $nearestIndex;
    }
    private function modeForRouteType(?int $type, ?string $agency): string { return match (true) { $agency === 'Tije' || (int)$type === 3 => 'TransJakarta', (int)$type === 1 => 'MRT', (int)$type === 2 => 'KRL', default => $agency ?: 'TRANSIT' }; }
    private function staticFeedTimestamp(): ?string { return DB::table('gtfs_stop_times')->max('updated_at'); }
    private function pathDistance(array $legs): float { $distance = 0.0; foreach ($legs as $leg) foreach (array_values($leg['stops']) as $index => $stop) if ($index > 0) { $previous = $leg['stops'][$index - 1]; $distance += $this->distanceMeters($previous['latitude'], $previous['longitude'], $stop['latitude'], $stop['longitude']); } return $distance; }
    private function timeSeconds(?string $value): int { if (!$value) return 0; [$hours, $minutes, $seconds] = array_pad(array_map('intval', explode(':', $value)), 3, 0); return ($hours * 3600) + ($minutes * 60) + $seconds; }
    private function secondsUntilNextService(?string $time): int
    {
        if (!$time) return self::INITIAL_WAIT_SECONDS;
        $now = now('Asia/Jakarta');
        $wait = $this->timeSeconds($time) - (($now->hour * 3600) + ($now->minute * 60) + $now->second);
        return $wait < 0 ? $wait + 86400 : $wait;
    }
    private function distanceMeters(float $lat1, float $lon1, float $lat2, float $lon2): float { $dLat = deg2rad($lat2 - $lat1); $dLon = deg2rad($lon2 - $lon1); $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2; return 6371000 * 2 * atan2(sqrt($a), sqrt(1 - $a)); }
}
