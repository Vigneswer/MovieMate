from typing import List, Dict, Any, Set
from collections import Counter
import asyncio
import logging
import re

from sqlalchemy.orm import Session

from ..models import Movie, WatchStatus
from .tmdb import TMDBService

logger = logging.getLogger(__name__)


class MovieRecommendationEngine:
    """
    Recommendation engine that searches OMDb for new movies
    based on user's collection preferences.
    """
    
    def __init__(self):
        self.tmdb_service = TMDBService()
    
    def _analyze_preferences(self, movies: List[Movie]) -> Dict[str, Any]:
        """Analyze user's movie collection to determine preferences"""
        genres = []
        directors = []
        actors = []
        years = []
        plot_keywords = []
        highly_rated = []
        
        for movie in movies:
            # Collect genres
            if movie.genre:
                genre_list = [g.strip() for g in movie.genre.split(',')]
                genres.extend(genre_list)
            
            # Collect directors
            if movie.director:
                directors.append(movie.director)
            
            # Collect cast
            if movie.cast:
                cast_list = [c.strip() for c in movie.cast.split(',')[:3]]
                actors.extend(cast_list)
            
            # Collect years for time period matching
            if movie.release_year:
                years.append(movie.release_year)
            
            # Extract keywords from description/overview
            if movie.description:
                keywords = self._extract_keywords(movie.description)
                plot_keywords.extend(keywords)
            
            # Track highly rated movies
            if movie.user_rating and movie.user_rating >= 4:
                highly_rated.append(movie)
        
        # Get top preferences
        genre_counter = Counter(genres)
        director_counter = Counter(directors)
        actor_counter = Counter(actors)
        keyword_counter = Counter(plot_keywords)
        
        # Calculate average year and range
        avg_year = sum(years) / len(years) if years else 2020
        year_range = (min(years) if years else 2000, max(years) if years else 2024)
        
        return {
            'top_genres': [genre for genre, _ in genre_counter.most_common(5)],
            'top_directors': [director for director, _ in director_counter.most_common(2)],
            'top_actors': [actor for actor, _ in actor_counter.most_common(2)],
            'top_keywords': [kw for kw, _ in keyword_counter.most_common(10)],
            'avg_year': int(avg_year),
            'year_range': year_range,
            'highly_rated': highly_rated[:3],
            'all_genres': set(genres)
        }
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract meaningful keywords from plot text"""
        if not text:
            return []
        
        # Remove common words
        stop_words = {'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 
                     'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
                     'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
                     'could', 'should', 'may', 'might', 'must', 'can', 'his', 'her', 'their'}
        
        # Extract words (lowercase, alphanumeric only)
        words = re.findall(r'\b[a-z]{4,}\b', text.lower())
        keywords = [w for w in words if w not in stop_words]
        return keywords[:15]  # Limit to 15 keywords per movie
    
    def _calculate_similarity(self, candidate: Dict, preferences: Dict, existing_titles: Set[str]) -> float:
        """
        Calculate similarity score between candidate movie and user preferences.
        Scores based on: genre match, year proximity, plot keyword overlap.
        """
        score = 0.0
        
        # Genre matching (40% weight)
        candidate_genres = set()
        if candidate.get('genres'):
            candidate_genres = set(g.strip() for g in candidate['genres'].split(','))
        elif candidate.get('genre'):
            candidate_genres = set(g.strip() for g in candidate['genre'].split(','))
        
        genre_overlap = len(candidate_genres & preferences['all_genres'])
        if genre_overlap > 0:
            score += 0.4 * (genre_overlap / max(len(preferences['all_genres']), 1))
        
        # Year proximity (30% weight)
        candidate_year = candidate.get('release_year')
        if candidate_year:
            try:
                year = int(str(candidate_year).split('-')[0][:4])
                year_diff = abs(year - preferences['avg_year'])
                # Closer years get higher scores (max diff 50 years)
                year_score = max(0, 1 - (year_diff / 50))
                score += 0.3 * year_score
            except:
                pass
        
        # Plot keyword matching (30% weight)
        candidate_plot = candidate.get('overview') or candidate.get('description') or ''
        if candidate_plot and preferences['top_keywords']:
            candidate_keywords = set(self._extract_keywords(candidate_plot))
            keyword_overlap = len(candidate_keywords & set(preferences['top_keywords']))
            if keyword_overlap > 0:
                score += 0.3 * (keyword_overlap / len(preferences['top_keywords']))
        
        return score
    
    async def get_recommendations(
        self,
        db: Session,
        count: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get movie recommendations from OMDb based on user's collection.
        Uses content-based filtering: genre similarity, year proximity, plot keyword matching.
        """
        logger.info(f"🎬 Starting recommendation generation for count={count}")
        all_movies = db.query(Movie).all()
        logger.info(f"📊 Found {len(all_movies)} movies in collection")
        
        if len(all_movies) < 1:
            logger.warning("⚠️ No movies in collection, returning empty recommendations")
            return []
        
        watched_movies = [
            m for m in all_movies 
            if m.status in [WatchStatus.COMPLETED, WatchStatus.WATCHING]
        ]
        logger.info(f"✅ Found {len(watched_movies)} watched movies")
        
        if not watched_movies:
            watched_movies = all_movies
            logger.info("ℹ️ No watched movies, using all movies for preferences")
        
        preferences = self._analyze_preferences(watched_movies)
        logger.info(f"🎯 Preferences: genres={preferences['top_genres'][:3]}, "
                   f"years={preferences['year_range']}, keywords={preferences['top_keywords'][:5]}")
        
        existing_titles = {m.title.lower() for m in all_movies}
        existing_imdb_ids = {m.tmdb_id for m in all_movies if m.tmdb_id}
        
        candidate_movies = []
        searches_done = set()
        
        # Strategy 1: Search by top genres to find movies with similar genres
        logger.info("🔍 Strategy 1: Searching for movies by genre...")
        for genre in preferences['top_genres'][:4]:  # Top 4 genres
            if genre not in searches_done:
                searches_done.add(genre)
                logger.info(f"  🎭 Searching: {genre}")
                search_result = await self.tmdb_service.search_movies(genre)
                results = search_result.get('results', [])
                logger.info(f"  📝 Found {len(results)} results")
                
                for movie_data in results[:8]:  # Get more candidates
                    title_lower = movie_data.get('title', '').lower()
                    imdb_id = movie_data.get('id')
                    
                    if title_lower in existing_titles or imdb_id in existing_imdb_ids:
                        continue
                    
                    candidate_movies.append(movie_data)
        
        # Strategy 2: Search by plot keywords to find similar themes
        logger.info("🔍 Strategy 2: Searching by plot keywords...")
        for keyword in preferences['top_keywords'][:5]:  # Top 5 keywords
            if keyword not in searches_done:
                searches_done.add(keyword)
                logger.info(f"  🔑 Searching: {keyword}")
                search_result = await self.tmdb_service.search_movies(keyword)
                results = search_result.get('results', [])
                logger.info(f"  📝 Found {len(results)} results")
                
                for movie_data in results[:5]:
                    title_lower = movie_data.get('title', '').lower()
                    imdb_id = movie_data.get('id')
                    
                    if title_lower in existing_titles or imdb_id in existing_imdb_ids:
                        continue
                    
                    candidate_movies.append(movie_data)
        
        # Strategy 3: Search by directors for stylistic similarity
        logger.info("🔍 Strategy 3: Searching by favorite directors...")
        for director in preferences['top_directors'][:2]:
            if director not in searches_done:
                searches_done.add(director)
                logger.info(f"  🎬 Searching: {director}")
                search_result = await self.tmdb_service.search_movies(director)
                results = search_result.get('results', [])
                
                for movie_data in results[:5]:
                    title_lower = movie_data.get('title', '').lower()
                    imdb_id = movie_data.get('id')
                    
                    if title_lower in existing_titles or imdb_id in existing_imdb_ids:
                        continue
                    
                    candidate_movies.append(movie_data)
        
        logger.info(f"📦 Collected {len(candidate_movies)} candidate movies")
        
        # Deduplicate candidates
        seen_ids = set()
        unique_candidates = []
        for movie in candidate_movies:
            imdb_id = movie.get('id')
            if imdb_id and imdb_id not in seen_ids:
                seen_ids.add(imdb_id)
                unique_candidates.append(movie)
        
        logger.info(f"� Deduplication: {len(unique_candidates)} unique candidates")
        
        # Fetch full details and calculate scores
        logger.info("📊 Fetching details and calculating similarity scores...")
        scored_recommendations = []
        
        for candidate in unique_candidates[:30]:  # Limit API calls
            imdb_id = candidate.get('id')
            if not imdb_id:
                continue
            
            # Fetch full details (includes genre, plot, year)
            details = await self.tmdb_service.get_movie_details(imdb_id)
            if not details:
                continue
            
            # Calculate similarity score
            score = self._calculate_similarity(details, preferences, existing_titles)
            
            if score > 0.2:  # Only keep reasonably similar movies
                # Build match reason
                reasons = []
                if details.get('genre'):
                    matching_genres = set(g.strip() for g in details['genre'].split(',')) & preferences['all_genres']
                    if matching_genres:
                        reasons.append(f"Similar genres: {', '.join(list(matching_genres)[:2])}")
                
                if details.get('release_year'):
                    year_diff = abs(int(str(details['release_year'])[:4]) - preferences['avg_year'])
                    if year_diff <= 5:
                        reasons.append(f"From similar era ({details['release_year']})")
                
                if not reasons:
                    reasons.append("Matches your preferences")
                
                details['match_reason'] = '; '.join(reasons)
                details['similarity_score'] = round(score, 2)
                scored_recommendations.append(details)
        
        # Sort by score (highest first)
        scored_recommendations.sort(key=lambda x: x['similarity_score'], reverse=True)
        
        logger.info(f"✨ Returning top {count} recommendations (from {len(scored_recommendations)} scored)")
        return scored_recommendations[:count]
    
    async def close(self):
        """Close HTTP client connection"""
        await self.tmdb_service.close()
