<?php

namespace Tests\Feature;

use App\Models\User;
use Tests\TestCase;

class GtfsApiTest extends TestCase
{
    public function test_stations_geojson_endpoint()
    {
        $response = $this->getJson('/api/v1/stations');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'type',
                     'features' => [
                         '*' => [
                             'type',
                             'geometry' => ['type', 'coordinates'],
                             'properties' => ['id', 'code', 'name', 'operator', 'line_color']
                         ]
                     ]
                 ]);
    }

    public function test_routes_geojson_endpoint()
    {
        $response = $this->getJson('/api/v1/routes/geojson');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'type',
                     'features' => [
                         '*' => [
                             'type',
                             'geometry' => ['type', 'coordinates'],
                             'properties' => ['route_id', 'agency_id', 'route_short_name', 'route_long_name', 'color']
                         ]
                     ]
                 ]);
    }

    public function test_route_plan_endpoint()
    {
        $response = $this->postJson('/api/v1/route/plan', [
            'origin_lat' => -6.291098,
            'origin_lon' => 106.886348,
            'dest_lat' => -6.290173,
            'dest_lon' => 106.881172,
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'status',
                     'data' => [
                         'journey_id',
                         'route' => [
                             'origin',
                             'destination',
                             'distance_km',
                             'estimated_duration_minutes',
                             'total_fare',
                             'stepper_timeline',
                             'map' => [
                                 'type',
                                 'features' => [
                                     '*' => [
                                         'geometry' => ['type', 'coordinates'],
                                         'properties' => ['route_id', 'geometry_source'],
                                     ],
                                 ],
                             ],
                             'legs',
                             'intermediate_stations',
                             'total_transfers',
                             'data_source',
                         ],
                         'transit_intelligence' => [
                             'boarding_recommendation',
                             'arrival_reminder',
                         ]
                     ]
                 ]);
    }

    public function test_route_plan_returns_unavailable_for_unconnected_stations()
    {
        $response = $this->postJson('/api/v1/route/plan', [
            'origin_id' => 146,
            'destination_id' => 147,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('status', 'unavailable')
            ->assertJsonPath('data_source', 'GTFS_STATIC');
    }

    public function test_realtime_endpoint_is_explicit_when_feed_is_not_configured()
    {
        $response = $this->getJson('/api/v1/transit/realtime');

        $response->assertStatus(503)
            ->assertJsonPath('status', 'unavailable')
            ->assertJsonPath('data_source', 'GTFS_REALTIME');
    }

    public function test_non_admin_cannot_verify_community_reports()
    {
        $user = User::where('role_id', 2)->firstOrFail();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/community-reports/1/verify', ['status' => 'disetujui'])
            ->assertStatus(403)
            ->assertJsonPath('status', 'error');
    }

    public function test_guest_journey_requires_guest_token()
    {
        $response = $this->postJson('/api/v1/route/plan', [
            'origin_lat' => -6.291098,
            'origin_lon' => 106.886348,
            'dest_lat' => -6.290173,
            'dest_lon' => 106.881172,
        ])->assertStatus(201);

        $journeyId = $response->json('data.journey_id');
        $guestToken = $response->json('data.guest_token');

        $this->getJson("/api/v1/journeys/{$journeyId}")
            ->assertStatus(403);

        $this->withHeader('X-Guest-Token', $guestToken)
            ->getJson("/api/v1/journeys/{$journeyId}")
            ->assertStatus(200)
            ->assertJsonPath('data.journey_id', $journeyId);
    }
}
