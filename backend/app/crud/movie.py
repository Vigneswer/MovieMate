from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.movie import Movie, WatchStatus, Platform, ContentType
from app.schemas.movie import MovieCreate, MovieUpdate


class MovieCRUD:
    """CRUD operations for Movie model."""
    
    def get_all(self, db: Session, skip: int = 0, limit: int = 100) -> List[Movie]:
        """Get all movies with pagination."""
        return db.query(Movie).order_by(Movie.created_at.desc()).offset(skip).limit(limit).all()
    
    def get_by_id(self, db: Session, movie_id: int) -> Optional[Movie]:
        """Get a movie by ID."""
        return db.query(Movie).filter(Movie.id == movie_id).first()
    
    def get_by_title(self, db: Session, title: str) -> Optional[Movie]:
        """Get a movie by title."""
        return db.query(Movie).filter(Movie.title == title).first()
    
    def search(self, db: Session, query: str) -> List[Movie]:
        """Search movies by title, genre, or director."""
        search_pattern = f"%{query}%"
        return db.query(Movie).filter(
            (Movie.title.ilike(search_pattern)) |
            (Movie.genre.ilike(search_pattern)) |
            (Movie.director.ilike(search_pattern))
        ).all()
    
    def get_by_genre(self, db: Session, genre: str) -> List[Movie]:
        """Get all movies of a specific genre."""
        return db.query(Movie).filter(Movie.genre.ilike(f"%{genre}%")).all()
    
    def get_favorites(self, db: Session) -> List[Movie]:
        """Get all favorite movies."""
        return db.query(Movie).filter(Movie.is_favorite == True).all()
    
    def get_watched(self, db: Session) -> List[Movie]:
        """Get all watched movies."""
        return db.query(Movie).filter(Movie.status == WatchStatus.COMPLETED).all()
    
    def get_by_status(self, db: Session, status: WatchStatus) -> List[Movie]:
        """Get movies by watch status."""
        return db.query(Movie).filter(Movie.status == status).order_by(Movie.created_at.desc()).all()
    
    def get_by_platform(self, db: Session, platform: Platform) -> List[Movie]:
        """Get movies by platform."""
        return db.query(Movie).filter(Movie.platform == platform).order_by(Movie.created_at.desc()).all()
    
    def get_by_type(self, db: Session, content_type: ContentType) -> List[Movie]:
        """Get content by type (movie or tv_show)."""
        return db.query(Movie).filter(Movie.content_type == content_type).order_by(Movie.created_at.desc()).all()
    
    def get_by_tmdb_id(self, db: Session, tmdb_id: int, content_type: ContentType) -> Optional[Movie]:
        """Get a movie/show by TMDB ID and type."""
        return db.query(Movie).filter(
            Movie.tmdb_id == tmdb_id,
            Movie.content_type == content_type
        ).first()
    
    def create(self, db: Session, movie: MovieCreate) -> Movie:
        """Create a new movie."""
        db_movie = Movie(**movie.model_dump())
        db.add(db_movie)
        db.commit()
        db.refresh(db_movie)
        return db_movie
    
    def update(self, db: Session, movie_id: int, movie_update: MovieUpdate) -> Optional[Movie]:
        """Update a movie."""
        db_movie = self.get_by_id(db, movie_id)
        if not db_movie:
            return None
        
        # Update only provided fields
        update_data = movie_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_movie, field, value)
        
        db.commit()
        db.refresh(db_movie)
        return db_movie
    
    def delete(self, db: Session, movie_id: int) -> bool:
        """Delete a movie."""
        db_movie = self.get_by_id(db, movie_id)
        if not db_movie:
            return False
        
        db.delete(db_movie)
        db.commit()
        return True
    
    def toggle_favorite(self, db: Session, movie_id: int) -> Optional[Movie]:
        """Toggle favorite status of a movie."""
        db_movie = self.get_by_id(db, movie_id)
        if not db_movie:
            return None
        
        db_movie.is_favorite = not db_movie.is_favorite
        db.commit()
        db.refresh(db_movie)
        return db_movie
    
    def toggle_watched(self, db: Session, movie_id: int) -> Optional[Movie]:
        """Toggle watched status of a movie."""
        db_movie = self.get_by_id(db, movie_id)
        if not db_movie:
            return None
        
        # Toggle between watching and completed
        if db_movie.status == WatchStatus.COMPLETED:
            db_movie.status = WatchStatus.WATCHING
            db_movie.watched_at = None
        else:
            db_movie.status = WatchStatus.COMPLETED
            from datetime import datetime
            db_movie.watched_at = datetime.now()
        
        db.commit()
        db.refresh(db_movie)
        return db_movie
    
    def update_progress(self, db: Session, movie_id: int, episodes_watched: int, 
                       current_season: Optional[int] = None, 
                       current_episode: Optional[int] = None) -> Optional[Movie]:
        """Update TV show progress."""
        db_movie = self.get_by_id(db, movie_id)
        if not db_movie or db_movie.content_type != ContentType.TV_SHOW:
            return None
        
        db_movie.episodes_watched = episodes_watched
        if current_season is not None:
            db_movie.current_season = current_season
        if current_episode is not None:
            db_movie.current_episode = current_episode
        
        # Auto-complete if all episodes watched
        if db_movie.total_episodes and episodes_watched >= db_movie.total_episodes:
            db_movie.status = WatchStatus.COMPLETED
            from datetime import datetime
            db_movie.watched_at = datetime.now()
        elif db_movie.status == WatchStatus.WISHLIST:
            db_movie.status = WatchStatus.WATCHING
        
        db.commit()
        db.refresh(db_movie)
        return db_movie


# Create a singleton instance
movie_crud = MovieCRUD()
