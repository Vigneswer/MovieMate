import { Star, Heart, Clock, CheckCircle, Play } from 'lucide-react';
import { STATUS_COLORS, WATCH_STATUS } from '../utils/constants';
import './MovieCard.css';

const MovieCard = ({ movie, onClick, onToggleFavorite }) => {
  const posterUrl = movie.poster_url || '/placeholder-poster.png';
  const rating = movie.tmdb_rating || movie.user_rating;

  const getStatusIcon = (status) => {
    switch (status) {
      case WATCH_STATUS.WISHLIST:
        return <Clock size={14} />;
      case WATCH_STATUS.WATCHING:
        return <Play size={14} />;
      case WATCH_STATUS.COMPLETED:
        return <CheckCircle size={14} />;
      default:
        return null;
    }
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    onToggleFavorite(movie.id);
  };

  return (
    <div className="movie-card" onClick={() => onClick(movie)}>
      <div className="movie-card-image">
        <img src={posterUrl} alt={movie.title} loading="lazy" />
        <div className="movie-card-overlay">
          <button 
            className={`favorite-btn ${movie.is_favorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
          >
            <Heart 
              size={20} 
              fill={movie.is_favorite ? '#ef4444' : 'none'}
              color={movie.is_favorite ? '#ef4444' : '#fff'}
            />
          </button>
        </div>
        
        {movie.status && (
          <div 
            className="status-badge"
            style={{ background: STATUS_COLORS[movie.status] }}
          >
            {getStatusIcon(movie.status)}
            <span>{movie.status}</span>
          </div>
        )}
      </div>
      
      <div className="movie-card-content">
        <h3 className="movie-card-title">{movie.title}</h3>
        <div className="movie-card-info">
          {movie.release_year && (
            <span className="movie-year">{movie.release_year}</span>
          )}
          {rating && (
            <div className="movie-rating">
              <Star size={14} fill="#fbbf24" color="#fbbf24" />
              <span>{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        {movie.content_type === 'tv_show' && movie.total_episodes && (
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${(movie.episodes_watched / movie.total_episodes) * 100}%` 
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
