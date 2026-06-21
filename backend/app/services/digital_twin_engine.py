import numpy as np
from typing import Dict, List, Any
from app.utils.logger import logger

class DigitalTwinEngine:
    """
    DigitalTwinEngine simulates what-if scenarios of illegal parking reductions
    and estimates the corresponding improvements in violations and traffic congestion.
    """
    
    def simulate_reduction(
        self, 
        reduction_percentage: int, 
        total_violations: int, 
        impact_data: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Simulates the effect of a given violation reduction percentage.
        
        Args:
            reduction_percentage (int): Percent reduction (0-100).
            total_violations (int): Baseline total violations count.
            impact_data (List[Dict[str, Any]]): Baseline impact data per junction.
            
        Returns:
            Dict[str, Any]: Simulation results containing city_summary, hotspots, and insight.
        """
        logger.info(f"Running what-if simulation for {reduction_percentage}% illegal parking reduction...")
        
        factor = 1.0 - (reduction_percentage / 100.0)
        
        # 1. Hotspot-level (Junction-level) simulation details
        hotspot_simulations = []
        for loc in impact_data:
            j_name = loc["junction_name"]
            before_violations = loc["violations"]
            before_impact = loc["impact_score"]
            
            # Apply integer truncation formula
            after_violations = int(before_violations * factor)
            after_impact = int(before_impact * factor)
            
            hotspot_simulations.append({
                "junction_name": j_name,
                "before_violations": before_violations,
                "after_violations": after_violations,
                "before_impact": before_impact,
                "after_impact": after_impact,
                "improvement_percentage": reduction_percentage
            })
            
        # 2. City-wide aggregated summary
        violations_before = total_violations
        violations_after = int(violations_before * factor)
        
        # Average impact before is calculated as mean of baseline impact scores
        if impact_data:
            impact_before = int(round(np.mean([loc["impact_score"] for loc in impact_data])))
        else:
            impact_before = 0
            
        impact_after = int(impact_before * factor)
        
        # Congestion proxy is equal to impact score
        congestion_before = impact_before
        congestion_after = impact_after
        
        city_summary = {
            "violations_before": violations_before,
            "violations_after": violations_after,
            "impact_before": impact_before,
            "impact_after": impact_after,
            "congestion_before": congestion_before,
            "congestion_after": congestion_after,
            "improvement_percentage": reduction_percentage
        }
        
        # 3. AI Recommendation / Insight layer
        if reduction_percentage >= 50:
            insight = f"A major {reduction_percentage}% reduction in illegal parking could drastically clear critical bottlenecks and lower congestion by approximately {reduction_percentage}%."
        elif reduction_percentage >= 30:
            insight = f"A {reduction_percentage}% reduction in illegal parking could significantly reduce congestion in critical hotspots."
        elif reduction_percentage >= 10:
            insight = f"A minor {reduction_percentage}% reduction in illegal parking provides noticeable congestion improvements across medium-severity hotspots."
        else:
            insight = f"A minimal {reduction_percentage}% reduction shows negligible citywide congestion improvements."
            
        logger.info("What-if simulation run complete.")
        
        return {
            "city_summary": city_summary,
            "hotspots": hotspot_simulations,
            "insight": insight
        }
        
    def generate_scenarios(self) -> List[Dict[str, Any]]:
        """
        Generates precalculated comparative scenarios for 10%, 20%, 30%, and 50% reductions.
        
        Returns:
            List[Dict[str, Any]]: List of scenario comparative results.
        """
        logger.info("Generating precalculated comparative scenarios...")
        
        scenarios = [
            {"scenario": "10%", "impact_reduction": 10},
            {"scenario": "20%", "impact_reduction": 20},
            {"scenario": "30%", "impact_reduction": 30},
            {"scenario": "50%", "impact_reduction": 50}
        ]
        return scenarios
