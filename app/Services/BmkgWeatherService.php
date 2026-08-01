<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BmkgWeatherService
{
    /**
     * Get BMKG Weather Forecast with 30-minute Redis / Laravel Cache per ADM4 region code.
     * Prevents rate limit violations (60 req/min).
     */
    public function getWeatherByAdm4(string $adm4Code = '31.71.03.1001'): array
    {
        $cacheKey = "bmkg_weather_adm4_{$adm4Code}";

        return Cache::remember($cacheKey, 1800, function () use ($adm4Code) {
            try {
                $endpoint = "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={$adm4Code}";

                $response = Http::withHeaders([
                    'User-Agent' => 'PanduYuk-Transit-Intelligence/1.0'
                ])->timeout(5)->get($endpoint);

                if ($response->successful() && isset($response->json()['data'])) {
                    $data = $response->json()['data'][0]['cuaca'][0][0] ?? null;

                    if ($data) {
                        return [
                            'status' => 'success',
                            'source' => 'BMKG_Open_API',
                            'adm4' => $adm4Code,
                            'weather_desc' => $data['weather_desc'] ?? 'Berawan',
                            'temperature' => (float)($data['t'] ?? 28.5),
                            'humidity' => (int)($data['hu'] ?? 75),
                            'wind_speed' => (float)($data['ws'] ?? 10.5),
                            'is_rainy' => str_contains(strtolower($data['weather_desc'] ?? ''), 'hujan'),
                            'cached_until' => now()->addMinutes(30)->toDateTimeString()
                        ];
                    }
                }
            } catch (\Exception $e) {
                Log::warning("BMKG Weather API call failed for ADM4 {$adm4Code}: " . $e->getMessage());
            }

            // Fallback default weather response
            return [
                'status' => 'fallback',
                'source' => 'Static_Forecast_Fallback',
                'adm4' => $adm4Code,
                'weather_desc' => 'Berawan / Cerah Berawan',
                'temperature' => 29.0,
                'humidity' => 70,
                'wind_speed' => 8.0,
                'is_rainy' => false,
                'cached_until' => now()->addMinutes(30)->toDateTimeString()
            ];
        });
    }
}
