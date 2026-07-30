<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class MapidController extends Controller
{
    /**
     * Search Locations using OpenStreetMap API with Fallback to Local/Dummy Database
     */
    public function search(Request $request)
    {
        $query = $request->query('query', '');

        if (empty($query)) {
            return response()->json([
                'source' => 'none',
                'results' => []
            ]);
        }

        // 1. Try External OpenStreetMap Nominatim API
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'MAPID-Transit-Intelligence/1.0'
            ])->timeout(3)->get('https://nominatim.openstreetmap.org/search', [
                'q' => $query,
                'format' => 'json',
                'addressdetails' => 1,
                'limit' => 5,
                'countrycodes' => 'id'
            ]);

            if ($response->successful() && count($response->json()) > 0) {
                $externalData = collect($response->json())->map(function ($item) {
                    return [
                        'id' => $item['place_id'] ?? rand(100, 9999),
                        'name' => $item['display_name'],
                        'latitude' => (float)$item['lat'],
                        'longitude' => (float)$item['lon'],
                        'type' => $item['type'] ?? 'poi',
                        'operator' => 'OpenStreetMap'
                    ];
                });

                return response()->json([
                    'source' => 'external_api (OpenStreetMap)',
                    'results' => $externalData
                ]);
            }
        } catch (\Exception $e) {
            // Silently fallback to Dummy/Database
        }

        // 2. Fallback to Local Spatial Database / Seeded Dummy Data
        $localResults = DB::table('stations')
            ->where('name', 'LIKE', "%{$query}%")
            ->orWhere('operator', 'LIKE', "%{$query}%")
            ->get()
            ->map(function ($station) {
                return [
                    'id' => $station->id,
                    'name' => $station->name,
                    'latitude' => (float)$station->latitude,
                    'longitude' => (float)$station->longitude,
                    'type' => 'Station',
                    'operator' => $station->operator
                ];
            });

        return response()->json([
            'source' => 'local_database_dummy',
            'results' => $localResults
        ]);
    }

    /**
     * Get All Stations with Facilities and Live Status
     */
    public function getStations()
    {
        $stations = DB::table('stations')->get()->map(function ($station) {
            $facilities = DB::table('facilities')->where('station_id', $station->id)->get();
            $exits = DB::table('exits')->where('station_id', $station->id)->get();
            $boarding = DB::table('boarding_recommendations')->where('station_id', $station->id)->first();

            return [
                'id' => $station->id,
                'name' => $station->name,
                'code' => $station->code,
                'operator' => $station->operator,
                'line_color' => $station->line_color,
                'latitude' => (float)$station->latitude,
                'longitude' => (float)$station->longitude,
                'address' => $station->address,
                'facilities' => $facilities,
                'exits' => $exits,
                'boarding_recommendation' => $boarding
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $stations
        ]);
    }

    /**
     * Get Specific Station Profile (POI, Facilities, Accessibilities)
     */
    public function getStationProfile($id)
    {
        $station = DB::table('stations')->where('id', $id)->first();

        if (!$station) {
            return response()->json(['message' => 'Station not found'], 404);
        }

        $facilities = DB::table('facilities')->where('station_id', $id)->get();
        $exits = DB::table('exits')->where('station_id', $id)->get();
        $boarding = DB::table('boarding_recommendations')->where('station_id', $id)->first();
        $reports = DB::table('community_reports')->where('station_id', $id)->latest()->get();

        return response()->json([
            'station' => $station,
            'facilities' => $facilities,
            'exits' => $exits,
            'boarding_recommendation' => $boarding,
            'community_reports' => $reports
        ]);
    }

    /**
     * Smart Route Planning & Transit Intelligence Recommendation
     */
    public function planRoute(Request $request)
    {
        $originId = $request->query('origin_id');
        $destId = $request->query('destination_id');

        $origin = DB::table('stations')->where('id', $originId)->first();
        $destination = DB::table('stations')->where('id', $destId)->first();

        if (!$origin || !$destination) {
            // Pick default first two stations if not provided
            $origin = DB::table('stations')->first();
            $destination = DB::table('stations')->skip(1)->first();
        }

        $boardingRec = DB::table('boarding_recommendations')
            ->where('station_id', $destination->id ?? 1)
            ->first();

        return response()->json([
            'route' => [
                'origin' => $origin,
                'destination' => $destination,
                'estimated_duration_minutes' => 15,
                'total_fare' => 10000,
            ],
            'transit_intelligence' => [
                'boarding_recommendation' => $boardingRec ?? [
                    'recommended_car' => 'Gerbong 2 atau 3',
                    'reason' => 'Dekat dengan eskalator dan pintu keluar stasiun tujuan.',
                    'walking_time_seconds' => 90
                ],
                'arrival_reminder' => [
                    'trigger_distance_meters' => 500,
                    'message' => "Persiapan turun! Anda mendekati {$destination->name}."
                ],
                'transfer_assistant' => [
                    'instructions' => [
                        "1. Turun di Pintu Kiri {$destination->name}",
                        "2. Ikuti Guiding Block menuju Concourse Level",
                        "3. Gunakan Lift / Eskalator Utama Exit B"
                    ]
                ]
            ]
        ]);
    }

    /**
     * Submit Community Report for Live Station Condition
     */
    public function submitReport(Request $request)
    {
        $request->validate([
            'station_id' => 'required|exists:stations,id',
            'issue' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $id = DB::table('community_reports')->insertGetId([
            'user_id' => $request->user()?->id,
            'station_id' => $request->station_id,
            'facility_id' => $request->facility_id ?? null,
            'issue' => $request->issue,
            'description' => $request->description,
            'status' => 'Verified',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        return response()->json([
            'message' => 'Laporan komunitas berhasil dikirim!',
            'report_id' => $id
        ], 201);
    }
}
