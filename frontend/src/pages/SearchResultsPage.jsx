import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Film, Tv, Star, Calendar, Clock, Plus, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  tmdbSearchMovies, 
  tmdbSearchTVShows, 
  tmdbGetMovieDetails, 
  tmdbGetTVDetails,
  createMovie 
} from '../services/movieService';
import './SearchResultsPage.css';

const SearchResultsPage = () => {
  const { type, id } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const navigate = useNavigate();

  const [results, setResults] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState('movies');

  useEffect(() => {
    if (type && id) {
      fetchDetails();
    } else if (query) {
      fetchSearchResults();
    }
  }, [type, id, query, activeTab]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const searchFn = activeTab === 'movies' ? tmdbSearchMovies : tmdbSearchTVShows;
      const data = await searchFn(query);
      setResults(data.results || []);
    } catch (error) {
      toast.error('Failed to fetch search results');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetails = async () => {
    try {
      setDetailsLoading(true);
      const fetchFn = type === 'movie' ? tmdbGetMovieDetails : tmdbGetTVDetails;
      const data = await fetchFn(id);
      setSelectedItem(data);
    } catch (error) {
      toast.error('Failed to fetch details');
      console.error(error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleItemClick = (item) => {
    const itemType = item.title ? 'movie' : 'tv';
    navigate(`/search/${itemType}/${item.id}`);
  };

  const handleAddToCollection = async () => {
    if (!selectedItem) return;

    // Validate required fields
    if (!selectedItem.title) {
      toast.error('Movie title is required');
      return;
    }

    try {
      setAdding(true);
      
      const movieData = {
        title: selectedItem.title,
        content_type: type === 'movie' ? 'movie' : 'tv_show',
        genre: selectedItem.genres || 'Unknown',
        release_year: selectedItem.release_year || null,
        duration: selectedItem.duration || null,
        tmdb_rating: selectedItem.tmdb_rating || null,
        poster_url: selectedItem.poster_url || null,
        backdrop_url: selectedItem.backdrop_url || null,
        description: selectedItem.overview || null,
        cast: selectedItem.cast || null,
        director: selectedItem.director || null,
        tmdb_id: selectedItem.tmdb_id || null,
        status: 'wishlist',
        platform: null,
        is_favorite: false,
        user_rating: null,
        review: null,
        notes: null,
        episodes_watched: 0,
        total_seasons: selectedItem.total_seasons || null,
        current_season: null,
        current_episode: null,
      };

      await createMovie(movieData);
      toast.success(`Added "${selectedItem.title}" to your collection!`);
      setTimeout(() => navigate('/'), 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.detail 
        ? (Array.isArray(error.response.data.detail) 
            ? error.response.data.detail[0].msg 
            : error.response.data.detail)
        : 'Failed to add to collection. Please try again.';
      toast.error(errorMsg);
      console.error('Add to collection error:', error);
    } finally {
      setAdding(false);
    }
  };

  if (type && id) {
    if (detailsLoading) {
      return (
        <div className="search-results-page">
          <LoadingSpinner size="large" />
        </div>
      );
    }

    if (!selectedItem) {
      return (
        <div className="search-results-page">
          <div className="error-state">Item not found</div>
        </div>
      );
    }

    return (
      <div className="search-results-page">
        <div className="detail-view">
          <div 
            className="detail-backdrop"
            style={{
              backgroundImage: selectedItem.backdrop_url 
                ? `url(${selectedItem.backdrop_url})` 
                : 'none'
            }}
          />
          
          <div className="detail-content">
            <div className="detail-poster">
              {selectedItem.poster_url ? (
                <img src={selectedItem.poster_url} alt={selectedItem.title} />
              ) : (
                <div className="poster-placeholder">
                  {type === 'movie' ? <Film size={64} /> : <Tv size={64} />}
                </div>
              )}
            </div>

            <div className="detail-info">
              <div className="detail-header">
                <h1 className="detail-title">{selectedItem.title}</h1>
                <button 
                  className="add-button"
                  onClick={handleAddToCollection}
                  disabled={adding}
                >
                  {adding ? (
                    <>
                      <LoadingSpinner size="small" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus size={20} />
                      Add to Collection
                    </>
                  )}
                </button>
              </div>

              <div className="detail-meta">
                <span className="meta-item">
                  <Calendar size={16} />
                  {selectedItem.release_year}
                </span>
                {selectedItem.duration > 0 && (
                  <span className="meta-item">
                    <Clock size={16} />
                    {selectedItem.duration} min
                  </span>
                )}
                {selectedItem.tmdb_rating > 0 && (
                  <span className="meta-item">
                    <Star size={16} />
                    {selectedItem.tmdb_rating}/10
                  </span>
                )}
                <span className="meta-badge">
                  {type === 'movie' ? 'Movie' : 'TV Show'}
                </span>
              </div>

              {selectedItem.genres && (
                <div className="detail-genres">
                  {selectedItem.genres.split(',').map((genre, idx) => (
                    <span key={idx} className="genre-badge">{genre.trim()}</span>
                  ))}
                </div>
              )}

              {selectedItem.overview && (
                <div className="detail-overview">
                  <h3>Overview</h3>
                  <p>{selectedItem.overview}</p>
                </div>
              )}

              {selectedItem.cast && (
                <div className="detail-cast">
                  <h3>Cast</h3>
                  <p>{selectedItem.cast}</p>
                </div>
              )}

              {selectedItem.director && (
                <div className="detail-director">
                  <h3>Director</h3>
                  <p>{selectedItem.director}</p>
                </div>
              )}

              {selectedItem.total_seasons && (
                <div className="detail-seasons">
                  <h3>Seasons</h3>
                  <p>{selectedItem.total_seasons} season{selectedItem.total_seasons > 1 ? 's' : ''}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-page">
      <div className="search-header">
        <h1 className="page-title">
          Search Results for "{query}"
        </h1>
        
        <div className="content-tabs">
          <button
            className={`tab-button ${activeTab === 'movies' ? 'active' : ''}`}
            onClick={() => setActiveTab('movies')}
          >
            <Film size={18} />
            Movies
          </button>
          <button
            className={`tab-button ${activeTab === 'tv' ? 'active' : ''}`}
            onClick={() => setActiveTab('tv')}
          >
            <Tv size={18} />
            TV Shows
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner size="large" />
      ) : (
        <div className="results-grid">
          {results.length === 0 ? (
            <div className="empty-state">
              No {activeTab === 'movies' ? 'movies' : 'TV shows'} found for "{query}"
            </div>
          ) : (
            results.map((item) => (
              <div
                key={item.id}
                className="result-card"
                onClick={() => handleItemClick(item)}
              >
                <div className="result-poster">
                  {item.poster_url ? (
                    <img src={item.poster_url} alt={item.title} />
                  ) : (
                    <div className="poster-placeholder">
                      {activeTab === 'movies' ? <Film size={32} /> : <Tv size={32} />}
                    </div>
                  )}
                </div>
                
                <div className="result-info">
                  <h3 className="result-title">{item.title}</h3>
                  <div className="result-meta">
                    <span>{item.release_date}</span>
                    {item.tmdb_rating > 0 && (
                      <span className="result-rating">
                        <Star size={12} />
                        {item.tmdb_rating}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default SearchResultsPage;
