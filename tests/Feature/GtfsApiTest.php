<?php

namespace Tests\Feature;

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
            'origin_lat' => -6.193125,
            'origin_lon' => 106.822894,
            'dest_lat' => -6.244365,
            'dest_lon' => 106.798150,
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'data' => [
                         'route' => [
                             'origin',
                             'destination',
                             'distance_km',
                             'estimated_duration_minutes',
                             'total_fare',
                             'stepper_timeline'
                         ],
                         'transit_intelligence' => [
                             'boarding_recommendation',
                             'pedestrian_isochrone',
                             'huff_gravity_recommendations',
                             'arrival_reminder',
                         ]
                     ]
                 ]);
    }
}
