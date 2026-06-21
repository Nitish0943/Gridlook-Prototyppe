# SCITA API Reference Documentation

**Complete REST API Specification for Smart City Parking Intelligence Platform**

---

## Overview

The SCITA platform exposes a comprehensive REST API with 30+ endpoints for accessing parking analytics, hotspot detection, impact scoring, enforcement recommendations, simulations, and advanced analytics.

**Base URL**: `http://localhost:8000`  
**API Version**: 1.0  
**Content-Type**: `application/json`  
**Authentication**: Not required for development (implement OAuth2/JWT for production)

---

## Health & System Endpoints

### 1. System Health Check

```
GET /health
```

**Purpose**: Verify system status and dataset load state

**Response**:
```json
{
  "status": "healthy",
  "dataset_loaded": true
}
```

**Status Codes**:
- `200 OK` - System operational
- `503 Service Unavailable` - Dataset not loaded

**Example**:
```bash
curl http://localhost:8000/health
```

---

### 2. Analytics Statistics Summary

```
GET /api/stats
```

**Purpose**: Retrieve aggregated platform statistics

**Response**:
```json
{
  "total_violations": 13847,
  "total_police_stations": 45,
  "total_junctions": 312,
  "top_violation_types": [
    "Unauthorized Parking",
    "Parking in No Parking Zone",
    "Expired Parking"
  ]
}
```

**Query Parameters**: None

**Status Codes**:
- `200 OK` - Statistics retrieved
- `500 Internal Server Error` - Processing error

**Example**:
```bash
curl http://localhost:8000/api/stats
```

---

### 3. Dataset Information

```
GET /api/dataset-info
```

**Purpose**: Get dataset metadata and structure

**Response**:
```json
{
  "columns": [
    "id", "created_datetime", "closed_datetime", "latitude", 
    "longitude", "junction_name", "police_station", "vehicle_number",
    "vehicle_type", "violation_type"
  ],
  "row_count": 13847,
  "date_range": {
    "start": "2024-01-01T00:00:00",
    "end": "2024-03-31T23:59:59"
  }
}
```

**Status Codes**:
- `200 OK` - Dataset info retrieved

**Example**:
```bash
curl http://localhost:8000/api/dataset-info
```

---

## Hotspot Analytics Endpoints

### 4. List Parking Hotspots

```
GET /api/hotspots
```

**Purpose**: Retrieve DBSCAN-detected hotspots ranked by violation density

**Response**:
```json
{
  "hotspots": [
    {
      "cluster_id": 0,
      "rank": 1,
      "latitude": 28.6139,
      "longitude": 77.2090,
      "violation_count": 847,
      "severity": "Critical",
      "unique_vehicles": 312,
      "unique_violation_types": 8,
      "police_stations": ["Central District", "North Zone"],
      "junction_name": "Delhi High Court Junction"
    },
    {
      "cluster_id": 1,
      "rank": 2,
      "latitude": 28.5244,
      "longitude": 77.1855,
      "violation_count": 534,
      "severity": "High",
      "unique_vehicles": 198,
      "unique_violation_types": 6,
      "police_stations": ["South District"],
      "junction_name": "Safdarjung Tomb Junction"
    }
  ],
  "total_count": 28
}
```

**Query Parameters**: None

**Severity Levels**:
- `Critical`: >500 violations
- `High`: 201-500 violations
- `Medium`: 51-200 violations
- `Low`: ≤50 violations

**Status Codes**:
- `200 OK` - Hotspots retrieved
- `500 Internal Server Error` - Clustering error

**Example**:
```bash
curl http://localhost:8000/api/hotspots
```

---

### 5. Hotspots Summary

```
GET /api/hotspots/summary
```

**Purpose**: Get severity breakdown of all hotspots

**Response**:
```json
{
  "total_hotspots": 28,
  "critical_count": 3,
  "high_count": 8,
  "medium_count": 12,
  "low_count": 5,
  "average_violations_per_hotspot": 493.7
}
```

**Status Codes**:
- `200 OK` - Summary retrieved

**Example**:
```bash
curl http://localhost:8000/api/hotspots/summary
```

---

### 6. GIS Map Data (Optimized)

```
GET /api/map-data
```

**Purpose**: Retrieve optimized geospatial data for map visualization

**Response**:
```json
{
  "violations_sample": [
    {
      "latitude": 28.6139,
      "longitude": 77.2090,
      "junction_name": "Delhi High Court",
      "violation_count": 12
    }
  ],
  "heatmap_data": [
    [28.6139, 77.2090, 0.8],
    [28.5244, 77.1855, 0.6]
  ],
  "hotspots_markers": [
    {
      "lat": 28.6139,
      "lng": 77.2090,
      "name": "Hotspot 1",
      "severity": "Critical"
    }
  ]
}
```

**Data Optimization**:
- Violations downsampled to max 5,000 points
- Heatmap intensity normalized (0-1 range)
- Hotspots pre-clustered for UI performance

**Status Codes**:
- `200 OK` - Map data retrieved

**Example**:
```bash
curl http://localhost:8000/api/map-data
```

---

## Impact Score Endpoints

### 7. List Junction Impact Scores

```
GET /api/impact
```

**Purpose**: Retrieve disruption scores ranked by severity

**Response**:
```json
{
  "locations": [
    {
      "rank": 1,
      "junction_name": "Delhi High Court Junction",
      "impact_score": 92.5,
      "category": "Critical",
      "violations": 847,
      "peak_hour_violations": 512,
      "repeat_offenders": 89,
      "unique_violation_types": 8
    },
    {
      "rank": 2,
      "junction_name": "Safdarjung Intersection",
      "impact_score": 78.3,
      "category": "High",
      "violations": 534,
      "peak_hour_violations": 298,
      "repeat_offenders": 56,
      "unique_violation_types": 6
    }
  ],
  "total_locations": 312
}
```

**Impact Categories**:
- `Critical`: Score 81-100
- `High`: Score 61-80
- `Medium`: Score 31-60
- `Low`: Score 0-30

**Formula**:
```
impact = 0.40 × frequency + 0.30 × peak_hours 
       + 0.20 × repeat_offenders + 0.10 × diversity
```

**Status Codes**:
- `200 OK` - Impact data retrieved

**Example**:
```bash
curl http://localhost:8000/api/impact
```

---

### 8. Impact Summary

```
GET /api/impact/summary
```

**Purpose**: Citywide impact metrics overview

**Response**:
```json
{
  "total_locations": 312,
  "average_impact_score": 54.2,
  "critical_locations": 12,
  "high_locations": 34,
  "medium_locations": 128,
  "low_locations": 138,
  "highest_impact_junction": "Delhi High Court Junction",
  "highest_impact_score": 92.5
}
```

**Status Codes**:
- `200 OK` - Summary retrieved

**Example**:
```bash
curl http://localhost:8000/api/impact/summary
```

---

## Enforcement Recommendations Endpoints

### 9. Enforcement Recommendations

```
GET /api/recommendations
```

**Purpose**: Retrieve ranked officer deployment recommendations

**Response**:
```json
{
  "recommendations": [
    {
      "rank": 1,
      "junction_name": "Delhi High Court Junction",
      "priority_score": 94.2,
      "priority": "Critical",
      "officers": 3,
      "recommended_time_window": "08:00-11:00",
      "expected_violation_reduction": "40%",
      "expected_congestion_reduction": "35%",
      "reason": "Highest disruption score with peak-hour concentration"
    },
    {
      "rank": 2,
      "junction_name": "Safdarjung Intersection",
      "priority_score": 81.5,
      "priority": "High",
      "officers": 2,
      "recommended_time_window": "17:00-20:00",
      "expected_violation_reduction": "30%",
      "expected_congestion_reduction": "25%",
      "reason": "High evening peak hour violations"
    }
  ],
  "total_recommendations": 180
}
```

**Officer Allocation**:
- `Critical`: 3 officers
- `High`: 2 officers
- `Medium`: 1 officer
- `Low`: 0 officers (monitoring)

**Status Codes**:
- `200 OK` - Recommendations retrieved

**Example**:
```bash
curl http://localhost:8000/api/recommendations
```

---

### 10. Recommendations Summary

```
GET /api/recommendations/summary
```

**Purpose**: High-level recommendations overview

**Response**:
```json
{
  "total_recommendations": 180,
  "critical_zones": 12,
  "high_priority_zones": 34,
  "medium_priority_zones": 89,
  "total_officers_recommended": 247,
  "estimated_citywide_violation_reduction": "28%",
  "estimated_congestion_reduction": "22%",
  "high_impact_time_windows": ["08:00-11:00", "17:00-20:00"]
}
```

**Status Codes**:
- `200 OK` - Summary retrieved

**Example**:
```bash
curl http://localhost:8000/api/recommendations/summary
```

---

## Digital Twin Simulation Endpoints

### 11. Custom What-If Simulation

```
POST /api/digital-twin/simulate
```

**Purpose**: Run custom enforcement scenario simulation

**Request Body**:
```json
{
  "reduction_percentage": 30
}
```

**Parameters**:
| Parameter | Type | Range | Description |
|-----------|------|-------|-------------|
| reduction_percentage | integer | 0-100 | Violation reduction scenario % |

**Response**:
```json
{
  "scenario_name": "30% Violation Reduction",
  "city_summary": {
    "before": {
      "total_violations": 13847,
      "average_impact_score": 54.2,
      "total_congestion_amplification": 8234
    },
    "after": {
      "total_violations": 9693,
      "average_impact_score": 37.9,
      "total_congestion_amplification": 5764
    },
    "reduction": {
      "violations": 4154,
      "impact_score": 16.3,
      "congestion": 2470
    }
  },
  "hotspots": [
    {
      "junction_name": "Delhi High Court Junction",
      "violations_before": 847,
      "violations_after": 593,
      "violations_reduction": 254,
      "impact_before": 92.5,
      "impact_after": 64.8
    }
  ],
  "insight": "30% enforcement increase would reduce citywide disruption..."
}
```

**Status Codes**:
- `200 OK` - Simulation completed
- `400 Bad Request` - Invalid reduction_percentage
- `500 Internal Server Error` - Simulation error

**Example**:
```bash
curl -X POST http://localhost:8000/api/digital-twin/simulate \
  -H "Content-Type: application/json" \
  -d '{"reduction_percentage": 30}'
```

---

### 12. Pre-Calculated Scenarios

```
GET /api/digital-twin/scenarios
```

**Purpose**: Retrieve pre-calculated scenario benchmarks

**Response**:
```json
{
  "scenarios": [
    {
      "scenario_name": "10% Reduction",
      "reduction_percentage": 10,
      "violations_after": 12462,
      "violations_reduction": 1385,
      "impact_score_after": 48.8,
      "congestion_after": 7410
    },
    {
      "scenario_name": "20% Reduction",
      "reduction_percentage": 20,
      "violations_after": 11078,
      "violations_reduction": 2769,
      "impact_score_after": 43.4,
      "congestion_after": 6587
    },
    {
      "scenario_name": "30% Reduction",
      "reduction_percentage": 30,
      "violations_after": 9693,
      "violations_reduction": 4154,
      "impact_score_after": 37.9,
      "congestion_after": 5764
    },
    {
      "scenario_name": "50% Reduction",
      "reduction_percentage": 50,
      "violations_after": 6923,
      "violations_reduction": 6924,
      "impact_score_after": 27.1,
      "congestion_after": 4117
    }
  ]
}
```

**Status Codes**:
- `200 OK` - Scenarios retrieved

**Example**:
```bash
curl http://localhost:8000/api/digital-twin/scenarios
```

---

## Advanced Analytics Endpoints

### Spillover Analysis

#### 13. Spillover Zones

```
GET /api/spillover
```

**Response**:
```json
{
  "spillover_zones": [
    {
      "hotspot_id": 0,
      "junction_name": "Delhi High Court Junction",
      "spillover_score": 78.4,
      "nearby_violation_density": 0.045,
      "growth_rate": 0.12,
      "secondary_zones": [
        "Supreme Court Road",
        "Tilak Marg",
        "Rajendra Place"
      ],
      "risk_level": "High"
    }
  ]
}
```

#### 14. Spillover Summary

```
GET /api/spillover/summary
```

**Response**:
```json
{
  "total_spillover_zones": 28,
  "high_risk_zones": 8,
  "medium_risk_zones": 15,
  "low_risk_zones": 5,
  "average_spillover_score": 62.3,
  "secondary_zones_affected": 156
}
```

#### 15. Spillover Map Data

```
GET /api/spillover/map
```

**Response**: GIS coordinates and overlay data for spillover zones

---

### Road Capacity Loss

#### 16. Capacity Loss Analysis

```
GET /api/capacity-loss
```

**Response**:
```json
{
  "capacity_loss_data": [
    {
      "junction_name": "Delhi High Court Junction",
      "capacity_loss_percent": 48.2,
      "occupied_width": 24.1,
      "vehicle_count": 28,
      "congestion_amplification": 0.62,
      "risk": "Critical"
    }
  ]
}
```

#### 17. Capacity Loss Summary

```
GET /api/capacity-loss/summary
```

**Response**:
```json
{
  "total_junctions_analyzed": 312,
  "average_capacity_loss": 15.3,
  "critical_loss_junctions": 8,
  "high_loss_junctions": 28,
  "total_occupied_width_meters": 3847
}
```

#### 18. Capacity Loss Map

```
GET /api/capacity-loss/map
```

**Response**: GIS data for capacity loss visualization

---

### Economic Impact Analysis

#### 19. Economic Impact Data

```
GET /api/economic-impact
```

**Response**:
```json
{
  "economic_impact": [
    {
      "junction_name": "Delhi High Court Junction",
      "daily_loss": 84700,
      "weekly_loss": 592900,
      "monthly_loss": 2541000,
      "yearly_loss": 30492000,
      "category": "Critical",
      "cost_breakdown": {
        "fuel_waste": 8470,
        "travel_delay": 12705,
        "productivity_loss": 58900,
        "enforcement_cost": 4235
      }
    }
  ]
}
```

#### 20. Economic Summary

```
GET /api/economic-impact/summary
```

**Response**:
```json
{
  "citywide_daily_loss": 2847000,
  "citywide_yearly_loss": 1039155000,
  "critical_loss_locations": 12,
  "highest_loss_junction": "Delhi High Court Junction",
  "highest_loss_amount": 30492000
}
```

#### 21. Economic Trends

```
GET /api/economic-impact/trends
```

**Response**:
```json
{
  "weekly_trend": [
    {"week": 1, "loss": 2041500},
    {"week": 2, "loss": 2189700},
    {"week": 3, "loss": 2127300}
  ],
  "monthly_trend": [
    {"month": "January", "loss": 85410000},
    {"month": "February", "loss": 79823000},
    {"month": "March", "loss": 88245000}
  ]
}
```

#### 22. Economic Impact Map

```
GET /api/economic-impact/map
```

**Response**: GIS data for economic impact visualization

---

### Future Risk Forecasting

#### 23. Forecast Data

```
GET /api/forecast
```

**Response**:
```json
{
  "forecast_data": [
    {
      "junction_name": "Delhi High Court Junction",
      "predicted_violations_7d": 58,
      "predicted_violations_30d": 245,
      "predicted_violations_90d": 738,
      "future_risk_score": 78.5,
      "risk": "High",
      "growth_rate": 0.08
    }
  ]
}
```

#### 24. Forecast Summary

```
GET /api/forecast/summary
```

**Response**:
```json
{
  "high_risk_emerging_zones": 12,
  "critical_growth_rate": "8%",
  "total_predicted_violations_90d": 12384,
  "new_hotspots_emerging": 4,
  "emerging_zones": ["Zone A", "Zone B", "Zone C", "Zone D"]
}
```

#### 25. Forecast Trends

```
GET /api/forecast/trends
```

**Response**:
```json
{
  "daily_trend": [
    {"day": 1, "predicted": 154},
    {"day": 2, "predicted": 159}
  ],
  "weekly_trend": [
    {"week": 1, "predicted": 1078},
    {"week": 2, "predicted": 1124}
  ],
  "monthly_trend": [
    {"month": 1, "predicted": 4620},
    {"month": 2, "predicted": 4841},
    {"month": 3, "predicted": 5234}
  ]
}
```

#### 26. Forecast Map

```
GET /api/forecast/map
```

**Response**: GIS data for forecast zone visualization

---

### Peak Hour Analysis

#### 27. Peak Hour Data

```
GET /api/peak-hours
```

**Response**:
```json
{
  "peak_hours_data": [
    {
      "junction_name": "Delhi High Court Junction",
      "peak_hour_violations": 512,
      "off_peak_violations": 335,
      "peak_hour_ratio": 60.5,
      "severity": "High",
      "peak_hours": ["07:00-11:00", "17:00-21:00"]
    }
  ]
}
```

#### 28. Peak Hours Summary

```
GET /api/peak-hours/summary
```

**Response**:
```json
{
  "total_peak_violations": 8932,
  "total_off_peak_violations": 4915,
  "peak_ratio": 64.5,
  "critical_peak_hours": ["08:00", "09:00", "18:00", "19:00"],
  "lowest_violation_hour": "03:00"
}
```

#### 29. Peak Hours by Junction

```
GET /api/peak-hours/junction/{junction_id}
```

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| junction_id | string | Junction identifier |

**Response**: Junction-specific peak hour details with hourly breakdown

#### 30. Peak Hours Map

```
GET /api/peak-hours/map
```

**Response**: Hourly heatmap data for visualization

---

## Error Handling

### Error Response Format

```json
{
  "detail": "Error message describing what went wrong",
  "error_code": "ERROR_CODE",
  "timestamp": "2024-03-15T10:30:00Z"
}
```

### Common HTTP Status Codes

| Code | Meaning | Resolution |
|------|---------|-----------|
| 200 | OK | Request successful |
| 400 | Bad Request | Invalid parameters - review request |
| 404 | Not Found | Resource does not exist |
| 500 | Internal Server Error | Backend error - contact support |
| 503 | Service Unavailable | Dataset not loaded - check health endpoint |

---

## Rate Limiting & Performance

### Recommendations

**For Production**:
- Implement rate limiting: 100 requests/minute per client
- Cache responses: 5 minute stale time, 10 minute cache time
- Use pagination for large result sets (max 1,000 records per page)

**Response Times (Development)**:
- System endpoints: < 50ms
- Analytics endpoints: < 500ms
- Complex queries (forecast): < 1,000ms

---

## Authentication (Production)

**To implement OAuth2/JWT**:

1. Add Bearer token to request headers:
```bash
Authorization: Bearer <token>
```

2. Response format remains unchanged
3. Implement role-based endpoint access

---

## Usage Examples

### Python (Requests)
```python
import requests

BASE_URL = "http://localhost:8000"

# Get hotspots
response = requests.get(f"{BASE_URL}/api/hotspots")
hotspots = response.json()

# Run simulation
simulation = requests.post(
    f"{BASE_URL}/api/digital-twin/simulate",
    json={"reduction_percentage": 30}
)
results = simulation.json()
```

### cURL
```bash
# Get impact data
curl http://localhost:8000/api/impact | jq .

# Run simulation
curl -X POST http://localhost:8000/api/digital-twin/simulate \
  -H "Content-Type: application/json" \
  -d '{"reduction_percentage": 30}' | jq .
```

### JavaScript (Fetch)
```javascript
// Get recommendations
const response = await fetch('http://localhost:8000/api/recommendations');
const recommendations = await response.json();

// Run simulation
const simulation = await fetch(
  'http://localhost:8000/api/digital-twin/simulate',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reduction_percentage: 30 })
  }
);
const results = await simulation.json();
```

---

## Swagger Documentation

**Interactive API Documentation**:
Navigate to `http://localhost:8000/docs`

- Try endpoints directly from browser
- Auto-generated from Pydantic models
- Real-time validation
- Complete parameter documentation

