from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Boolean, Enum
from sqlalchemy.sql import func
from app.database import Base
import enum


class ContentType(str, enum.Enum):
    """Content type enum for movies and TV shows."""
    MOVIE = "movie"
    TV_SHOW = "tv_show"


class WatchStatus(str, enum.Enum):
    """Watch status enum."""
    WISHLIST = "wishlist"
    WATCHING = "watching"
    COMPLETED = "completed"


class Platform(str, enum.Enum):
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


class Movie(Base):
    """Movie/TV Show model for storing content information."""
    
    __tablename__ = "movies"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Basic Info
    content_type = Column(Enum(ContentType), nullable=False, default=ContentType.MOVIE, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    release_year = Column(Integer, nullable=True)
    genre = Column(String(200), nullable=True, index=True)  # Comma-separated genres
    director = Column(String(200), nullable=True)
    cast = Column(Text, nullable=True)  # Comma-separated list of actors
    
    # Media
    poster_url = Column(String(500), nullable=True)
    backdrop_url = Column(String(500), nullable=True)
    trailer_url = Column(String(500), nullable=True)
    
    # Watch Info
    platform = Column(Enum(Platform), nullable=True, index=True)
    status = Column(Enum(WatchStatus), nullable=False, default=WatchStatus.WISHLIST, index=True)
    
    # Movie specific
    duration = Column(Integer, nullable=True)  # Duration in minutes
    
    # TV Show specific
    total_seasons = Column(Integer, nullable=True)
    total_episodes = Column(Integer, nullable=True)
    episodes_watched = Column(Integer, default=0)
    current_season = Column(Integer, nullable=True)
    current_episode = Column(Integer, nullable=True)
    
    # User ratings and reviews
    user_rating = Column(Float, nullable=True)  # User's rating out of 10
    tmdb_rating = Column(Float, nullable=True)  # TMDB rating out of 10
    review = Column(Text, nullable=True)  # User's review
    notes = Column(Text, nullable=True)  # User's personal notes
    
    # TMDB/OMDb Integration
    tmdb_id = Column(String(50), nullable=True, index=True)  # TMDB ID or IMDb ID
    
    # Flags
    is_favorite = Column(Boolean, default=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    watched_at = Column(DateTime(timezone=True), nullable=True)  # When completed
    
    def __repr__(self):
        return f"<Movie(id={self.id}, title='{self.title}', type={self.content_type}, status={self.status})>"
