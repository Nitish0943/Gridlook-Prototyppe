# AI-Powered Parking Intelligence Platform - Full Implementation

This platform is a Smart City Parking Intelligence backend that handles data ingestion, temporal feature engineering, geospatial clustering (DBSCAN), parking disruption scoring, priority-based enforcement recommendations, and what-if digital twin simulations. It is built using Python 3.11, FastAPI, Pandas, NumPy, Scikit-Learn, and Pydantic.

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py           # Dependency injection helpers
│   │   ├── digital_twin.py   # Simulation endpoints (POST /simulate, GET /scenarios)
│   │   ├── endpoints.py      # Core endpoints (health, stats, info)
│   │   ├── hotspots.py       # Hotspots endpoints (GET /api/hotspots)
│   │   ├── impact.py         # Disruption impact endpoints (GET /api/impact)
│   │   └── recommendations.py# Recommendations endpoints (GET /api/recommendations)
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py         # Configs (peak hours, DBSCAN parameters)
│   ├── models/
│   │   ├── __init__.py
│   │   ├── digital_twin.py   # Digital twin Pydantic models
│   │   ├── hotspot.py        # Hotspot Pydantic models
│   │   ├── impact.py         # Impact Pydantic models
│   │   ├── recommendation.py # Recommendation Pydantic models
│   │   └── schemas.py        # Core analytics Pydantic models
│   ├── services/
│   │   ├── __init__.py
│   │   ├── data_loader.py    # CSV Ingestion & cleaning
│   │   ├── feature_eng.py    # Temporal feature extraction
│   │   ├── hotspot_engine.py # Geospatial clustering (DBSCAN)
│   │   ├── impact_engine.py  # Disruption calculation (Phase 3)
│   │   ├── recommendation_engine.py # Enforcement prioritization (Phase 4)
│   │   ├── digital_twin_engine.py   # What-if simulations (Phase 5)
│   │   └── statistics.py     # Summary stats aggregator
│   ├── utils/
│   │   ├── __init__.py
│   │   └── logger.py         # Logging configuration
│   ├── main.py               # Main lifespan manager & entrypoint
│   └── __init__.py
│
├── data/
│   └── violations.csv        # Parking violations dataset
│
├── requirements.txt          # Python dependencies
└── README.md                 # Project documentation
```

## Features Implemented

### Phase 1: Ingestion, Cleaning & Feature Engineering
- Ingests dataset from `data/violations.csv`.
- Resolves missing data representations (string `"NULL"`, `"None"` -> `pd.NA`).
- Extracts `hour`, `day`, `month`, `weekday`, `is_weekend`, and `is_peak_hour` (morning `7 AM - 11 AM` / evening `5 PM - 9 PM`).
- Precomputes general summary statistics (total violations, police stations, junctions, vehicle types, date range, and top violation types).

### Phase 2: Parking Hotspot Engine
- Cleans coordinates and executes BallTree/KDTree-based **DBSCAN** clustering (defaults: `eps=0.002` (~220m), `min_samples=10`).
- Computes centroid centers, severity level (`Low`, `Medium`, `High`, `Critical`), ranking, unique vehicles, unique violation types, and unique police stations count.

### Phase 3: Parking Disruption Impact Engine
- Quantifies traffic disruption at each junction.
- Computes the raw disruption score: `impact_score = 0.40 * F + 0.30 * P + 0.20 * R + 0.10 * D` (Frequency, Peak Hour, Repeat Offenders, Diversity).
- Normalizes scores using Min-Max scaling to `0 - 100`.

### Phase 4: Enforcement Recommendation Engine
- **Geospatial Mapping**: Determines the dominant hotspot cluster for each junction and extracts the hotspot severity.
- **Priority Scoring**: Computes the final normalized priority score:
  $$\text{priority\_score} = 0.60 \times \text{impact\_score} + 0.40 \times \text{hotspot\_score}$$
  Where `hotspot_score` is derived from the severity category: `Critical` -> 100, `High` -> 75, `Medium` -> 50, `Low` -> 25, No Hotspot -> 0.
- **Priority Category**: `81-100` -> Critical, `61-80` -> High, `31-60` -> Medium, `0-30` -> Low.
- **Officer Allocation & Reductions**: Allocates deployment sizes (`Critical` -> 3, `High` -> 2, `Medium` -> 1, `Low` -> 0) and projects violation/congestion reductions.
- **Circular Time Window**: Pinpoints the circular 3-consecutive-hour sliding window that contains the maximum parking violation count.

### Phase 5: Parking Digital Twin Simulation Engine
- **What-If Simulations**: Allows testing of enforcement strategies by simulating the effect of reducing violations by a custom percentage (e.g. 10%, 30%, 50%).
- **Truncted Integer Math**: Simulates new violations, impact scores, and congestion index using consistent floor division truncation logic:
  $$\text{after\_value} = \lfloor \text{before\_value} \times (1 - \text{reduction\_percentage} / 100) \rfloor$$
- **Congestion Index**: Estimates a congestion proxy index based directly on impact scores.
- **Junction-level & City-wide Aggregates**: Runs calculations across all hotspots/junctions and compiles a city-wide before-vs-after comparative summary.
- **Scenario Generator**: Precalculates comparative scenario reports for 10%, 20%, 30%, and 50% reductions.
- **AI Simulation Insight**: Generates context-aware insights summarizing the overall improvement.
- **Instant Latency**: Runs calculations dynamically on cached memory states in $O(N)$ time, responding instantly without re-running heavy DBSCAN models.

---

## Getting Started

### Prerequisites
- Python 3.11+ installed.

### Setup and Running

1. **Install Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

2. **Start the FastAPI Server**:
   From the `backend` directory, run:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   The interactive Swagger documentation will be available at [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs).

---

## API Testing Examples (Phase 5)

Below are standard API test requests using both `curl` and PowerShell `Invoke-RestMethod`.

### 1. Run Custom Simulation
Runs a custom what-if simulation for a specified violation reduction percentage.

* **Endpoint**: `POST /api/digital-twin/simulate`
* **curl**:
  ```bash
  curl -X POST http://127.0.0.1:8000/api/digital-twin/simulate \
       -H "Content-Type: application/json" \
       -d '{"reduction_percentage": 30}'
  ```
* **PowerShell**:
  ```powershell
  Invoke-RestMethod -Uri http://127.0.0.1:8000/api/digital-twin/simulate -Method Post -Body '{"reduction_percentage": 30}' -ContentType "application/json"
  ```
* **Response**:
  ```json
  {
    "city_summary": {
      "violations_before": 298450,
      "violations_after": 208915,
      "impact_before": 6,
      "impact_after": 4,
      "congestion_before": 6,
      "congestion_after": 4,
      "improvement_percentage": 30
    },
    "hotspots": [
      {
        "junction_name": "BTP051 - Safina Plaza Junction",
        "before_violations": 15449,
        "after_violations": 10814,
        "before_impact": 100,
        "after_impact": 70,
        "improvement_percentage": 30
      },
      ...
    ],
    "insight": "A 30% reduction in illegal parking could significantly reduce congestion in critical hotspots."
  }
  ```

### 2. Scenario Comparisons
Returns precalculated scenario reports for line charts, bar charts, and dashboard comparisons.

* **Endpoint**: `GET /api/digital-twin/scenarios`
* **curl**:
  ```bash
  curl -X GET http://127.0.0.1:8000/api/digital-twin/scenarios
  ```
* **PowerShell**:
  ```powershell
  Invoke-RestMethod -Uri http://127.0.0.1:8000/api/digital-twin/scenarios -Method Get
  ```
* **Response**:
  ```json
  [
    { "scenario": "10%", "impact_reduction": 10 },
    { "scenario": "20%", "impact_reduction": 20 },
    { "scenario": "30%", "impact_reduction": 30 },
    { "scenario": "50%", "impact_reduction": 50 }
  ]
  ```
