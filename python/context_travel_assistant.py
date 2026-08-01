"""
PanduYuk Transit Intelligence - Context-Aware Travel Assistant Engine
Rule-based & Explainable AI Engine for generating transparent, contextual action recommendations.
"""

import json
import sys
from datetime import datetime

def generate_context_recommendation(context: dict):
    user_lat = context.get('latitude', -6.193125)
    user_lon = context.get('longitude', 106.822894)
    station_name = context.get('station_name', 'Stasiun Bundaran HI')
    weather_desc = context.get('weather_desc', 'Hujan Ringan')
    is_rainy = context.get('is_rainy', True)
    crowd_level = context.get('crowd_level', 'HIGH') # LOW, MODERATE, HIGH
    time_str = context.get('time', datetime.now().strftime('%H:%M'))

    recommendations = []

    # Rule 1: Weather-Aware Recommendation
    if is_rainy or 'hujan' in weather_desc.lower():
        recommendations.append({
            'action_type': 'Facility',
            'headline': f'Gunakan Koridor Skybridge Terhubung di {station_name}',
            'reasoning': f'BMKG mendeteksi cuaca {weather_desc}. Menghindari area trotoar terbuka untuk kenyamanan perjalanan.',
            'confidence': 0.95
        })

    # Rule 2: Peak-Hour & Crowding Boarding Recommendation
    if crowd_level == 'HIGH':
        recommendations.append({
            'action_type': 'Boarding',
            'headline': 'Disarankan Masuk ke Gerbong 2 atau Gerbong 7',
            'reasoning': f'Status kepadatan stasiun saat ini Tinggi ({crowd_level}) pada jam {time_str}. Gerbong 2 & 7 memiliki okupansi 35% lebih rendah dibanding gerbong tengah.',
            'confidence': 0.92
        })
    else:
        recommendations.append({
            'action_type': 'Boarding',
            'headline': 'Semua Gerbong Beroperasi Normal',
            'reasoning': f'Kepadatan stasiun tergolong Rendah-Sedang ({crowd_level}). Waktu tunggu kereta sekitar 3-5 menit.',
            'confidence': 0.88
        })

    # Rule 3: Accessibility & Exit Recommendation
    recommendations.append({
        'action_type': 'Exit',
        'headline': 'Gunakan Exit Gate A dengan Lift Prioritas',
        'reasoning': 'Gate A terhubung langsung dengan halte pengumpan TransJakarta dan trotoar ber-guiding block.',
        'confidence': 0.90
    })

    return {
        'status': 'success',
        'station_name': station_name,
        'user_context': {
            'time': time_str,
            'weather': weather_desc,
            'crowd_level': crowd_level
        },
        'explainable_ai_output': recommendations
    }

if __name__ == "__main__":
    sample_context = {
        'latitude': -6.193125,
        'longitude': 106.822894,
        'station_name': 'Stasiun Bundaran HI',
        'weather_desc': 'Hujan Sedang',
        'is_rainy': True,
        'crowd_level': 'HIGH',
        'time': '17:45'
    }

    res = generate_context_recommendation(sample_context)
    print(json.dumps(res, indent=2))
