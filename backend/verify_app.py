import sys
import os

# Add the parent directory of this script to sys.path so 'app' package is importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_app():
    print("Starting FastAPI TestClient (which executes the startup lifespan)...")
    
    # Use TestClient in a with-block to trigger startup/shutdown lifespan events
    with TestClient(app) as client:
        print("\n=== Testing GET /health ===")
        response = client.get("/health")
        print("Status Code:", response.status_code)
        print("JSON Response:", response.json())
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        assert response.json()["dataset_loaded"] is True
        
        print("\n=== Testing GET /api/stats ===")
        response = client.get("/api/stats")
        print("Status Code:", response.status_code)
        data = response.json()
        print("JSON Response (parsed fields):")
        print("  total_violations:", data.get("total_violations"))
        print("  total_police_stations:", data.get("total_police_stations"))
        print("  total_junctions:", data.get("total_junctions"))
        print("  total_vehicle_types:", data.get("total_vehicle_types"))
        print("  date_range:", data.get("date_range"))
        print("  top_violation_types (top 3):", data.get("top_violation_types", [])[:3])
        
        assert response.status_code == 200
        assert "total_violations" in data
        assert "total_police_stations" in data
        
        print("\n=== Testing GET /api/dataset-info ===")
        response = client.get("/api/dataset-info")
        print("Status Code:", response.status_code)
        info_data = response.json()
        print("JSON Response (parsed fields):")
        print("  rows (number of records):", info_data.get("rows"))
        print("  columns count:", len(info_data.get("columns", [])))
        print("  columns list (first 10):", info_data.get("columns", [])[:10])
        print("  date_range:", info_data.get("date_range"))
        
        assert response.status_code == 200
        assert "columns" in info_data
        assert "rows" in info_data
        assert "date_range" in info_data
        print("\nAll endpoints returned valid responses successfully!")

if __name__ == "__main__":
    test_app()
