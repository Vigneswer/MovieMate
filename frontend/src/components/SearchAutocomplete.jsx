import { useState, useEffect, useRef } from 'react';
import { Search, Film, Tv, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { tmdbSearchMovies, tmdbSearchTVShows } from '../services/movieService';
import './SearchAutocomplete.css';

const SearchAutocomplete = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.length < 3) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }

      setLoading(true);
      try {
        const [movieResults, tvResults] = await Promise.all([
          tmdbSearchMovies(query, 1),
          tmdbSearchTVShows(query, 1)
        ]);

        const movies = (movieResults?.results || []).slice(0, 8).map((item, idx) => ({
          ...item,
          type: 'movie',
          uniqueKey: `movie-${item.id}-${idx}`
        }));
        
        const tvShows = (tvResults?.results || []).slice(0, 7).map((item, idx) => ({
          ...item,
          type: 'tv',
          uniqueKey: `tv-${item.id}-${idx}`
        }));

        setSuggestions([...movies, ...tvShows]);
        setShowDropdown(true);
      } catch (error) {
        console.error('Search error:', error);
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.length >= 3) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowDropdown(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    navigate(`/search/${suggestion.type}/${suggestion.id}`);
    setShowDropdown(false);
    setQuery('');
  };

  return (
    <div className="search-autocomplete" ref={searchRef}>
      <form onSubmit={handleSearch} className="search-form">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder="Search movies & TV shows..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 3 && setSuggestions.length > 0 && setShowDropdown(true)}
        />
        {loading && (
          <Loader2 className="loading-icon" size={18} />
        )}
      </form>

      {showDropdown && suggestions.length > 0 && (
        <div className="suggestions-dropdown">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.uniqueKey}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="suggestion-icon">
                {suggestion.type === 'movie' ? (
                  <Film size={16} />
                ) : (
                  <Tv size={16} />
                )}
              </div>
              <div className="suggestion-info">
                <div className="suggestion-title">
                  {suggestion.title}
                </div>
                <div className="suggestion-meta">
                  {suggestion.release_date} • {suggestion.type === 'movie' ? 'Movie' : 'TV Show'}
                </div>
              </div>
            </div>
          ))}
          <div 
            className="view-all-results"
            onClick={() => {
              navigate(`/search?q=${encodeURIComponent(query)}`);
              setShowDropdown(false);
              setQuery('');
            }}
          >
            View all results for "{query}"
          </div>
        </div>
      )}

      {showDropdown && !loading && query.length >= 3 && suggestions.length === 0 && (
        <div className="suggestions-dropdown">
          <div className="no-results">
            No results found for "{query}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchAutocomplete;
