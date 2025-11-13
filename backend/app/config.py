from pydantic_settings import BaseSettings
from typing import List
import os
from pathlib import Path

# Get the backend directory path
BACKEND_DIR = Path(__file__).resolve().parent.parent
ENV_FILE = BACKEND_DIR / ".env"


class Settings(BaseSettings):
    """Application settings and configuration."""
    
    # Database
    DATABASE_URL: str
    
    # API
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    DEBUG: bool = True
    
    # CORS - Allow all localhost origins for development
    CORS_ORIGINS: str = "*"
    
    # TMDB API
    TMDB_API_KEY: str
    
    # OMDB API
    OMDB_API_KEY: str
    
    # Gemini API
    GEMINI_API_KEY: str
    
    # Project Info
    PROJECT_NAME: str = "MovieMate API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Movie Database API with PostgreSQL"
    
    class Config:
        env_file = str(ENV_FILE)
        env_file_encoding = 'utf-8'
        case_sensitive = True
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Convert comma-separated CORS origins to list."""
        if self.CORS_ORIGINS == "*":
            return ["*"]
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]


settings = Settings()
