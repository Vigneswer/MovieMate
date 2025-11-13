import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import MovieCard from '../components/MovieCard';
import SearchBar from '../components/SearchBar';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import MovieDetailModal from '../components/MovieDetailModal';
import SurpriseMeModal from '../components/SurpriseMeModal';
import { getMovies, searchMovies, toggleFavorite, getFavorites } from '../services/movieService';
import { Sparkles } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
  const [movies, setMovies] = useState([]); 
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showSurpriseMe, setShowSurpriseMe] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    contentType: null,
    favorites: false,
  });

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [movies, filters, searchQuery]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await getMovies();
      setMovies(data);
    } catch (error) {
      toast.error('Failed to load movies');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    let filtered = [...movies];

    // Search filter
    if (searchQuery.trim()) {
      try {
        const results = await searchMovies(searchQuery);
        filtered = results;
      } catch (error) {
        console.error('Search error:', error);
      }
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter(m => m.status === filters.status);
    }

    // Content type filter
    if (filters.contentType) {
      filtered = filtered.filter(m => m.content_type === filters.contentType);
    }

    // Favorites filter
    if (filters.favorites) {
      filtered = filtered.filter(m => m.is_favorite);
    }

    setFilteredMovies(filtered);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleToggleFavorite = async (id) => {
    try {
      const updated = await toggleFavorite(id);
      setMovies(prev => prev.map(m => m.id === id ? updated : m));
      toast.success(updated.is_favorite ? 'Added to favorites' : 'Removed from favorites');
    } catch (error) {
      toast.error('Failed to update favorite');
    }
  };

  const handleMovieClick = (movie) => {
    setSelectedMovie(movie);
  };

  const handleCloseModal = () => {
    setSelectedMovie(null);
  };

  const handleMovieUpdate = () => {
    fetchMovies();
    setSelectedMovie(null);
  };

  if (loading) {
    return (
      <div className="home-page">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  return (
    <div className="home-page">
      <div className="home-hero">
        <h2 className="home-title">Discover Your Next Favorite</h2>
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search for new movies..."
        />
        <button className="surprise-me-btn" onClick={() => setShowSurpriseMe(true)}>
          <Sparkles size={20} />
          <span>Surprise Me!</span>
        </button>
      </div>

      <FilterBar activeFilters={filters} onFilterChange={handleFilterChange} />

      <div className="home-content">
        <div className="collection-header">
          <h3 className="section-title">My Collection</h3>
          <span className="collection-count">{filteredMovies.length} items</span>
        </div>

        {filteredMovies.length === 0 ? (
          <div className="empty-state">
            <p>No movies found. Start building your collection!</p>
          </div>
        ) : (
          <div className="movies-grid">
            {filteredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onClick={handleMovieClick}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>

      {selectedMovie && (
        <MovieDetailModal
          movie={selectedMovie}
          onClose={handleCloseModal}
          onUpdate={handleMovieUpdate}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {showSurpriseMe && (
        <SurpriseMeModal
          onClose={() => setShowSurpriseMe(false)}
          onSelectMovie={(movie) => {
            setSelectedMovie(movie);
          }}
        />
      )}
    </div>
  );
};

export default HomePage;
