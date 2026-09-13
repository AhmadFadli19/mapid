<?php

namespace App\Services;

use App\Models\Journey;
use App\Models\JourneyTimeline;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class JourneyPersistenceService
{
    public function create(array $plan, ?int $userId = null): Journey
    {
        $route = $plan['route'];
        $journeyPlan = $plan['journey_plan'];
        $finalStop = collect($route['legs'] ?? [])->last()['stops'] ?? [];
        $finalArrival = collect($finalStop)->last()['arrival_time'] ?? null;
        $estimatedArrival = $this->toDateTime($finalArrival) ?: now()->addMinutes((int)$route['total_duration_minutes']);
        $journey = DB::transaction(function () use ($plan, $route, $journeyPlan, $userId, $estimatedArrival) {
            $journey = Journey::create([
                'user_id' => $userId,
                'origin_station_id' => $route['origin']['id'],
                'destination_station_id' => $route['destination']['id'],
                'start_time' => now(),
                'estimated_arrival' => $estimatedArrival,
                'status' => 'PLANNED',
                'gtfs_trip_id' => $journeyPlan['first_trip_id'],
                'current_stage' => 'PLANNING',
                'data_source' => 'GTFS_STATIC',
                'data_quality' => 'STATIC_SCHEDULE',
                'route_payload' => $plan,
                'guest_token' => $userId ? null : (string)Str::uuid(),
            ]);

            foreach ($journeyPlan['timeline'] as $index => $step) {
                JourneyTimeline::create([
                    'journey_id' => $journey->id,
                    'step_order' => $index + 1,
                    'title' => $step['title'],
                    'instruction' => $step['instruction'],
                    'transport_mode' => $step['transport_mode'] ?? 'WALK',
                    'latitude' => $step['latitude'] ?? null,
                    'longitude' => $step['longitude'] ?? null,
                    'status' => $step['status'] ?? 'PENDING',
                    'station_id' => $step['station_id'] ?? null,
                    'gtfs_stop_id' => $step['gtfs_stop_id'] ?? null,
                    'route_id' => $step['route_id'] ?? null,
                    'route_name' => $step['route_name'] ?? null,
                    'arrival_time' => $this->toDateTime($step['arrival_time'] ?? null),
                    'departure_time' => $this->toDateTime($step['departure_time'] ?? null),
                    'transfer_at' => $step['transfer_at'] ?? null,
                ]);
            }

            return $journey;
        });

        return $journey->load(['originStation', 'destinationStation', 'timelines']);
    }

    public function updateStage(Journey $journey, array $values): Journey
    {
        $journey->fill([
            'current_stage' => $values['current_stage'],
            'current_stop_id' => $values['current_stop_id'] ?? $journey->current_stop_id,
            'delay_seconds' => $values['delay_seconds'] ?? $journey->delay_seconds,
            'last_position_lat' => $values['last_position_lat'] ?? $journey->last_position_lat,
            'last_position_lon' => $values['last_position_lon'] ?? $journey->last_position_lon,
            'last_synced_at' => now(),
            'status' => $values['status'] ?? ($journey->status === 'PLANNED' ? 'ONGOING' : $journey->status),
        ])->save();
        return $journey->fresh(['originStation', 'destinationStation', 'timelines']);
    }

    private function toDateTime(?string $time): mixed
    {
        if (!$time) return null;
        $parts = array_map('intval', explode(':', $time));
        if (count($parts) < 2) return null;
        $scheduled = now('Asia/Jakarta')->setTime($parts[0] % 24, $parts[1], $parts[2] ?? 0);
        if ($scheduled->isPast()) $scheduled->addDay();
        return $scheduled;
    }
}
