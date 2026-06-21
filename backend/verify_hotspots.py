import sys
import os

# Add the parent directory of this script to sys.path so 'app' package is importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_hotspots():
    print("Starting FastAPI TestClient (which executes Phase 2 startup including DBSCAN)...")
    
    with TestClient(app) as client:
        print("\n=== Testing GET /health ===")
        response = client.get("/health")
        print("Status Code:", response.status_code)
        print("JSON Response:", response.json())
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        
        print("\n=== Testing GET /api/hotspots/summary ===")
        response = client.get("/api/hotspots/summary")
        print("Status Code:", response.status_code)
        summary = response.json()
        print("JSON Response:")
        print("  total_hotspots:", summary.get("total_hotspots"))
        print("  critical_hotspots:", summary.get("critical_hotspots"))
        print("  high_hotspots:", summary.get("high_hotspots"))
        print("  medium_hotspots:", summary.get("medium_hotspots"))
        print("  low_hotspots:", summary.get("low_hotspots"))
        
        assert response.status_code == 200
        assert "total_hotspots" in summary
        assert "critical_hotspots" in summary
        
        print("\n=== Testing GET /api/hotspots ===")
        response = client.get("/api/hotspots")
        print("Status Code:", response.status_code)
        data = response.json()
        hotspots = data.get("hotspots", [])
        print(f"Total Hotspots returned: {len(hotspots)}")
        
        # Verify ranking order and values of top 3 hotspots
        print("\nTop 3 Hotspots details:")
        for hs in hotspots[:3]:
            print(f"  Rank {hs.get('rank')}: Cluster ID {hs.get('cluster_id')}")
            print(f"    Location (Lat/Lon): {hs.get('latitude')}, {hs.get('longitude')}")
            print(f"    Violations Count: {hs.get('violation_count')} (Severity: {hs.get('severity')})")
            print(f"    Unique Vehicles: {hs.get('unique_vehicles')}")
            print(f"    Unique Violation Types: {hs.get('unique_violation_types')}")
            print(f"    Unique Police Stations: {hs.get('police_stations')}")
            print()
            
        assert response.status_code == 200
        assert len(hotspots) == summary.get("total_hotspots")
        
        # Verify that they are sorted descending by violation_count
        counts = [h.get("violation_count") for h in hotspots]
        is_sorted_desc = all(counts[i] >= counts[i+1] for i in range(len(counts)-1))
        print("Is sorted descending by violation_count?", is_sorted_desc)
        assert is_sorted_desc, "Hotspots are not sorted descending by violation count!"
        
        # Verify rank field is sequential starting at 1
        ranks = [h.get("rank") for h in hotspots]
        expected_ranks = list(range(1, len(hotspots) + 1))
        assert ranks == expected_ranks, "Ranks are not sequential starting at 1!"
        print("Ranks are verified to be sequential starting at 1.")
        
        print("\nAll Phase 2 hotspots endpoints successfully verified!")

if __name__ == "__main__":
    test_hotspots()
