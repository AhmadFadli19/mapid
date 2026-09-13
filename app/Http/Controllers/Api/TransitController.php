<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Journey;
use App\Models\Station;
use App\Services\GtfsRealtimeService;
use App\Services\JourneyPersistenceService;
use App\Services\TransitRoutePlannerService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class TransitController extends Controller
{
    public function planRoute(Request $request, TransitRoutePlannerService $planner, JourneyPersistenceService $persistence)
    {
        [$origin, $destination] = $this->resolveStations($request);
        if (!$origin || !$destination) return $this->unavailable('Stasiun asal dan tujuan harus berasal dari data stasiun/koordinat yang valid.');

        $plan = $planner->plan($origin, $destination, $this->nullableFloat($request->input('dest_lat')), $this->nullableFloat($request->input('dest_lon')));
        if (!$plan) return $this->unavailable('Data GTFS belum menyediakan perjalanan yang menghubungkan kombinasi ini.');

        $journey = $persistence->create($plan, $request->user()?->id);
        $plan['journey_id'] = $journey->id;
        $plan['journey_status'] = $journey->status;
        $plan['data_source'] = 'GTFS_STATIC';
        if ($journey->user_id === null) $plan['guest_token'] = $journey->guest_token;
        return response()->json(['status' => 'success', 'data' => $plan], 201);
    }

    public function createJourney(Request $request, TransitRoutePlannerService $planner, JourneyPersistenceService $persistence)
    {
        return $this->planRoute($request, $planner, $persistence);
    }

    public function getJourney(Request $request, Journey $journey, GtfsRealtimeService $realtime)
    {
        $this->ensureOwnership($request, $journey);
        $stored = $journey->route_payload ?: [];
        $route = $stored['route'] ?? $stored;
        $intelligence = $stored['transit_intelligence'] ?? [];
        $realtimeStatus = $realtime->statusForJourney($journey);
        $intelligence['journey_monitoring'] = $realtimeStatus;
        $intelligence['arrival_reminder'] = $realtimeStatus['arrival_reminder'];
        return response()->json(['status' => 'success', 'data' => [
            'journey_id' => $journey->id,
            'status' => $journey->status,
            'current_stage' => $journey->current_stage,
            'current_stop_id' => $journey->current_stop_id,
            'route' => $route,
            'transit_intelligence' => $intelligence,
            'timeline' => $journey->timelines,
            'data_source' => $journey->data_source,
            'data_quality' => $journey->data_quality,
            'last_synced_at' => $journey->last_synced_at?->toIso8601String(),
        ]]);
    }

    public function updateJourneyStage(Request $request, Journey $journey, JourneyPersistenceService $persistence)
    {
        $this->ensureOwnership($request, $journey);
        $validator = Validator::make($request->all(), [
            'current_stage' => 'required|string|max:100',
            'current_stop_id' => 'nullable|string|max:100',
            'delay_seconds' => 'nullable|integer',
            'last_position_lat' => 'nullable|numeric|between:-90,90',
            'last_position_lon' => 'nullable|numeric|between:-180,180',
            'status' => 'nullable|in:PLANNED,ONGOING,COMPLETED,CANCELLED',
        ]);
        if ($validator->fails()) return response()->json(['status' => 'error', 'message' => 'Stage journey tidak valid.', 'errors' => $validator->errors()], 422);
        $updated = $persistence->updateStage($journey, $validator->validated());
        return response()->json(['status' => 'success', 'data' => $updated]);
    }

    public function completeJourney(Request $request, Journey $journey)
    {
        $this->ensureOwnership($request, $journey);
        $journey->update(['status' => 'COMPLETED', 'current_stage' => 'COMPLETED', 'last_synced_at' => now()]);
        return response()->json(['status' => 'success', 'data' => $journey->fresh(['timelines'])]);
    }

    public function getRealtime(GtfsRealtimeService $realtime)
    {
        $data = $realtime->sync();
        return response()->json($data, ($data['status'] ?? 'unavailable') === 'success' ? 200 : 503);
    }

    private function resolveStations(Request $request): array
    {
        return [
            $this->resolveStation($request->input('origin_id'), $request->input('origin_lat'), $request->input('origin_lon')),
            $this->resolveStation($request->input('destination_id'), $request->input('dest_lat'), $request->input('dest_lon')),
        ];
    }

    private function resolveStation($id, $lat, $lon): ?Station
    {
        if ($id !== null && $id !== '') return Station::find($id);
        $lat = $this->nullableFloat($lat); $lon = $this->nullableFloat($lon);
        if ($lat === null || $lon === null) return null;
        $match = Station::query()->get()->map(fn (Station $station) => [$station, $this->distanceMeters($lat, $lon, $station->latitude, $station->longitude)])->filter(fn (array $item) => $item[1] <= 2000)->sortBy(fn (array $item) => $item[1])->first();
        return $match[0] ?? null;
    }

    private function nullableFloat($value): ?float { return $value === null || $value === '' ? null : (float)$value; }
    private function unavailable(string $message) { return response()->json(['status' => 'unavailable', 'message' => $message, 'data_source' => 'GTFS_STATIC'], 422); }
    private function ensureOwnership(Request $request, Journey $journey): void
    {
        $userId = $request->user()?->id;
        if ($journey->user_id !== null) {
            if (!$userId || (int)$journey->user_id !== (int)$userId) abort(403, 'Journey bukan milik pengguna ini.');
            return;
        }

        $guestToken = $request->header('X-Guest-Token') ?: $request->input('guest_token');
        if (!$guestToken || !$journey->guest_token || !hash_equals((string)$journey->guest_token, (string)$guestToken)) {
            abort(403, 'Guest journey token tidak valid.');
        }
    }
    private function distanceMeters(float $lat1, float $lon1, float $lat2, float $lon2): float { $dLat = deg2rad($lat2 - $lat1); $dLon = deg2rad($lon2 - $lon1); $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2; return 6371000 * 2 * atan2(sqrt($a), sqrt(1 - $a)); }
}
