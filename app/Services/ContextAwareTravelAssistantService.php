<?php

namespace App\Services;

use App\Models\Station;
use Illuminate\Support\Carbon;

class ContextAwareTravelAssistantService
{
    protected BmkgWeatherService $weatherService;

    public function __construct(BmkgWeatherService $weatherService)
    {
        $this->weatherService = $weatherService;
    }

    /**
     * Generate explainable, context-aware travel recommendations.
     */
    public function generateRecommendation(Station $station, ?string $adm4Code = '31.71.03.1001', string $crowdLevel = 'MODERATE'): array
    {
        $weather = $this->weatherService->getWeatherByAdm4($adm4Code);
        $now = Carbon::now('Asia/Jakarta');
        $timeStr = $now->format('H:i');
        $isPeakHour = ($now->hour >= 7 && $now->hour <= 9) || ($now->hour >= 17 && $now->hour <= 19);

        $recommendations = [];

        // 1. Weather-Aware Action
        if ($weather['is_rainy']) {
            $recommendations[] = [
                'action_type' => 'Facility',
                'headline' => "Gunakan Koridor Skybridge Terhubung di {$station->name}",
                'reasoning' => "BMKG mendeteksi cuaca {$weather['weather_desc']} ({$weather['temperature']}°C). Gunakan jalur tertutup agar terhindar dari hujan.",
                'confidence' => 0.95
            ];
        }

        // 2. Crowding & Peak Hour Action
        if ($isPeakHour || $crowdLevel === 'HIGH') {
            $recommendations[] = [
                'action_type' => 'Boarding',
                'headline' => 'Naik dari Gerbong 2 atau Gerbong 7 (Ujung Peron)',
                'reasoning' => "Jam sibuk ({$timeStr}) dengan kepadatan {$crowdLevel}. Gerbong ujung peron memiliki tingkat okupansi 30% lebih leluasa dibanding gerbong 4 & 5.",
                'confidence' => 0.92
            ];
        } else {
            $recommendations[] = [
                'action_type' => 'Boarding',
                'headline' => 'Semua Gerbong Buka & Nyaman',
                'reasoning' => "Kepadatan stasiun saat ini Renggang-Normal. Estimasi kedatangan kereta 3 menit.",
                'confidence' => 0.88
            ];
        }

        // 3. Transfer / Exit Action
        $recommendations[] = [
            'action_type' => 'Exit',
            'headline' => "Gunakan Exit Gate A untuk Akses Trotoar & Guiding Block",
            'reasoning' => "Exit Gate A terhubung langsung dengan halte pengumpan dan fasilitas penyeberangan aman.",
            'confidence' => 0.90
        ];

        return [
            'status' => 'success',
            'station' => [
                'id' => $station->id,
                'name' => $station->name,
                'operator' => $station->operator
            ],
            'context' => [
                'time' => $timeStr,
                'is_peak_hour' => $isPeakHour,
                'weather' => $weather['weather_desc'],
                'temperature' => $weather['temperature'],
                'crowd_level' => $crowdLevel
            ],
            'explainable_ai_recommendations' => $recommendations
        ];
    }
}
