export interface ViolationTypeCount {
  violation_type: string;
  count: number;
}

export interface StatsResponse {
  total_violations: number;
  total_police_stations: number;
  total_junctions: number;
  top_violation_types: ViolationTypeCount[];
}

export interface HotspotDetail {
  cluster_id: number;
  rank: number;
  latitude: number;
  longitude: number;
  violation_count: number;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  unique_vehicles: number;
  unique_violation_types: number;
  police_stations: number;
  junction_name?: string;
  police_station?: string;
}

export interface HotspotsSummaryResponse {
  total_hotspots: number;
  critical_hotspots: number;
  high_hotspots: number;
  medium_hotspots: number;
  low_hotspots: number;
}

export interface LocationImpactDetail {
  rank: number;
  junction_name: string;
  impact_score: number;
  category: 'Low' | 'Medium' | 'High' | 'Critical';
  violations: number;
  peak_hour_violations: number;
  repeat_offenders: number;
}

export interface ImpactSummaryResponse {
  total_locations: number;
  average_impact_score: number;
  critical_locations: number;
  high_locations: number;
  medium_locations: number;
  low_locations: number;
}

export interface RecommendationDetail {
  rank: number;
  junction_name: string;
  priority_score: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  officers: number;
  recommended_time_window: string;
  expected_violation_reduction: number;
  expected_congestion_reduction: number;
  reason: string;
}

export interface RecommendationsSummaryResponse {
  total_recommendations: number;
  critical_zones: number;
  high_zones: number;
  estimated_citywide_reduction: number;
}

export interface CitySummary {
  violations_before: number;
  violations_after: number;
  impact_before: number;
  impact_after: number;
  congestion_before: number;
  congestion_after: number;
  improvement_percentage: number;
}

export interface HotspotSimulationDetail {
  junction_name: string;
  before_violations: number;
  after_violations: number;
  before_impact: number;
  after_impact: number;
  improvement_percentage: number;
}

export interface SimulateResponse {
  city_summary: CitySummary;
  hotspots: HotspotSimulationDetail[];
  insight: string;
}

export interface ScenarioDetail {
  scenario: string;
  impact_reduction: number;
}

export interface MapViolationDetail {
  latitude: number;
  longitude: number;
  violation_type: string;
  junction_name: string;
  police_station: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface MapDataResponse {
  hotspots: HotspotDetail[];
  heatmap: number[][];
  violations: MapViolationDetail[];
}

export interface SpilloverDetail {
  hotspot_id: string;
  junction_name: string;
  latitude: number;
  longitude: number;
  spillover_score: number;
  nearby_violation_density: number;
  hotspot_growth_rate: number;
  impact_score: number;
  risk_radius_m: number;
  secondary_zones: string[];
}

export interface SpilloverListResponse {
  spillovers: SpilloverDetail[];
}

export interface SpilloverSummaryResponse {
  total_spillover_zones: number;
  critical_spillovers: number;
  average_spillover_score: number;
  max_risk_radius_m: number;
}

export interface SpilloverMapDetail {
  id: string;
  type: 'primary' | 'secondary';
  latitude: number;
  longitude: number;
  radius: number;
  score: number;
  label: string;
}

export interface SpilloverMapResponse {
  zones: SpilloverMapDetail[];
}

// =============================================
// Road Capacity Loss Estimator
// =============================================

export interface CapacityLossDetail {
  junction_name: string;
  capacity_loss: number;
  occupied_width: number;
  available_width: number;
  road_width: number;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  congestion_amplification: number;
  vehicle_count: number;
  latitude: number;
  longitude: number;
}

export interface CapacityLossListResponse {
  locations: CapacityLossDetail[];
}

export interface CapacityLossSummaryResponse {
  average_capacity_loss: number;
  critical_locations: number;
  highest_loss_area: string;
  citywide_capacity_loss: number;
}

export interface CapacityLossMapDetail {
  id: string;
  latitude: number;
  longitude: number;
  capacity_loss: number;
  risk: string;
  label: string;
  radius: number;
}

export interface CapacityLossMapResponse {
  locations: CapacityLossMapDetail[];
}

// =============================================
// Economic Impact Dashboard
// =============================================

export interface EconomicCostBreakdown {
  fuel_waste: number;
  delay_cost: number;
  productivity_loss: number;
  enforcement_cost: number;
}

export interface EconomicImpactDetail {
  junction_name: string;
  daily_loss: number;
  weekly_loss: number;
  monthly_loss: number;
  yearly_loss: number;
  category: 'Low' | 'Medium' | 'High' | 'Critical';
  violations_count: number;
  breakdown: EconomicCostBreakdown;
  latitude: number;
  longitude: number;
}

export interface EconomicImpactListResponse {
  locations: EconomicImpactDetail[];
}

export interface EconomicImpactSummaryResponse {
  citywide_daily_loss: number;
  citywide_monthly_loss: number;
  citywide_yearly_loss: number;
  highest_loss_area: string;
}

export interface EconomicTrendPoint {
  date: string;
  cost: number;
  violations: number;
}

export interface EconomicTrendResponse {
  trends: EconomicTrendPoint[];
}

export interface EconomicMapDetail {
  id: string;
  latitude: number;
  longitude: number;
  daily_loss: number;
  monthly_loss: number;
  yearly_loss: number;
  category: string;
  label: string;
  radius: number;
}

export interface EconomicMapResponse {
  locations: EconomicMapDetail[];
}

// =============================================
// Future Parking Risk Forecast
// =============================================

export interface ForecastDetail {
  junction_name: string;
  current_violations: number;
  predicted_violations: number;
  predicted_7_days: number;
  predicted_90_days: number;
  growth_rate: number;
  future_risk_score: number;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
  latitude: number;
  longitude: number;
}

export interface ForecastListResponse {
  forecast: ForecastDetail[];
}

export interface ForecastSummaryResponse {
  high_risk_areas: number;
  critical_future_hotspots: number;
  highest_growth_area: string;
  average_growth_rate: number;
}

export interface TrendPoint {
  date: string;
  predicted: number;
}

export interface ForecastTrendResponse {
  daily: TrendPoint[];
  weekly: TrendPoint[];
  monthly: TrendPoint[];
}

export interface ForecastMapDetail {
  id: string;
  latitude: number;
  longitude: number;
  current_violations: number;
  predicted_violations: number;
  growth_rate: number;
  future_risk_score: number;
  risk: string;
  label: string;
  radius: number;
}

export interface ForecastMapResponse {
  locations: ForecastMapDetail[];
}

// =============================================
// Peak Hour Prediction Engine
// =============================================

export interface PeakHourDetail {
  hour: string;
  predicted_violations: number;
  risk_score: number;
  risk: 'Low' | 'Medium' | 'High' | 'Critical';
}

export interface PeakHourResponse {
  peak_hours: PeakHourDetail[];
}

export interface JunctionPeakDetail {
  junction_name: string;
  peak_hour: string;
  predicted_violations: number;
}

export interface PeakHourSummaryResponse {
  next_peak_hour: string;
  highest_risk_junction: string;
  predicted_citywide_violations: number;
}



