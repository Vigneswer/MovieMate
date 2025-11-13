from fastapi import APIRouter, Depends, HTTPException, status, Query, Path
import logging
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.schemas.movie import Movie as MovieSchema, MovieCreate, MovieUpdate, WatchStatus, Platform, ContentType
from app.models.movie import Movie as MovieModel
from app.crud.movie import movie_crud
from app.services.tmdb import tmdb_service
from app.services.recommendations import MovieRecommendationEngine
from app.services.gemini import gemini_service

router = APIRouter(prefix="/movies", tags=["Movies & TV Shows"])
logger = logging.getLogger(__name__)


# ==================== COLLECTION ENDPOINTS ====================

@router.get("/", response_model=List[MovieSchema], summary="Get all content")
def get_movies(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of records to return"),
    content_type: Optional[ContentType] = Query(None, description="Filter by content type"),
    status: Optional[WatchStatus] = Query(None, description="Filter by watch status"),
    platform: Optional[Platform] = Query(None, description="Filter by platform"),
    db: Session = Depends(get_db)
):
    """
    Retrieve all movies/TV shows with optional filtering.
    """
    query = db.query(MovieModel)
    
    if content_type:
        query = query.filter(MovieModel.content_type == content_type)
    if status:
        query = query.filter(MovieModel.status == status)
    if platform:
        query = query.filter(MovieModel.platform == platform)
    
    movies = query.order_by(MovieModel.created_at.desc()).offset(skip).limit(limit).all()
    return movies


@router.get("/search", response_model=List[MovieSchema], summary="Search content in collection")
def search_movies(
    q: str = Query(..., min_length=1, description="Search query"),
    db: Session = Depends(get_db)
):
    """
    Search movies/TV shows in your collection by title, genre, or director.
    """
    movies = movie_crud.search(db, query=q)
    return movies


@router.get("/genre/{genre}", response_model=List[MovieSchema], summary="Get content by genre")
def get_movies_by_genre(
    genre: str,
    db: Session = Depends(get_db)
):
    """
    Get all movies/TV shows of a specific genre.
    """
    movies = movie_crud.get_by_genre(db, genre=genre)
    return movies


@router.get("/status/{status}", response_model=List[MovieSchema], summary="Get content by status")
def get_movies_by_status(
    status: WatchStatus,
    db: Session = Depends(get_db)
):
    """
    Get all content with a specific watch status (wishlist, watching, completed).
    """
    movies = movie_crud.get_by_status(db, status=status)
    return movies


@router.get("/platform/{platform}", response_model=List[MovieSchema], summary="Get content by platform")
def get_movies_by_platform(
    platform: Platform,
    db: Session = Depends(get_db)
):
    """
    Get all content from a specific streaming platform.
    """
    movies = movie_crud.get_by_platform(db, platform=platform)
    return movies


@router.get("/favorites", response_model=List[MovieSchema], summary="Get favorite content")
def get_favorite_movies(db: Session = Depends(get_db)):
    """
    Retrieve all movies/TV shows marked as favorites.
    """
    movies = movie_crud.get_favorites(db)
    return movies


@router.get("/type/{content_type}", response_model=List[MovieSchema], summary="Get content by type")
def get_by_type(
    content_type: ContentType,
    db: Session = Depends(get_db)
):
    """
    Get all content of a specific type (movie or tv_show).
    """
    movies = movie_crud.get_by_type(db, content_type=content_type)
    return movies


@router.get("/{movie_id}", response_model=MovieSchema, summary="Get content by ID")
def get_movie(
    movie_id: int,
    db: Session = Depends(get_db)
):
    """
    Get a specific movie/TV show by ID.
    """
    movie = movie_crud.get_by_id(db, movie_id=movie_id)
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with id {movie_id} not found"
        )
    return movie


# ==================== CREATE/UPDATE/DELETE ENDPOINTS ====================

@router.post("/", response_model=MovieSchema, status_code=status.HTTP_201_CREATED, summary="Add content to collection")
def create_movie(
    movie: MovieCreate,
    db: Session = Depends(get_db)
):
    """
    Add a new movie/TV show to your collection.
    """
    # Check if already exists by TMDB ID
    if movie.tmdb_id:
        existing = movie_crud.get_by_tmdb_id(db, tmdb_id=movie.tmdb_id, content_type=movie.content_type)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"This content is already in your collection (ID: {existing.id})"
            )
    
    return movie_crud.create(db, movie=movie)


@router.put("/{movie_id}", response_model=MovieSchema, summary="Update content")
def update_movie(
    movie_id: int,
    movie_update: MovieUpdate,
    db: Session = Depends(get_db)
):
    """
    Update a movie/TV show's information.
    """
    movie = movie_crud.update(db, movie_id=movie_id, movie_update=movie_update)
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with id {movie_id} not found"
        )
    return movie


@router.delete("/{movie_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete content")
def delete_movie(
    movie_id: int,
    db: Session = Depends(get_db)
):
    """
    Delete a movie/TV show from your collection.
    """
    success = movie_crud.delete(db, movie_id=movie_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with id {movie_id} not found"
        )


# ==================== ACTION ENDPOINTS ====================

@router.patch("/{movie_id}/favorite", response_model=MovieSchema, summary="Toggle favorite status")
def toggle_favorite(
    movie_id: int,
    db: Session = Depends(get_db)
):
    """
    Toggle the favorite status of a movie/TV show.
    """
    movie = movie_crud.toggle_favorite(db, movie_id=movie_id)
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with id {movie_id} not found"
        )
    return movie


@router.patch("/{movie_id}/status", response_model=MovieSchema, summary="Update watch status")
def update_status(
    movie_id: int,
    new_status: WatchStatus,
    db: Session = Depends(get_db)
):
    """
    Update the watch status of content (wishlist, watching, completed).
    """
    movie = movie_crud.get_by_id(db, movie_id)
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Content with id {movie_id} not found"
        )
    
    movie_update = MovieUpdate(status=new_status)
    if new_status == WatchStatus.COMPLETED:
        from datetime import datetime
        movie.watched_at = datetime.now()
    
    movie = movie_crud.update(db, movie_id=movie_id, movie_update=movie_update)
    return movie


@router.patch("/{movie_id}/progress", response_model=MovieSchema, summary="Update TV show progress")
def update_progress(
    movie_id: int,
    episodes_watched: int = Query(..., ge=0, description="Episodes watched"),
    current_season: Optional[int] = Query(None, ge=1, description="Current season"),
    current_episode: Optional[int] = Query(None, ge=1, description="Current episode"),
    db: Session = Depends(get_db)
):
    """
    Update progress for a TV show (episodes watched, current season/episode).
    """
    movie = movie_crud.update_progress(
        db, 
        movie_id=movie_id, 
        episodes_watched=episodes_watched,
        current_season=current_season,
        current_episode=current_episode
    )
    if not movie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TV show with id {movie_id} not found"
        )
    return movie


# ==================== TMDB INTEGRATION ENDPOINTS ====================

@router.get("/tmdb/search/movies", summary="Search movies on TMDB")
async def tmdb_search_movies(
    q: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1, description="Page number")
):
    """
    Search for movies on TMDB to add to your collection.
    """
    results = await tmdb_service.search_movies(q, page)
    return results


@router.get("/tmdb/search/tv", summary="Search TV shows on TMDB")
async def tmdb_search_tv(
    q: str = Query(..., min_length=1, description="Search query"),
    page: int = Query(1, ge=1, description="Page number")
):
    """
    Search for TV shows on TMDB to add to your collection.
    """
    results = await tmdb_service.search_tv_shows(q, page)
    return results


@router.get("/tmdb/movie/{imdb_id}", summary="Get movie details from OMDb")
async def tmdb_get_movie(imdb_id: str):
    """
    Get detailed information about a movie from OMDb using IMDb ID.
    """
    details = await tmdb_service.get_movie_details(imdb_id)
    if not details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Movie with IMDb ID {imdb_id} not found"
        )
    return details


@router.get("/tmdb/tv/{imdb_id}", summary="Get TV show details from OMDb")
async def tmdb_get_tv(imdb_id: str):
    """
    Get detailed information about a TV show from OMDb using IMDb ID.
    """
    details = await tmdb_service.get_tv_show_details(imdb_id)
    if not details:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"TV show with IMDb ID {imdb_id} not found"
        )
    return details


@router.get("/tmdb/trending/{media_type}", summary="Get trending content from TMDB")
async def tmdb_trending(
    media_type: str = Path(..., description="Media type: 'movie', 'tv', or 'all'"),
    time_window: str = Query("week", description="Time window: 'day' or 'week'")
):
    """
    Get trending movies/TV shows from TMDB.
    """
    results = await tmdb_service.get_trending(media_type, time_window)
    return results


@router.get("/tmdb/popular/movies", summary="Get popular movies from TMDB")
async def tmdb_popular_movies(page: int = Query(1, ge=1)):
    """
    Get popular movies from TMDB.
    """
    results = await tmdb_service.get_popular_movies(page)
    return results


@router.get("/tmdb/popular/tv", summary="Get popular TV shows from TMDB")
async def tmdb_popular_tv(page: int = Query(1, ge=1)):
    """
    Get popular TV shows from TMDB.
    """
    results = await tmdb_service.get_popular_tv_shows(page)
    return results


# ==================== ANALYTICS ENDPOINTS ====================

@router.get("/analytics/stats", summary="Get collection statistics")
def get_stats(db: Session = Depends(get_db)):
    """
    Get statistics about your movie/TV show collection.
    """
    from sqlalchemy import func
    
    total_count = db.query(func.count(MovieModel.id)).scalar()
    movies_count = db.query(func.count(MovieModel.id)).filter(MovieModel.content_type == ContentType.MOVIE).scalar()
    tv_count = db.query(func.count(MovieModel.id)).filter(MovieModel.content_type == ContentType.TV_SHOW).scalar()
    
    wishlist_count = db.query(func.count(MovieModel.id)).filter(MovieModel.status == WatchStatus.WISHLIST).scalar()
    watching_count = db.query(func.count(MovieModel.id)).filter(MovieModel.status == WatchStatus.WATCHING).scalar()
    completed_count = db.query(func.count(MovieModel.id)).filter(MovieModel.status == WatchStatus.COMPLETED).scalar()
    
    favorites_count = db.query(func.count(MovieModel.id)).filter(MovieModel.is_favorite == True).scalar()
    
    # Calculate total watch time for movies
    total_movie_time = db.query(func.sum(MovieModel.duration)).filter(
        MovieModel.content_type == ContentType.MOVIE,
        MovieModel.status == WatchStatus.COMPLETED
    ).scalar() or 0
    
    # Get genre distribution
    genres_result = db.query(MovieModel.genre).filter(MovieModel.genre.isnot(None)).all()
    genre_dict = {}
    for (genre_str,) in genres_result:
        if genre_str:
            for genre in genre_str.split(","):
                genre = genre.strip()
                genre_dict[genre] = genre_dict.get(genre, 0) + 1
    
    # Get platform distribution
    platform_result = db.query(MovieModel.platform, func.count(MovieModel.id)).filter(
        MovieModel.platform.isnot(None)
    ).group_by(MovieModel.platform).all()
    platform_stats = {platform.value: count for platform, count in platform_result}
    
    return {
        "total_content": total_count,
        "movies": movies_count,
        "tv_shows": tv_count,
        "wishlist": wishlist_count,
        "watching": watching_count,
        "completed": completed_count,
        "favorites": favorites_count,
        "total_watch_time_minutes": total_movie_time,
        "total_watch_time_hours": round(total_movie_time / 60, 1) if total_movie_time else 0,
        "genre_distribution": genre_dict,
        "platform_distribution": platform_stats
    }


@router.get("/analytics/watch-time", summary="Get watch time analytics")
def get_watch_time_analytics(
    period: str = Query("weekly", regex="^(weekly|monthly)$", description="Time period: weekly or monthly"),
    db: Session = Depends(get_db)
):
    """
    Get watch time analytics grouped by week or month.
    Returns the time spent watching content over time.
    """
    from datetime import datetime, timedelta
    from sqlalchemy import extract, case
    
    # Get completed movies and TV shows with their watch dates
    completed_content = db.query(
        MovieModel.watched_at,
        MovieModel.duration,
        MovieModel.content_type,
        MovieModel.episodes_watched,
        MovieModel.total_episodes
    ).filter(
        MovieModel.status == WatchStatus.COMPLETED,
        MovieModel.watched_at.isnot(None)
    ).all()
    
    # Group data by period
    time_data = {}
    
    for watched_at, duration, content_type, episodes_watched, total_episodes in completed_content:
        if not watched_at:
            continue
            
        # Determine the period key
        if period == "weekly":
            # Get the Monday of the week
            days_since_monday = watched_at.weekday()
            monday = watched_at - timedelta(days=days_since_monday)
            period_key = monday.strftime("%Y-%m-%d")
            period_label = f"Week of {monday.strftime('%b %d, %Y')}"
        else:  # monthly
            period_key = watched_at.strftime("%Y-%m")
            period_label = watched_at.strftime("%B %Y")
        
        # Calculate watch time
        if content_type == ContentType.MOVIE:
            watch_time = duration or 0
        else:  # TV Show
            # Estimate: assume each episode is ~45 minutes if no duration specified
            if episodes_watched and episodes_watched > 0:
                episode_duration = (duration / total_episodes) if (duration and total_episodes) else 45
                watch_time = episodes_watched * episode_duration
            else:
                watch_time = 0
        
        # Add to time data
        if period_key not in time_data:
            time_data[period_key] = {
                "period": period_label,
                "date": period_key,
                "watch_time_minutes": 0,
                "watch_time_hours": 0,
                "content_count": 0
            }
        
        time_data[period_key]["watch_time_minutes"] += watch_time
        time_data[period_key]["content_count"] += 1
    
    # Convert to hours and sort by date
    sorted_data = []
    for key in sorted(time_data.keys()):
        data = time_data[key]
        data["watch_time_hours"] = round(data["watch_time_minutes"] / 60, 1)
        sorted_data.append(data)
    
    return {
        "period": period,
        "data": sorted_data,
        "total_periods": len(sorted_data)
    }


# ==================== RECOMMENDATION ENDPOINTS ====================

@router.get("/recommendations/surprise-me", summary="Get personalized recommendations from OMDb")
async def get_surprise_me_recommendations(
    count: int = Query(10, ge=1, le=50, description="Number of recommendations to return"),
    db: Session = Depends(get_db)
):
    """
    Get personalized movie/TV recommendations from OMDb based on your collection.
    
    Searches OMDb for new movies matching your preferences (genres, directors, actors).
    Requires at least 1 movie in your collection to generate recommendations.
    """
    # Check how many movies exist first
    total_movies = db.query(MovieModel).count()
    
    logger.info("🎯 Surprise Me endpoint called with count=%s; total_movies=%s", count, total_movies)
    engine = MovieRecommendationEngine()
    try:
        recommendations = await engine.get_recommendations(db, count=count)
    except Exception as e:
        logger.exception("❌ Error while generating recommendations: %s", e)
        await engine.close()
        # Return a JSON error so CORS middleware can attach headers
        raise HTTPException(status_code=500, detail="Failed to generate recommendations")
    await engine.close()
    
    if not recommendations:
        # Return empty recommendations instead of error
        return {
            "recommendations": [],
            "count": 0,
            "message": f"No recommendations available. You have {total_movies} movie(s) in your collection. Add at least 1 movie to get personalized suggestions from OMDb!"
        }
    
    # Format response - be resilient to missing fields from the external API
    # TMDB/OMDb adapter may return different keys; use safe .get() with fallbacks
    rec_list = (
        recommendations.get("results", [])
        if isinstance(recommendations, dict)
        else recommendations
    )
    result = []
    for rec in rec_list or []:
        try:
            title = rec.get("title") or rec.get("name") or ""
            release_date = rec.get("release_date") or rec.get("first_air_date") or rec.get("year") or ""
            year = release_date[:4] if isinstance(release_date, str) else release_date
            poster = rec.get("poster_url") or rec.get("poster_path") or ""
            imdb_id = rec.get("imdb_id") or rec.get("id") or ""
            overview = rec.get("description") or rec.get("overview") or ""
            imdb_rating = rec.get("imdb_rating") or rec.get("tmdb_rating") or rec.get("vote_average")
            runtime = rec.get("runtime") or rec.get("duration")

            # Frontend expects: id, content_type, actors, plot, match_reasons (array), similarity_score
            match_reason_single = rec.get("match_reason") or rec.get("reason")
            if rec.get("match_reasons"):
                match_reasons = rec.get("match_reasons")
            elif match_reason_single:
                # Split by semicolon if it's a combined reason string
                match_reasons = [r.strip() for r in match_reason_single.split(';') if r.strip()]
            else:
                match_reasons = ["Recommended for you"]
            actors = rec.get("actors") or rec.get("cast") or ""
            similarity_score = rec.get("similarity_score") or rec.get("similarity") or 0.66
            content_type = rec.get("content_type") or rec.get("media_type") or "movie"

            result.append({
                "id": imdb_id,
                "title": title,
                "year": year,
                "genre": rec.get("genre", ""),
                "director": rec.get("director", ""),
                "actors": actors,
                "plot": overview,
                "poster_url": poster,
                "imdb_id": imdb_id,
                "imdb_rating": imdb_rating,
                "runtime": runtime,
                "match_reasons": match_reasons,
                "similarity_score": similarity_score,
                "content_type": content_type,
            })
        except Exception:
            logger.exception("⚠️ Failed to normalize a recommendation item: %s", rec)
            continue
    
    return {
        "recommendations": result,
        "count": len(result)
    }


# ==================== AI REVIEW GENERATION ====================

@router.post("/{movie_id}/generate-review", summary="Generate AI review summary")
async def generate_ai_review(
    movie_id: int = Path(..., description="Movie ID"),
    user_comments: str = Query(..., description="User's thoughts/comments about the movie"),
    db: Session = Depends(get_db)
):
    """
    Generate a concise AI-powered review summary using Gemini based on user comments and movie overview.
    """
    logger.info(f"🤖 Generating AI review for movie ID: {movie_id}")
    
    # Get movie from database
    movie = movie_crud.get_by_id(db, movie_id)
    if not movie:
        raise HTTPException(status_code=404, detail="Movie not found")
    
    # Check if movie has been watched
    if movie.status not in [WatchStatus.COMPLETED, WatchStatus.WATCHING]:
        raise HTTPException(
            status_code=400,
            detail="Can only generate reviews for watched movies"
        )
    
    if not movie.description:
        raise HTTPException(
            status_code=400,
            detail="Movie must have an overview/description to generate review"
        )
    
    # Generate review using Gemini
    try:
        review_summary = await gemini_service.generate_review_summary(
            movie_title=movie.title,
            movie_overview=movie.description,
            user_comments=user_comments,
            user_rating=movie.user_rating
        )
        
        if not review_summary:
            raise HTTPException(
                status_code=500,
                detail="Failed to generate review summary"
            )
        
        logger.info(f"✅ Generated review for {movie.title}")
        
        return {
            "movie_id": movie_id,
            "movie_title": movie.title,
            "generated_review": review_summary,
            "user_comments": user_comments,
            "user_rating": movie.user_rating
        }
        
    except Exception as e:
        logger.exception(f"❌ Error generating review: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate review: {str(e)}"
        )
