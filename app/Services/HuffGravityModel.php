<?php

namespace App\Services;

use App\Models\ExitGate;
use App\Models\StationTenant;
use Illuminate\Support\Collection;

class HuffGravityModel
{
    /**
     * Compute visit probabilities P_ij for tenants from a specific exit gate.
     * Formula: P_ij = (S_j^alpha / T_ij^beta) / sum_k(S_k^alpha / T_ik^beta)
     * alpha = 1.0 (Attractiveness), beta = 2.0 (Distance friction)
     */
    public function calculateProbabilities(ExitGate $exitGate, Collection $tenants, float $alpha = 1.0, float $beta = 2.0): array
    {
        if ($tenants->isEmpty()) {
            return [];
        }

        $gateLat = $exitGate->latitude;
        $gateLon = $exitGate->longitude;

        $utilities = [];
        $totalUtility = 0.0;

        foreach ($tenants as $tenant) {
            // Distance calculation
            $dLat = deg2rad($tenant->latitude - $gateLat);
            $dLon = deg2rad($tenant->longitude - $gateLon);
            $a = sin($dLat / 2) ** 2 + cos(deg2rad($gateLat)) * cos(deg2rad($tenant->latitude)) * sin($dLon / 2) ** 2;
            $c = 2 * atan2(sqrt($a), sqrt(1 - $a));
            $distanceMeters = max(10.0, 6371000.0 * $c);

            // Attractiveness score S_j
            $scoreS = $tenant->mission_type === 'MENU_GO' ? 90.0 : ($tenant->mission_type === 'STRUK_GO' ? 80.0 : 70.0);

            // Utility U_ij
            $utility = (pow($scoreS, $alpha)) / (pow($distanceMeters, $beta));
            $totalUtility += $utility;

            $utilities[] = [
                'tenant' => $tenant,
                'distance_meters' => round($distanceMeters, 1),
                'attractiveness_score' => $scoreS,
                'utility' => $utility
            ];
        }

        $results = [];
        foreach ($utilities as $item) {
            $prob = $totalUtility > 0 ? ($item['utility'] / $totalUtility) : 0.0;
            $percentage = round($prob * 100.0, 2);

            $results[] = [
                'tenant_id' => $item['tenant']->id,
                'tenant_name' => $item['tenant']->tenant_name,
                'mission_type' => $item['tenant']->mission_type,
                'price_avg' => $item['tenant']->price_avg,
                'distance_meters' => $item['distance_meters'],
                'probability_percentage' => $percentage,
                'recommendation' => $percentage > 40 ? 'Sangat Direkomendasikan' : ($percentage > 20 ? 'Direkomendasikan' : 'Pilihan Sekitar')
            ];
        }

        usort($results, fn($a, $b) => $b['probability_percentage'] <=> $a['probability_percentage']);
        return $results;
    }
}
