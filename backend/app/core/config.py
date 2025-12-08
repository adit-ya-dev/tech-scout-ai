from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Tech Scout AI"
    API_V1_STR: str = "/api/v1"
    
    # Supabase
    SUPABASE_URL: str
    SUPABASE_KEY: str
    
    # Firecrawl
    FIRECRAWL_API_KEY: Optional[str] = None
    
    # Hugging Face
    HUGGINGFACE_API_KEY: Optional[str] = None
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

settings = Settings()
