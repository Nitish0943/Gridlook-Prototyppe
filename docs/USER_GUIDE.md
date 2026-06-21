# SCITA User Guide

**End-User Documentation for Smart City Parking Intelligence Platform**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Navigation](#dashboard-navigation)
3. [Page-by-Page Guide](#page-by-page-guide)
4. [Key Concepts](#key-concepts)
5. [How to Interpret Data](#how-to-interpret-data)
6. [Common Tasks](#common-tasks)
7. [Frequently Asked Questions](#frequently-asked-questions)

---

## Getting Started

### System Access

**URL**: `http://localhost:3000`

**First Visit**:
1. Navigate to platform URL
2. You will land on the Executive Dashboard
3. Review the KPI cards at the top for current city status
4. Explore different sections using the sidebar navigation

**Browser Requirements**:
- Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+
- JavaScript enabled
- Cookies enabled for session management

### Interface Overview

```
┌─────────────────────────────────────────────────────┐
│  SCITA Platform    🔔 Alerts    ⚙️ Settings   👤 User │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Sidebar          │           Main Content Area     │
│  ├─ Dashboard     │    • Page Title                 │
│  ├─ Hotspots      │    • KPI Cards                  │
│  ├─ Impact        │    • Charts & Visualizations   │
│  ├─ Recommend...  │    • Data Tables                │
│  ├─ Digital Twin  │    • GIS Maps                   │
│  └─ More...       │    • Insights Panel             │
│                   │                                 │
└─────────────────────────────────────────────────────┘
```

---

## Dashboard Navigation

### Main Menu (Sidebar)

| Icon | Page | Purpose |
|------|------|---------|
| 🏠 | Dashboard | Executive overview & command center |
| 📍 | Hotspots | Geospatial cluster analysis |
| ⚡ | Impact Score | Disruption severity ranking |
| 👮 | Recommendations | Officer deployment strategy |
| 🎮 | Digital Twin | What-if scenario simulation |
| 💰 | Economic Impact | Financial loss analysis |
| 🛣️ | Capacity Loss | Road carrying capacity |
| 📈 | Forecast | 90-day risk prediction |
| ⏰ | Peak Hours | Temporal violation patterns |
| 🔄 | Spillover | Parking overflow analysis |
| 📊 | Correlation | Cross-metric relationships |
| ⚙️ | Settings | Configuration & preferences |

### Header Controls

**Left Side**:
- Platform logo and name
- Page title

**Right Side**:
- 🔔 Alert notifications
- ⚙️ System settings
- 👤 User profile

### Color Scheme

**Severity Indicators**:
- 🔴 **Red (Critical)**: Immediate action required
- 🟠 **Orange (High)**: High priority action
- 🟡 **Yellow (Medium)**: Monitor and plan
- 🟢 **Green (Low)**: Routine monitoring

---

## Page-by-Page Guide

### Executive Dashboard (`/dashboard`)

**Purpose**: Command center for city leadership with real-time metrics

**Layout**:
```
1. KPI Cards (6 metrics)
   ├─ Total Violations (Count)
   ├─ Hotspots Detected (Count)
   ├─ Average Impact Score (0-100)
   ├─ Forecast Risk (0-100)
   ├─ Economic Daily Loss (₹ Currency)
   └─ Road Capacity Loss (%)

2. GIS Command Center Map
   • Interactive city map with overlays
   • Zoom/pan controls
   • Layer toggle sidebar

3. Executive Summary Panel
   • High-priority alerts
   • Critical zone count
   • Top recommendations preview

4. Priority Actions Table
   • Top 8 enforcement recommendations
   • Priority ranking
   • Recommended officer count
   • Click for detailed view

5. Forecast Trend Chart
   • 90-day violation trend
   • Weekly aggregation
   • Emerging risk zones highlighted

6. Economic Impact Summary
   • Daily/monthly/yearly loss
   • Cost breakdown
   • Highest loss junctions

7. Capacity Monitor
   • Top capacity loss corridors
   • Occupancy percentages
   • Risk levels

8. AI Insights Panel
   • Auto-generated insights from all engines
   • Actionable recommendations
   • Trend descriptions
```

**How to Use**:
1. **Monitor KPIs**: Glance at metric cards for current status
2. **Review Map**: Zoom to regions of interest
3. **Check Alerts**: Read AI insights for action items
4. **Action Items**: Click table rows to drill into details

---

### Parking Hotspots (`/hotspots`)

**Purpose**: Identify high-density violation clusters using geospatial analysis

**Key Information**:
- **DBSCAN Clustering**: Automatic density-based zone detection
- **Severity Breakdown**: Critical/High/Medium/Low classifications
- **Metrics**: Violation count, unique vehicles, violation types

**Layout**:
```
1. Heatmap Visualization
   • Color intensity = violation density
   • Pan/zoom enabled
   • Click markers for details

2. Hotspot Ranking Table
   Rank | Junction | Violations | Severity | Vehicles | Types
   
3. Severity Summary Cards
   • Critical (e.g., 3 zones)
   • High (e.g., 8 zones)
   • Medium (e.g., 12 zones)
   • Low (e.g., 5 zones)
```

**Severity Definitions**:
- **Critical** (>500 violations): Immediate enforcement needed
- **High** (201-500): High-priority zones
- **Medium** (51-200): Monitor and plan intervention
- **Low** (≤50): Routine monitoring

**Common Actions**:
1. Sort by violation count (descending)
2. Filter by severity level
3. Click zone to see police districts involved
4. Export data for analysis

---

### Impact Score (`/impact-score`)

**Purpose**: Quantify disruption severity at each junction

**What is Impact Score?**
```
Formula: 40% Frequency + 30% Peak Hours 
       + 20% Repeat Offenders + 10% Diversity

Score Range: 0-100
• 0-30:   Low disruption
• 31-60:  Medium disruption
• 61-80:  High disruption
• 81-100: Critical disruption
```

**Layout**:
```
1. Average Impact Gauge
   • Current citywide average
   • Trending indicator (↑ increasing / ↓ decreasing)

2. Category Distribution
   • Critical count
   • High count
   • Medium count
   • Low count

3. Impact Ranking Table
   Rank | Junction | Score | Category | Violations | Peak-Hour | Repeat Vehicles
```

**How to Interpret**:
- **High Score + Many Peak-Hour Violations** = Morning/evening problem
- **High Score + Many Repeat Offenders** = Systematic parking violation
- **Low Score but High Violations** = Spread out time/location (lower priority)

**Use Case**:
"Which junction should we prioritize for enforcement?"
→ Sort by impact score descending
→ Top junctions are most disruptive

---

### Enforcement Recommendations (`/recommendations`)

**Purpose**: Strategic officer deployment with ROI projections

**Key Information**:
```
Priority Score = 60% Impact Score + 40% Hotspot Severity

Officer Allocation:
• Critical:  3 officers (Expect 40% reduction)
• High:      2 officers (Expect 30% reduction)
• Medium:    1 officer (Expect 20% reduction)
• Low:       0 officers (Monitoring)
```

**Layout**:
```
1. Priority Summary Cards
   • Total recommendations
   • Officer allocation
   • Expected reduction %
   • Estimated congestion relief

2. Recommendation Ranking Table
   Rank | Junction | Priority | Officers | Time Window | Reduction | Reason

3. Time Window Analysis
   • Optimal 3-hour deployment windows
   • Based on violation time distribution
   • Example: "08:00-11:00" for morning peak
```

**Interpreting Recommendations**:
- **Time Window**: Deploy during these hours for maximum effectiveness
- **Expected Reduction**: Projected violation decrease if deployed
- **Reason**: Why this zone is prioritized

**Action Steps**:
1. Review top critical zones
2. Note recommended time windows
3. Compare with available officer resources
4. Plan deployment schedule
5. Use Digital Twin to validate assumptions

---

### Digital Twin (`/digital-twin`)

**Purpose**: Simulate enforcement scenarios and predict outcomes

**How It Works**:
```
Current State → Simulation Engine → Projected Results
                   ↓
            Reduction Scenario (0-100%)
            
Example:
• Current: 13,847 violations, 54.2 impact score
• Simulate: 30% reduction through increased enforcement
• Result: 9,693 violations, 37.9 impact score
```

**Using the Simulator**:

1. **Adjustment Slider**
   - Range: 0% to 100% violation reduction
   - Move slider or enter custom value
   - See real-time results update

2. **Scenario Comparison**
   - Current State (baseline)
   - 10% Reduction Scenario (light enforcement)
   - 20% Reduction Scenario (moderate)
   - 30% Reduction Scenario (strong)
   - 50% Reduction Scenario (intensive)

3. **Metrics Displayed**
   - Total violations (city-wide)
   - Average impact score
   - Total congestion amplification
   - By-junction details

**Example Scenario**:
"What if we increase enforcement by 20%?"
1. Move slider to 20%
2. System calculates:
   - Expected violations: 11,078 (down from 13,847)
   - Impact reduction: 6.2% average
   - Congestion relief: 18% estimated

3. Review junction-level impacts
4. Assess resource requirements
5. Make policy decision

**Business Use**:
- Policy evaluation before implementation
- Budget justification (ROI calculation)
- Multi-scenario comparison for leadership
- Risk assessment of enforcement changes

---

### Economic Impact (`/economic-impact`)

**Purpose**: Quantify financial consequences of parking violations

**Cost Components** (per violation):
```
Fuel Waste:        ₹10
Travel Delay:      ₹15 (5 min delay × ₹180/hour)
Productivity Loss: Delay time × ₹150/hour
Enforcement Cost:  ₹5
---
Total Avg Cost:   ≈₹40 per violation
```

**Financial Calculations**:
```
Daily Loss    = Total Violations × Average Cost
Weekly Loss   = Daily Loss × 7
Monthly Loss  = Daily Loss × 30
Yearly Loss   = Daily Loss × 365
```

**Layout**:
```
1. Loss KPI Cards
   • Daily: ₹2.8M (example)
   • Monthly: ₹85.4M
   • Yearly: ₹1.04B

2. Cost Breakdown
   • Pie chart showing component percentages
   • Fuel waste (%)
   • Travel delay (%)
   • Productivity loss (%)
   • Enforcement (%)

3. Top Loss Locations
   • Highest daily loss junctions
   • Cumulative economic impact
   • Intervention ROI potential

4. Trend Analysis
   • Weekly trend chart
   • Monthly trend chart
   • Growth/decline patterns
```

**Using This Data**:
1. **Budget Justification**: "Parking violations cost the city ₹1B annually"
2. **ROI Calculation**: "Reducing violations by 20% saves ₹200M yearly"
3. **Priority Setting**: "This junction has ₹30M yearly loss - highest ROI target"

---

### Road Capacity Loss (`/capacity-loss`)

**Purpose**: Estimate traffic carrying capacity reduction from illegal parking

**Key Metrics**:
```
Capacity Loss % = (Illegal Parking Width / Total Road Width) × 100%

Vehicle Widths:
• Motorcycle: 1.0m
• Car: 2.5m
• SUV: 2.7m
• Bus: 3.0m
```

**Risk Levels**:
```
Critical:  > 50% capacity loss
High:      30-50% capacity loss
Medium:    10-30% capacity loss
Low:       < 10% capacity loss
```

**Layout**:
```
1. Capacity Status Cards
   • Average citywide capacity loss
   • Critical corridors count
   • Total occupied width

2. Highest Loss Corridors Table
   Junction | Loss % | Occupied Width | Vehicle Count | Risk

3. Congestion Amplification Chart
   • Visual representation of amplification factor
   • Correlation with impact scores
   • Historical trend

4. Vehicle Type Breakdown
   • Distribution of vehicle types in violations
   • Impact by vehicle category
```

**Interpretation Example**:
- "Delhi High Court Junction: 48% capacity loss"
- Means: Nearly half the road is blocked by illegal parking
- Result: Severe congestion, long delays
- Action: Highest enforcement priority

---

### Future Risk Forecast (`/forecast`)

**Purpose**: Predict violations 90 days ahead and identify emerging risks

**Forecasting Method**:
```
Algorithm: Holt-Winters Exponential Smoothing

Inputs: Historical violation data
Output: 90-day prediction with growth rates
```

**Prediction Horizons**:
- **7-day**: Short-term trends
- **30-day**: Monthly planning horizon
- **90-day**: Quarterly risk assessment

**Layout**:
```
1. Forecast KPIs
   • High-risk emerging zones (next 90 days)
   • Critical hotspots (next 30 days)
   • Average growth rate
   • New hotspots alert

2. Emerging High-Risk Locations
   Zone | 7-Day Pred | 30-Day Pred | 90-Day Pred | Growth % | Risk

3. Forecast Trend Chart
   • Daily predictions (next 90 days)
   • Highlight seasonal patterns
   • Emerging spike detection

4. Comparison with Current
   • Current state violations
   • Predicted violations
   • Growth/decline percentage
   • Actionable alerts
```

**Business Use**:
- "Prepare for 15% increase in violations next month"
- "Three new hotspots emerging - plan prevention"
- "Seasonal pattern: Summer has 20% higher violations"

---

### Peak Hour Patterns (`/peak-hours`)

**Purpose**: Identify optimal enforcement time windows

**Peak Hour Definition**:
```
Morning Peak: 7:00 AM - 11:00 AM
Evening Peak: 5:00 PM - 9:00 PM
Total: 8 hours per day

Off-Peak: 11:00 AM - 5:00 PM + 9:00 PM - 7:00 AM
Total: 16 hours per day
```

**Layout**:
```
1. Peak vs. Off-Peak Summary
   • Peak hour violations
   • Off-peak violations
   • Peak hour ratio (%)
   • Recommended windows

2. Hourly Heatmap
   Hours (0-23) | Violation Intensity
   7am-11am: 🔴 Intense
   12pm-4pm: 🟡 Moderate
   5pm-9pm: 🔴 Intense
   10pm-6am: 🟢 Low

3. Peak Hour Details Table
   Junction | Peak Viol | Off-Peak Viol | Peak Ratio | Severity

4. Daily Pattern Chart
   • Line graph: violations by hour
   • Two peaks visible (morning, evening)
   • Off-peak trough during 2-4 PM
```

**Using Peak Hour Data**:
1. "Hotspot A has 68% violations during morning peak"
   → Deploy more officers 7-11 AM
2. "Hotspot B has even distribution"
   → Spread enforcement across all hours
3. "Evening peak is growing faster than morning"
   → Increase evening deployments

---

### Spillover Zones (`/spillover`)

**Purpose**: Detect parking overflow to adjacent areas

**What is Spillover?**
```
When a main hotspot reaches capacity, overflow occurs to 
nearby areas within 1000m radius = Secondary Zones
```

**Layout**:
```
1. Spillover Zone Map
   • Primary hotspots (large markers)
   • Secondary zones (smaller markers)
   • Risk radius overlay (1000m circles)
   • Color-coded by severity

2. Spillover Risk Table
   Primary Zone | Secondary Zones | Risk Level | Growth Rate | Action

3. Secondary Zone Details
   • Nearby violation density
   • Growth trend
   • Recommendation
```

**Example**:
```
Primary Hotspot: Delhi High Court Junction (Critical)
Secondary Zones:
  • Supreme Court Road (8.2km away, 245 violations)
  • Tilak Marg (5.7km away, 156 violations)
  • Rajendra Place (9.1km away, 89 violations)

Spillover Score: 78 (High)
Growth Rate: +12% month-over-month
→ Recommendation: Monitor secondary zones; if growth continues,
                  increase enforcement at secondary locations
```

---

## Key Concepts

### Impact Score Explained

**What**: Quantitative disruption severity (0-100 scale)

**Why**: Different locations with same violation count have different impact:
- Hotspot A: 100 violations all at peak hours = Higher impact
- Hotspot B: 100 violations spread across day = Lower impact

**Formula Weights**:
```
Frequency (40%):       Total violations
Peak Hours (30%):      Violations during 7-11 AM + 5-9 PM
Repeat Offenders (20%): Same vehicle parking multiple times
Diversity (10%):       Different violation types
```

**Categories**:
- **Critical (81-100)**: Immediate enforcement
- **High (61-80)**: Within 1-2 weeks
- **Medium (31-60)**: Plan intervention
- **Low (0-30)**: Monitor

---

### Hotspot vs. High Impact

**Hotspot**: 
- Defined by DBSCAN clustering (geospatial proximity)
- Many violations in one location
- Example: "Parking violations concentrated at Delhi High Court Junction"

**High Impact**:
- Defined by impact score formula (disruption severity)
- Combination of frequency + timing + patterns
- Example: "Delhi High Court has high disruption despite fewer violations than nearby junction"

**They often overlap but are different metrics**

---

### Spillover Risk

**Definition**: Parking overflow from saturated hotspot to adjacent areas

**Why It Matters**:
1. Problem appears to be solved (primary hotspot reduced)
2. But just moved to nearby areas (secondary zones)
3. Enforcement becomes less effective if spillover not addressed

**Indicator**: "High spillover score" = monitor and strengthen secondary zone enforcement

---

### Forecast Risk Score

**Components**:
```
40% × Predicted Violation Growth
30% × Historical Growth Rate
20% × Current Impact Score
10% × Current Spillover Score
```

**Interpretation**:
- High score = Likely to get worse
- Low score = Likely to improve or stay stable

---

## How to Interpret Data

### Reading Charts

**Line Charts** (Trends):
- X-axis: Time period
- Y-axis: Metric value
- Slope: Trend direction (↗ increasing, ↘ decreasing, → flat)

**Bar Charts** (Comparison):
- Height: Metric value
- Width: Categories (junctions, days, etc.)
- Use for ranking

**Pie Charts** (Composition):
- Slice size: Component percentage
- Total: 100%
- Use for cost breakdown, vehicle type distribution

**Heatmaps** (Spatial Distribution):
- Color intensity: Violation density
- Red: High density
- Green: Low density
- Darker: More violations

### Reading Tables

**Sortable Columns**:
- Click column header to sort ascending/descending
- Use to find "Top 5" or "Bottom 10"

**Color-Coded Rows**:
- Red row: Critical severity
- Orange row: High severity
- Yellow row: Medium severity
- Green row: Low severity

**Action Buttons**:
- "View Details": Navigate to detailed page
- "Export": Download data
- "Compare": Side-by-side comparison

---

## Common Tasks

### Task 1: Find the Worst Parking Hotspot

1. Go to **Hotspots** page
2. Table is pre-sorted by violation count (descending)
3. Click the top row
4. Review details:
   - Violation count
   - Unique vehicles (repeat offenders?)
   - Police districts involved
   - Recommended enforcement time

### Task 2: Plan Officer Deployment

1. Go to **Recommendations** page
2. Review critical zones (top of list)
3. For each critical zone:
   - Note the "Recommended Time Window" (e.g., "08:00-11:00")
   - Allocate officers = number shown
   - Expected reduction percentage
4. Simulate different deployment scenarios using **Digital Twin**

### Task 3: Calculate ROI of Enforcement

1. Current State:
   - Go to **Economic Impact** page
   - Note "Daily Loss" amount
   - Example: ₹2.8M per day = ₹1.04B yearly

2. Scenario:
   - Go to **Digital Twin** page
   - Set slider to "30% reduction"
   - Note new daily loss: ₹1.96M
   - Savings: ₹840K per day = ₹306M yearly

3. Decision:
   - If enforcement increase costs <₹306M, it's ROI positive

### Task 4: Identify Emerging Problems

1. Go to **Forecast** page
2. Check "Emerging High-Risk Locations" section
3. Review 30-day and 90-day predictions
4. Look for "Growth Rate" column (% increase)
5. Zones with >10% growth = prepare intervention

### Task 5: Compare Two Junctions

1. Go to **Impact Score** page
2. Find Junction A in table (e.g., Row 5, Impact: 78)
3. Go to **Hotspots** page
4. Find Junction B's hotspot (look for cluster_id)
5. Compare:
   - Violation count
   - Unique vehicles
   - Police district
   - Severity level
6. Use **Digital Twin** to model enforcement impact on each

---

## Frequently Asked Questions

### Q: What's the difference between violations count and impact score?

**A**: 
- **Violations Count**: How many parking violations occurred
- **Impact Score**: How disruptive those violations are

Example:
- Junction A: 200 violations, 45 impact score (spread over 24 hours)
- Junction B: 150 violations, 72 impact score (concentrated at peak hours)
→ Junction B is prioritized despite fewer violations

---

### Q: Why do some hotspots have low impact scores?

**A**: Possible reasons:
1. Violations spread across off-peak hours (less disruptive)
2. Few repeat offenders (not systematic problem)
3. Limited violation type diversity (more predictable)
4. Small vehicles (less capacity impact)

**Action**: These are lower priority for enforcement

---

### Q: What if spillover score increases?

**A**: It means:
1. Overflow parking moving to adjacent zones
2. Primary hotspot enforcement is pushing problem elsewhere
3. Solution: Expand enforcement to secondary zones

**Action**: 
- Increase enforcement at primary hotspot AND secondary zones
- Re-simulate with higher reduction percentage

---

### Q: How do I use Digital Twin for planning?

**A**: Example workflow:
1. Go to Digital Twin
2. Run baseline scenario (0% reduction = current state)
3. Increase slider to 20%
   - Review projected results
   - Check if resources available
4. Increase to 30%
   - Review again
   - Check if realistic
5. Share 20% or 30% scenario with leadership
6. Get approval
7. Execute enforcement plan
8. Compare actual results with prediction

---

### Q: What does "peak ratio" mean in peak hours?

**A**: Percentage of violations occurring during peak hours

**Example**:
- Junction A: Peak Ratio 65%
  → 65% of violations occur 7-11 AM + 5-9 PM
  → Deploy most officers during these hours

- Junction B: Peak Ratio 40%
  → 40% of violations occur during peak hours
  → More distributed throughout day

---

### Q: How are recommendations calculated?

**A**:
```
Priority Score = 60% Impact Score + 40% Hotspot Severity Score

Officer Allocation:
• If Priority Score > 80: Allocate 3 officers
• If Priority Score 60-80: Allocate 2 officers
• If Priority Score 31-59: Allocate 1 officer
• If Priority Score < 31: Monitor only

Expected Reduction = Based on historical similar deployments
```

---

### Q: Can I export data for external analysis?

**A**: Currently, you can:
1. Screenshot charts and tables
2. Use browser developer tools to inspect response data
3. Export via API (if developer access)

Production feature: Add CSV/Excel export buttons to all pages

---

### Q: What's the best time to deploy officers?

**A**: 
1. Go to **Recommendations** page
2. Look for "Recommended Time Window" column
3. Each junction shows optimal 3-hour window
4. This is calculated based on which hours have highest violations

**Example**: If Delhi High Court shows "08:00-11:00":
- Deploy more officers between 8-11 AM
- Fewer officers before 8 AM or after 11 AM
- This window changes if violation patterns change

---

### Q: How often is data updated?

**A**: Currently:
- Data loaded once at platform startup
- No real-time updates

Production roadmap:
- Hourly batch updates
- Real-time streaming (Advanced)

---

### Q: Who should use each page?

| Role | Primary Pages |
|------|---|
| **City Administrator** | Dashboard, Forecast, Economic Impact |
| **Police Chief** | Recommendations, Impact Score, Peak Hours |
| **Officer** | Hotspots, Digital Twin simulation, Deployment schedule |
| **Urban Planner** | Forecast, Spillover, Capacity Loss |
| **Smart City Manager** | Dashboard, Digital Twin, All pages |

---

### Q: How do I share insights with my team?

**A**:
1. Navigate to relevant page
2. Screenshot key metrics
3. Email to stakeholders
4. For detailed reports: Use API to export data

Production feature: Add built-in report generation

---

### Q: What if I see an error?

**A**: Try these steps:
1. Refresh the page (F5 or Ctrl+R)
2. Check health endpoint: `http://localhost:8000/health`
3. Clear browser cache (Ctrl+Shift+Delete)
4. Check console for error messages (F12 → Console tab)
5. Contact technical support with error details

---

## Tips & Best Practices

### For City Administrators

✅ **Do**:
- Review dashboard daily for status updates
- Check Economic Impact for budget planning
- Use Digital Twin for policy decisions
- Share forecast insights with enforcement teams

❌ **Don't**:
- Act on single data point (look for trends)
- Deploy officers uniformly (use recommendations)
- Ignore spillover zones (they're emerging problems)

### For Police Leadership

✅ **Do**:
- Prioritize Critical and High zones
- Deploy officers during recommended time windows
- Monitor peak hours closely
- Compare recommendations with available resources

❌ **Don't**:
- Deploy uniformly across all zones
- Ignore peak hour patterns
- Deploy outside recommended windows
- Over-enforce low-impact zones

### For Urban Planners

✅ **Do**:
- Review 90-day forecasts for emerging patterns
- Analyze spillover zones for infrastructure issues
- Use capacity loss for parking facility planning
- Monitor growth rates for seasonal patterns

❌ **Don't**:
- Make decisions on single month
- Ignore spillover (underlying cause)
- Plan parking without capacity analysis

---

## Support

For questions not answered here:
1. Review relevant section above
2. Check **Settings** page for FAQs
3. Contact technical support team
4. Review API documentation for developers

**Technical Documentation**:
- System Architecture: `SYSTEM_ARCHITECTURE.md`
- API Reference: `API_DOCUMENTATION.md`
- Product Documentation: `PRODUCT_DOCUMENTATION.md`

