from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime
from enum import Enum


class ContentType(str, Enum):
    """Content type enum."""
    MOVIE = "movie"
    TV_SHOW = "tv_show"


class WatchStatus(str, Enum):
    """Watch status enum."""
    WISHLIST = "wishlist"
    WATCHING = "watching"
    COMPLETED = "completed"


class Platform(str, Enum):
    """Streaming platform enum."""
    NETFLIX = "Netflix"
    PRIME_VIDEO = "Prime Video"
    DISNEY_PLUS = "Disney+"
    HBO_MAX = "HBO Max"
    HULU = "Hulu"
    APPLE_TV = "Apple TV+"
    YOUTUBE = "YouTube"
    THEATER = "Theater"
    OTHER = "Other"


class MovieBase(BaseModel):
    """Base schema for Movie/TV Show with common attributes."""
    
    content_type: ContentType = Field(default=ContentType.MOVIE, description="Content type (movie or tv_show)")
    title: str = Field(..., min_length=1, max_length=255, description="Title")
    description: Optional[str] = Field(None, description="Description/plot")
    release_year: Optional[int] = Field(None, ge=1888, le=2100, description="Release year")
    genre: Optional[str] = Field(None, max_length=200, description="Comma-separated genres")
    director: Optional[str] = Field(None, max_length=200, description="Director name")
    cast: Optional[str] = Field(None, description="Comma-separated cast members")
    
    # Media
    poster_url: Optional[str] = Field(None, max_length=500, description="Poster image URL")
    backdrop_url: Optional[str] = Field(None, max_length=500, description="Backdrop image URL")
    trailer_url: Optional[str] = Field(None, max_length=500, description="Trailer video URL")
    
    # Watch info
    platform: Optional[Platform] = Field(None, description="Streaming platform")
    status: WatchStatus = Field(default=WatchStatus.WISHLIST, description="Watch status")
    
    # Movie specific
    duration: Optional[int] = Field(None, ge=1, description="Duration in minutes (for movies)")
    
    # TV Show specific
    total_seasons: Optional[int] = Field(None, ge=1, description="Total seasons (for TV shows)")
    total_episodes: Optional[int] = Field(None, ge=1, description="Total episodes (for TV shows)")
    episodes_watched: int = Field(default=0, ge=0, description="Episodes watched (for TV shows)")
    current_season: Optional[int] = Field(None, ge=1, description="Current season (for TV shows)")
    current_episode: Optional[int] = Field(None, ge=1, description="Current episode (for TV shows)")
    
    # Ratings and reviews
    user_rating: Optional[float] = Field(None, ge=0, le=10, description="User's rating out of 10")
    tmdb_rating: Optional[float] = Field(None, ge=0, le=10, description="TMDB rating out of 10")
    review: Optional[str] = Field(None, description="User's review")
    notes: Optional[str] = Field(None, description="User's personal notes")
    
    # TMDB/OMDb ID
    tmdb_id: Optional[str] = Field(None, description="TMDB or IMDb ID")
    
    # Flags
    is_favorite: bool = Field(default=False, description="Whether marked as favorite")


class MovieCreate(MovieBase):
    """Schema for creating a new movie."""
    pass


class MovieUpdate(BaseModel):
    """Schema for updating a movie (all fields optional)."""
    
    content_type: Optional[ContentType] = None
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    release_year: Optional[int] = Field(None, ge=1888, le=2100)
    genre: Optional[str] = Field(None, max_length=200)
    director: Optional[str] = Field(None, max_length=200)
    cast: Optional[str] = None
    poster_url: Optional[str] = Field(None, max_length=500)
    backdrop_url: Optional[str] = Field(None, max_length=500)
    trailer_url: Optional[str] = Field(None, max_length=500)
    platform: Optional[Platform] = None
    status: Optional[WatchStatus] = None
    duration: Optional[int] = Field(None, ge=1)
    total_seasons: Optional[int] = Field(None, ge=1)
    total_episodes: Optional[int] = Field(None, ge=1)
    episodes_watched: Optional[int] = Field(None, ge=0)
    current_season: Optional[int] = Field(None, ge=1)
    current_episode: Optional[int] = Field(None, ge=1)
    user_rating: Optional[float] = Field(None, ge=0, le=10)
    tmdb_rating: Optional[float] = Field(None, ge=0, le=10)
    review: Optional[str] = None
    notes: Optional[str] = None
    tmdb_id: Optional[int] = None
    is_favorite: Optional[bool] = None


class MovieInDB(MovieBase):
    """Schema for movie as stored in database."""
    
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    watched_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


class Movie(MovieInDB):
    """Schema for movie response."""
    pass
