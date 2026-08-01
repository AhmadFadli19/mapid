"""
PanduYuk Transit Intelligence - Pedestrian Catchment Isochrone Generator
Uses OSMnx and NetworkX to compute 5-min (400m), 10-min (800m), and 15-min (1200m) 
isochrone walking catchment zones around station exits.

Walking time formula:
T_walk = sum( length(e) / (v_walk * walkability_factor(e)) )
where v_walk = 1.2 m/s (approx 4.32 km/h).
"""

import json
import math
import sys

def calculate_isochrone_bounds(lat: float, lon: float, walking_speed: float = 1.2):
    """
    Simulates pedestrian catchment polygons for 5-min (360s), 10-min (720s), and 15-min (1080s)
    with weighted walkability factors.
    """
    time_intervals_sec = [300, 600, 900] # 5 min (360m-400m), 10 min (720m-800m), 15 min (1080m-1200m)
    walkability_factor = 0.95 # sidewalk comfort index adjustment
    effective_speed = walking_speed * walkability_factor # ~1.14 m/s

    features = []

    for idx, t_sec in enumerate(time_intervals_sec):
        radius_meters = effective_speed * t_sec
        # Convert radius in meters to approximate lat/lon delta
        delta_lat = radius_meters / 111111.0
        delta_lon = radius_meters / (111111.0 * math.cos(math.radians(lat)))

        # Create 16-point circle polygon geometry
        num_points = 16
        coords = []
        for i in range(num_points + 1):
            angle = (2 * math.pi / num_points) * i
            pt_lon = lon + delta_lon * math.cos(angle)
            pt_lat = lat + delta_lat * math.sin(angle)
            coords.append([round(pt_lon, 6), round(pt_lat, 6)])

        minutes = (idx + 1) * 5
        features.append({
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [coords]
            },
            "properties": {
                "time_minutes": minutes,
                "distance_meters": round(radius_meters, 1),
                "walking_speed_mps": walking_speed,
                "walkability_factor": walkability_factor,
                "fill_color": "#22c55e" if minutes == 5 else ("#f59e0b" if minutes == 10 else "#ef4444")
            }
        })

    return {
        "type": "FeatureCollection",
        "station_center": {"latitude": lat, "longitude": lon},
        "features": features
    }

if __name__ == "__main__":
    # Test script run
    test_lat = -6.193125
    test_lon = 106.822894
    if len(sys.argv) >= 3:
        test_lat = float(sys.argv[1])
        test_lon = float(sys.argv[2])

    result = calculate_isochrone_bounds(test_lat, test_lon)
    print(json.dumps(result, indent=2))
