import sys
import os

# Add the parent directory of this script to sys.path so 'app' package is importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_digital_twin():
    print("Starting FastAPI TestClient (which executes Phase 5 startup pipeline)...")
    
    with TestClient(app) as client:
        print("\n=== Testing GET /health ===")
        response = client.get("/health")
        print("Status Code:", response.status_code)
        print("JSON Response:", response.json())
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        
        print("\n=== Testing GET /api/digital-twin/scenarios ===")
        response = client.get("/api/digital-twin/scenarios")
        print("Status Code:", response.status_code)
        scenarios = response.json()
        print("JSON Response:")
        for sc in scenarios:
            print(f"  Scenario {sc.get('scenario')}: Impact Reduction {sc.get('impact_reduction')}%")
            
        assert response.status_code == 200
        assert len(scenarios) == 4
        assert scenarios[0]["scenario"] == "10%"
        assert scenarios[2]["scenario"] == "30%"
        
        print("\n=== Testing POST /api/digital-twin/simulate ===")
        payload = {"reduction_percentage": 30}
        response = client.post("/api/digital-twin/simulate", json=payload)
        print("Status Code:", response.status_code)
        
        data = response.json()
        summary = data.get("city_summary", {})
        hotspots = data.get("hotspots", [])
        insight = data.get("insight", "")
        
        print("\nCity Summary Simulation Results:")
        print("  Violations (Before -> After):", summary.get("violations_before"), "->", summary.get("violations_after"))
        print("  Impact Score (Before -> After):", summary.get("impact_before"), "->", summary.get("impact_after"))
        print("  Congestion Index (Before -> After):", summary.get("congestion_before"), "->", summary.get("congestion_after"))
        print("  Improvement Percentage:", summary.get("improvement_percentage"), "%")
        
        # Verify integer truncation calculations
        v_before = summary.get("violations_before")
        v_after = summary.get("violations_after")
        expected_v_after = int(v_before * 0.7)
        print(f"  Verifying violations_after: Expected {expected_v_after}, Got {v_after}")
        assert v_after == expected_v_after, "violations_after calculation is incorrect!"
        
        imp_before = summary.get("impact_before")
        imp_after = summary.get("impact_after")
        expected_imp_after = int(imp_before * 0.7)
        print(f"  Verifying impact_after: Expected {expected_imp_after}, Got {imp_after}")
        assert imp_after == expected_imp_after, "impact_after calculation is incorrect!"
        
        print("\nAI Simulation Insight:")
        print(f"  '{insight}'")
        assert "30%" in insight or "30" in insight, "Insight text does not detail the correct reduction percentage!"
        
        print("\nTop 3 Hotspots/Junctions Simulation Details:")
        for h in hotspots[:3]:
            print(f"  Junction: {h.get('junction_name')}")
            print(f"    Violations: {h.get('before_violations')} -> {h.get('after_violations')}")
            print(f"    Impact Score: {h.get('before_impact')} -> {h.get('after_impact')}")
            print(f"    Junction Improvement: {h.get('improvement_percentage')}%")
            
            # Check hotspot level calculations
            assert h.get("after_violations") == int(h.get("before_violations") * 0.7), "Hotspot after_violations is incorrect!"
            assert h.get("after_impact") == int(h.get("before_impact") * 0.7), "Hotspot after_impact is incorrect!"
            
        assert response.status_code == 200
        assert len(hotspots) > 0
        
        print("\nAll Phase 5 digital twin simulation endpoints successfully verified!")

if __name__ == "__main__":
    test_digital_twin()
