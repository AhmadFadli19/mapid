<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facility;
use App\Models\Station;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FacilityFinderController extends Controller
{
    public function search(Request $request)
    {
        $station = $request->query('station_id') ? Station::find($request->query('station_id')) : null;
        $lat = $station?->latitude ?? $this->floatOrNull($request->query('lat'));
        $lon = $station?->longitude ?? $this->floatOrNull($request->query('lon'));
        $radius = max(1, min(10000, (float)$request->query('radius_meters', 1500)));
        if ($lat === null || $lon === null) return response()->json(['status' => 'error', 'message' => 'Kirim station_id atau koordinat lat/lon yang valid.'], 422);
        if ($request->query('station_id') && !$station) return response()->json(['status' => 'error', 'message' => 'Stasiun tidak ditemukan.'], 404);

        $query = Facility::query()->with('station')->where('is_available', true)->whereNotNull('latitude')->whereNotNull('longitude');
        if (DB::getDriverName() === 'pgsql') {
            $point = 'ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography';
            $query->whereRaw("ST_DWithin(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, {$point}, ?)", [$lon, $lat, $radius])
                ->selectRaw("facilities.*, ST_Distance(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography, {$point}) AS distance_meters", [$lon, $lat]);
        }
        $category = $request->query('category');
        $accessibility = filter_var($request->query('accessibility', false), FILTER_VALIDATE_BOOLEAN);
        $search = strtolower(trim((string)$request->query('query', '')));
        $facilities = $query->get()->filter(function (Facility $facility) use ($category, $accessibility, $search) {
            if ($accessibility && !$facility->is_accessible) return false;
            if ($category && strtoupper($category) !== 'ALL' && strcasecmp($facility->category ?? '', $category) !== 0 && !($category === 'Accessibility' && $facility->is_accessible)) return false;
            if ($search !== '' && !str_contains(strtolower($facility->facility_name), $search) && !str_contains(strtolower($facility->category ?? ''), $search)) return false;
            return true;
        })->map(function (Facility $facility) use ($lat, $lon, $radius) {
            $distance = isset($facility->distance_meters) ? (float)$facility->distance_meters : $this->distanceMeters($lat, $lon, $facility->latitude, $facility->longitude);
            if ($distance > $radius) return null;
            return [
                'id' => $facility->id,
                'name' => $facility->facility_name,
                'category' => $facility->category,
                'floor' => $facility->floor,
                'is_available' => true,
                'is_accessible' => (bool)$facility->is_accessible,
                'status' => 'available',
                'status_note' => $facility->status_note ?: 'Tersedia menurut data terakhir.',
                'distance_meters' => round($distance, 1),
                'walking_time_seconds' => (int)ceil($distance / 1.2),
                'operating_hours' => $facility->operating_hours,
                'station' => $facility->station ? ['id' => $facility->station->id, 'name' => $facility->station->name] : null,
                'data_source' => 'MAPID_VERIFIED_DATA',
                'last_updated' => $facility->updated_at?->toIso8601String(),
            ];
        })->filter()->sortBy('distance_meters')->values();

        return response()->json(['status' => 'success', 'query' => ['latitude' => $lat, 'longitude' => $lon, 'radius_meters' => $radius], 'excluded_unavailable' => Facility::query()->where('is_available', false)->count(), 'facilities' => $facilities, 'data_source' => 'MAPID_VERIFIED_DATA']);
    }

    private function floatOrNull($value): ?float { return $value === null || $value === '' ? null : (float)$value; }
    private function distanceMeters(float $lat1, float $lon1, float $lat2, float $lon2): float { $dLat = deg2rad($lat2 - $lat1); $dLon = deg2rad($lon2 - $lon1); $a = sin($dLat / 2) ** 2 + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLon / 2) ** 2; return 6371000 * 2 * atan2(sqrt($a), sqrt(1 - $a)); }
}
