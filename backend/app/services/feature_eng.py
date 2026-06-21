import pandas as pd
from app.utils.logger import logger
from app.core.config import settings

class FeatureEngineer:
    """
    Feature engineering pipeline that extracts temporal features from the dataset.
    """
    
    def process(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Executes the feature engineering pipeline.
        
        Args:
            df (pd.DataFrame): Dataframe containing 'created_datetime' column.
            
        Returns:
            pd.DataFrame: Dataframe with engineered features.
        """
        logger.info("Starting temporal feature engineering pipeline...")
        
        if 'created_datetime' not in df.columns:
            error_msg = "Required column 'created_datetime' is missing from the dataset."
            logger.error(error_msg)
            raise ValueError(error_msg)
            
        try:
            # Copy dataframe to avoid modifying the input in-place
            df_feat = df.copy()
            
            # Ensure created_datetime is properly formatted
            if not pd.api.types.is_datetime64_any_dtype(df_feat['created_datetime']):
                logger.warning("'created_datetime' is not datetime type. Converting now...")
                df_feat['created_datetime'] = pd.to_datetime(df_feat['created_datetime'], errors='coerce')
                
            # Extract basic temporal components
            logger.info("Extracting hour, day, month, and weekday...")
            df_feat['hour'] = df_feat['created_datetime'].dt.hour
            df_feat['day'] = df_feat['created_datetime'].dt.day
            df_feat['month'] = df_feat['created_datetime'].dt.month
            df_feat['weekday'] = df_feat['created_datetime'].dt.weekday  # 0=Monday, 6=Sunday
            
            # Calculate weekend flag (Saturday=5, Sunday=6)
            logger.info("Calculating weekend flag...")
            df_feat['is_weekend'] = df_feat['weekday'].isin([5, 6])
            
            # Calculate peak hour flag
            logger.info("Calculating peak hour flag...")
            morning_start, morning_end = settings.PEAK_HOURS_MORNING
            evening_start, evening_end = settings.PEAK_HOURS_EVENING
            
            # check morning and evening ranges
            is_morning_peak = (df_feat['hour'] >= morning_start) & (df_feat['hour'] < morning_end)
            is_evening_peak = (df_feat['hour'] >= evening_start) & (df_feat['hour'] < evening_end)
            df_feat['is_peak_hour'] = is_morning_peak | is_evening_peak
            
            # Use nullable pandas types so that if there are NaT values in datetime,
            # they are represented as <NA> rather than converting integers to float64.
            for col in ['hour', 'day', 'month', 'weekday']:
                df_feat[col] = df_feat[col].astype("Int64")
                
            df_feat['is_weekend'] = df_feat['is_weekend'].astype("boolean")
            df_feat['is_peak_hour'] = df_feat['is_peak_hour'].astype("boolean")
            
            logger.info("Feature engineering pipeline completed successfully.")
            return df_feat
            
        except Exception as e:
            logger.error(f"Error occurred during feature engineering: {str(e)}")
            raise e
