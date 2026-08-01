"""
PanduYuk Transit Intelligence - Huff Gravity Model for UMKM Attractiveness
Predicts the probability P_ij of a commuter visiting tenant j from exit gate i:

P_ij = (S_j^alpha / T_ij^beta) / sum_k(S_k^alpha / T_ik^beta)

where:
alpha = 1.0 (menu variety & attraction score)
beta = 2.0 (distance friction exponent)
"""

import json
import math
import sys

def calculate_huff_probabilities(exit_gate: dict, tenants: list, alpha: float = 1.0, beta: float = 2.0):
    gate_lat = exit_gate.get('latitude', -6.193125)
    gate_lon = exit_gate.get('longitude', 106.822894)

    attractiveness_scores = []
    total_utility = 0.0

    for tenant in tenants:
        t_lat = tenant.get('latitude', gate_lat)
        t_lon = tenant.get('longitude', gate_lon)

        # Haversine distance in meters (T_ij)
        d_lat = math.radians(t_lat - gate_lat)
        d_lon = math.radians(t_lon - gate_lon)
        a = (math.sin(d_lat / 2) ** 2 + 
             math.cos(math.radians(gate_lat)) * math.cos(math.radians(t_lat)) * math.sin(d_lon / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        distance_meters = max(10.0, 6371000.0 * c) # Minimum 10m to avoid div by 0

        # Menu variety / attractiveness score (S_j)
        score_s = float(tenant.get('attractiveness_score', 80.0))

        # Utility U_ij = (S_j^alpha) / (T_ij^beta)
        utility = (math.pow(score_s, alpha)) / (math.pow(distance_meters, beta))
        total_utility += utility

        attractiveness_scores.append({
            'tenant_id': tenant.get('id'),
            'tenant_name': tenant.get('tenant_name'),
            'mission_type': tenant.get('mission_type', 'MENU_GO'),
            'distance_meters': round(distance_meters, 1),
            'attractiveness_score_s': score_s,
            'raw_utility': utility
        })

    # Calculate final visit probabilities P_ij
    results = []
    for item in attractiveness_scores:
        prob = (item['raw_utility'] / total_utility) if total_utility > 0 else 0.0
        results.append({
            'tenant_id': item['tenant_id'],
            'tenant_name': item['tenant_name'],
            'mission_type': item['mission_type'],
            'distance_meters': item['distance_meters'],
            'probability_percentage': round(prob * 100.0, 2),
            'visit_recommendation': 'Sangat Direkomendasikan' if prob > 0.4 else ('Direkomendasikan' if prob > 0.2 else 'Pilihan Sekitar')
        })

    # Sort descending by probability
    results.sort(key=lambda x: x['probability_percentage'], reverse=True)
    return results

if __name__ == "__main__":
    test_exit = {'latitude': -6.193125, 'longitude': 106.822894}
    test_tenants = [
        {'id': 1, 'tenant_name': 'Kopi Kenangan MRT BHI', 'mission_type': 'MENU_GO', 'latitude': -6.193150, 'longitude': 106.822900, 'attractiveness_score': 90.0},
        {'id': 2, 'tenant_name': 'Indomaret Point Gate B', 'mission_type': 'STRUK_GO', 'latitude': -6.193400, 'longitude': 106.823200, 'attractiveness_score': 75.0},
        {'id': 3, 'tenant_name': 'Roti O Concourse Level', 'mission_type': 'MENU_GO', 'latitude': -6.194000, 'longitude': 106.824000, 'attractiveness_score': 85.0}
    ]

    res = calculate_huff_probabilities(test_exit, test_tenants)
    print(json.dumps(res, indent=2))
