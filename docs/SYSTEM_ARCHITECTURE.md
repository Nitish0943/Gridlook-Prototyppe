# SCITA System Architecture Documentation

**Enterprise Architecture for Smart City Parking & Traffic Analytics**

---

## System Overview

SCITA is a three-tier distributed architecture combining real-time data ingestion, multi-engine analytics processing, and executive-grade GIS visualization.

```
┌────────────────────────────────────────────────────────────────────┐
│                    PRESENTATION TIER                               │
│         Next.js 16 / React 19 / TypeScript / Tailwind CSS         │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐    │
│  │  Dashboard   │  Hotspots    │  Impact      │  Digital Twin│    │
│  │  Economic    │  Capacity    │  Forecast    │  Spillover   │    │
│  │  Peak Hours  │  Correlation │  Settings    │              │    │
│  └──────────────┴──────────────┴──────────────┴──────────────┘    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  GIS Rendering (Leaflet / Mapbox GL / React-Leaflet)   │    │
│  │  Charting (Recharts) | Data Tables (TanStack)           │    │
│  └──────────────────────────────────────────────────────────┘    │
└────────────────────────────────────────────────────────────────────┘
                              ↓
                        REST JSON APIs
                              ↓
┌────────────────────────────────────────────────────────────────────┐
│                    APPLICATION TIER                                │
│              FastAPI 0.110+ / Python 3.11+                         │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  CORE APIs          │  ANALYTICS APIs   │  SIMULATION     │     │
│  │  • Health Check     │  • Impact Score   │  • Digital Twin │     │
│  │  • Stats            │  • Recommendations│  • Scenarios    │     │
│  │  • Dataset Info     │  • Hotspots       │                 │     │
│  └──────────────────────────────────────────────────────────┘     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  ADVANCED ANALYTICS ENDPOINTS (6 Modules)               │     │
│  │  • Spillover Analysis   • Capacity Loss Estimation     │     │
│  │  • Economic Impact      • Forecast Engine              │     │
│  │  • Peak Hour Patterns   • GIS Map Data                 │     │
│  └──────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────┘
                              ↓
                   Dependency Injection
                              ↓
┌────────────────────────────────────────────────────────────────────┐
│                    ANALYTICS TIER                                  │
│         Data Processing & Machine Learning Engines                 │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  DATA INGESTION    │  FEATURE ENGINEERING              │     │
│  │  • CSV Loader      │  • Temporal Features              │     │
│  │  • Data Cleaner    │  • Hour, Day, Month, Weekday     │     │
│  │  • Deduplication   │  • Peak Hour Identification       │     │
│  └──────────────────────────────────────────────────────────┘     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  CORE ANALYTICS (4 Engines)                             │     │
│  │  • DBSCAN Hotspot Clustering                            │     │
│  │  • Impact Score Calculation                             │     │
│  │  • Enforcement Recommendations                          │     │
│  │  • What-If Digital Twin Simulation                      │     │
│  └──────────────────────────────────────────────────────────┘     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  ADVANCED ANALYTICS (6 Engines)                         │     │
│  │  • Spillover Detection          • Capacity Loss Analysis │     │
│  │  • Economic Impact Modeling     • Trend Forecasting     │     │
│  │  • Peak Hour Analysis           • GIS Processing        │     │
│  └──────────────────────────────────────────────────────────┘     │
│  ┌──────────────────────────────────────────────────────────┐     │
│  │  UTILITIES                                              │     │
│  │  • Statistics Aggregation  • Logging Framework          │     │
│  └──────────────────────────────────────────────────────────┘     │
└────────────────────────────────────────────────────────────────────┘
                              ↓
                       Data Pipeline
                              ↓
┌────────────────────────────────────────────────────────────────────┐
│                      DATA TIER                                     │
│              Parking Violations Dataset (CSV)                      │
│  • 13K+ Violation Records  • Spatial Coordinates                 │
│  • Temporal Metadata       • Vehicle & Police Info               │
└────────────────────────────────────────────────────────────────────┘
```

---

## Backend Architecture

### Startup Initialization Pipeline

**Application Lifespan Management** (`app/main.py`):

```
FastAPI Startup Sequence:
1. Load Dataset (CSV → Pandas DataFrame)
   └─ data_loader.py: Raw data ingestion & null handling

2. Feature Engineering (Raw DF → Processed DF)
   └─ feature_eng.py: Extract hour, day, month, weekday, is_weekend, is_peak_hour

3. Calculate Summary Statistics
   └─ statistics.py: Total violations, police stations, junctions, violation types

4. Hotspot Detection (DBSCAN Clustering)
   └─ hotspot_engine.py: Cluster coordinates → rank by severity

5. Impact Score Calculation
   └─ impact_engine.py: Junction-level disruption scoring (0-100)

6. Recommendations Generation
   └─ recommendation_engine.py: Priority ranking + officer deployment

7. Spillover Analysis
   └─ spillover_engine.py: Adjacent zone overflow detection

8. Capacity Loss Estimation
   └─ capacity_loss_engine.py: Road carrying capacity reduction

9. Economic Impact Modeling
   └─ economic_impact_engine.py: Financial consequence quantification

10. Forecast Calculation
    └─ forecast_engine.py: 90-day violation prediction

11. Peak Hour Analysis
    └─ peak_hour_engine.py: Temporal pattern extraction

Output: All results stored in app.state for O(1) lookup on HTTP requests
```

### Module Dependencies

```
Data Loader
    ↓
Feature Engineer
    ↓
Statistics Service
    ↓
Hotspot Engine ──────────┐
    ↓                    │
Impact Engine ←─────────┤
    ↓                    │
Recommendation Engine ←──┤
    ↓                    │
Digital Twin Engine ←───┤
    ↓                    │
Spillover Engine ← ─ ─ ──┤
    ↓                    │
Capacity Loss Engine     │
    ↓                    │
Economic Impact Engine ──┘
    ↓
Forecast Engine
    ↓
Peak Hour Engine
```

### Directory Structure

```
backend/
├── app/
│   ├── api/
│   │   ├── __init__.py
│   │   ├── deps.py                      # Dependency injection (get_df, get_stats)
│   │   ├── endpoints.py                 # GET /health, /api/stats, /api/dataset-info
│   │   ├── hotspots.py                  # GET /api/hotspots*
│   │   ├── impact.py                    # GET /api/impact*
│   │   ├── recommendations.py           # GET /api/recommendations*
│   │   ├── digital_twin.py              # POST /simulate, GET /scenarios
│   │   ├── spillover.py                 # GET /api/spillover*
│   │   ├── capacity_loss.py             # GET /api/capacity-loss*
│   │   ├── economic_impact.py           # GET /api/economic-impact*
│   │   ├── forecast.py                  # GET /api/forecast*
│   │   └── peak_hours.py                # GET /api/peak-hours*
│   │
│   ├── core/
│   │   ├── config.py                    # Settings: peak hours, DBSCAN params
│   │   └── __init__.py
│   │
│   ├── models/
│   │   ├── schemas.py                   # Core response models
│   │   ├── hotspot.py                   # Hotspot response schemas
│   │   ├── impact.py                    # Impact response schemas
│   │   ├── recommendation.py            # Recommendation schemas
│   │   ├── digital_twin.py              # Simulation schemas
│   │   ├── spillover.py                 # Spillover schemas
│   │   ├── capacity_loss.py             # Capacity loss schemas
│   │   ├── economic_impact.py           # Economic impact schemas
│   │   ├── forecast.py                  # Forecast schemas
│   │   ├── peak_hours.py                # Peak hour schemas
│   │   └── __init__.py
│   │
│   ├── services/
│   │   ├── data_loader.py               # CSV ingestion & cleaning
│   │   ├── feature_eng.py               # Temporal feature extraction
│   │   ├── statistics.py                # Summary statistics
│   │   ├── hotspot_engine.py            # DBSCAN clustering
│   │   ├── impact_engine.py             # Impact scoring
│   │   ├── recommendation_engine.py     # Enforcement recommendations
│   │   ├── digital_twin_engine.py       # What-if simulation
│   │   ├── spillover_engine.py          # Spillover analysis
│   │   ├── capacity_loss_engine.py      # Capacity loss calculation
│   │   ├── economic_impact_engine.py    # Economic impact modeling
│   │   ├── forecast_engine.py           # Trend forecasting
│   │   ├── peak_hour_engine.py          # Peak hour analysis
│   │   └── __init__.py
│   │
│   ├── utils/
│   │   ├── logger.py                    # Logging configuration
│   │   └── __init__.py
│   │
│   ├── main.py                          # FastAPI app + lifespan
│   └── __init__.py
│
├── data/
│   └── violations.csv                   # Input dataset
│
├── requirements.txt                     # Python dependencies
└── README.md
```

---

## Core Analytics Engines

### 1. Hotspot Engine (DBSCAN)

**Algorithm**: Density-Based Spatial Clustering of Applications with Noise

**Input Parameters**:
- eps: 0.002 degrees (≈220 meters at equator)
- min_samples: 10 violations per cluster
- Coordinates: latitude/longitude pairs (WGS84 projection)

**Process**:
1. Validate coordinates (remove null, out-of-range, 0.0/0.0)
2. Apply DBSCAN clustering
3. Compute cluster centroids
4. Calculate metrics per cluster:
   - Violation count
   - Unique vehicles
   - Unique violation types
   - Police station distribution
5. Rank clusters by violation density

**Severity Classification**:
```
Critical:  violations > 500
High:      201 ≤ violations ≤ 500
Medium:    51 ≤ violations ≤ 200
Low:       violations ≤ 50
```

**Output Schema**:
```json
{
  "cluster_id": "integer",
  "rank": "integer",
  "latitude": "float",
  "longitude": "float",
  "violation_count": "integer",
  "severity": "string (Critical|High|Medium|Low)",
  "unique_vehicles": "integer",
  "unique_violation_types": "integer",
  "police_stations": ["array of strings"],
  "junction_name": "string"
}
```

### 2. Impact Engine

**Disruption Scoring Formula**:
```
raw_impact = 0.40 × frequency + 0.30 × peak_weight 
           + 0.20 × repeat_offender_ratio + 0.10 × diversity

where:
  frequency = total violations at junction
  peak_weight = count of peak hour violations (7-11 AM, 5-9 PM)
  repeat_offender_ratio = vehicles appearing ≥2 times
  diversity = count of unique violation types

Normalization: MinMaxScaler → 0-100 range
```

**Category Assignment**:
```
Critical:  impact_score ∈ [81, 100]
High:      impact_score ∈ [61, 80]
Medium:    impact_score ∈ [31, 60]
Low:       impact_score ∈ [0, 30]
```

**Dependencies**: Raw DataFrame (no dependencies on other engines)

### 3. Recommendation Engine

**Priority Scoring**:
```
priority_score = 0.60 × impact_score + 0.40 × hotspot_severity_score

Officer Allocation:
  Critical (score ≥ 81):  3 officers
  High (61-80):           2 officers
  Medium (31-60):         1 officer
  Low (0-30):             0 officers (monitoring only)

Expected Violation Reduction:
  Critical:  40%
  High:      30%
  Medium:    20%
  Low:       10%
```

**Time Window Optimization**:
```
Sliding Window: 3-hour circular window (00:00-02:59, 01:00-03:59, ... 23:00-01:59)
Metric: Sum of violations in each hour window
Selection: Window with maximum violation count
Output Format: "HH:00-HH:00" (e.g., "08:00-11:00")
```

**Dependencies**: Impact scores, Hotspot severity

### 4. Digital Twin Engine

**Simulation Logic**:
```
For each junction:
  after_violations = floor(before_violations × (1 - reduction_percentage/100))
  after_impact_score = floor(before_impact × (1 - reduction_percentage/100))
  after_congestion = floor(before_congestion × (1 - reduction_percentage/100))

City-wide Aggregation:
  total_violations_after = Σ junction_violations_after
  avg_impact_after = mean(impact_scores_after)
  total_congestion_after = Σ congestion_after

Scenarios Pre-calculated:
  • 10% reduction
  • 20% reduction
  • 30% reduction
  • 50% reduction
  • Custom (0-100%)
```

**Output Comparison**:
```json
{
  "scenario": "Current State vs. 30% Reduction",
  "before": {
    "total_violations": "integer",
    "avg_impact_score": "float",
    "total_congestion": "float"
  },
  "after": {
    "total_violations": "integer",
    "avg_impact_score": "float",
    "total_congestion": "float"
  },
  "junction_details": [
    {
      "junction_name": "string",
      "before_violations": "integer",
      "after_violations": "integer",
      "reduction": "integer"
    }
  ]
}
```

### 5. Spillover Engine

**Spillover Risk Scoring**:
```
spillover_score = 0.40 × hotspot_severity + 0.30 × nearby_density
                + 0.20 × impact_score + 0.10 × growth_rate

Risk Radius: 1000 meters (haversine distance)

Secondary Zones: All junctions within risk_radius
  nearby_violation_density = violations_in_secondary_zone / secondary_zone_area
  growth_rate = (recent_violations - historical_violations) / historical_violations
```

**GIS Processing**:
```
For each hotspot:
  1. Identify all junctions within 1000m radius
  2. Calculate haversine distance
  3. Rank secondary zones by violation density
  4. Flag high-growth secondary zones as emerging overflow
```

### 6. Capacity Loss Engine

**Vehicle Width Estimation**:
```
Motorcycle:  1.0 m
Auto:        2.0 m
Car:         2.5 m
SUV:         2.7 m
Bus/Truck:   3.0 m
```

**Capacity Loss Calculation**:
```
occupied_width = Σ (vehicle_count × vehicle_width)

capacity_loss_percent = (occupied_width / road_width) × 100%

congestion_amplification = 0.5 × normalized_capacity_loss
                         + 0.3 × normalized_impact_score
                         + 0.2 × normalized_violation_density
```

**Risk Categorization**:
```
Critical:  capacity_loss > 50%
High:      30% < capacity_loss ≤ 50%
Medium:    10% < capacity_loss ≤ 30%
Low:       capacity_loss ≤ 10%
```

### 7. Economic Impact Engine

**Cost Components** (per violation):
```
Fuel Waste:         ₹10 per violation
Travel Delay:       5 minutes/violation × ₹180/hour = ₹15 per violation
Productivity Loss:  Delay time × ₹150/hour wage
Enforcement Cost:   ₹5 per violation
```

**Financial Calculations**:
```
Daily Loss = Σ (fuel + delay + productivity + enforcement)
Weekly Loss = Daily Loss × 7
Monthly Loss = Daily Loss × 30
Yearly Loss = Daily Loss × 365

Per-Junction Projection:
  Economic Impact = violation_count × (fuel + delay + productivity + enforcement)
```

**Trend Analysis**:
```
Weekly Trend: Last 4 weeks average by day
Monthly Trend: Last 12 months by week
Yearly Projection: Quarterly breakdown
```

### 8. Forecast Engine

**Holt-Winters Exponential Smoothing**:
```
Inputs:
  • Historical daily violation time series
  • Forecast horizon: 90 days
  • Growth calculation per junction

Algorithm:
  1. Fit exponential smoothing model to historical data
  2. Generate citywide forecast (next 90 days)
  3. Calculate per-junction growth rates
  4. Apply growth multiplier: projected_violations = citywide_forecast × junction_share × growth_rate
  5. Calculate risk scores

Risk Score Calculation:
  risk_score = 0.40 × normalized_predictions
             + 0.30 × normalized_growth_rate
             + 0.20 × impact_score
             + 0.10 × spillover_score

Prediction Horizons:
  • 7-day average
  • 30-day average
  • 90-day point estimate
```

**Output Trends**:
```
Daily Trend:   Next 90 consecutive days
Weekly Trend:  13 weeks ahead
Monthly Trend: 3 months ahead
```

### 9. Peak Hour Engine

**Peak Hour Definition**:
```
Peak Hours: 7:00 AM - 11:00 AM (7-11 exclusive of 12)
            5:00 PM - 9:00 PM (17-21 exclusive of 22)

Off-Peak: All other hours (23:00-06:59)
```

**Metrics**:
```
Per-Junction Calculation:
  peak_hour_violations = count(violations where hour ∈ [7,8,9,10] or [17,18,19,20])
  off_peak_violations = total_violations - peak_hour_violations
  peak_ratio = (peak_hour_violations / total_violations) × 100%

Severity Classification (based on peak_ratio):
  Critical:  peak_ratio > 70%
  High:      50% < peak_ratio ≤ 70%
  Medium:    30% < peak_ratio ≤ 50%
  Low:       peak_ratio ≤ 30%
```

**Temporal Heatmaps**:
```
Hourly Distribution: Violations per hour (0-23)
Daily Pattern: Violations by day of week
Weekly Pattern: Week vs. weekend comparison
```

---

## Frontend Architecture

### Tech Stack
- **Framework**: Next.js 16.2.9 with App Router
- **UI Library**: React 19.2.4 (TypeScript)
- **Styling**: Tailwind CSS 4 with PostCSS
- **Data Fetching**: TanStack React Query 5.101
- **HTTP**: Axios 1.18.0
- **Charting**: Recharts 3.8.1
- **Mapping**: Leaflet 1.9.4 + react-leaflet 5.0.0 + Mapbox GL
- **UI Components**: Lucide React 1.21.0
- **Animations**: Framer Motion 12.40.0
- **Tables**: TanStack react-table 8.21.3

### Page Architecture

```
/dashboard              → Executive Command Center
/hotspots              → DBSCAN Cluster Analysis
/impact-score          → Disruption Severity
/recommendations       → Officer Deployment
/digital-twin          → What-If Simulation
/economic-impact       → Financial Analysis
/capacity-loss         → Road Capacity
/forecast              → 90-Day Predictions
/peak-hours            → Temporal Patterns
/spillover             → Overflow Zones
/correlation           → Cross-Metric Analysis
/settings              → Configuration
```

### Data Fetching Pattern

**React Query Hooks** (one per API endpoint):
```
Custom Hook Pattern:
  const { data, isLoading, isError, refetch } = useHotspots()

Configuration:
  • staleTime: 5 minutes (auto background refetch)
  • cacheTime: 10 minutes
  • retry: 2 attempts with exponential backoff
  • enabled: true (automatic fetching on mount)

Error Handling:
  • Error boundary wrapper
  • Retry button in error state
  • Toast notifications for failures
```

### Component Hierarchy

```
LayoutShell
  ├── Sidebar Navigation
  ├── Header
  └── MainContent
      └── PageHeader
          ├── Page-Specific Components
          │   ├── KPI Cards
          │   ├── Charts (Recharts)
          │   ├── Maps (Leaflet/Mapbox)
          │   ├── Tables (TanStack)
          │   └── Insights Panel
          └── FeedbackStates
              ├── LoadingSkeleton
              └── ErrorState
```

### GIS Integration

**Leaflet Map Configuration**:
```javascript
Base Layer:        OpenStreetMap (TileLayer)
Overlays:
  • Hotspot Markers    (Cluster + Popup)
  • Heatmap Layer      (Heat from violations sample)
  • Spillover Zones    (Circle overlays)
  • Forecast Zones     (Polygon overlays)
  • Risk Visualization (Color-coded by severity)

Interaction:
  • Pan & Zoom controls
  • Layer toggle sidebar
  • Popup on marker click
  • Custom icons by severity
```

**React-Leaflet Pattern**:
```jsx
<MapContainer center={[lat, lng]} zoom={13}>
  <TileLayer url={openStreetMap} />
  <MarkerClusterGroup>
    {hotspots.map(h => (
      <Marker key={h.id} position={[h.lat, h.lng]}>
        <Popup>{h.name}</Popup>
      </Marker>
    ))}
  </MarkerClusterGroup>
  <HeatLayer data={heatmapData} />
</MapContainer>
```

### State Management

**Server State** (React Query):
- API responses cached for 5-10 minutes
- Background refetch on stale
- Optimistic updates for simulations

**UI State** (React Hooks):
- Modal open/close
- Filter selections
- Sort order
- Simulation slider value
- Map layer visibility

### Performance Optimizations

**Frontend**:
- Dynamic imports with lazy loading (`next/dynamic`)
- Image optimization with `next/image`
- Code splitting by page (automatic with App Router)
- CSS-in-JS optimization (Tailwind purging)

**Backend**:
- Pre-computation on startup (all engines run once)
- O(1) lookup in app.state (no re-calculation per request)
- Downsampled GIS data (max 5,000 points for maps)
- Response compression (gzip)

---

## API Endpoint Reference

### Health & System (3 endpoints)
```
GET /health
  Response: {status, dataset_loaded}
  Purpose: System monitoring

GET /api/stats
  Response: {total_violations, total_police_stations, 
             total_junctions, top_violation_types}
  Purpose: Aggregated analytics overview

GET /api/dataset-info
  Response: {columns, row_count, date_range}
  Purpose: Dataset metadata
```

### Hotspots (3 endpoints)
```
GET /api/hotspots
  Response: List[HotspotDetail]
  Purpose: Ranked DBSCAN clusters

GET /api/hotspots/summary
  Response: {total_hotspots, critical, high, medium, low}
  Purpose: Severity distribution

GET /api/map-data
  Response: {violations_sample, heatmap_data, hotspots}
  Purpose: Optimized GIS visualization data
```

### Impact (2 endpoints)
```
GET /api/impact
  Response: List[LocationImpactDetail]
  Purpose: Junction-level disruption scores

GET /api/impact/summary
  Response: {avg_impact, critical_count, high_count, ...}
  Purpose: City-wide impact metrics
```

### Recommendations (2 endpoints)
```
GET /api/recommendations
  Response: List[RecommendationDetail]
  Purpose: Ranked enforcement strategy

GET /api/recommendations/summary
  Response: {total_recommendations, critical_zones, 
             estimated_reduction}
  Purpose: Strategy summary
```

### Digital Twin (2 endpoints)
```
POST /api/digital-twin/simulate
  Input: {reduction_percentage: 0-100}
  Response: SimulateResponse
  Purpose: Custom scenario simulation

GET /api/digital-twin/scenarios
  Response: List[ScenarioDetail] (10%, 20%, 30%, 50%)
  Purpose: Pre-calculated benchmarks
```

### Advanced Analytics (18 endpoints)
```
Spillover:
  GET /api/spillover
  GET /api/spillover/summary
  GET /api/spillover/map

Capacity Loss:
  GET /api/capacity-loss
  GET /api/capacity-loss/summary
  GET /api/capacity-loss/map

Economic Impact:
  GET /api/economic-impact
  GET /api/economic-impact/summary
  GET /api/economic-impact/trends
  GET /api/economic-impact/map

Forecast:
  GET /api/forecast
  GET /api/forecast/summary
  GET /api/forecast/trends
  GET /api/forecast/map

Peak Hours:
  GET /api/peak-hours
  GET /api/peak-hours/summary
  GET /api/peak-hours/junction
  GET /api/peak-hours/map
```

---

## Data Flow Diagram

```
violations.csv
     ↓
[DataLoader] → Raw DataFrame
     ↓
[FeatureEngineer] → Enhanced DataFrame
     ↓
[StatisticsService] ──→ {stats summary}
     ├─→ [HotspotEngine] ──────→ {hotspots}
     │                   ↓
     ├─→ [ImpactEngine] ──────→ {impact_scores}
     │                   ↓
     ├─→ [RecommendationEngine] → {recommendations}
     │                   ↓
     ├─→ [DigitalTwinEngine] → {simulations}
     │                   ↓
     ├─→ [SpilloverEngine] ──→ {spillover}
     │                   ↓
     ├─→ [CapacityLossEngine] → {capacity_loss}
     │                   ↓
     ├─→ [EconomicImpactEngine] → {economic_impact}
     │                   ↓
     ├─→ [ForecastEngine] ──→ {forecasts}
     │                   ↓
     └─→ [PeakHourEngine] ──→ {peak_hours}
     ↓
[app.state] (In-Memory Cache)
     ↓
FastAPI Routes
     ↓
REST JSON APIs
     ↓
Frontend (React Query)
     ↓
Dashboard UI (Recharts, Leaflet, Tables)
```

---

## Scalability Considerations

### Current Limitations
- In-memory data storage (limited by available RAM)
- Single backend instance
- No distributed caching
- CSV batch processing (not real-time streaming)

### Production Scaling Strategies

**Horizontal Scaling**:
```
Load Balancer (Nginx/HAProxy)
  ├─ Backend Instance 1
  ├─ Backend Instance 2
  └─ Backend Instance N

Shared Cache (Redis):
  • Cache hot API responses
  • Distribute computation results
  • Cross-instance state synchronization

Database (PostgreSQL/MongoDB):
  • Replace in-memory storage
  • Enable historical tracking
  • Time-series data for trends
```

**Data Processing**:
```
Current: Single-process batch on startup

Production Options:
1. Batch Jobs (Apache Airflow)
   • Hourly/daily recomputation
   • Scheduled data ingestion
   • Incremental processing

2. Real-Time Streaming (Apache Kafka)
   • Event-driven analytics
   • Continuous update of cached results
   • Real-time API responses

3. Time-Windowed Analysis
   • Process only recent violations
   • Rolling window analytics
   • Reduced computation time
```

**Frontend Optimization**:
```
CDN for Static Assets
  ├─ JavaScript bundles
  ├─ CSS stylesheets
  └─ Map tiles (Mapbox/Tiles)

Server-Side Rendering (SSR)
  • Pre-render pages at build time
  • Improve Time to First Paint (TTFP)
  • SEO optimization

Infinite Scroll/Pagination
  • Load data on demand
  • Reduce initial payload
  • Improve perceived performance
```

---

## Security & Compliance

### Authentication & Authorization
- Implement OAuth2/JWT for API access
- Role-based access control (RBAC)
- Admin, Police, Planner, Operator roles

### Data Protection
- HTTPS/TLS encryption in transit
- Data encryption at rest (database)
- Input validation & sanitization
- SQL injection prevention (Pydantic + parameterized queries)

### Monitoring & Logging
- Structured logging (JSON format)
- Error tracking (Sentry)
- Performance metrics (Prometheus)
- Audit trail for administrative actions

---

## Deployment Architecture

### Docker Compose (Development)
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports: ["8000:8000"]
    volumes: ["./backend/data:/app/data"]
  
  frontend:
    build: ./frontend
    ports: ["3000:3000"]
    depends_on: ["backend"]
```

### Kubernetes (Production)
```yaml
Deployments:
  • Backend Service (3+ replicas)
  • Frontend Service (2+ replicas)
  
Services:
  • API Load Balancer
  • Frontend Load Balancer
  
Storage:
  • PersistentVolume for datasets
  • ConfigMap for environment settings
```

### Version Compatibility

| Component | Version | Status |
|-----------|---------|--------|
| Python | 3.11+ | Required |
| FastAPI | 0.110+ | Required |
| Next.js | 16.2.9 | Required |
| React | 19.2.4 | Required |
| Node.js | 18+ | Required |
| PostgreSQL | 14+ | Optional |
| Redis | 7+ | Optional |

