import sys
import os

# Add the parent directory of this script to sys.path so 'app' package is importable
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi.testclient import TestClient
from app.main import app

def test_recommendations():
    print("Starting FastAPI TestClient (which executes Phase 4 startup pipeline)...")
    
    with TestClient(app) as client:
        print("\n=== Testing GET /health ===")
        response = client.get("/health")
        print("Status Code:", response.status_code)
        print("JSON Response:", response.json())
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"
        
        print("\n=== Testing GET /api/recommendations/summary ===")
        response = client.get("/api/recommendations/summary")
        print("Status Code:", response.status_code)
        summary = response.json()
        print("JSON Response:")
        print("  total_recommendations:", summary.get("total_recommendations"))
        print("  critical_zones:", summary.get("critical_zones"))
        print("  high_zones:", summary.get("high_zones"))
        print("  estimated_citywide_reduction:", summary.get("estimated_citywide_reduction"))
        
        assert response.status_code == 200
        assert "total_recommendations" in summary
        assert "critical_zones" in summary
        
        print("\n=== Testing GET /api/recommendations ===")
        response = client.get("/api/recommendations")
        print("Status Code:", response.status_code)
        data = response.json()
        recommendations = data.get("recommendations", [])
        print(f"Total recommendations returned: {len(recommendations)}")
        
        # Verify ranking order and values of top 3 recommendations
        print("\nTop 3 Enforcement Recommendations details:")
        for rec in recommendations[:3]:
            print(f"  Rank {rec.get('rank')}: Junction {rec.get('junction_name')}")
            print(f"    Priority Score: {rec.get('priority_score')} (Priority: {rec.get('priority')})")
            print(f"    Officers Recommended: {rec.get('officers')}")
            print(f"    Recommended Time Window: {rec.get('recommended_time_window')}")
            print(f"    Expected Violation Reduction: {rec.get('expected_violation_reduction')}%")
            print(f"    Expected Congestion Reduction: {rec.get('expected_congestion_reduction')}%")
            print(f"    AI Reason: {rec.get('reason')}")
            print()
            
        # Verify table-friendly dashboard fields are directly present
        print("Checking TanStack Table/Dashboard fields in top recommendation:")
        top_rec = recommendations[0]
        fields_to_check = [
            "junction_name", "priority", "officers", 
            "recommended_time_window", "expected_violation_reduction", "priority_score"
        ]
        for field in fields_to_check:
            print(f"  Presence of '{field}': {field in top_rec} (Value: {top_rec.get(field)})")
            assert field in top_rec, f"Field '{field}' is missing in recommendation details!"
            
        assert response.status_code == 200
        assert len(recommendations) == summary.get("total_recommendations")
        
        # Verify priority score is sorted descending
        scores = [r.get("priority_score") for r in recommendations]
        is_sorted_desc = all(scores[i] >= scores[i+1] for i in range(len(scores)-1))
        print("\nIs sorted descending by priority_score?", is_sorted_desc)
        assert is_sorted_desc, "Recommendations are not sorted descending by priority score!"
        
        # Verify rank field is sequential starting at 1
        ranks = [r.get("rank") for r in recommendations]
        expected_ranks = list(range(1, len(recommendations) + 1))
        assert ranks == expected_ranks, "Ranks are not sequential starting at 1!"
        print("Ranks are verified to be sequential starting at 1.")
        
        print("\nAll Phase 4 recommendations endpoints successfully verified!")

if __name__ == "__main__":
    test_recommendations()
