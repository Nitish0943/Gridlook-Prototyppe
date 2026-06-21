import os
import pandas as pd
from pathlib import Path
from app.utils.logger import logger
from app.core.config import settings

class DataLoader:
    """
    DataLoader service responsible for reading the violations CSV dataset,
    handling missing values, deduplication, and parsing datetime fields.
    """
    def __init__(self, file_path: Path = settings.DATA_PATH):
        self.file_path = file_path

    def load_data(self) -> pd.DataFrame:
        """
        Loads, cleans, and prepares the parking violation dataset.
        
        Returns:
            pd.DataFrame: Cleaned dataframe.
        """
        logger.info(f"Starting data ingestion from {self.file_path}...")
        
        if not os.path.exists(self.file_path):
            error_msg = f"Dataset file not found at {self.file_path}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)
            
        try:
            # Ingest raw CSV data
            df = pd.read_csv(self.file_path)
            initial_rows = len(df)
            logger.info(f"Loaded {initial_rows} raw records.")
            
            # Handle missing values safely: map common string representations of null to pd.NA
            null_representations = ["NULL", "null", "None", "nan", "NaN", ""]
            df = df.replace(null_representations, pd.NA)
            
            # Remove duplicate records (based on unique identifier 'id')
            df = df.drop_duplicates(subset=['id'], keep='first')
            cleaned_rows = len(df)
            duplicates_removed = initial_rows - cleaned_rows
            
            if duplicates_removed > 0:
                logger.info(f"Removed {duplicates_removed} duplicate records by 'id'.")
            else:
                logger.info("No duplicate records found.")
                
            # Convert datetime columns properly to pandas Datetime TZ-aware/unaware objects
            datetime_columns = [
                "created_datetime",
                "closed_datetime",
                "modified_datetime",
                "action_taken_timestamp",
                "validation_timestamp",
                "data_sent_to_scita_timestamp"
            ]
            
            for col in datetime_columns:
                if col in df.columns:
                    logger.info(f"Converting column {col} to datetime...")
                    df[col] = pd.to_datetime(df[col], errors='coerce')
                    
            logger.info("Data ingestion and cleaning completed successfully.")
            return df
            
        except Exception as e:
            logger.error(f"Critical error occurred during data loading: {str(e)}")
            raise e
