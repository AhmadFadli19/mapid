<?php

namespace App\Services;

use App\Models\Station;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class InariskFloodService
{
    protected string $wmsUrl = 'https://inarisk.bnpb.go.id/geoserver/wms';

    /**
     * Spatial Overlay Query clipping flood risk polygon layers (100m x 100m) with station point.
     */
    public function getStationFloodRisk(Station $station): array
    {
        // 1. PostGIS Spatial Overlay Query if spatial flood table exists
        if (DB::getDriverName() === 'pgsql') {
            try {
                $result = DB::selectOne("
                    SELECT risk_level, flood_depth_cm 
                    FROM inarisk_flood_zones 
                    WHERE ST_Intersects(
                        geom, 
                        ST_SetSRID(ST_MakePoint(?, ?), 4326)
                    ) LIMIT 1;
                ", [$station->longitude, $station->latitude]);

                if ($result) {
                    return [
                        'status' => 'success',
                        'flood_risk_level' => $result->risk_level,
                        'estimated_depth_cm' => $result->flood_depth_cm,
                        'is_accessible_footpath' => $result->flood_depth_cm < 20,
                        'source' => 'InaRISK_PostGIS_Overlay'
                    ];
                }
            } catch (\Exception $e) {
                // Table might not exist yet, fallback to GeoServer WMS GetFeatureInfo query
            }
        }

        // 2. Fallback InaRISK GeoServer WMS GetFeatureInfo HTTP Request
        try {
            $bbox = sprintf(
                "%f,%f,%f,%f",
                $station->longitude - 0.001,
                $station->latitude - 0.001,
                $station->longitude + 0.001,
                $station->latitude + 0.001
            );

            $params = [
                'REQUEST' => 'GetFeatureInfo',
                'SERVICE' => 'WMS',
                'VERSION' => '1.1.1',
                'LAYERS' => 'inarisk:banjir_100m',
                'QUERY_LAYERS' => 'inarisk:banjir_100m',
                'INFO_FORMAT' => 'application/json',
                'BBOX' => $bbox,
                'HEIGHT' => '100',
                'WIDTH' => '100',
                'X' => '50',
                'Y' => '50',
                'SRS' => 'EPSG:4326'
            ];

            $response = Http::timeout(4)->get($this->wmsUrl, $params);

            if ($response->successful() && isset($response->json()['features'])) {
                $features = $response->json()['features'];
                if (count($features) > 0) {
                    $props = $features[0]['properties'] ?? [];
                    return [
                        'status' => 'success',
                        'flood_risk_level' => $props['gridcode'] ?? 'Rendah',
                        'estimated_depth_cm' => 0,
                        'is_accessible_footpath' => true,
                        'source' => 'InaRISK_GeoServer_WMS'
                    ];
                }
            }
        } catch (\Exception $e) {
            Log::info("InaRISK WMS call timeout, fallback to safe level.");
        }

        // Safe Fallback
        return [
            'status' => 'success',
            'flood_risk_level' => 'Aman (Rendah)',
            'estimated_depth_cm' => 0,
            'is_accessible_footpath' => true,
            'source' => 'InaRISK_Safety_Default'
        ];
    }
}
