import httpx
from typing import List, Dict, Optional
from app.config import settings


class TMDBService:
    """Service for interacting with OMDb API (replacing TMDB)."""
    
    BASE_URL = "http://www.omdbapi.com"
    
    def __init__(self):
        # OMDb API key from settings
        self.api_key = settings.OMDB_API_KEY
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose()
    
    async def search_movies(self, query: str, page: int = 1) -> Dict:
        """
        Search for movies by title using OMDb.
        
        Args:
            query: Search query string
            page: Page number for pagination
            
        Returns:
            Dictionary with search results in TMDB-like format
        """
        try:
            response = await self.client.get(
                self.BASE_URL,
                params={
                    "apikey": self.api_key,
                    "s": query,
                    "type": "movie",
                    "page": page
                }
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get("Response") == "True":
                # Convert OMDb format to TMDB-like format
                results = []
                for item in data.get("Search", []):
                    poster = item.get("Poster") if item.get("Poster") != "N/A" else None
                    results.append({
                        "id": item.get("imdbID"),
                        "title": item.get("Title"),
                        "release_date": item.get("Year"),
                        "poster_url": poster,
                        "poster_path": poster,  # Keep for compatibility
                        "tmdb_rating": None,  # Not available in search
                        "overview": ""  # OMDb search doesn't provide overview
                    })
                return {
                    "results": results,
                    "total_results": int(data.get("totalResults", 0)),
                    "page": page
                }
            else:
                return {"results": [], "total_results": 0}
        except Exception as e:
            print(f"Error searching movies: {e}")
            return {"results": [], "total_results": 0}
    
    async def search_tv_shows(self, query: str, page: int = 1) -> Dict:
        """
        Search for TV shows by title using OMDb.
        
        Args:
            query: Search query string
            page: Page number for pagination
            
        Returns:
            Dictionary with search results in TMDB-like format
        """
        try:
            response = await self.client.get(
                self.BASE_URL,
                params={
                    "apikey": self.api_key,
                    "s": query,
                    "type": "series",
                    "page": page
                }
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get("Response") == "True":
                # Convert OMDb format to TMDB-like format
                results = []
                for item in data.get("Search", []):
                    poster = item.get("Poster") if item.get("Poster") != "N/A" else None
                    results.append({
                        "id": item.get("imdbID"),
                        "title": item.get("Title"),  # Use 'title' for consistency
                        "name": item.get("Title"),
                        "first_air_date": item.get("Year"),
                        "release_date": item.get("Year"),
                        "poster_url": poster,
                        "poster_path": poster,  # Keep for compatibility
                        "tmdb_rating": None,
                        "overview": ""  # OMDb search doesn't provide overview
                    })
                return {
                    "results": results,
                    "total_results": int(data.get("totalResults", 0)),
                    "page": page
                }
            else:
                return {"results": [], "total_results": 0}
        except Exception as e:
            print(f"Error searching TV shows: {e}")
            return {"results": [], "total_results": 0}
    
    async def get_movie_details(self, imdb_id: str) -> Optional[Dict]:
        """
        Get detailed information about a movie by IMDb ID.
        
        Args:
            imdb_id: IMDb ID (e.g., tt1234567) or integer
            
        Returns:
            Dictionary with movie details in TMDB-like format
        """
        try:
            # If imdb_id is an integer, it's from the old system, skip
            if isinstance(imdb_id, int):
                return None
                
            response = await self.client.get(
                self.BASE_URL,
                params={
                    "apikey": self.api_key,
                    "i": str(imdb_id),
                    "plot": "full"
                }
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get("Response") == "True":
                return self.format_movie_for_db(data)
            return None
        except Exception as e:
            print(f"Error fetching movie details: {e}")
            return None
    
    async def get_tv_show_details(self, imdb_id: str) -> Optional[Dict]:
        """
        Get detailed information about a TV show by IMDb ID.
        
        Args:
            imdb_id: IMDb ID (e.g., tt1234567) or integer
            
        Returns:
            Dictionary with TV show details in TMDB-like format
        """
        try:
            # If imdb_id is an integer, it's from the old system, skip
            if isinstance(imdb_id, int):
                return None
                
            response = await self.client.get(
                self.BASE_URL,
                params={
                    "apikey": self.api_key,
                    "i": str(imdb_id),
                    "plot": "full"
                }
            )
            response.raise_for_status()
            data = response.json()
            
            if data.get("Response") == "True":
                return self.format_tv_show_for_db(data)
            return None
        except Exception as e:
            print(f"Error fetching TV show details: {e}")
            return None
    
    async def get_trending(self, media_type: str = "all", time_window: str = "week") -> Dict:
        """
        OMDb doesn't support trending, return empty results.
        """
        return {"results": []}
    
    async def get_popular_movies(self, page: int = 1) -> Dict:
        """OMDb doesn't support popular movies, return empty results."""
        return {"results": []}
    
    async def get_popular_tv_shows(self, page: int = 1) -> Dict:
        """OMDb doesn't support popular TV shows, return empty results."""
        return {"results": []}
    
    def format_movie_for_db(self, omdb_data: Dict) -> Dict:
        """
        Format OMDb movie data for database storage.
        
        Args:
            omdb_data: Raw OMDb movie data
            
        Returns:
            Formatted dictionary for database
        """
        # Parse runtime (e.g., "148 min" -> 148)
        runtime = None
        if omdb_data.get("Runtime") and omdb_data["Runtime"] != "N/A":
            try:
                runtime = int(omdb_data["Runtime"].split()[0])
            except:
                pass
        
        # Parse year
        year = None
        if omdb_data.get("Year") and omdb_data["Year"] != "N/A":
            try:
                # Handle year ranges like "2019-2020"
                year = int(omdb_data["Year"].split("–")[0].split("-")[0])
            except:
                pass
        
        # Parse rating
        imdb_rating = None
        if omdb_data.get("imdbRating") and omdb_data["imdbRating"] != "N/A":
            try:
                imdb_rating = float(omdb_data["imdbRating"])
            except:
                pass
        
        return {
            "content_type": "movie",
            "title": omdb_data.get("Title"),
            "overview": omdb_data.get("Plot") if omdb_data.get("Plot") != "N/A" else None,
            "description": omdb_data.get("Plot") if omdb_data.get("Plot") != "N/A" else None,
            "release_year": year,
            "release_date": str(year) if year else None,
            "genre": omdb_data.get("Genre") if omdb_data.get("Genre") != "N/A" else None,
            "genres": omdb_data.get("Genre") if omdb_data.get("Genre") != "N/A" else None,
            "director": omdb_data.get("Director") if omdb_data.get("Director") != "N/A" else None,
            "cast": omdb_data.get("Actors") if omdb_data.get("Actors") != "N/A" else None,
            "duration": runtime,
            "runtime": runtime,
            "poster_url": omdb_data.get("Poster") if omdb_data.get("Poster") != "N/A" else None,
            "backdrop_url": None,  # OMDb doesn't provide backdrop images
            "trailer_url": None,  # OMDb doesn't provide trailers
            "tmdb_rating": imdb_rating,
            "tmdb_id": omdb_data.get("imdbID"),  # Store IMDb ID in tmdb_id field
            "id": omdb_data.get("imdbID")
        }
    
    def format_tv_show_for_db(self, omdb_data: Dict) -> Dict:
        """
        Format OMDb TV show data for database storage.
        
        Args:
            omdb_data: Raw OMDb TV show data
            
        Returns:
            Formatted dictionary for database
        """
        # Parse year
        year = None
        if omdb_data.get("Year") and omdb_data["Year"] != "N/A":
            try:
                # Handle year ranges like "2019-2020"
                year = int(omdb_data["Year"].split("–")[0].split("-")[0])
            except:
                pass
        
        # Parse rating
        imdb_rating = None
        if omdb_data.get("imdbRating") and omdb_data["imdbRating"] != "N/A":
            try:
                imdb_rating = float(omdb_data["imdbRating"])
            except:
                pass
        
        # Parse seasons (e.g., "5" -> 5)
        total_seasons = None
        if omdb_data.get("totalSeasons") and omdb_data["totalSeasons"] != "N/A":
            try:
                total_seasons = int(omdb_data["totalSeasons"])
            except:
                pass
        
        return {
            "content_type": "tv_show",
            "title": omdb_data.get("Title"),
            "overview": omdb_data.get("Plot") if omdb_data.get("Plot") != "N/A" else None,
            "description": omdb_data.get("Plot") if omdb_data.get("Plot") != "N/A" else None,
            "release_year": year,
            "release_date": str(year) if year else None,
            "first_air_date": str(year) if year else None,
            "genre": omdb_data.get("Genre") if omdb_data.get("Genre") != "N/A" else None,
            "genres": omdb_data.get("Genre") if omdb_data.get("Genre") != "N/A" else None,
            "director": omdb_data.get("Director") if omdb_data.get("Director") != "N/A" else None,
            "cast": omdb_data.get("Actors") if omdb_data.get("Actors") != "N/A" else None,
            "total_seasons": total_seasons,
            "total_episodes": None,  # OMDb doesn't provide total episodes
            "poster_url": omdb_data.get("Poster") if omdb_data.get("Poster") != "N/A" else None,
            "backdrop_url": None,  # OMDb doesn't provide backdrop images
            "trailer_url": None,  # OMDb doesn't provide trailers
            "tmdb_rating": imdb_rating,
            "tmdb_id": omdb_data.get("imdbID"),  # Store IMDb ID in tmdb_id field
            "id": omdb_data.get("imdbID")
        }


# Create singleton instance
tmdb_service = TMDBService()
