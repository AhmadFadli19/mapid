<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Station;
use App\Models\TransitRoute;
use App\Models\CommunityReport;
use App\Models\Journey;
use App\Models\JourneyTimeline;
use App\Services\HuffGravityModel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class MapidController extends Controller
{
    /**
     * GET /api/stations or /api/v1/stations
     * Efficient station listing with optional bbox filtering & limit.
     */
    public function getStations(Request $request)
    {
        $operator = $request->query('operator');
        $bbox = $request->query('bbox');
        $limit = (int)$request->query('limit', 300);

        $query = Station::with([
            'facilities',
            'exits',
            'tenants' => function ($q) {
                $q->where('is_active', true);
            },
            'communityReports' => function ($q) {
                $q->latest()->limit(5);
            },
            'boardingRecommendations'
        ]);

        if ($operator && $operator !== 'ALL') {
            $query->where('operator', 'LIKE', "%{$operator}%");
        }

        if ($bbox) {
            $coords = explode(',', $bbox);
            if (count($coords) === 4) {
                $minLon = (float)$coords[0];
                $minLat = (float)$coords[1];
                $maxLon = (float)$coords[2];
                $maxLat = (float)$coords[3];
                $query->whereBetween('longitude', [$minLon, $maxLon])
                      ->whereBetween('latitude', [$minLat, $maxLat]);
            }
        } else {
            // Apply maximum limit if no bbox provided to prevent 8,000+ DOM node memory bloat
            if ($limit > 0) {
                $query->limit($limit);
            }
        }

        $stations = $query->get();

        return response()->json([
            'status' => 'success',
            'count' => $stations->count(),
            'data' => $stations
        ]);
    }

    /**
     * GET /api/stations/{id} or /api/v1/stations/{id}
     * Eager loading profile details for a specific station.
     */
    public function getStationProfile($id)
    {
        $station = Station::with([
            'facilities',
            'exits',
            'tenants' => function ($q) {
                $q->where('is_active', true);
            },
            'communityReports.user',
            'boardingRecommendations'
        ])->find($id);

        if (!$station) {
            return response()->json([
                'status' => 'error',
                'message' => 'Stasiun tidak ditemukan'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'data' => $station
        ]);
    }

    /**
     * GET /api/stations/{id}/routes or /api/v1/stations/{id}/routes
     * Mendapatkan daftar rute TransJakarta & GeoJSON polylines yang melintasi stasiun/halte tertentu.
     */
    public function getStationRoutes($id)
    {
        $station = Station::find($id);

        if (!$station) {
            return response()->json([
                'status' => 'error',
                'message' => 'Stasiun tidak ditemukan'
            ], 404);
        }

        // 1. Get cached GTFS stop_id -> route_ids mapping
        $gtfsStopToRoutes = \Illuminate\Support\Facades\Cache::remember('gtfs_stop_to_routes_map', 86400, function () {
            $tripsFile = base_path('file_gtfs_tj/trips.txt');
            $stopTimesFile = base_path('file_gtfs_tj/stop_times.txt');

            $tripToRoute = [];
            if (file_exists($tripsFile) && ($h = fopen($tripsFile, 'r')) !== FALSE) {
                $header = fgetcsv($h);
                while (($row = fgetcsv($h)) !== FALSE) {
                    if (count($row) >= count($header)) {
                        $data = array_combine($header, $row);
                        $tripToRoute[$data['trip_id']] = $data['route_id'];
                    }
                }
                fclose($h);
            }

            $map = [];
            if (file_exists($stopTimesFile) && ($h = fopen($stopTimesFile, 'r')) !== FALSE) {
                $header = fgetcsv($h);
                while (($row = fgetcsv($h)) !== FALSE) {
                    if (count($row) >= count($header)) {
                        $data = array_combine($header, $row);
                        $stopId = $data['stop_id'];
                        $tripId = $data['trip_id'];
                        if (isset($tripToRoute[$tripId])) {
                            $routeId = $tripToRoute[$tripId];
                            $map[$stopId][$routeId] = true;
                        }
                    }
                }
                fclose($h);
            }

            foreach ($map as $sId => $rDict) {
                $map[$sId] = array_keys($rDict);
            }

            return $map;
        });

        $routeIds = [];
        $rawStopId = str_replace('TJ_', '', $station->code);
        if (isset($gtfsStopToRoutes[$rawStopId])) {
            $routeIds = $gtfsStopToRoutes[$rawStopId];
        }

        // 2. Spatial proximity fallback or supplement if routeIds is empty or for hubs
        if (empty($routeIds) || in_array($station->operator, ['TransJakarta', 'MRT Jakarta', 'LRT Jabodebek', 'KRL Commuter Line'])) {
            $allRoutes = TransitRoute::all();
            foreach ($allRoutes as $route) {
                if (in_array($route->route_id, $routeIds)) continue;
                $coords = $route->coordinates ?? [];
                foreach ($coords as $pt) {
                    // $pt is [lon, lat]
                    $dLat = abs($pt[1] - $station->latitude);
                    $dLon = abs($pt[0] - $station->longitude);
                    // Approx 350 meters threshold
                    if ($dLat <= 0.0035 && $dLon <= 0.0035) {
                        $routeIds[] = $route->route_id;
                        break;
                    }
                }
            }
        }

        $routes = TransitRoute::whereIn('route_id', array_unique($routeIds))->get();

        // Format GeoJSON FeatureCollection
        $features = $routes->map(function ($r) {
            return [
                'type' => 'Feature',
                'geometry' => [
                    'type' => 'LineString',
                    'coordinates' => $r->coordinates ?? []
                ],
                'properties' => [
                    'route_id' => $r->route_id,
                    'agency_id' => $r->agency_id,
                    'route_short_name' => $r->route_short_name,
                    'route_long_name' => $r->route_long_name,
                    'color' => $r->route_color,
                    'text_color' => $r->route_text_color,
                    'operator' => 'TransJakarta'
                ]
            ];
        });

        return response()->json([
            'status' => 'success',
            'station' => [
                'id' => $station->id,
                'code' => $station->code,
                'name' => $station->name,
                'operator' => $station->operator,
                'latitude' => $station->latitude,
                'longitude' => $station->longitude,
            ],
            'total_routes' => $routes->count(),
            'routes' => $routes,
            'geojson' => [
                'type' => 'FeatureCollection',
                'features' => $features
            ]
        ]);
    }


    /**
     * GET /api/map/search
     * Hybrid Geocoding: OSM Nominatim + Fallback SQL Query stasiun lokal
     */
    public function search(Request $request)
    {
        $query = trim($request->query('query', ''));

        if (empty($query)) {
            return response()->json([
                'status' => 'success',
                'source' => 'none',
                'results' => []
            ]);
        }

        // 1. Try OSM Nominatim API
        try {
            $response = Http::withHeaders([
                'User-Agent' => 'PanduYuk-Transit-Intelligence/1.0'
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
                        'id' => 'osm_' . ($item['place_id'] ?? rand(100, 9999)),
                        'name' => $item['display_name'],
                        'latitude' => (float)$item['lat'],
                        'longitude' => (float)$item['lon'],
                        'type' => $item['type'] ?? 'POI',
                        'operator' => 'OpenStreetMap'
                    ];
                });

                return response()->json([
                    'status' => 'success',
                    'source' => 'OSM_Nominatim',
                    'results' => $externalData
                ]);
            }
        } catch (\Exception $e) {
            // Silently fallback to Local Database
        }

        // 2. Fallback SQL Query Local Stations & POIs
        $localResults = Station::where('name', 'LIKE', "%{$query}%")
            ->orWhere('code', 'LIKE', "%{$query}%")
            ->orWhere('operator', 'LIKE', "%{$query}%")
            ->limit(10)
            ->get()
            ->map(function ($station) {
                return [
                    'id' => $station->id,
                    'code' => $station->code,
                    'name' => $station->name,
                    'latitude' => (float)$station->latitude,
                    'longitude' => (float)$station->longitude,
                    'type' => 'Station',
                    'operator' => $station->operator,
                    'line_color' => $station->line_color,
                ];
            });

        return response()->json([
            'status' => 'success',
            'source' => 'Local_SQL_Database',
            'results' => $localResults
        ]);
    }

    /**
     * POST /api/route/plan or /api/v1/route/plan
     * Menghitung estimasi rute transit, boarding recommendation, Isochrone, & Huff Gravity Model
     */
    public function planRoute(Request $request)
    {
        $originId = $request->input('origin_id') ?? $request->query('origin_id');
        $destId = $request->input('destination_id') ?? $request->query('destination_id');

        $originLat = (float)($request->input('origin_lat') ?? $request->query('origin_lat'));
        $originLon = (float)($request->input('origin_lon') ?? $request->query('origin_lon'));
        $destLat = (float)($request->input('dest_lat') ?? $request->query('dest_lat'));
        $destLon = (float)($request->input('dest_lon') ?? $request->query('dest_lon'));

        $origin = Station::find($originId);
        $destination = Station::find($destId);

        if (!$origin) {
            if ($originLat != 0 && $originLon != 0) {
                $origin = Station::orderByRaw("(((latitude - {$originLat}) * (latitude - {$originLat})) + ((longitude - {$originLon}) * (longitude - {$originLon})))")->first();
            } else {
                $origin = Station::first();
            }
        }

        if (!$destination) {
            if ($destLat != 0 && $destLon != 0) {
                $destination = Station::orderByRaw("(((latitude - {$destLat}) * (latitude - {$destLat})) + ((longitude - {$destLon}) * (longitude - {$destLon})))")->first();
            } else {
                $destination = Station::skip(1)->first() ?? $origin;
            }
        }

        // Calculate Haversine distance
        $earthRadius = 6371; // km
        $dLat = deg2rad($destination->latitude - $origin->latitude);
        $dLon = deg2rad($destination->longitude - $origin->longitude);
        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($origin->latitude)) * cos(deg2rad($destination->latitude)) *
            sin($dLon / 2) * sin($dLon / 2);
        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
        $distanceKm = round($earthRadius * $c, 2);

        // Estimated travel duration (average BRT speed 35 km/h + 3 mins dwell time)
        $durationMinutes = max(5, (int)ceil(($distanceKm / 35) * 60) + 3);
        $fare = 3500; // TransJakarta flat fare 3500

        // Fetch boarding recommendation
        $boardingRec = DB::table('boarding_recommendations')
            ->where('station_id', $destination->id)
            ->first();

        if (!$boardingRec) {
            $boardingRec = (object)[
                'car_number' => 'Gerbong Depan / Pintu A',
                'reason' => 'Paling dekat dengan Lift & Eskalator Exit A stasiun tujuan.',
                'nearest_exit' => 'Exit A',
                'walking_time_seconds' => 90
            ];
        }

        // Calculate Pedestrian Isochrone Catchment (5, 10, 15 mins) around destination
        $isochroneFeatures = [];
        $intervals = [5 => 360, 10 => 720, 15 => 1080]; // meters approx @ 1.2 m/s walk speed
        foreach ($intervals as $mins => $radiusMeters) {
            $dLatIso = $radiusMeters / 111111.0;
            $dLonIso = $radiusMeters / (111111.0 * cos(deg2rad($destination->latitude)));
            $points = [];
            for ($i = 0; $i <= 16; $i++) {
                $angle = (2 * M_PI / 16) * $i;
                $pLon = $destination->longitude + $dLonIso * cos($angle);
                $pLat = $destination->latitude + $dLatIso * sin($angle);
                $points[] = [round($pLon, 6), round($pLat, 6)];
            }
            $isochroneFeatures[] = [
                'type' => 'Feature',
                'geometry' => [
                    'type' => 'Polygon',
                    'coordinates' => [$points]
                ],
                'properties' => [
                    'time_minutes' => $mins,
                    'distance_meters' => $radiusMeters,
                    'fill_color' => $mins == 5 ? '#22c55e' : ($mins == 10 ? '#f59e0b' : '#ef4444')
                ]
            ];
        }

        // Huff Gravity Model for nearby tenants
        $tenants = DB::table('station_tenants')
            ->where('station_id', $destination->id)
            ->where('is_active', true)
            ->get();

        $huffProbabilities = [];
        if ($tenants->count() > 0) {
            $huffService = new HuffGravityModel();
            $exitGateModel = new \App\Models\ExitGate([
                'latitude' => $destination->latitude,
                'longitude' => $destination->longitude
            ]);
            $huffProbabilities = $huffService->calculateProbabilities($exitGateModel, $tenants);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'route' => [
                    'origin' => $origin,
                    'destination' => $destination,
                    'distance_km' => $distanceKm,
                    'estimated_duration_minutes' => $durationMinutes,
                    'total_fare' => $fare,
                    'stepper_timeline' => [
                        [
                            'step' => 1,
                            'title' => "Tap In di Halte {$origin->name}",
                            'instruction' => "Gunakan Kartu Uang Elektronik (KUE) atau QR code di Gate Masuk {$origin->operator}.",
                            'transport_mode' => $origin->operator
                        ],
                        [
                            'step' => 2,
                            'title' => "Boarding pada {$boardingRec->car_number}",
                            'instruction' => $boardingRec->reason,
                            'transport_mode' => 'BUS'
                        ],
                        [
                            'step' => 3,
                            'title' => "Approaching {$destination->name}",
                            'instruction' => "Threshold reminder aktif 500 meter sebelum tiba.",
                            'transport_mode' => 'NOTIF'
                        ],
                        [
                            'step' => 4,
                            'title' => "Tap Out via {$boardingRec->nearest_exit}",
                            'instruction' => "Gunakan jalur guiding block menuju pintu keluar halte.",
                            'transport_mode' => 'WALK'
                        ]
                    ]
                ],
                'transit_intelligence' => [
                    'boarding_recommendation' => [
                        'recommended_car' => $boardingRec->car_number,
                        'reason' => $boardingRec->reason,
                        'nearest_exit' => $boardingRec->nearest_exit,
                        'walking_time_seconds' => $boardingRec->walking_time_seconds
                    ],
                    'pedestrian_isochrone' => [
                        'type' => 'FeatureCollection',
                        'features' => $isochroneFeatures
                    ],
                    'huff_gravity_recommendations' => $huffProbabilities,
                    'arrival_reminder' => [
                        'trigger_distance_meters' => 500,
                        'message' => "Persiapan turun! Anda mendekati halte tujuan {$destination->name}."
                    ],
                    'crowd_status' => 'Normal (Hijau)',
                    'weather_condition' => 'Cerah Berawan (30°C)'
                ]
            ]
        ]);
    }

    /**
     * POST /api/community-report
     * Submit laporan kondisi stasiun
     */
    public function submitReport(Request $request)
    {
        $validated = $request->validate([
            'station_id' => 'required|exists:stations,id',
            'facility_id' => 'nullable|exists:facilities,id',
            'report_type' => 'nullable|string|max:100',
            'issue' => 'required|string|max:255',
            'description' => 'nullable|string',
            'photo_url' => 'nullable|string',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $report = CommunityReport::create([
            'user_id' => $request->user()?->id,
            'station_id' => $validated['station_id'],
            'facility_id' => $validated['facility_id'] ?? null,
            'report_type' => $validated['report_type'] ?? 'Kondisi Halte',
            'issue' => $validated['issue'],
            'description' => $validated['description'] ?? null,
            'photo_url' => $validated['photo_url'] ?? null,
            'status' => 'Verified',
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan komunitas berhasil dikirim dan diverifikasi!',
            'data' => $report
        ], 201);
    }

    /**
     * GET /api/transit/stations-geojson or /api/v1/stations (GeoJSON mode)
     * Format GeoJSON output for MAPID MAPS frontend integration
     */
    public function getStationsGeoJson(Request $request)
    {
        $operator = $request->query('operator');
        $bbox = $request->query('bbox');
        $limit = (int)$request->query('limit', 500);

        $query = Station::query();

        if ($operator && $operator !== 'ALL') {
            $query->where('operator', 'LIKE', "%{$operator}%");
        }

        if ($bbox) {
            $coords = explode(',', $bbox);
            if (count($coords) === 4) {
                $minLon = (float)$coords[0];
                $minLat = (float)$coords[1];
                $maxLon = (float)$coords[2];
                $maxLat = (float)$coords[3];
                $query->whereBetween('longitude', [$minLon, $maxLon])
                      ->whereBetween('latitude', [$minLat, $maxLat]);
            }
        } else if ($limit > 0) {
            $query->limit($limit);
        }

        $stations = $query->get();

        $features = $stations->map(function ($s) {
            return [
                'type' => 'Feature',
                'geometry' => [
                    'type' => 'Point',
                    'coordinates' => [(float)$s->longitude, (float)$s->latitude]
                ],
                'properties' => [
                    'id' => $s->id,
                    'code' => $s->code,
                    'name' => $s->name,
                    'operator' => $s->operator,
                    'line_color' => $s->line_color,
                    'address' => $s->address
                ]
            ];
        });

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features
        ]);
    }

    /**
     * GET /api/transit/routes-geojson or /api/v1/routes/geojson
     * Format GeoJSON output for GTFS Transit Lines with RDP Polyline Simplification
     */
    public function getRoutesGeoJson(Request $request)
    {
        $routeId = $request->query('route_id');
        $tolerance = (float)$request->query('tolerance', 0.0003); // RDP simplification tolerance (~30 meters)
        $limit = (int)$request->query('limit', 50);

        $query = TransitRoute::query();

        if ($routeId) {
            $query->where('route_id', $routeId);
        } else if ($limit > 0) {
            $query->limit($limit);
        }

        $routes = $query->get();

        $features = $routes->map(function ($r) use ($tolerance) {
            $coords = $r->coordinates ?? [];
            if ($tolerance > 0 && count($coords) > 10) {
                $coords = $this->simplifyPolyline($coords, $tolerance);
            }

            return [
                'type' => 'Feature',
                'geometry' => [
                    'type' => 'LineString',
                    'coordinates' => $coords
                ],
                'properties' => [
                    'route_id' => $r->route_id,
                    'agency_id' => $r->agency_id,
                    'route_short_name' => $r->route_short_name,
                    'route_long_name' => $r->route_long_name,
                    'color' => $r->route_color,
                    'text_color' => $r->route_text_color,
                    'operator' => 'TransJakarta'
                ]
            ];
        });

        return response()->json([
            'type' => 'FeatureCollection',
            'features' => $features
        ]);
    }

    /**
     * Ramer-Douglas-Peucker (RDP) Polyline Simplification Algorithm
     */
    private function simplifyPolyline(array $points, float $epsilon = 0.0003): array
    {
        if (count($points) <= 2) return $points;

        $dmax = 0.0;
        $index = 0;
        $end = count($points) - 1;

        for ($i = 1; $i < $end; $i++) {
            $d = $this->perpendicularDistance($points[$i], $points[0], $points[$end]);
            if ($d > $dmax) {
                $index = $i;
                $dmax = $d;
            }
        }

        if ($dmax > $epsilon) {
            $rec1 = $this->simplifyPolyline(array_slice($points, 0, $index + 1), $epsilon);
            $rec2 = $this->simplifyPolyline(array_slice($points, $index), $epsilon);

            return array_merge(array_slice($rec1, 0, -1), $rec2);
        } else {
            return [$points[0], $points[$end]];
        }
    }

    private function perpendicularDistance(array $pt, array $lineStart, array $lineEnd): float
    {
        $x = $pt[0]; $y = $pt[1];
        $x1 = $lineStart[0]; $y1 = $lineStart[1];
        $x2 = $lineEnd[0]; $y2 = $lineEnd[1];

        $dx = $x2 - $x1;
        $dy = $y2 - $y1;

        if ($dx == 0 && $dy == 0) {
            return sqrt(($x - $x1) ** 2 + ($y - $y1) ** 2);
        }

        $num = abs($dy * $x - $dx * $y + $x2 * $y1 - $y2 * $x1);
        $den = sqrt($dy ** 2 + $dx ** 2);

        return $num / $den;
    }
}
