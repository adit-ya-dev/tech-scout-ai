"""
Application settings - no API keys required!
"""
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    PROJECT_NAME: str = "Tech Scout AI"
    API_V1_STR: str = "/api/v1"
    
    # Database (SQLite for dev, PostgreSQL for production)
    DATABASE_URL: str = "sqlite:///./techscout.db"
    
    # AI Models (local, no API keys needed)
    GRANITE_MODEL: str = "ibm-granite/granite-3.0-2b-instruct"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"
    
    # Optional: For faster embedding with GPU
    USE_GPU: bool = False
    
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True,
        extra="ignore",  # Ignore extra env vars
    )


settings = Settings()
