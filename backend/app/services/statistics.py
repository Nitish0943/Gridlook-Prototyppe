import json
import pandas as pd
from typing import Any, Dict, List
from app.utils.logger import logger

class StatisticsService:
    """
    StatisticsService computes summary statistics on the processed violations dataset.
    """
    
    @staticmethod
    def parse_violation_types(val: Any) -> List[str]:
        """
        Parses a violation_type value (which can be a JSON array string or comma separated values)
        into a list of individual violation type strings.
        
        Args:
            val (Any): Cell value from the violation_type column.
            
        Returns:
            List[str]: List of parsed violation names.
        """
        if not isinstance(val, str):
            return []
        
        val = val.strip()
        if not val or val == "NULL" or val == "NaN":
            return []
            
        try:
            # Parse as JSON if possible
            parsed = json.loads(val)
            if isinstance(parsed, list):
                return [v.strip() for v in parsed if v.strip()]
            return [str(parsed).strip()]
        except (json.JSONDecodeError, TypeError):
            # Fallback parsing for bracketed strings if not valid JSON
            cleaned = val.replace('[', '').replace(']', '').replace('"', '').replace("'", '').split(',')
            return [v.strip() for v in cleaned if v.strip()]

    def calculate_summary(self, df: pd.DataFrame) -> Dict[str, Any]:
        """
        Calculates all required summary statistics.
        
        Args:
            df (pd.DataFrame): Dataframe with engineered features.
            
        Returns:
            Dict[str, Any]: Dictionary containing summary statistics.
        """
        logger.info("Calculating summary statistics...")
        
        try:
            # 1. total_violations
            total_violations = len(df)
            
            # 2. total_police_stations (excl nulls)
            total_police_stations = df['police_station'].dropna().nunique()
            
            # 3. total_junctions (excl 'No Junction', nulls, and empty values)
            junctions = df['junction_name'].dropna()
            junctions_filtered = junctions[(junctions != 'No Junction') & (junctions != '')]
            total_junctions = junctions_filtered.nunique()
            
            # 4. total_vehicle_types (excl nulls)
            total_vehicle_types = df['vehicle_type'].dropna().nunique()
            
            # 5. date_range
            date_range_dict = {"start": "", "end": ""}
            if 'created_datetime' in df.columns:
                valid_dates = df['created_datetime'].dropna()
                if not valid_dates.empty:
                    min_date = valid_dates.min()
                    max_date = valid_dates.max()
                    # Format as YYYY-MM-DD HH:MM:SS
                    date_range_dict["start"] = min_date.strftime("%Y-%m-%d %H:%M:%S")
                    date_range_dict["end"] = max_date.strftime("%Y-%m-%d %H:%M:%S")
            
            # 6. top_violation_types
            # Parse list strings and count individual occurrences
            violation_series = df['violation_type'].dropna()
            individual_violations = []
            for val in violation_series:
                individual_violations.extend(self.parse_violation_types(val))
                
            if individual_violations:
                top_v_counts = pd.Series(individual_violations).value_counts().head(10)
                top_violation_types = [
                    {"violation_type": name, "count": int(count)}
                    for name, count in top_v_counts.items()
                ]
            else:
                top_violation_types = []
                
            stats = {
                "total_violations": total_violations,
                "total_police_stations": total_police_stations,
                "total_junctions": total_junctions,
                "total_vehicle_types": total_vehicle_types,
                "date_range": date_range_dict,
                "top_violation_types": top_violation_types
            }
            
            logger.info("Summary statistics calculated successfully.")
            return stats
            
        except Exception as e:
            logger.error(f"Error calculating summary statistics: {str(e)}")
            raise e
